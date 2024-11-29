import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Button,
  CircularProgress,
  Grid,
  Card,
  Typography,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
  Pagination
} from "@mui/material";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";

function SnapshotViewer() {
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState("");
  const [cameraId, setCameraId] = useState(1);
  const [totalSnapshots, setTotalSnapshots] = useState(0);
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;

  const fetchSnapshots = async () => {
    if (!dateFilter || !cameraId) return;

    setLoading(true);

    try {
      const [year, month, day] = dateFilter.split("-");
      const response = await axios.get(
        `https://ng3m7737-8000.inc1.devtunnels.ms/snapdate_count-daywise/${year}/${month}/${day}?camera_id=${cameraId}`
      );
      
      setSnapshots(response.data.snapshots);
      setTotalSnapshots(response.data.count);
      setPage(1);
    } catch (error) {
      console.error("Error fetching snapshots:", error);
      setSnapshots([]);
      setTotalSnapshots(0);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchSnapshots();
  }, [dateFilter, cameraId]);

  // Paginate snapshots
  const paginatedSnapshots = snapshots.slice(
    (page - 1) * itemsPerPage, 
    page * itemsPerPage
  );

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const downloadAllImagesAsZip = async () => {
    if (snapshots.length === 0) return;

    setDownloadLoading(true);
    const zip = new JSZip();

    try {
      const promises = snapshots.map(async (snapshot) => {
        const response = await axios.get(snapshot.path, {
          responseType: 'blob'
        });
        zip.file(snapshot.filename, response.data);
      });

      await Promise.all(promises);

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, `Camera_${cameraId}_Snapshots_${dateFilter}.zip`);
    } catch (error) {
      console.error("Error downloading images:", error);
      alert("Failed to download images. Please try again.");
    } finally {
      setDownloadLoading(false);
    }
  };

  const generatePDF = () => {
    if (snapshots.length === 0) return;

    const doc = new jsPDF();
    doc.setFontSize(12);
    
    // Title
    doc.text(`Snapshot Report`, 10, 10);
    doc.text(`Camera: ${cameraId} | Date: ${dateFilter}`, 10, 20);

    // Table headers
    doc.setFontSize(10);
    doc.text("Filename", 10, 30);
    doc.text("Time", 100, 30);

    // Add snapshot details
    snapshots.forEach((snapshot, index) => {
      const yPosition = 40 + (index * 10);
      doc.text(snapshot.filename, 10, yPosition);
      doc.text(snapshot.time, 100, yPosition);
    });

    doc.save(`Snapshots_Camera${cameraId}_${dateFilter}.pdf`);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h5" align="center" sx={{ mb: 3 }}>
   Throughput
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <TextField
            type="date"
            label="Select Date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            fullWidth
            variant="outlined"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Camera ID</InputLabel>
            <Select
              value={cameraId}
              onChange={(e) => setCameraId(e.target.value)}
              label="Camera ID"
            >
              {Array.from({ length: 26 }, (_, i) => i + 1).map((id) => (
                <MenuItem key={id} value={id}>
                  Camera {id}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box display="flex" gap={2} height="100%">
          <Button
  variant="contained"
  color="primary"
  fullWidth
  onClick={generatePDF}
  disabled={true} // The button is now disabled and not clickable
  sx={{ height: "56px" }}
>
  Download PDF
</Button>

<Button
  variant="contained"
  color="secondary"
  fullWidth
  onClick={downloadAllImagesAsZip}
  disabled={true} // The button is now disabled and not clickable
  sx={{ height: "56px" }}
>
  {downloadLoading ? "Downloading..." : "Download ZIP"}
</Button>

          </Box>
        </Grid>
      </Grid>

      {dateFilter && (
        <Typography 
        variant="body2" 
        align="center" 
        sx={{ mb: 2, fontWeight: 'bold' }}
      >
        Total Snapshots: {totalSnapshots} | Camera: {cameraId} | Date: {dateFilter}
      </Typography>
      
      )}

      {loading ? (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
          <CircularProgress sx={{ mb: 2 }} />
          <Typography>Loading snapshots...</Typography>
        </Box>
      ) : paginatedSnapshots.length > 0 ? (
        <>
          <Grid container spacing={2}>
            {paginatedSnapshots.map((snapshot, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    height: '100%'
                  }}
                >
                  <img
                    src={snapshot.path}
                    alt={snapshot.filename}
                    style={{
                      width: '100%',
                      maxHeight: '250px',
                      objectFit: 'cover',
                      borderRadius: '4px',
                      marginBottom: '10px'
                    }}
                  />
                  <Typography variant="body2" color="textSecondary">
                    {snapshot.filename} - {snapshot.time}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box display="flex" justifyContent="center" mt={3}>
            <Pagination
              count={Math.ceil(snapshots.length / itemsPerPage)}
              page={page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </>
      ) : dateFilter ? (
        <Typography variant="body1" align="center" color="textSecondary">
          No snapshots found for Camera {cameraId} on {dateFilter}
        </Typography>
      ) : null}
    </Container>
  );
}

export default SnapshotViewer;