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

  const handlePlayPause = async () => {
    try {
      if (isPlaying) {
        // Pause playback
        setIsPlaying(false);
        if (audioRef.current) {
          audioRef.current.pause();
          // Store the current time when pausing
          setCurrentPosition(audioRef.current.currentTime || 0);
        }
      } else {
        // Resume or start playback
        setIsPlaying(true);
        if (audioRef.current) {
          // If we have a stored position, resume from there
          if (currentPosition > 0) {
            audioRef.current.currentTime = currentPosition;
          }
          await audioRef.current.play();
        } else {
          // If no audio is loaded, start playing current segment
          await playSegment(currentSegment);
        }
      }
    } catch (error) {
      console.error('Error in handlePlayPause:', error);
      setError('Failed to play/pause audio');
      setIsPlaying(false);
    }
  };

  const playSegment = async (segmentIndex) => {
    try {
      const segment = segments[segmentIndex];
      if (!segment) return;

      // Clean up previous audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      setLoading(true);
      const audioBlob = await textToSpeech(segment, selectedVoice);
      
      // Create new audio element
      const audio = new Audio(URL.createObjectURL(audioBlob));
      audioRef.current = audio;

      // Set up event listeners
      audio.addEventListener('ended', () => handleSegmentEnd(segmentIndex));
      audio.addEventListener('timeupdate', () => {
        setCurrentPosition(audio.currentTime);
        // Estimate current word based on time
        if (segment) {
          const words = segment.split(' ');
          const wordIndex = Math.floor((audio.currentTime / audio.duration) * words.length);
          setHighlightedWord(wordIndex);
        }
      });
      audio.addEventListener('error', (e) => {
        console.error('Audio error:', e);
        setError('Failed to play audio');
        setIsPlaying(false);
      });

      // Start playback
      if (currentPosition > 0) {
        audio.currentTime = currentPosition;
      }
      await audio.play();
      setIsPlaying(true);
      setLoading(false);
    } catch (error) {
      console.error('Error playing segment:', error);
      setError('Failed to play segment');
      setIsPlaying(false);
      setLoading(false);
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
        playSegment(currentSegment - 1);
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
        playSegment(currentSegment + 1);
      }
    }
  };

  const handleSegmentEnd = (segmentIndex) => {
    console.log('Audio ended');
    setIsPlaying(false);
    setHighlightedWord(-1);
    if (segmentIndex < segments.length - 1) {
      setCurrentSegment(prev => prev + 1);
      setCurrentPosition(0);
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
                onClick={handlePlayPause}
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
