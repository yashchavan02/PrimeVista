import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL, supabase } from '../lib/supabase';
import UploadProgressBar from '../components/UploadProgressBar';
import StatusBadge from '../components/StatusBadge';

const AdminDashboard = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [videos, setVideos] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (err) {
      console.error('Error fetching videos:', err);
    }
  };

  const generateVideoId = () => {
    return crypto.randomUUID();
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!file || !title) {
      setError('Please select a file and provide a title');
      return;
    }

    setLoading(true);
    setUploadStatus('uploading');
    setUploadProgress(0);

    const videoId = generateVideoId();

    try {
      const formData = new FormData();
      formData.append('video', file);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('videoId', videoId);

      await axios.post(`${API_BASE_URL}/upload/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percent = (progressEvent.loaded * 100) / progressEvent.total;
          setUploadProgress(percent);
        },
      });

      setUploadStatus('complete');
      setTitle('');
      setDescription('');
      setFile(null);
      
      document.getElementById('video-file').value = '';
      
      fetchVideos();

      setTimeout(() => {
        setUploadProgress(0);
        setUploadStatus('');
      }, 3000);
    } catch (err) {
      console.error('Upload error:', err);
      setUploadStatus('error');
      const errorMessage = err.response?.data?.error || err.message || err.code || 'Upload failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">Dashboard</h1>
          <p className="text-gray-500">Manage your video content</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="backdrop-blur-sm bg-white/5 border border-white/10 p-8 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-lg font-medium">Upload Video</h2>
            </div>
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 flex items-center gap-2 text-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-gray-400 mb-2 text-sm">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-violet-500/50"
                  placeholder="Enter video title"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-2 text-sm">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-violet-500/50 h-24 resize-none"
                  placeholder="Enter video description"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-2 text-sm">Video File</label>
                <div className="relative">
                  <input
                    id="video-file"
                    type="file"
                    accept="video/*"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-violet-500/50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-violet-600 file:text-white file:cursor-pointer"
                    required
                  />
                </div>
                {file && (
                  <p className="mt-2 text-sm text-gray-500">
                    Selected: <span className="text-violet-300">{file.name}</span>
                  </p>
                )}
              </div>

              {(uploadStatus === 'uploading' || uploadStatus === 'processing' || uploadStatus === 'complete') && (
                <div className="mt-4">
                  <UploadProgressBar progress={uploadProgress} status={uploadStatus} />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium py-3 rounded-xl transition-all duration-200 disabled:opacity-50 shadow-lg shadow-violet-500/20"
              >
                {loading ? 'Uploading...' : 'Upload Video'}
              </button>
            </form>
          </div>

          <div className="backdrop-blur-sm bg-white/5 border border-white/10 p-8 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
              </div>
              <h2 className="text-lg font-medium">Your Videos</h2>
            </div>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {videos.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-white/5 flex items-center justify-center">
                    <svg className="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500">No videos uploaded yet.</p>
                </div>
              ) : (
                videos.map((video) => (
                  <div
                    key={video.id}
                    className="bg-white/5 hover:bg-white/10 p-4 rounded-xl transition-colors flex items-center justify-between"
                  >
                    <div className="flex-1 min-w-0 mr-4">
                      <h3 className="font-semibold truncate text-white">{video.title}</h3>
                      <p className="text-gray-400 text-sm truncate">{video.description || 'No description'}</p>
                    </div>
                    <StatusBadge status={video.status} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
