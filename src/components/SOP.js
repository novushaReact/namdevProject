import React, { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Modal, Box, IconButton, Tooltip } from "@mui/material";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import DownloadIcon from "@mui/icons-material/Download";
import CloseIcon from "@mui/icons-material/Close";

const sopImages = [
  { id: 1, img: require("../assets/sop/English/white/01.png") },
  { id: 2, img: require("../assets/sop/English/white/02.png") },
  { id: 3, img: require("../assets/sop/English/white/03.png") },
  { id: 4, img: require("../assets/sop/English/white/04.png") },
];

function SOP() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [zoom, setZoom] = useState(1);

  const openImageModal = (imageUrl) => {
    setModalImage(imageUrl);
    setZoom(1);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleZoomIn = () => {
    setZoom((prevZoom) => prevZoom + 0.1);
  };

  const handleZoomOut = () => {
    setZoom((prevZoom) => Math.max(0.1, prevZoom - 0.1));
  };

  const downloadImage = async (imageUrl, fileName) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const aTag = document.createElement("a");
      aTag.href = url;
      aTag.download = fileName;
      aTag.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  };

  return (
    <Container>
      <h3 style={{ textAlign: "center", margin: "20px 0" }}>Standard Operating Procedures</h3>

      <Row style={{ marginTop: "20px" }}>
        {sopImages.map((sop) => (
          <Col
            xs={12}
            sm={6}
            md={4}
            key={sop.id}
            style={{
              marginBottom: "30px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <img
                src={sop.img}
                alt={`SOP ${sop.id}`}
                width="300px"
                height="400px"
                style={{
                  boxShadow: "2px 2px 50px 10px rgba(0, 0, 0, 0.05)",
                  cursor: "pointer",
                }}
                onClick={() => openImageModal(sop.img)}
              />
              <Tooltip title="Download SOP">
                <IconButton onClick={() => downloadImage(sop.img, `SOP-${sop.id}.jpg`)}>
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            </div>
          </Col>
        ))}
      </Row>

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        aria-labelledby="sop-modal-title"
        aria-describedby="sop-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "10px",
            outline: "none",
            textAlign: "center",
          }}
        >
          {/* Close Button */}
          <IconButton
            onClick={closeModal}
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
            }}
          >
            <CloseIcon />
          </IconButton>

          {/* SOP Image */}
          <div
            style={{
              overflow: "hidden",
              textAlign: "center",
            }}
          >
            <img
              src={modalImage}
              alt="Selected SOP"
              style={{
                transform: `scale(${zoom})`,
                transition: "transform 0.3s ease-in-out",
                maxWidth: "100%",
                maxHeight: "80vh",
              }}
            />
          </div>

          {/* Zoom Controls */}
          <div style={{ marginTop: "20px" }}>
            <Tooltip title="Zoom In">
              <IconButton onClick={handleZoomIn}>
                <ZoomInIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Zoom Out">
              <IconButton onClick={handleZoomOut}>
                <ZoomOutIcon />
              </IconButton>
            </Tooltip>
          </div>
        </Box>
      </Modal>
    </Container>
  );
}

export default SOP;
