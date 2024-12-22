import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from '@mui/material';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import { useAppContext } from '../../contexts/AppContext';
import { askAIQuestion } from '../../api';
import './styles.css';

const AIAssistant = () => {
  const { sessionId, segments, currentSegment } = useAppContext();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);

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
        contextSegments.push(segments[i]);
      }
      
      const context = contextSegments.join(' ');
      console.log('Asking question with context:', { 
        question, 
        contextLength: context.length,
        segmentsUsed: end - start 
      });

      const response = await askAIQuestion(sessionId, question, context);
      setAnswer(response);
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
    setOpen(false);
    setQuestion('');
    setAnswer('');
  };

  return (
    <>
      <Tooltip title="Ask AI Assistant">
        <IconButton 
          color="primary" 
          onClick={handleOpen}
          disabled={!sessionId}
        >
          <QuestionAnswerIcon />
        </IconButton>
      </Tooltip>

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
    </>
  );
};

export default AIAssistant;
