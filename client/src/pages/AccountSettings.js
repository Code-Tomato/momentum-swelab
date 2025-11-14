import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { commonStyles, inputHandlers, buttonHandlers } from '../styles/sharedStyles';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function AccountSettings() {
  const navigate = useNavigate();
  const username = sessionStorage.getItem('username');
  const user = sessionStorage.getItem('user') ? JSON.parse(sessionStorage.getItem('user')) : null;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (user && user.email) {
      setEmail(user.email);
    }
  }, [user]);

  async function handleDeleteAccount() {
    if (!password) {
      setMessage('Please enter your password to confirm account deletion');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`${API_BASE}/delete_account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Account deleted successfully. Redirecting...');
        setTimeout(() => {
          sessionStorage.removeItem('username');
          sessionStorage.removeItem('user');
          navigate('/');
        }, 2000);
      } else {
        setMessage(data.message || 'Error deleting account');
        setShowDeleteConfirm(false);
        setPassword('');
      }
    } catch (err) {
      setMessage('Server error deleting account. Please try again.');
      setShowDeleteConfirm(false);
      setPassword('');
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('user');
    navigate('/login');
  }

  if (!username) return <Navigate to="/login" replace />;

  return (
    <div style={commonStyles.pageContainer}>
      {/* Header */}
      <div style={commonStyles.header}>
        <h1 style={commonStyles.headerTitle}>Account Settings</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => navigate('/portal')}
            style={commonStyles.secondaryButton}
            onMouseEnter={buttonHandlers.secondaryHover}
            onMouseLeave={buttonHandlers.secondaryLeave}
            aria-label="Back to portal"
          >
            Back to Portal
          </button>
          <button
            onClick={logout}
            style={commonStyles.dangerButton}
            onMouseEnter={buttonHandlers.dangerHover}
            onMouseLeave={buttonHandlers.dangerLeave}
            aria-label="Logout"
          >
            Logout
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px' }}>
        {/* Account Information */}
        <div style={commonStyles.cardSmall}>
          <h2 style={commonStyles.headingSmall}>Account Information</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Username
              </label>
              <div style={{ marginTop: '8px', fontSize: '16px', color: '#fff', fontWeight: 500 }}>
                {username}
              </div>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Email
              </label>
              <div style={{ marginTop: '8px', fontSize: '16px', color: '#fff', fontWeight: 500 }}>
                {email || 'Not available'}
              </div>
            </div>
          </div>
        </div>

        {/* Delete Account Section */}
        <div style={{ ...commonStyles.cardSmall, marginTop: '24px', borderColor: '#8b0000' }}>
          <h2 style={{ ...commonStyles.headingSmall, color: '#ff6b6b' }}>Danger Zone</h2>
          <p style={{ fontSize: '13px', color: '#888', marginBottom: '16px' }}>
            Once you delete your account, there is no going back. Please be certain.
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                ...commonStyles.dangerButton,
                backgroundColor: '#8b0000',
                width: '100%'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#a00000';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#8b0000';
              }}
              aria-label="Delete account"
            >
              Delete Account
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ fontSize: '13px', color: '#ff6b6b', fontWeight: 600 }}>
                Are you sure you want to delete your account? This will:
              </p>
              <ul style={{ fontSize: '12px', color: '#888', marginLeft: '20px', marginTop: '0', marginBottom: '0' }}>
                <li>Delete all projects you created</li>
                <li>Remove you from projects you joined</li>
                <li>Permanently delete your account</li>
              </ul>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                <label style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Enter your password to confirm
                </label>
                <input
                  type="password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={commonStyles.inputSmall}
                  onFocus={inputHandlers.onFocus}
                  onBlur={inputHandlers.onBlur}
                  aria-label="Password confirmation"
                  disabled={loading}
                />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleDeleteAccount}
                  disabled={loading || !password}
                  style={{
                    ...commonStyles.dangerButton,
                    backgroundColor: '#8b0000',
                    flex: 1,
                    opacity: loading || !password ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!loading && password) {
                      e.currentTarget.style.backgroundColor = '#a00000';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading && password) {
                      e.currentTarget.style.backgroundColor = '#8b0000';
                    }
                  }}
                  aria-label="Confirm delete account"
                >
                  {loading ? 'Deleting...' : 'Confirm Delete'}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setPassword('');
                    setMessage('');
                  }}
                  disabled={loading}
                  style={commonStyles.secondaryButton}
                  onMouseEnter={buttonHandlers.secondaryHover}
                  onMouseLeave={buttonHandlers.secondaryLeave}
                  aria-label="Cancel delete account"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {message && (
          <div style={{
            marginTop: '16px',
            ...(message.includes('Error') || message.includes('failed') ? commonStyles.messageError : commonStyles.messageSuccess),
            fontSize: '12px'
          }} role="alert">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default AccountSettings;

