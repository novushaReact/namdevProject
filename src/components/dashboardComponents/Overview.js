import React, { useState, useEffect } from "react";
import { Col, Row, Modal, Button, Form } from "react-bootstrap";
import { IconButton } from "@mui/material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import SearchIcon from "@mui/icons-material/Search";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import BarChartIcon from "@mui/icons-material/BarChart";
import axios from "axios";

function Overview(props) {
  const [cameraCount, setCameraCount] = useState(0);
  const [detectionCount, setDetectionCount] = useState(0);
  const [objectCount, setObjectCount] = useState(null);
  const [peopleCount, setPeopleCount] = useState(null);
  const [showObjectModal, setShowObjectModal] = useState(false);
  const [showPeopleModal, setShowPeopleModal] = useState(false);
  const [cameraId, setCameraId] = useState("");

  // Fetch camera count
  useEffect(() => {
    async function fetchCameraCount() {
      try {
        const response = await axios.get(
          "https://ng3m7737-8000.inc1.devtunnels.ms/cameras/count"
        );
        setCameraCount(response.data.camera_count);
      } catch (error) {
        console.error("Error fetching camera count:", error);
      }
    }
    fetchCameraCount();
  }, []);

  // Fetch detection count
  useEffect(() => {
    async function fetchDetectionCount() {
      const newData = [];
      for (let i = 0; i < 40; i++) {
        const res = await axios.get(
          `http://127.0.0.1:8000/data_by_date_and_source?date=${props.date}&source_id=${i}`
        );
        newData.push(res.data.count);
      }
      if (newData.length > 0) {
        setDetectionCount(newData.reduce((sum, num) => sum + num, 0));
      }
    }
    fetchDetectionCount();
  }, [props.date]);

  // Fetch object count
  async function fetchObjectCount(cameraId) {
    try {
      const response = await axios.get(
        `https://ng3m7737-8000.inc1.devtunnels.ms/cameras/recent-object-count/${cameraId}`
      );
      // Extract object count from the new response structure
      const objectCount = response.data.counts[cameraId].object_count;
      setObjectCount(objectCount);
    } catch (error) {
      console.error("Error fetching object count:", error);
      setObjectCount(null);
    }
  }
  
  // Fetch people count
  async function fetchPeopleCount(cameraId) {
    try {
      const response = await axios.get(
        `https://ng3m7737-8000.inc1.devtunnels.ms/cameras/people-count/${cameraId}`
      );
      // Extract people count from the new response structure
      const peopleCount = response.data.counts[cameraId].current_people_in_roi3;
      setPeopleCount(peopleCount !== undefined ? peopleCount : "No Data");
    } catch (error) {
      console.error("Error fetching people count:", error);
      setPeopleCount("No Data");
    }
  }

  const handleObjectCountClick = () => setShowObjectModal(true);
  const handleFetchObjectCount = () => {
    if (cameraId) fetchObjectCount(cameraId);
    setShowObjectModal(false);
  };

  const handlePeopleCountClick = () => setShowPeopleModal(true);
  const handleFetchPeopleCount = () => {
    if (cameraId) fetchPeopleCount(cameraId);
    setShowPeopleModal(false);
  };

  return (
    <div className="chart column-chart" style={{ width: "100%" }}>
      <h3>Welcome, CMR For Better Tomorrow</h3>
      <p>Welcome back to ALVision Theft</p>
      <Row>
        {/* Camera Count */}
        <Col xs={6} style={{ padding: 0 }}>
          <div
            style={{
              border: "1px solid #000",
              margin: "5px",
              padding: "10px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconButton>
                <CameraAltIcon style={{ color: "#3f51b5" }} />
              </IconButton>
              <div>{cameraCount}</div>
            </div>
            <div style={{ textAlign: "center" }}>Camera Count</div>
          </div>
        </Col>

        {/* Object Count */}
        <Col xs={6} style={{ padding: 0 }}>
          <div
            style={{
              border: "1px solid #000",
              margin: "5px",
              padding: "10px",
              cursor: "pointer",
            }}
            onClick={handleObjectCountClick}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconButton>
                <SearchIcon style={{ color: "#ff9800" }} />
              </IconButton>
              <div>{objectCount !== null ? objectCount : "Click to fetch"}</div>
            </div>
            <div style={{ textAlign: "center" }}>Object Count</div>
          </div>
        </Col>

        {/* People Count */}
        <Col xs={6} style={{ padding: 0 }}>
          <div
            style={{
              border: "1px solid #000",
              margin: "5px",
              padding: "10px",
              cursor: "pointer",
            }}
            onClick={handlePeopleCountClick}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconButton>
                <PeopleAltIcon style={{ color: "#4caf50" }} />
              </IconButton>
              <div>{peopleCount !== null ? peopleCount : "Click to fetch"}</div>
            </div>
            <div style={{ textAlign: "center" }}>People Count</div>
          </div>
        </Col>

        {/* Detection Count */}
        <Col xs={6} style={{ padding: 0 }}>
          <div
            style={{
              border: "1px solid #000",
              margin: "5px",
              padding: "10px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconButton>
                <BarChartIcon style={{ color: "#9c27b0" }} />
              </IconButton>
              <div>{detectionCount}</div>
            </div>
            <div style={{ textAlign: "center" }}>Detection Report</div>
          </div>
        </Col>
      </Row>

      {/* Modals */}
      <Modal show={showObjectModal} onHide={() => setShowObjectModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Enter Camera ID for Object Count</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Camera ID</Form.Label>
              <Form.Control
                type="number"
                value={cameraId}
                onChange={(e) => setCameraId(e.target.value)}
                placeholder="Enter camera ID"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowObjectModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleFetchObjectCount}>
            Fetch Object Count
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showPeopleModal} onHide={() => setShowPeopleModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Enter Camera ID for People Count</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Camera ID</Form.Label>
              <Form.Control
                type="number"
                value={cameraId}
                onChange={(e) => setCameraId(e.target.value)}
                placeholder="Enter camera ID"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPeopleModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleFetchPeopleCount}>
            Fetch People Count
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Overview;
