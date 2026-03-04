import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import VideoPlayer from '../components/VideoPlayer';

const VideoPlayerPage = () => {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVideo();
    
    const interval = setInterval(() => {
      if (video && video.status !== 'ready' && video.status !== 'failed') {
        fetchVideo();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [id, video?.status]);

  const fetchVideo = async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setVideo(data);
    } catch (err) {
      console.error('Error fetching video:', err);
      setError('Video not found');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="gradient-bg min-h-screen flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-700 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-red-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="gradient-bg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{error || 'Video not found'}</h2>
          <Link to="/" className="text-red-400 hover:text-red-300 transition-colors">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  const isProcessing = video.status !== 'ready' && video.status !== 'failed';

  return (
    <div className="min-h-screen bg-black pt-20 pb-12">
      <div className="max-w-5xl mx-auto px-4">
        {isProcessing && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 p-4 rounded-xl mb-4 flex items-center gap-2 text-sm">
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Video is {video.status}. Please wait...
          </div>
        )}
        {video.status === 'failed' && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-4 flex items-center gap-2 text-sm">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Video processing failed. Please try uploading again.
          </div>
        )}
        {video.status === 'ready' && video.hls_master_url && (
          <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <VideoPlayer src={video.hls_master_url} title={video.title} />
          </div>
        )}
        {video.status === 'ready' && !video.hls_master_url && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-4 text-sm">
            Video is ready but HLS URL is missing.
          </div>
        )}
        
        <div className="mt-8 backdrop-blur-sm bg-white/5 border border-white/10 p-6 rounded-2xl">
          <h1 className="text-2xl font-semibold text-white mb-3">{video.title}</h1>
          <p className="text-gray-500 text-sm">{video.description || 'No description available'}</p>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayerPage;
