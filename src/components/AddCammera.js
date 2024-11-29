import React, { useState } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import { Add } from '@mui/icons-material';

const CameraManagement = () => {
  const [cameras, setCameras] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    cameraId: '',
    cameraUrl: '',
    cameraType: 'rtsp',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAddCamera = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        camera_id: parseInt(formData.cameraId, 10),
        url: formData.cameraUrl,
      };

      const response = await fetch('/api/cameras/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const newCamera = {
          id: formData.cameraId,
          url: formData.cameraUrl,
          type: formData.cameraType,
        };
        setCameras([...cameras, newCamera]);
        setIsAddModalOpen(false);
        setFormData({ cameraId: '', cameraUrl: '', cameraType: 'rtsp' });
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to add camera');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontWeight: 'bold', textAlign: 'center' }}>Camera Management</h2>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          style={{ backgroundColor: 'grey', color: 'white', marginLeft: 'auto' }}
          onClick={() => setIsAddModalOpen(true)}
        >
          Add Camera
        </Button>
      </div>

      <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
        {cameras.map((camera) => (
          <div key={camera.id} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h3>Camera {camera.id}</h3>
            <p>Type: {camera.type}</p>
            <p>URL: {camera.url}</p>
          </div>
        ))}
      </div>

      <Dialog
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Camera</DialogTitle>
        <DialogContent>
          <form onSubmit={handleAddCamera} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <TextField
              label="Camera ID"
              type="number"
              value={formData.cameraId}
              onChange={(e) => setFormData({ ...formData, cameraId: e.target.value })}
              required
            />
            <Select
              value={formData.cameraType}
              onChange={(e) => setFormData({ ...formData, cameraType: e.target.value })}
              displayEmpty
            >
              <MenuItem value="rtsp">RTSP Stream</MenuItem>
              <MenuItem value="http">HTTP Stream</MenuItem>
            </Select>
            <TextField
              label="Camera URL"
              value={formData.cameraUrl}
              onChange={(e) => setFormData({ ...formData, cameraUrl: e.target.value })}
              required
            />
            <DialogActions>
              <Button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                style={{ color: 'black' }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                style={{ backgroundColor: 'blue', color: 'white' }}
                disabled={isLoading}
              >
                {isLoading ? 'Adding...' : 'Add'}
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>

      {error && (
        <Alert severity="error" style={{ marginTop: '20px' }}>
          {error}
        </Alert>
      )}
    </div>
  );
};

export default CameraManagement;
