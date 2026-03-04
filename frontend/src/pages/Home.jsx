import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import VideoCard from '../components/VideoCard';

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('status', 'ready')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (err) {
      console.error('Error fetching videos:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-violet-600/10 rounded-full blur-[140px]"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-40 pb-20">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold text-white mb-6 tracking-tight">
              Stream <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">Premium</span> Content
            </h1>
            <p className="text-lg text-gray-400 max-w-xl mx-auto mb-10">
              Experience crystal-clear streaming with adaptive quality. 
              Your entertainment, reimagined.
            </p>
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-gray-500">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span>HD Quality</span>
              </div>
              <div className="w-1 h-1 bg-gray-700 rounded-full"></div>
              <div className="flex items-center gap-2 text-gray-500">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
                <span>Adaptive</span>
              </div>
              <div className="w-1 h-1 bg-gray-700 rounded-full"></div>
              <div className="flex items-center gap-2 text-gray-500">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span>Secure</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1 h-6 bg-gradient-to-b from-violet-500 to-indigo-500 rounded-full"></div>
          <h2 className="text-xl font-medium text-white">Latest Videos</h2>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="relative">
              <div className="w-12 h-12 border-2 border-gray-800 rounded-full"></div>
              <div className="absolute top-0 left-0 w-12 h-12 border-2 border-violet-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
          </div>
        ) : videos.length === 0 ? (
          <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-16 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-violet-500/10 flex items-center justify-center">
              <svg className="w-10 h-10 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No videos available</h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto">
              {user ? 'No videos uploaded yet.' : 'Sign in to start watching.'}
            </p>
            {!user && (
              <Link to="/login" className="inline-block mt-4 text-violet-400 hover:text-violet-300 text-sm font-medium">
                Sign In →
              </Link>
            )}
          </div>
        ) : !user ? (
          <>
            <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-4 text-center mb-6">
              <p className="text-gray-400 text-sm">
                <Link to="/login" className="text-violet-400 hover:text-violet-300 font-medium">Sign in</Link> to watch videos
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {videos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
