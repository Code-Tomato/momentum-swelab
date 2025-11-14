import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { commonStyles, inputHandlers, buttonHandlers } from '../styles/sharedStyles';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function ResetPasswordPage() {
  const { token } = useParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validatePassword = (password) => {
    // Password must be at least 4 characters
    if (password.length < 4) {
      return 'Password must be at least 4 characters long';
    }
    // Check for invalid characters (space and exclamation mark)
    if (password.includes(' ') || password.includes('!')) {
      return 'Password cannot contain space or "!" characters';
    }
    return null;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');
    setError('');
    
    if (!username.trim()) {
      setError('Username is required');
      return;
    }
    
    if (!password.trim()) {
      setError('Password is required');
      return;
    }
    
    if (!confirmPassword.trim()) {
      setError('Please confirm your password');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/reset-password`, {
        token: token,
        username: username,
        password: password
      });
      
      if (response.data.success) {
        setMessage('Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(response.data.message || 'Failed to reset password');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div style={{ ...commonStyles.pageContainer, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={commonStyles.card}>
          <div>
            <h2 style={commonStyles.heading}>Invalid Reset Link</h2>
            <p style={commonStyles.subheading}>The reset link is invalid or missing.</p>
          </div>
          <div style={commonStyles.divider}>
            <button
              onClick={() => navigate('/forgot-password')}
              style={commonStyles.secondaryButton}
              onMouseEnter={buttonHandlers.secondaryHover}
              onMouseLeave={buttonHandlers.secondaryLeave}
            >
              Request New Reset Link
            </button>
            <button
              onClick={() => navigate('/login')}
              style={commonStyles.tertiaryButton}
              onMouseEnter={buttonHandlers.tertiaryHover}
              onMouseLeave={buttonHandlers.tertiaryLeave}
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...commonStyles.pageContainer, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={commonStyles.card}>
        <div>
          <h2 style={commonStyles.heading}>Reset Password</h2>
          <p style={commonStyles.subheading}>Enter your new password</p>
        </div>

        <form onSubmit={handleSubmit} style={commonStyles.form}>
          <div style={commonStyles.formGroup}>
            <label style={commonStyles.label} htmlFor="reset-username">Username</label>
            <input
              id="reset-username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={e => {
                setUsername(e.target.value);
                setError('');
              }}
              required
              style={{ ...commonStyles.input, borderColor: error ? '#ff6b6b' : '#333' }}
              onFocus={inputHandlers.onFocus}
              onBlur={inputHandlers.onBlur}
              aria-label="Username"
              aria-invalid={!!error}
            />
          </div>

          <div style={commonStyles.formGroup}>
            <label style={commonStyles.label} htmlFor="new-password">New Password</label>
            <input
              id="new-password"
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={e => {
                setPassword(e.target.value);
                setError('');
              }}
              required
              style={{ ...commonStyles.input, borderColor: error ? '#ff6b6b' : '#333' }}
              onFocus={inputHandlers.onFocus}
              onBlur={inputHandlers.onBlur}
              aria-label="New password"
              aria-invalid={!!error}
            />
          </div>

          <div style={commonStyles.formGroup}>
            <label style={commonStyles.label} htmlFor="confirm-password">Confirm Password</label>
            <input
              id="confirm-password"
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={e => {
                setConfirmPassword(e.target.value);
                setError('');
              }}
              required
              style={{ ...commonStyles.input, borderColor: error ? '#ff6b6b' : '#333' }}
              onFocus={inputHandlers.onFocus}
              onBlur={inputHandlers.onBlur}
              aria-label="Confirm password"
              aria-invalid={!!error}
            />
          </div>

          {error && (
            <div style={commonStyles.messageError} role="alert">
              {error}
            </div>
          )}

          {message && (
            <div style={commonStyles.messageSuccess} role="alert">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              ...commonStyles.primaryButton,
              opacity: isLoading ? 0.6 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
            onMouseEnter={!isLoading ? buttonHandlers.primaryHover : undefined}
            onMouseLeave={!isLoading ? buttonHandlers.primaryLeave : undefined}
            aria-label="Reset password"
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

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
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;

