import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  IconButton,
  Typography,
  LinearProgress,
  CircularProgress,
  Tooltip,
  Paper,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import { useAppContext } from '../../contexts/AppContext';
import { useSettings } from '../../contexts/SettingsContext';
import { textToSpeech } from '../../api';
import AIAssistant from '../AIAssistant';
import './styles.css';

const TextReader = () => {
  const {
    sessionId,
    segments,
    currentSegment,
    setCurrentSegment,
    isPlaying,
    setIsPlaying,
    error,
    setError,
  } = useAppContext();

  const { selectedVoice, fontSize } = useSettings();

  const [loading, setLoading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [highlightedWord, setHighlightedWord] = useState(-1);
  
  const audioRef = useRef(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }
    };
  }, []);

  const playSegment = async () => {
    if (!sessionId || !segments || segments.length === 0) {
      setError('No document loaded');
      return;
    }
    
    if (!selectedVoice) {
      setError('Please select a voice in settings');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const currentText = segments[currentSegment];
      console.log('Converting text to speech:', currentText);
      
      const audioBlob = await textToSpeech(currentText, selectedVoice);
      console.log('Received audio blob:', audioBlob);
      
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }

      const newAudio = new Audio(audioUrl);
      audioRef.current = newAudio;
      
      newAudio.addEventListener('loadedmetadata', () => {
        console.log('Audio duration:', newAudio.duration);
        setDuration(newAudio.duration);
      });

      newAudio.addEventListener('ended', () => {
        console.log('Audio ended');
        setIsPlaying(false);
        setHighlightedWord(-1);
        if (currentSegment < segments.length - 1) {
          setCurrentSegment(prev => prev + 1);
          setCurrentPosition(0);
        }
      });

      newAudio.addEventListener('timeupdate', () => {
        setCurrentPosition(newAudio.currentTime);
        // Estimate current word based on time
        if (currentText) {
          const words = currentText.split(' ');
          const wordIndex = Math.floor((newAudio.currentTime / newAudio.duration) * words.length);
          setHighlightedWord(wordIndex);
        }
      });

      console.log('Playing audio...');
      await newAudio.play();
      setIsPlaying(true);
      
    } catch (error) {
      console.error('Failed to play segment:', error);
      setError(error.message || 'Failed to play audio');
      setIsPlaying(false);
    } finally {
      setLoading(false);
    }
  };

  const togglePlay = async () => {
    console.log('Toggle play clicked');
    if (!audioRef.current || !isPlaying) {
      console.log('Starting new playback');
      await playSegment();
    } else {
      console.log('Pausing playback');
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handlePrevious = () => {
    if (currentSegment > 0) {
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }
      setCurrentSegment(prev => prev - 1);
      setCurrentPosition(0);
      setHighlightedWord(-1);
      if (isPlaying) {
        playSegment();
      }
    }
  };

  const handleNext = () => {
    if (currentSegment < segments.length - 1) {
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }
      setCurrentSegment(prev => prev + 1);
      setCurrentPosition(0);
      setHighlightedWord(-1);
      if (isPlaying) {
        playSegment();
      }
    }
  };

  if (!segments || segments.length === 0) {
    return (
      <Box className="text-reader-empty">
        <Typography variant="body1" color="text.secondary">
          Upload a document to start reading
        </Typography>
      </Box>
    );
  }

  return (
    <Paper elevation={3} className="text-reader">
      <Box className="text-content" style={{ fontSize: `${fontSize}px` }}>
        {segments[currentSegment].split(' ').map((word, index) => (
          <span
            key={index}
            className={index === highlightedWord ? 'highlighted' : ''}
          >
            {word}{' '}
          </span>
        ))}
      </Box>

      <Box className="controls">
        <Box className="progress-info">
          <Typography variant="caption">
            Segment {currentSegment + 1} of {segments.length}
          </Typography>
          <Typography variant="caption">
            {Math.floor(currentPosition)}s / {Math.floor(duration)}s
          </Typography>
        </Box>

        <LinearProgress
          variant="determinate"
          value={(currentPosition / duration) * 100 || 0}
          className="progress-bar"
        />

        <Box className="buttons">
          <Tooltip title="Previous Segment">
            <span>
              <IconButton
                onClick={handlePrevious}
                disabled={currentSegment === 0 || loading}
              >
                <SkipPreviousIcon />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title={isPlaying ? 'Pause' : 'Play'}>
            <span>
              <IconButton
                onClick={togglePlay}
                disabled={loading}
                color="primary"
                className="play-button"
              >
                {loading ? (
                  <CircularProgress size={24} />
                ) : isPlaying ? (
                  <PauseIcon />
                ) : (
                  <PlayArrowIcon />
                )}
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Next Segment">
            <span>
              <IconButton
                onClick={handleNext}
                disabled={currentSegment === segments.length - 1 || loading}
              >
                <SkipNextIcon />
              </IconButton>
            </span>
          </Tooltip>

          <AIAssistant />
        </Box>

        {error && (
          <Typography variant="caption" color="error" className="error-message">
            {error}
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default TextReader;
