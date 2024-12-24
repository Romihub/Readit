import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Switch,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import { useSettings } from '../../contexts/SettingsContext';
import { getVoices } from '../../api';
import './styles.css';

const Settings = ({ open, onClose }) => {
  const [voices, setVoices] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const { 
    darkMode, 
    setDarkMode, 
    fontSize, 
    setFontSize,
    selectedVoice,
    setSelectedVoice,
    wordsPerPage,
    setWordsPerPage,
  } = useSettings();

  useEffect(() => {
    const fetchVoices = async () => {
      setLoading(true);
      try {
        const voiceList = await getVoices();
        setVoices(voiceList);
        if (!selectedVoice && voiceList.length > 0) {
          setSelectedVoice(voiceList[0].id);
        }
      } catch (error) {
        console.error('Error fetching voices:', error);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchVoices();
    }
  }, [open, selectedVoice, setSelectedVoice]);

  const handleFontSizeChange = (event, newValue) => {
    setFontSize(newValue);
  };

  const handleWordsPerPageChange = (event, newValue) => {
    setWordsPerPage(newValue);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          minWidth: '350px',
          maxWidth: '450px',
          margin: '16px',
          width: 'calc(100% - 32px)',
        }
      }}
    >
      <DialogTitle className="settings-header">
        <Typography variant="h6">Settings</Typography>
        <IconButton 
          edge="end" 
          color="inherit" 
          onClick={onClose}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent className="settings-content">
        <div className="settings-section">
          <div className="settings-section-title">
            <Typography variant="subtitle1">Appearance</Typography>
          </div>
          <Box display="flex" alignItems="center" mb={2}>
            <Typography>Dark Mode</Typography>
            <Switch
              checked={darkMode}
              onChange={(e) => setDarkMode(e.target.checked)}
              color="primary"
            />
          </Box>
          <Box>
            <div className="slider-label">
              <Typography>Font Size</Typography>
              <Tooltip title="Adjust the size of text in the reader">
                <InfoIcon className="info-icon" fontSize="small" />
              </Tooltip>
            </div>
            <Slider
              value={fontSize}
              onChange={handleFontSizeChange}
              min={12}
              max={24}
              step={1}
              marks
              valueLabelDisplay="auto"
            />
          </Box>
        </div>

        <div className="settings-section">
          <div className="settings-section-title">
            <Typography variant="subtitle1">Reading</Typography>
          </div>
          <Box>
            <div className="slider-label">
              <Typography>Words per Page</Typography>
              <Tooltip title="Number of words to display per page">
                <InfoIcon className="info-icon" fontSize="small" />
              </Tooltip>
            </div>
            <Slider
              value={wordsPerPage}
              onChange={handleWordsPerPageChange}
              min={50}
              max={500}
              step={50}
              marks
              valueLabelDisplay="auto"
            />
          </Box>
        </div>

        <div className="settings-section">
          <div className="settings-section-title">
            <Typography variant="subtitle1">Text to Speech</Typography>
          </div>
          <FormControl fullWidth>
            <InputLabel>Voice</InputLabel>
            <Select
              value={selectedVoice || ''}
              onChange={(e) => setSelectedVoice(e.target.value)}
              disabled={loading}
            >
              {loading ? (
                <MenuItem disabled>
                  <CircularProgress size={20} />
                  Loading voices...
                </MenuItem>
              ) : (
                voices.map((voice) => (
                  <MenuItem key={voice.id} value={voice.id}>
                    {voice.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Settings;
