import React, { useState, useEffect, useCallback } from 'react';
import {
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useAppContext } from '../../contexts/AppContext';
import { getBookmarks, addBookmark, deleteBookmark } from '../../api';
import './styles.css';

const Bookmarks = () => {
  const [open, setOpen] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [note, setNote] = useState('');
  
  const {
    sessionId,
    currentPosition,
    setCurrentPosition,
    currentSegment,
    setIsPlaying,
  } = useAppContext();

  const fetchBookmarks = useCallback(async () => {
    if (!sessionId) return;
    
    try {
      const data = await getBookmarks(sessionId);
      setBookmarks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch bookmarks:', error);
      setBookmarks([]);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const handleAddBookmark = async () => {
    if (!sessionId) return;

    try {
      await addBookmark(sessionId, {
        position: currentPosition,
        segment_index: currentSegment,
        note: note
      });
      setDialogOpen(false);
      setNote('');
      fetchBookmarks();
    } catch (error) {
      console.error('Failed to add bookmark:', error);
    }
  };

  const handleDeleteBookmark = async (bookmarkId) => {
    if (!sessionId) return;

    try {
      await deleteBookmark(sessionId, bookmarkId);
      fetchBookmarks();
    } catch (error) {
      console.error('Failed to delete bookmark:', error);
    }
  };

  const handleJumpToBookmark = (position, segmentIndex) => {
    setCurrentPosition(position);
    setIsPlaying(false);
    setOpen(false);
  };

  return (
    <>
      <IconButton onClick={() => setOpen(true)} color="inherit">
        <BookmarkIcon />
      </IconButton>

      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <div className="bookmarks-drawer">
          <div className="bookmarks-header">
            <Typography variant="h6">Bookmarks</Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setDialogOpen(true)}
            >
              Add Bookmark
            </Button>
          </div>

          <List>
            {bookmarks && bookmarks.length > 0 ? (
              bookmarks.map((bookmark) => (
                <ListItem key={bookmark.id}>
                  <ListItemText
                    primary={`Segment ${bookmark.segment_index + 1}`}
                    secondary={bookmark.note || 'No note'}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => handleJumpToBookmark(bookmark.position, bookmark.segment_index)}
                    >
                      <PlayArrowIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={() => handleDeleteBookmark(bookmark.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))
            ) : (
              <ListItem>
                <ListItemText primary="No bookmarks yet" />
              </ListItem>
            )}
          </List>
        </div>
      </Drawer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Add Bookmark</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Note"
            type="text"
            fullWidth
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddBookmark} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Bookmarks;
