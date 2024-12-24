import axios from 'axios';

export const API_URL = 'http://localhost:5000';

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
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const askAIQuestion = async (sessionId, question, context) => {
  try {
    console.log('Asking AI:', { sessionId, question, context });
    const response = await api.post('/ask', {
      sessionId,
      question,
      context,
    });
    return response.data.response;
  } catch (error) {
    console.error('API Error:', error.response?.data || error);
    throw error.response?.data || error;
  }
};

export const getVoices = async () => {
  try {
    const response = await api.get('/api/voices');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch voices:', error);
    throw error;
  }
};

export const textToSpeech = async (text, voice) => {
  try {
    const response = await api.post('/text-to-speech', { text, voice }, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    console.error('Failed to convert text to speech:', error);
    throw error;
  }
};

export const addBookmark = async (sessionId, segment, note) => {
  try {
    if (!sessionId || !segment) {
      throw new Error('Missing required fields: sessionId and segment are required');
    }
    
    const response = await api.post('/bookmarks', {
      sessionId,
      segment,
      note: note || ''
    });
    return response.data;
  } catch (error) {
    console.error('Failed to add bookmark:', error);
    throw error.response?.data?.error || error.message || error;
  }
};

export const getBookmarks = async (sessionId) => {
  try {
    const response = await api.get(`/bookmarks/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to get bookmarks:', error);
    throw error;
  }
};

export const deleteBookmark = async (bookmarkId) => {
  try {
    await api.delete(`/bookmarks/${bookmarkId}`);
  } catch (error) {
    console.error('Failed to delete bookmark:', error);
    throw error;
  }
};
