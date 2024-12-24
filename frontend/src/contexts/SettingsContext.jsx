import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

const getSavedValue = (key, defaultValue) => {
  try {
    const saved = localStorage.getItem(key);
    if (saved === null) return defaultValue;
    return JSON.parse(saved);
  } catch (error) {
    console.warn(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

export const SettingsProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => 
    getSavedValue('darkMode', false)
  );
  
  const [fontSize, setFontSize] = useState(() => 
    getSavedValue('fontSize', 16)
  );
  
  const [selectedVoice, setSelectedVoice] = useState(() => 
    getSavedValue('selectedVoice', null)
  );
  
  const [wordsPerPage, setWordsPerPage] = useState(() => 
    getSavedValue('wordsPerPage', 200)
  );

  // Save settings to localStorage
  const saveToLocalStorage = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  };

  useEffect(() => {
    saveToLocalStorage('darkMode', darkMode);
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  useEffect(() => {
    saveToLocalStorage('fontSize', fontSize);
  }, [fontSize]);

  useEffect(() => {
    saveToLocalStorage('selectedVoice', selectedVoice);
  }, [selectedVoice]);

  useEffect(() => {
    saveToLocalStorage('wordsPerPage', wordsPerPage);
  }, [wordsPerPage]);

  const value = {
    darkMode,
    setDarkMode,
    fontSize,
    setFontSize,
    selectedVoice,
    setSelectedVoice,
    wordsPerPage,
    setWordsPerPage,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsContext;
