import React, { useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
} from '@mui/material';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAppContext } from '../../contexts/AppContext';
import { getBookmarks, addBookmark, deleteBookmark } from '../../api';
import './styles.css';

const Bookmarks = () => {
  const { sessionId, segments, currentSegment } = useAppContext();
  const [bookmarks, setBookmarks] = useState([]);
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (sessionId) {
      loadBookmarks();
    }
  }, [sessionId]);

  const loadBookmarks = async () => {
    try {
      const data = await getBookmarks(sessionId);
      setBookmarks(data);
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
      setError('Failed to load bookmarks');
    }
  };

  const handleAddBookmark = async () => {
    if (!sessionId || currentSegment === undefined) return;

    setLoading(true);
    setError(null);
    try {
      const bookmark = {
        segment_index: currentSegment,
        text: segments[currentSegment],
        note: note.trim(),
      };

      console.log('Adding bookmark:', bookmark);
      await addBookmark(sessionId, bookmark);
      
      // Reload bookmarks to get the updated list
      await loadBookmarks();
      
      // Clear form and close dialog
      setNote('');
      setOpen(false);
    } catch (error) {
      console.error('Failed to add bookmark:', error);
      setError('Failed to add bookmark');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBookmark = async (bookmarkId) => {
    if (!sessionId || !bookmarkId) return;

    try {
      console.log('Deleting bookmark:', bookmarkId);
      await deleteBookmark(sessionId, bookmarkId);
      
      // Reload bookmarks to get the updated list
      await loadBookmarks();
    } catch (error) {
      console.error('Failed to delete bookmark:', error);
      setError('Failed to delete bookmark');
    }
  };

  const handleOpen = () => {
    setOpen(true);
    setError(null);
  };

  const handleClose = () => {
    setOpen(false);
    setNote('');
    setError(null);
  };

  return (
    <Box className="bookmarks-container">
      <Box className="bookmarks-header">
        <Typography variant="h6">
          Bookmarks
        </Typography>
        <Tooltip title="Add Bookmark">
          <span>
            <IconButton
              onClick={handleOpen}
              disabled={!sessionId || currentSegment === undefined}
              color="primary"
            >
              <BookmarkIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      {error && (
        <Typography color="error" className="error-message">
          {error}
        </Typography>
      )}

      <List className="bookmarks-list">
        {bookmarks.map((bookmark) => (
          <ListItem
            key={bookmark.id}
            className="bookmark-item"
          >
            <ListItemText
              primary={`Segment ${bookmark.segment_index + 1}`}
              secondary={
                <>
                  <Typography
                    component="span"
                    variant="body2"
                    color="textPrimary"
                  >
                    {bookmark.text.substring(0, 100)}...
                  </Typography>
                  {bookmark.note && (
                    <Typography
                      component="p"
                      variant="caption"
                      color="textSecondary"
                    >
                      Note: {bookmark.note}
                    </Typography>
                  )}
                </>
              }
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
      </List>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Bookmark</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle2" gutterBottom>
            Current Segment:
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            {segments[currentSegment]?.substring(0, 200)}...
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            label="Add a note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleAddBookmark}
            color="primary"
            variant="contained"
            disabled={loading}
          >
            Add Bookmark
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Bookmarks;
