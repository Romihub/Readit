import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [sessionId, setSessionId] = useState(null);
  const [segments, setSegments] = useState([]);
  const [currentSegment, setCurrentSegment] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [bookmarks, setBookmarks] = useState([]);
  const [error, setError] = useState(null);

  const value = {
    sessionId,
    setSessionId,
    segments,
    setSegments,
    currentSegment,
    setCurrentSegment,
    isPlaying,
    setIsPlaying,
    currentPosition,
    setCurrentPosition,
    bookmarks,
    setBookmarks,
    error,
    setError,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext;
