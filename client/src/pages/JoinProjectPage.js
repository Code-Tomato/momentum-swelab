import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function JoinProjectPage() {
  const [projectId, setProjectId] = useState('');
  const [message, setMessage] = useState('');
  const user = JSON.parse(sessionStorage.getItem('user'));
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE_URL}/projects/${projectId}/join`, { userId: user.username });
      setMessage(res.data.message || 'Joined project successfully!');
    } catch {
      setMessage('Failed to join project.');
    }
  };

  return (
    <CenteredCard title="Join Project">
      <form onSubmit={handleSubmit} style={formStyle}>
        <input type="text" placeholder="Enter project ID"
          value={projectId} onChange={(e) => setProjectId(e.target.value)} required />
        <button type="submit" style={btnStyle('#17a2b8')}>Join</button>
      </form>
      {message && <p>{message}</p>}
      <button onClick={() => navigate('/portal')} style={btnStyle('#007bff')}>Back to Portal</button>
    </CenteredCard>
  );
}

export default JoinProjectPage;

function CenteredCard({ title, children }) {
  return (
    <div style={pageContainer}>
      <div style={card}>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}

const pageContainer = { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f5f5f5' };
const card = { background: 'white', padding: '40px', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', width: '350px', textAlign: 'center' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '10px' };
const btnStyle = (bg) => ({ padding: '10px', backgroundColor: bg, color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' });
