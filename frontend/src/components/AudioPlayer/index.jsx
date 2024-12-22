import React, { useEffect, useRef, useState } from 'react';
import { Box, IconButton, LinearProgress, Typography, Slider } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import SpeedIcon from '@mui/icons-material/Speed';
import { useAppContext } from '../../contexts/AppContext';
import { convertToSpeech, saveSession } from '../../services/api';
import './styles.css';

const AudioPlayer = () => {
  const {
    currentText,
    sessionId,
    isPlaying,
    setIsPlaying,
    currentPosition,
    setCurrentPosition,
    audioUrl,
    setAudioUrl,
    setError
  } = useAppContext();

  const audioRef = useRef(null);
  const progressInterval = useRef(null);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const handlePlay = async () => {
    try {
      if (!audioUrl) {
        const { audio_url } = await convertToSpeech(currentText);
        setAudioUrl(audio_url);
      }
      
      audioRef.current.currentTime = currentPosition;
      audioRef.current.play();
      setIsPlaying(true);
      
      progressInterval.current = setInterval(() => {
        setCurrentPosition(audioRef.current.currentTime);
        saveSession(sessionId, audioRef.current.currentTime);
      }, 1000);
    } catch (error) {
      setError(error.message);
    }
  };

  const handlePause = () => {
    audioRef.current.pause();
    setIsPlaying(false);
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
  };

  const handleStop = () => {
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setCurrentPosition(0);
    setIsPlaying(false);
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    saveSession(sessionId, 0);
  };

  const handleSpeedChange = (event, newValue) => {
    setPlaybackRate(newValue);
    if (audioRef.current) {
      audioRef.current.playbackRate = newValue;
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentPosition(0);
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!currentText) return null;

  return (
    <Box className="audio-player">
      <audio
        ref={audioRef}
        src={audioUrl}
        onEnded={handleEnded}
        onError={() => setError('Error playing audio')}
      />
      
      <Box className="controls">
        <IconButton onClick={isPlaying ? handlePause : handlePlay}>
          {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
        </IconButton>
        <IconButton onClick={handleStop}>
          <StopIcon />
        </IconButton>
      </Box>

      <Box className="progress">
        <Typography variant="body2">
          {formatTime(currentPosition)}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={(currentPosition / (audioRef.current?.duration || 1)) * 100}
          className="progress-bar"
        />
        <Typography variant="body2">
          {audioRef.current?.duration ? formatTime(audioRef.current.duration) : '0:00'}
        </Typography>
      </Box>

      <Box className="speed-control">
        <SpeedIcon className="speed-icon" />
        <Slider
          value={playbackRate}
          onChange={handleSpeedChange}
          min={0.5}
          max={2}
          step={0.1}
          marks={[
            { value: 0.5, label: '0.5x' },
            { value: 1, label: '1x' },
            { value: 1.5, label: '1.5x' },
            { value: 2, label: '2x' },
          ]}
          className="speed-slider"
        />
      </Box>
    </Box>
  );
};

export default AudioPlayer;
