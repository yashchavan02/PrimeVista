import { Link } from 'react-router-dom';

const VideoCard = ({ video }) => {
  const thumbnailUrl = video.thumbnail_url || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=640&h=360&fit=crop';

  return (
    <Link to={`/video/${video.id}`} className="block group">
      <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 hover:border-white/20 transition-all duration-300">
        <div className="relative aspect-video overflow-hidden">
          <img
            src={thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300">
              <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4l12 6-12 6V4z" />
              </svg>
            </div>
          </div>
          <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-xs text-gray-300 font-medium">
            HD
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-white font-medium text-base truncate mb-1 group-hover:text-violet-300 transition-colors">
            {video.title}
          </h3>
          <p className="text-gray-500 text-sm line-clamp-2">{video.description || 'No description'}</p>
        </div>
      </div>
    </Link>
  );
};

export default VideoCard;
