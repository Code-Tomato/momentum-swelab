import React from 'react';
import { useNavigate } from 'react-router-dom';

function MyUserPortal() {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem('user'));

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div style={{ padding: '40px' }}>
      <h2>Welcome to your Portal, {user?.username}</h2>
      <p>You can view your account information, manage hardware, or navigate back to the dashboard.</p>
      <div style={{ display: 'flex', gap: '20px' }}>
        <button onClick={() => navigate('/')}>Go to Dashboard</button>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}

export default MyUserPortal;
