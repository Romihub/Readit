import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || error.message);
  }
);

export const uploadDocument = async (file) => {
  console.log('Uploading document:', file.name);
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('Upload response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

export const getVoices = async () => {
  console.log('Fetching voices');
  try {
    const response = await api.get('/voices');
    console.log('Voices response:', response.data);
    return Object.entries(response.data).map(([id, description]) => ({
      id,
      name: id.split('-').slice(2).join('-').replace('Neural', ''),
      description,
      language: id.split('-').slice(0, 2).join('-')
    }));
  } catch (error) {
    console.error('Failed to fetch voices:', error);
    return [];
  }
};

export const textToSpeech = async (text, voiceId) => {
  console.log('Converting text to speech:', { text: text.substring(0, 50) + '...', voiceId });
  try {
    const response = await api.post('/tts', 
      { text, voice_id: voiceId },
      { responseType: 'blob' }
    );
    
    console.log('TTS response received, type:', response.data.type, 'size:', response.data.size);
    
    if (response.data.type !== 'audio/wav') {
      throw new Error('Invalid audio format received');
    }
    
    return response.data;
  } catch (error) {
    console.error('TTS error:', error);
    throw error;
  }
};

export const getBookmarks = async (sessionId) => {
  try {
    const response = await api.get(`/session/${sessionId}/bookmark`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch bookmarks:', error);
    throw error;
  }
};

export const addBookmark = async (sessionId, bookmark) => {
  try {
    const response = await api.post(`/session/${sessionId}/bookmark`, bookmark);
    return response.data;
  } catch (error) {
    console.error('Failed to add bookmark:', error);
    throw error;
  }
};

export const deleteBookmark = async (sessionId, bookmarkId) => {
  try {
    await api.delete(`/session/${sessionId}/bookmark`, {
      params: { bookmark_id: bookmarkId }
    });
  } catch (error) {
    console.error('Failed to delete bookmark:', error);
    throw error;
  }
};

export const askAIQuestion = async (sessionId, question, context) => {
  try {
    console.log('Asking AI:', { sessionId, question, context: context.substring(0, 100) + '...' });
    const response = await api.post('/ask', {
      session_id: sessionId,
      question,
      context
    });
    console.log('AI response:', response.data);
    return response.data.response;
  } catch (error) {
    console.error('Error getting AI response:', error);
    throw error;
  }
};
