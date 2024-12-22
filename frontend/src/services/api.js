import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const uploadDocument = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await api.post(process.env.REACT_APP_UPLOAD_ENDPOINT, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to upload document: ' + error.message);
  }
};

export const convertToSpeech = async (text) => {
  try {
    const response = await api.post(process.env.REACT_APP_TTS_ENDPOINT, { text });
    return response.data;
  } catch (error) {
    throw new Error('Failed to convert text to speech: ' + error.message);
  }
};

export const askQuestion = async (question, context) => {
  try {
    const response = await api.post(process.env.REACT_APP_ASK_ENDPOINT, {
      question,
      context,
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to get AI response: ' + error.message);
  }
};

export const saveSession = async (sessionId, position) => {
  try {
    const response = await api.post(`${process.env.REACT_APP_SESSION_ENDPOINT}/${sessionId}`, {
      position,
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to save session: ' + error.message);
  }
};

export const getSession = async (sessionId) => {
  try {
    const response = await api.get(`${process.env.REACT_APP_SESSION_ENDPOINT}/${sessionId}`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to get session: ' + error.message);
  }
};
