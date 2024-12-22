import React, { useState, useEffect, useRef } from 'react';
import {
  IconButton,
  Paper,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import { useAppContext } from '../../contexts/AppContext';
import { textToSpeech } from '../../api';
import './styles.css';

const Reader = () => {
  const {
    sessionId,
    currentSegment,
    segments,
    isPlaying,
    setIsPlaying,
    selectedVoice,
    currentPosition,
    setCurrentPosition,
  } = useAppContext();

  const [audio, setAudio] = useState(null);
  const [loading, setLoading] = useState(false);
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
    if (!sessionId || !segments || segments.length === 0) return;

    try {
      setLoading(true);
      const currentText = segments[currentSegment];
      
      // Get audio from TTS service
      const audioBlob = await textToSpeech(currentText, selectedVoice);
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }

      const newAudio = new Audio(audioUrl);
      audioRef.current = newAudio;
      
      newAudio.addEventListener('ended', () => {
        setIsPlaying(false);
        if (currentSegment < segments.length - 1) {
          // Move to next segment
          setCurrentPosition(0);
          setCurrentSegment(prev => prev + 1);
        }
      });

      newAudio.addEventListener('timeupdate', () => {
        setCurrentPosition(newAudio.currentTime);
      });

      setAudio(newAudio);
      newAudio.play();
      setIsPlaying(true);
      
    } catch (error) {
      console.error('Failed to play segment:', error);
      setIsPlaying(false);
    } finally {
      setLoading(false);
    }
  };

  const togglePlayPause = () => {
    if (loading) return;

    if (isPlaying && audio) {
      audio.pause();
      setIsPlaying(false);
    } else {
      playSegment();
    }
  };

  return (
    <Box className="reader-container">
      <Paper elevation={3} className="reader-paper">
        <Typography variant="body1" className="reader-text">
          {segments && segments[currentSegment]}
        </Typography>
        
        <Box className="reader-controls">
          <IconButton
            onClick={togglePlayPause}
            disabled={loading || !segments || segments.length === 0}
            size="large"
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : isPlaying ? (
              <PauseIcon />
            ) : (
              <PlayArrowIcon />
            )}
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
};

export default Reader;
