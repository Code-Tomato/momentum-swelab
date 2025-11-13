import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
} from "@mui/material";
import JoinButton from "./JoinButton";

const ProjectCard = ({ project, onToggle }) => {
  const [qty1, setQty1] = useState("");
  const [qty2, setQty2] = useState("");

  // ===== Flask API Calls =====
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const handleCheckIn = async (projectId, qty) => {
    if (!qty) return alert("Please enter a quantity.");
    try {
      const res = await fetch(`${API_BASE}/checkin/${projectId}/${qty}`);
      const data = await res.json();
      alert(data.message);
    } catch (err) {
      alert("Error connecting to server.");
      console.error(err);
    }
  };

  const handleCheckOut = async (projectId, qty) => {
    if (!qty) return alert("Please enter a quantity.");
    try {
      const res = await fetch(`${API_BASE}/checkout/${projectId}/${qty}`);
      const data = await res.json();
      alert(data.message);
    } catch (err) {
      alert("Error connecting to server.");
      console.error(err);
    }
  };

  const handleJoin = async (projectId) => {
    try {
      const res = await fetch(`${API_BASE}/join/${projectId}`);
      const data = await res.json();
      alert(data.message);
    } catch (err) {
      alert("Error connecting to server.");
    }
  };

  const handleLeave = async (projectId) => {
    try {
      const res = await fetch(`${API_BASE}/leave/${projectId}`);
      const data = await res.json();
      alert(data.message);
    } catch (err) {
      alert("Error connecting to server.");
    }
  };


  return (
    <Card
      variant="outlined"
      sx={{
        border: "1px solid #ccc",
        backgroundColor: project.joined ? "#e8f5e9" : "#fff",
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          {/* Project Info */}
          <Box>
            <Typography variant="h6" sx={{ mb: 0.5 }}>
              {project.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {project.users.join(", ")}
            </Typography>
            <Typography variant="body2">HWSet1: {project.hw1}</Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              HWSet2: {project.hw2}
            </Typography>
          </Box>

          {/* Actions Section */}
          <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
            {/* HWSet 1 Controls */}
            <Box display="flex" alignItems="center" gap={1}>
              <TextField
                size="small"
                variant="outlined"
                placeholder="Enter"
                value={qty1}
                onChange={(e) => setQty1(e.target.value)}
                sx={{ width: 70 }}
              />
              <Button
                variant="contained"
                size="small"
                onClick={() => handleCheckIn(project.id, qty1)}
              >
                Check In
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleCheckOut(project.id, qty1)}
              >
                Check Out
              </Button>
            </Box>

            {/* HWSet 2 Controls */}
            <Box display="flex" alignItems="center" gap={1}>
              <TextField
                size="small"
                variant="outlined"
                placeholder="Enter"
                value={qty2}
                onChange={(e) => setQty2(e.target.value)}
                sx={{ width: 70 }}
              />
              <Button
                variant="contained"
                size="small"
                onClick={() => handleCheckIn(project.id, qty2)}
              >
                Check In
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleCheckOut(project.id, qty2)}
              >
                Check Out
              </Button>
            </Box>

            {/* Join / Leave Button */}
            <JoinButton
              joined={project.joined}
              onClick={() => project.joined ? handleLeave(project.id) : handleJoin(project.id)
              }
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;

