import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Typography,
  CircularProgress,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Paper,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import { useAppContext } from '../../contexts/AppContext';
import { useSettings } from '../../contexts/SettingsContext';
import { askAIQuestion, textToSpeech } from '../../api';
import './styles.css';

// Initialize speech recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

if (recognition) {
  recognition.continuous = true;
  recognition.interimResults = true;
}

const AIAssistant = () => {
  const { sessionId, segments, currentSegment } = useAppContext();
  const { selectedVoice } = useSettings();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [audioResponse, setAudioResponse] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!recognition) return;

    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript;
      setQuestion(transcript);
    };

    recognition.onend = () => {
      if (isListening) {
        recognition.start();
      }
    };

    return () => {
      if (isListening) {
        recognition.stop();
      }
    };
  }, [isListening]);

  const handleStartListening = () => {
    if (!recognition) {
      setError('Speech recognition is not supported in your browser');
      return;
    }
    setIsListening(true);
    recognition.start();
  };

  const handleStopListening = () => {
    if (!recognition) return;
    setIsListening(false);
    recognition.stop();
  };

  const handleAskQuestion = async () => {
    if (!question.trim() || !sessionId) return;

    setLoading(true);
    setError(null);
    try {
      // Get context from current and surrounding segments
      const contextSegments = [];
      const start = Math.max(0, currentSegment - 1);
      const end = Math.min(segments.length, currentSegment + 2);
      
      for (let i = start; i < end; i++) {
        if (segments[i]) {
          contextSegments.push(segments[i]);
        }
      }
      
      const context = contextSegments.join(' ');
      console.log('Asking question with context:', { 
        question, 
        contextLength: context.length,
        segmentsUsed: end - start 
      });

      const response = await askAIQuestion(sessionId, question, context);
      setAnswer(response);

      // Convert AI response to speech if voice is selected
      if (selectedVoice) {
        try {
          const audioBlob = await textToSpeech(response, selectedVoice);
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          
          setAudioResponse(audio);
          audio.play();

          // Clean up when audio finishes
          audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            setAudioResponse(null);
          };
        } catch (error) {
          console.error('Failed to convert response to speech:', error);
        }
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      setError('Failed to get AI response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleAskQuestion();
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    if (audioResponse) {
      audioResponse.pause();
      setAudioResponse(null);
    }
    setOpen(false);
    setQuestion('');
    setAnswer('');
    setIsListening(false);
    if (recognition) {
      recognition.stop();
    }
  };

  return (
    <Box className="ai-assistant-container">
      <Box className="chat-header">
        <Typography variant="h6">Ask AI</Typography>
        <IconButton
          color="inherit"
          onClick={handleOpen}
          disabled={!sessionId}
        >
          <SendIcon />
        </IconButton>
      </Box>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Ask AI Assistant</DialogTitle>
        <DialogContent>
          <Box className="question-input">
            <TextField
              fullWidth
              multiline
              rows={2}
              variant="outlined"
              placeholder="Ask a question about the document..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading || !sessionId}
            />
            <Fab
              color={isListening ? 'secondary' : 'primary'}
              size="small"
              onClick={isListening ? handleStopListening : handleStartListening}
              disabled={loading || !recognition}
              className="mic-button"
            >
              {isListening ? <StopIcon /> : <MicIcon />}
            </Fab>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAskQuestion}
              disabled={loading || !question.trim() || !sessionId}
              className="ask-button"
            >
              {loading ? <CircularProgress size={24} /> : 'Ask'}
            </Button>
          </Box>

          {error && (
            <Typography color="error" className="error-message">
              {error}
            </Typography>
          )}

          {answer && (
            <Paper elevation={1} className="answer-container">
              <Typography variant="subtitle1" gutterBottom>
                AI Response:
              </Typography>
              <Typography variant="body1">
                {answer}
              </Typography>
            </Paper>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AIAssistant;
