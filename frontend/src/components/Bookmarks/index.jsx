import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  TextField,
  Button,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAppContext } from '../../contexts/AppContext';
import { addBookmark, getBookmarks, deleteBookmark } from '../../api';
import './styles.css';

const Bookmarks = () => {
  const { sessionId, currentSegment, segments } = useAppContext();
  const [bookmarks, setBookmarks] = useState([]);
  const [note, setNote] = useState('');
  const [error, setError] = useState(null);

  const loadBookmarks = useCallback(async () => {
    if (!sessionId) return;
    try {
      const data = await getBookmarks(sessionId);
      setBookmarks(data);
    } catch (error) {
      console.error('Error loading bookmarks:', error);
      setError('Failed to load bookmarks');
    }
  }, [sessionId]);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  const handleAddBookmark = async () => {
    if (!sessionId || currentSegment === null || !segments[currentSegment]) {
      setError('Cannot add bookmark: no segment selected');
      return;
    }

    try {
      const segment = segments[currentSegment];
      const bookmark = await addBookmark(sessionId, segment, note);
      setBookmarks(prev => [...prev, bookmark]);
      setNote('');
      setError(null);
    } catch (error) {
      console.error('Error adding bookmark:', error);
      setError('Failed to add bookmark');
    }
  };

  const handleDeleteBookmark = async (bookmarkId) => {
    try {
      await deleteBookmark(bookmarkId);
      setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
      setError(null);
    } catch (error) {
      console.error('Error deleting bookmark:', error);
      setError('Failed to delete bookmark');
    }
  };

  return (
    <Box className="bookmarks-container">
      <Typography variant="h6" gutterBottom>
        Bookmarks
      </Typography>

      <Box className="add-bookmark">
        <TextField
          fullWidth
          size="small"
          variant="outlined"
          placeholder="Add a note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={!sessionId || currentSegment === null}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddBookmark}
          disabled={!sessionId || currentSegment === null}
        >
          Add Bookmark
        </Button>
      </Box>

      {error && (
        <Typography color="error" className="error-message">
          {error}
        </Typography>
      )}

      <List className="bookmarks-list">
        {bookmarks.map((bookmark) => (
          <ListItem key={bookmark.id}>
            <ListItemText
              primary={bookmark.note || 'No note'}
              secondary={`Segment: ${bookmark.segment.substring(0, 100)}...`}
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                onClick={() => handleDeleteBookmark(bookmark.id)}
              >
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
        {bookmarks.length === 0 && (
          <ListItem>
            <ListItemText
              primary="No bookmarks yet"
              secondary="Add a bookmark to save important parts of the document"
            />
          </ListItem>
        )}
      </List>
    </Box>
  );
};

export default Bookmarks;
