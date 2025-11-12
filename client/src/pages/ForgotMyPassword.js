import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/forgot-password`, { email });
      setMessage(response.data.message || 'Password reset instructions sent to your email.');
    } catch (err) {
      setMessage('Server error. Please try again later.');
    }
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
          width: '350px',
          textAlign: 'center'
        }}
      >
        <h2 style={{ marginBottom: '20px' }}>Forgot Password</h2>
        <p style={{ color: '#555', marginBottom: '20px' }}>
          Enter your email address below, and we’ll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{
              padding: '10px',
              borderRadius: '5px',
              border: '1px solid #ccc'
            }}
          />
          <button
            type="submit"
            style={{
              padding: '10px',
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Send Reset Link
          </button>
        </form>

        {message && (
          <p
            style={{
              marginTop: '15px',
              color: message.toLowerCase().includes('sent') ? 'green' : 'red'
            }}
          >
            {message}
          </p>
        )}

        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '10px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Back to Login
          </button>
          <button
            onClick={() => navigate('/register')}
            style={{
              padding: '10px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Register New Account
          </button>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
