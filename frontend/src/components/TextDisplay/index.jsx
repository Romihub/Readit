import React from 'react';
import { Paper, Typography } from '@mui/material';
import { useAppContext } from '../../contexts/AppContext';
import './styles.css';

const TextDisplay = () => {
  const { currentText, currentPosition, isPlaying } = useAppContext();

  const getHighlightedText = () => {
    if (!currentText) return null;

    // Calculate which words to highlight based on current position
    const words = currentText.split(' ');
    const wordsPerSecond = 2; // Adjust based on reading speed
    const currentWordIndex = Math.floor(currentPosition * wordsPerSecond);

    return (
      <div className="text-content">
        {words.map((word, index) => (
          <span
            key={index}
            className={index === currentWordIndex && isPlaying ? 'highlighted' : ''}
          >
            {word}{' '}
          </span>
        ))}
      </div>
    );
  };

  if (!currentText) return null;

  return (
    <Paper className="text-display">
      <Typography variant="h6" gutterBottom>
        Document Text
      </Typography>
      {getHighlightedText()}
    </Paper>
  );
};

export default TextDisplay;
