import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { commonStyles, inputHandlers, buttonHandlers } from '../styles/sharedStyles';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');
    setError('');
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    try {
      const response = await axios.post(`${API_BASE_URL}/forgot-password`, { email });
      setMessage(response.data.message || 'Password reset instructions sent to your email.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Server error. Please try again later.');
    }
  };

  return (
    <div style={{ ...commonStyles.pageContainer, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={commonStyles.card}>
        <div>
          <h2 style={commonStyles.heading}>Reset Password</h2>
          <p style={commonStyles.subheading}>Enter your email to receive reset instructions</p>
        </div>

        <form onSubmit={handleSubmit} style={commonStyles.form}>
          <div style={commonStyles.formGroup}>
            <label style={commonStyles.label} htmlFor="reset-email">Email Address</label>
            <input
              id="reset-email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => {
                setEmail(e.target.value);
                setError('');
              }}
              required
              style={{ ...commonStyles.input, borderColor: error ? '#ff6b6b' : '#333' }}
              onFocus={inputHandlers.onFocus}
              onBlur={inputHandlers.onBlur}
              aria-label="Email address"
              aria-invalid={!!error}
            />
            {error && <div style={{ fontSize: '12px', color: '#ff6b6b', marginTop: '4px' }}>{error}</div>}
          </div>

          <button
            type="submit"
            style={commonStyles.primaryButton}
            onMouseEnter={buttonHandlers.primaryHover}
            onMouseLeave={buttonHandlers.primaryLeave}
            aria-label="Send reset link"
          >
            Send Reset Link
          </button>
        </form>

        {message && (
          <div style={message.toLowerCase().includes('sent') ? commonStyles.messageSuccess : commonStyles.messageError} role="alert">
            {message}
          </div>
        )}

        <div style={commonStyles.divider}>
          <button
            onClick={() => navigate('/login')}
            style={commonStyles.secondaryButton}
            onMouseEnter={buttonHandlers.secondaryHover}
            onMouseLeave={buttonHandlers.secondaryLeave}
            aria-label="Back to login"
          >
            Back to Login
          </button>
          <button
            onClick={() => navigate('/register')}
            style={commonStyles.tertiaryButton}
            onMouseEnter={buttonHandlers.tertiaryHover}
            onMouseLeave={buttonHandlers.tertiaryLeave}
            aria-label="Create new account"
          >
            Create New Account
          </button>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
