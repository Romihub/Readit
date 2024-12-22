import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Drawer,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Switch,
  FormControlLabel,
  Slider,
  Divider,
  Button,
  CircularProgress,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { useSettings } from '../../contexts/SettingsContext';
import { useAppContext } from '../../contexts/AppContext';
import { getVoices } from '../../api';
import './styles.css';

const Settings = () => {
  const [open, setOpen] = useState(false);
  const [voices, setVoices] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const { 
    darkMode, 
    setDarkMode, 
    fontSize, 
    setFontSize,
    selectedVoice,
    setSelectedVoice,
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
        console.error('Failed to fetch voices:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVoices();
  }, [setSelectedVoice, selectedVoice]);

  const fontSizes = [
    { value: 12, label: 'Small' },
    { value: 16, label: 'Medium' },
    { value: 20, label: 'Large' },
    { value: 24, label: 'Extra Large' },
  ];

  return (
    <>
      <IconButton
        onClick={() => setOpen(true)}
        color="inherit"
        aria-label="settings"
      >
        <SettingsIcon />
      </IconButton>

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 400 } }
        }}
      >
        <Box className="settings-container">
          <Typography variant="h6" gutterBottom>
            Settings
          </Typography>

          <Stack spacing={4}>
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Voice Settings
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Select Voice</InputLabel>
                {loading ? (
                  <Box display="flex" alignItems="center" justifyContent="center" p={2}>
                    <CircularProgress size={24} />
                  </Box>
                ) : voices && voices.length > 0 ? (
                  <Select
                    value={selectedVoice || ''}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    label="Select Voice"
                  >
                    {voices.map((voice) => (
                      <MenuItem 
                        key={voice.id} 
                        value={voice.id}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: 2
                        }}
                      >
                        <Typography>{voice.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {voice.language}
                        </Typography>
                      </MenuItem>
                    ))}
                  </Select>
                ) : (
                  <Typography color="error">
                    No voices available. Please try again later.
                  </Typography>
                )}
              </FormControl>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Display Settings
              </Typography>
              <Stack spacing={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={darkMode}
                      onChange={(e) => setDarkMode(e.target.checked)}
                    />
                  }
                  label="Dark Mode"
                />

                <Box>
                  <Typography gutterBottom>Font Size</Typography>
                  <Slider
                    value={fontSize}
                    min={12}
                    max={24}
                    step={4}
                    marks={fontSizes.map(size => ({
                      value: size.value,
                      label: size.label
                    }))}
                    onChange={(_, value) => setFontSize(value)}
                  />
                </Box>
              </Stack>
            </Box>

            <Box sx={{ mt: 'auto' }}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => setOpen(false)}
              >
                Done
              </Button>
            </Box>
          </Stack>
        </Box>
      </Drawer>
    </>
  );
};

export default Settings;
