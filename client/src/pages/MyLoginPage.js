import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function MyLoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, form);
      if (response.data.success) {
        const userId = response.data.userId || response.data.user_data?.userId || form.username;
        sessionStorage.setItem('userId', userId);
        sessionStorage.setItem('user', JSON.stringify(response.data.user_data || {}));
        navigate('/portal');
      } else setError(response.data.message || 'Login failed');
    } catch (err) {
      setError('Server error. Please try again later.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#0a0a0a',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>
      <div style={{
        backgroundColor: '#1a1a1a',
        padding: '48px',
        border: '1px solid #333',
        width: '100%',
        maxWidth: '400px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        <div>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: 600, color: '#fff' }}>Login</h2>
          <p style={{ margin: 0, fontSize: '14px', color: '#888' }}>Access your account</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 500, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Username</label>
            <input
              name="username"
              placeholder="Enter your username"
              value={form.username}
              onChange={handleChange}
              required
              style={{
                padding: '10px 12px',
                backgroundColor: '#252525',
                border: '1px solid #333',
                color: '#fff',
                fontSize: '14px',
                fontFamily: 'inherit',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#00d9ff'}
              onBlur={(e) => e.target.style.borderColor = '#333'}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 500, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Password</label>
            <input
              name="password"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
              style={{
                padding: '10px 12px',
                backgroundColor: '#252525',
                border: '1px solid #333',
                color: '#fff',
                fontSize: '14px',
                fontFamily: 'inherit',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#00d9ff'}
              onBlur={(e) => e.target.style.borderColor = '#333'}
            />
          </div>

          <button
            type="submit"
            style={{
              padding: '10px 16px',
              backgroundColor: '#00d9ff',
              color: '#0a0a0a',
              border: 'none',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              marginTop: '8px'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#00c4e0'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#00d9ff'}
          >
            Login
          </button>
        </form>

        {error && <div style={{ padding: '12px', backgroundColor: '#2a1a1a', border: '1px solid #5a2a2a', color: '#ff6b6b', fontSize: '13px', borderRadius: '2px' }}>{error}</div>}

        <div style={{ borderTop: '1px solid #333', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={() => navigate('/register')}
            style={{
              padding: '10px 16px',
              backgroundColor: 'transparent',
              color: '#00d9ff',
              border: '1px solid #00d9ff',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#00d9ff';
              e.target.style.color = '#0a0a0a';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#00d9ff';
            }}
          >
            Register
          </button>
          <button
            onClick={() => navigate('/forgot-password')}
            style={{
              padding: '10px 16px',
              backgroundColor: 'transparent',
              color: '#888',
              border: '1px solid #333',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = '#00d9ff';
              e.target.style.color = '#00d9ff';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = '#333';
              e.target.style.color = '#888';
            }}
          >
            Forgot Password?
          </button>
        </div>
      </div>
    </div>
  );
}

export default MyLoginPage;
