import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { commonStyles, inputHandlers, buttonHandlers } from '../styles/sharedStyles';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function MyLoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!form.username.trim()) {
      newErrors.username = 'Username is required';
    }
    if (!form.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setError('');
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, form);
      if (response.data.success) {
        const userId = response.data.userId || response.data.user_data?.userId || form.username;
        sessionStorage.setItem('userId', userId);
        sessionStorage.setItem('user', JSON.stringify(response.data.user_data || {}));
        navigate('/portal');
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server error. Please try again later.');
    }
  };

  return (
    <div style={{ ...commonStyles.pageContainer, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={commonStyles.card}>
        <div>
          <h2 style={commonStyles.heading}>Login</h2>
          <p style={commonStyles.subheading}>Access your account</p>
        </div>

        <form onSubmit={handleSubmit} style={commonStyles.form}>
          <div style={commonStyles.formGroup}>
            <label style={commonStyles.label} htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              placeholder="Enter your username"
              value={form.username}
              onChange={handleChange}
              required
              style={{ ...commonStyles.input, borderColor: errors.username ? '#ff6b6b' : '#333' }}
              onFocus={inputHandlers.onFocus}
              onBlur={(e) => {
                inputHandlers.onBlur(e);
                validateForm();
              }}
              aria-label="Username"
              aria-invalid={!!errors.username}
            />
            {errors.username && <div style={{ fontSize: '12px', color: '#ff6b6b', marginTop: '4px' }}>{errors.username}</div>}
          </div>

          <div style={commonStyles.formGroup}>
            <label style={commonStyles.label} htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
              style={{ ...commonStyles.input, borderColor: errors.password ? '#ff6b6b' : '#333' }}
              onFocus={inputHandlers.onFocus}
              onBlur={(e) => {
                inputHandlers.onBlur(e);
                validateForm();
              }}
              aria-label="Password"
              aria-invalid={!!errors.password}
            />
            {errors.password && <div style={{ fontSize: '12px', color: '#ff6b6b', marginTop: '4px' }}>{errors.password}</div>}
          </div>

          <button
            type="submit"
            style={commonStyles.primaryButton}
            onMouseEnter={buttonHandlers.primaryHover}
            onMouseLeave={buttonHandlers.primaryLeave}
            aria-label="Login"
          >
            Login
          </button>
        </form>

        {error && <div style={commonStyles.messageError} role="alert">{error}</div>}

        <div style={commonStyles.divider}>
          <button
            onClick={() => navigate('/register')}
            style={commonStyles.secondaryButton}
            onMouseEnter={buttonHandlers.secondaryHover}
            onMouseLeave={buttonHandlers.secondaryLeave}
            aria-label="Navigate to registration"
          >
            Register
          </button>
          <button
            onClick={() => navigate('/forgot-password')}
            style={commonStyles.tertiaryButton}
            onMouseEnter={buttonHandlers.tertiaryHover}
            onMouseLeave={buttonHandlers.tertiaryLeave}
            aria-label="Forgot password"
          >
            Forgot Password?
          </button>
        </div>
      </div>
    </div>
  );
}

export default MyLoginPage;
