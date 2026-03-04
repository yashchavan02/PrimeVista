const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const createVideo = async (videoData) => {
  console.log('Creating video with data:', videoData);
  const { data, error } = await supabase
    .from('videos')
    .insert([videoData])
    .select()
    .single();
  
  if (error) {
    console.error('Supabase insert error:', error);
    throw error;
  }
  return data;
};

const getVideoById = async (id) => {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

const getAllVideos = async () => {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

const getVideosByStatus = async (status) => {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('status', status);
  
  if (error) throw error;
  return data || [];
};

const updateVideoStatus = async (id, status, additionalFields = {}) => {
  const updateData = { status, ...additionalFields };
  
  const { data, error } = await supabase
    .from('videos')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

module.exports = {
  createVideo,
  getVideoById,
  getAllVideos,
  getVideosByStatus,
  updateVideoStatus,
};
