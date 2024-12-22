import React from 'react';
import {
  Container,
  Typography,
  Alert,
  Snackbar,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  Stack,
} from '@mui/material';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import DocumentUploader from './components/DocumentUploader';
import TextReader from './components/TextReader';
import AIAssistant from './components/AIAssistant';
import Settings from './components/Settings';
import Bookmarks from './components/Bookmarks';

const AppContent = () => {
  const { error, setError, sessionId } = useAppContext();
  const { darkMode, fontSize } = useSettings();

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#1976d2',
      },
      background: {
        default: darkMode ? '#303030' : '#ffffff',
        paper: darkMode ? '#424242' : '#ffffff',
      },
    },
    typography: {
      fontSize: fontSize,
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md">
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Readit
        </Typography>
        
        <Typography variant="subtitle1" gutterBottom align="center">
          Upload a document and let AI read it for you
        </Typography>

        <Stack spacing={2}>
          <Box sx={{ position: 'relative' }}>
            <DocumentUploader />
            <Box sx={{ position: 'absolute', top: 0, right: 0, display: 'flex', gap: 1 }}>
              <Settings />
              <Bookmarks />
              <AIAssistant />
            </Box>
          </Box>

          {sessionId && <TextReader />}
        </Stack>

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
        >
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
};

const App = () => {
  return (
    <SettingsProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </SettingsProvider>
  );
};

export default App;
