import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Paper,
  LinearProgress,
  Tooltip,
  Pagination,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import { useAppContext } from '../../contexts/AppContext';
import { useSettings } from '../../contexts/SettingsContext';
import { textToSpeech } from '../../api';
import './styles.css';

const TextReader = () => {
  const {
    segments,
    currentSegment,
    setCurrentSegment,
    isPlaying,
    setIsPlaying,
    currentPosition,
    setCurrentPosition,
  } = useAppContext();

  const { selectedVoice, wordsPerPage } = useSettings();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [highlightedWord, setHighlightedWord] = useState(-1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const audioRef = useRef(null);
  const contentRef = useRef(null);

  // Calculate total pages based on wordsPerPage setting
  useEffect(() => {
    if (segments && segments.length > 0) {
      const totalWords = segments.reduce((acc, segment) => 
        acc + segment.split(' ').length, 0);
      setTotalPages(Math.ceil(totalWords / wordsPerPage));
    }
  }, [segments, wordsPerPage]);

  // Auto-scroll to current segment
  useEffect(() => {
    if (contentRef.current && segments) {
      const segmentElements = contentRef.current.getElementsByClassName('segment');
      if (segmentElements[currentSegment]) {
        segmentElements[currentSegment].scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }
  }, [currentSegment, segments]);

  const handleSegmentEnd = useCallback((segmentIndex) => {
    console.log('Audio ended');
    if (segmentIndex < segments.length - 1) {
      setCurrentSegment(prev => prev + 1);
      setCurrentPosition(0);
      // Continue playing next segment automatically
      playSegment(segmentIndex + 1);
    } else {
      setIsPlaying(false);
      setHighlightedWord(-1);
    }
  }, [segments.length, setCurrentSegment, setCurrentPosition, setIsPlaying]);

  const playSegment = useCallback(async (segmentIndex) => {
    try {
      const segment = segments[segmentIndex];
      if (!segment || !selectedVoice) return;

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

          // Update current page based on total words read
          const totalWordsRead = segments.slice(0, segmentIndex).reduce((acc, seg) => 
            acc + seg.split(' ').length, 0) + wordIndex;
          const newPage = Math.ceil((totalWordsRead + 1) / wordsPerPage);
          if (newPage !== currentPage) {
            setCurrentPage(newPage);
          }
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
  }, [currentPosition, segments, selectedVoice, setCurrentPosition, setIsPlaying, handleSegmentEnd, currentPage, wordsPerPage]);

  const handlePlayPause = useCallback(async () => {
    try {
      if (isPlaying) {
        // Pause playback
        setIsPlaying(false);
        if (audioRef.current) {
          audioRef.current.pause();
          setCurrentPosition(audioRef.current.currentTime || 0);
        }
      } else {
        // Resume or start playback
        setIsPlaying(true);
        if (audioRef.current) {
          if (currentPosition > 0) {
            audioRef.current.currentTime = currentPosition;
          }
          await audioRef.current.play();
        } else {
          await playSegment(currentSegment);
        }
      }
    } catch (error) {
      console.error('Error in handlePlayPause:', error);
      setError('Failed to play/pause audio');
      setIsPlaying(false);
    }
  }, [currentPosition, currentSegment, isPlaying, playSegment, setCurrentPosition, setIsPlaying]);

  const handlePageChange = useCallback((event, page) => {
    const wordsPerSegment = segments.map(segment => segment.split(' ').length);
    let totalWords = 0;
    let targetSegment = 0;

    // Find the segment that contains the start of the selected page
    for (let i = 0; i < wordsPerSegment.length; i++) {
      if (totalWords >= (page - 1) * wordsPerPage) {
        targetSegment = i;
        break;
      }
      totalWords += wordsPerSegment[i];
    }

    setCurrentSegment(targetSegment);
    setCurrentPage(page);
    setCurrentPosition(0);
    setHighlightedWord(-1);
    
    if (isPlaying) {
      playSegment(targetSegment);
    }
  }, [segments, isPlaying, playSegment, setCurrentSegment, wordsPerPage]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  if (!segments || segments.length === 0) {
    return (
      <Paper elevation={3} className="text-reader">
        <Typography variant="body1" align="center">
          No document loaded. Please upload a document to start reading.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} className="text-reader">
      <Box className="text-content" ref={contentRef}>
        {segments.map((segment, segmentIndex) => (
          <Box
            key={segmentIndex}
            className={`segment ${segmentIndex === currentSegment ? 'active' : ''}`}
          >
            {segment.split(' ').map((word, index) => (
              <span
                key={index}
                className={`word ${
                  segmentIndex === currentSegment && index === highlightedWord
                    ? 'highlighted'
                    : ''
                }`}
              >
                {word}{' '}
              </span>
            ))}
          </Box>
        ))}
      </Box>

      <Box className="controls">
        <Box className="progress-info">
          <Typography variant="caption">
            Segment {currentSegment + 1} of {segments.length}
          </Typography>
          <Typography variant="caption">
            {Math.floor(currentPosition)}s / {Math.floor(segments[currentSegment].length / 100)}s
          </Typography>
        </Box>

        <LinearProgress
          variant="determinate"
          value={(currentPosition / (segments[currentSegment].length / 100)) * 100 || 0}
          className="progress-bar"
        />

        <Box className="control-buttons">
          <Tooltip title="Previous Segment">
            <span>
              <IconButton
                onClick={() => handlePageChange(null, Math.max(1, currentPage - 1))}
                disabled={currentPage === 1 || loading}
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
                {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Next Segment">
            <span>
              <IconButton
                onClick={() => handlePageChange(null, Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages || loading}
              >
                <SkipNextIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Box>

        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
          size="small"
          className="pagination"
        />
      </Box>

      {error && (
        <Typography color="error" className="error-message">
          {error}
        </Typography>
      )}
    </Paper>
  );
};

export default TextReader;
