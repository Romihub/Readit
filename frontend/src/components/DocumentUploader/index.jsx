import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAppContext } from '../../contexts/AppContext';
import { uploadDocument } from '../../api';
import './styles.css';

const DocumentUploader = () => {
  const {
    setSessionId,
    setSegments,
    setCurrentSegment,
    setError,
  } = useAppContext();

  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [fileName, setFileName] = useState('');

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setFileName(file.name);
    setUploading(true);
    setUploadSuccess(false);
    setError(null);

    try {
      console.log('Uploading file:', file.name);
      const response = await uploadDocument(file);
      console.log('Upload response:', response);

      setSessionId(response.session_id);
      setSegments(response.segments);
      setCurrentSegment(0);
      setUploadSuccess(true);
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  }, [setSessionId, setSegments, setCurrentSegment, setError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    multiple: false
  });

  return (
    <Paper elevation={3} className="uploader-container">
      <Box
        {...getRootProps()}
        className={`dropzone ${isDragActive ? 'active' : ''} ${uploadSuccess ? 'success' : ''}`}
      >
        <input {...getInputProps()} />
        
        {uploading ? (
          <Box className="upload-status">
            <CircularProgress size={40} />
            <Typography variant="body1" className="upload-text">
              Uploading {fileName}...
            </Typography>
          </Box>
        ) : uploadSuccess ? (
          <Box className="upload-status success">
            <CheckCircleIcon className="success-icon" />
            <Typography variant="body1" className="upload-text">
              Successfully uploaded {fileName}
            </Typography>
          </Box>
        ) : (
          <Box className="upload-status">
            <CloudUploadIcon className="upload-icon" />
            <Typography variant="body1" className="upload-text">
              {isDragActive
                ? 'Drop the file here'
                : 'Drag and drop a document or click to select'}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Supported formats: PDF, DOC, DOCX, TXT
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default DocumentUploader;
