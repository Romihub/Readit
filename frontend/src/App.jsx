import React from 'react';
import { Box, Container, Paper, Typography, IconButton } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { AppProvider } from './contexts/AppContext';
import { SettingsProvider } from './contexts/SettingsContext';
import TextReader from './components/TextReader';
import DocumentUploader from './components/DocumentUploader';
import Settings from './components/Settings';
import Bookmarks from './components/Bookmarks';
import AIAssistant from './components/AIAssistant';
import './App.css';

function App() {
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  const toggleSettings = () => {
    setSettingsOpen(!settingsOpen);
  };

  return (
    <AppProvider>
      <SettingsProvider>
        <div className="app">
          <header className="app-header">
            <Typography variant="h2" component="h1" className="app-title">
              Readit
            </Typography>
            <IconButton 
              color="inherit" 
              className="settings-button"
              aria-label="settings"
              onClick={toggleSettings}
            >
              <SettingsIcon />
            </IconButton>
          </header>

          <Container maxWidth="md" className="main-container">
            <Box className="content-layout">
              <Box className="main-content">
                <Typography variant="h6" className="upload-title">
                  Upload a document and let AI read it for you
                </Typography>
                <Paper elevation={3} className="upload-area">
                  <DocumentUploader />
                  <TextReader />
                </Paper>
                <Box className="bottom-section">
                  <Paper elevation={3} className="bookmarks-section">
                    <Bookmarks />
                  </Paper>
                  <Paper elevation={3} className="ai-section">
                    <AIAssistant />
                  </Paper>
                </Box>
              </Box>
            </Box>
          </Container>

          <Settings open={settingsOpen} onClose={toggleSettings} />
        </div>
      </SettingsProvider>
    </AppProvider>
  );
}

export default App;
