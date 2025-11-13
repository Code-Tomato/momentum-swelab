import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function MyUserPortal() {
  const navigate = useNavigate();
  const userStr = sessionStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  // Redirect to login if no user data
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5'
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '10px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          width: '400px',
          textAlign: 'center'
        }}
      >
        <h2>Welcome, {user.username}</h2>
        <p>Select an action below:</p>

        <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button onClick={() => navigate('/portal/create-project')}
            style={buttonStyle('#28a745')}>Create New Project</button>

          <button onClick={() => navigate('/portal/join-project')}
            style={buttonStyle('#17a2b8')}>Join Existing Project</button>

          <button onClick={() => navigate('/portal/hardware-set1')}
            style={buttonStyle('#007bff')}>Checkout/Checkin Hardware Set 1</button>

          <button onClick={() => navigate('/portal/hardware-set2')}
            style={buttonStyle('#6f42c1')}>Checkout/Checkin Hardware Set 2</button>

          <button onClick={() => { sessionStorage.removeItem('user'); navigate('/login'); }}
            style={buttonStyle('#dc3545')}>Log Out</button>
        </div>
      </div>
    </div>
  );
}

const buttonStyle = (bg) => ({
  padding: '12px',
  backgroundColor: bg,
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '15px'
});

export default MyUserPortal;