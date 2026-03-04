import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';

const VideoPlayer = ({ src, title }) => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(true);
  const [qualityLevels, setQualityLevels] = useState([]);
  const [currentQuality, setCurrentQuality] = useState(-1);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);

  const initHls = useCallback(() => {
    const video = videoRef.current;
    if (!video || !src || !Hls.isSupported()) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
    }

    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: false,
    });
    hlsRef.current = hls;

    hls.loadSource(src);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
      const levels = data.levels.map((level, index) => {
        let height = 0;
        let label = 'Auto';
        
        if (level.height) {
          height = level.height;
          label = `${height}p`;
        } else if (level.attrs && level.attrs.RESOLUTION) {
          const resParts = level.attrs.RESOLUTION.split('x');
          height = parseInt(resParts[0]);
          label = `${height}p`;
        } else if (level.bitrate) {
          label = `${Math.round(level.bitrate / 1000)}k`;
        }
        
        return {
          index,
          height,
          bitrate: level.bitrate,
          label,
        };
      });
      setQualityLevels(levels);
      video.play().catch(() => {});
    });

    hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
      setCurrentQuality(data.level);
    });

    hls.on(Hls.Events.ERROR, (event, data) => {
      console.error('HLS Error:', data);
      const errorInfo = data.response ? `${data.details} - Status: ${data.response.code}` : data.details;
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            setError(`Network error: ${errorInfo}`);
            hls.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            if (data.details === 'manifestParsingError') {
              setError(`Cannot parse video manifest. Check console for details.`);
            } else {
              setError(`Media error: ${errorInfo}`);
              hls.recoverMediaError();
            }
            break;
          default:
            setError(`Fatal error: ${errorInfo}`);
            hls.destroy();
            break;
        }
      }
    });

    hls.on(Hls.Events.RECOVERED, () => {
      setError(null);
    });

    video.addEventListener('waiting', () => setIsBuffering(true));
    video.addEventListener('playing', () => setIsBuffering(false));
    video.addEventListener('canplay', () => setIsBuffering(false));
    video.addEventListener('error', () => setIsBuffering(false));

    return () => {
      hls.destroy();
    };
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    setError(null);
    setQualityLevels([]);
    setCurrentQuality(-1);
    setIsSupported(Hls.isSupported());

    if (Hls.isSupported()) {
      return initHls();
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      const onLoadedMetadata = () => {
        video.play().catch(() => {});
      };
      video.addEventListener('loadedmetadata', onLoadedMetadata);

      return () => {
        video.removeEventListener('loadedmetadata', onLoadedMetadata);
      };
    }
  }, [src, initHls]);

  const handleRetry = () => {
    setError(null);
    if (hlsRef.current) {
      hlsRef.current.destroy();
    }
    if (Hls.isSupported()) {
      initHls();
    }
  };

  const handleQualityChange = (levelIndex) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
    }
    setShowQualityMenu(false);
  };

  return (
    <div className="w-full">
      {!isSupported && !error && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 p-4 rounded-xl mb-4 flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          HLS is not supported in your browser. Using native playback.
        </div>
      )}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors text-sm font-medium"
          >
            Retry
          </button>
        </div>
      )}
      <div className="relative">
        <video
          ref={videoRef}
          controls
          className="w-full aspect-video bg-black rounded-xl"
          playsInline
        >
          Your browser does not support video playback.
        </video>
        {isBuffering && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
        )}
        {qualityLevels.length > 0 && (
          <div className="absolute bottom-16 right-4 z-10">
            <button
              onClick={() => setShowQualityMenu(!showQualityMenu)}
              className="bg-black/60 backdrop-blur-sm hover:bg-black/80 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.6 5 9.6 4.5c0-1.5-.8-2.5-2.4-2.5-1.3 0-2.4.8-2.4 2 0 .8.4 1.6 1.1 2.1-.2.4-.3.9-.3 1.4 0 .5.1 1 .3 1.4 1.3-.5 2.2-1.5 2.2-2.6z" />
              </svg>
              {currentQuality === -1 ? 'Auto' : qualityLevels.find(q => q.index === currentQuality)?.label || 'Auto'}
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            {showQualityMenu && (
              <div className="absolute bottom-full right-0 mb-2 bg-black/80 backdrop-blur-xl rounded-lg overflow-hidden min-w-[120px] border border-white/10">
                <button
                  onClick={() => handleQualityChange(-1)}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-white/10 transition-colors ${
                    currentQuality === -1 ? 'text-violet-400' : 'text-white'
                  }`}
                >
                  Auto
                </button>
                {qualityLevels.map((level) => (
                  <button
                    key={level.index}
                    onClick={() => handleQualityChange(level.index)}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-white/10 transition-colors ${
                      currentQuality === level.index ? 'text-violet-400' : 'text-white'
                    }`}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
