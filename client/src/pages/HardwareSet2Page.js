import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function HardwareSet1Page() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const user = JSON.parse(sessionStorage.getItem('user'));
  const projectId = sessionStorage.getItem('currentProjectId'); // optional
  
  const handleCheckout = async (qty) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/hardware/hwset2/checkout`, { userId: user.username, projectId, qty });
      setMessage(res.data.message || 'Checked out successfully!');
    } catch {
      setMessage('Checkout failed.');
    }
  };

  const handleCheckin = async (qty) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/hardware/hwset2/checkin`, { userId: user.username, projectId, qty });
      setMessage(res.data.message || 'Checked in successfully!');
    } catch {
      setMessage('Checkin failed.');
    }
  };

  return (
    <CenteredCard title="Hardware Set 1">
      <button onClick={() => handleCheckout(1)} style={btnStyle('#28a745')}>Checkout 2 Unit</button>
      <button onClick={() => handleCheckin(1)} style={btnStyle('#ffc107')}>Checkin 2 Unit</button>
      {message && <p style={{ marginTop: '10px' }}>{message}</p>}
      <button onClick={() => navigate('/portal')} style={btnStyle('#007bff')}>Back to Portal</button>
    </CenteredCard>
  );
}

export default HardwareSet2Page;

// Reusable layout styles
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
const btnStyle = (bg) => ({ padding: '10px', backgroundColor: bg, color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginBottom: '10px' });
