import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { commonStyles, inputHandlers, buttonHandlers } from '../styles/sharedStyles';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function MyRegistrationPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (form.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 4) {
      newErrors.password = 'Password must be at least 4 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');
    
    if (!validateForm()) {
      setMessage('Please fix the errors below');
      return;
    }
    
    try {
      const response = await axios.post(`${API_BASE_URL}/register`, form);
      if (response.data.success) {
        setMessage('Registration successful! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setMessage(response.data.message || 'Registration failed. Try again.');
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Server error. Please try again later.');
    }
  };

  return (
    <div style={{ ...commonStyles.pageContainer, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={commonStyles.card}>
        <div>
          <h2 style={commonStyles.heading}>Register</h2>
          <p style={commonStyles.subheading}>Create your account</p>
        </div>

        <form onSubmit={handleSubmit} style={commonStyles.form}>
          <div style={commonStyles.formGroup}>
            <label style={commonStyles.label} htmlFor="reg-username">Username</label>
            <input
              id="reg-username"
              name="username"
              placeholder="Choose a username (min 3 characters)"
              value={form.username}
              onChange={handleChange}
              required
              minLength={3}
              style={{ ...commonStyles.input, borderColor: errors.username ? '#ff6b6b' : '#333' }}
              onFocus={inputHandlers.onFocus}
              onBlur={(e) => {
                inputHandlers.onBlur(e);
                validateForm();
              }}
              aria-label="Username"
              aria-invalid={!!errors.username}
              aria-describedby={errors.username ? 'username-error' : undefined}
            />
            {errors.username && <div id="username-error" style={{ fontSize: '12px', color: '#ff6b6b', marginTop: '4px' }}>{errors.username}</div>}
          </div>

          <div style={commonStyles.formGroup}>
            <label style={commonStyles.label} htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              name="email"
              type="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={handleChange}
              required
              style={{ ...commonStyles.input, borderColor: errors.email ? '#ff6b6b' : '#333' }}
              onFocus={inputHandlers.onFocus}
              onBlur={(e) => {
                inputHandlers.onBlur(e);
                validateForm();
              }}
              aria-label="Email address"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && <div id="email-error" style={{ fontSize: '12px', color: '#ff6b6b', marginTop: '4px' }}>{errors.email}</div>}
          </div>

          <div style={commonStyles.formGroup}>
            <label style={commonStyles.label} htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              name="password"
              type="password"
              placeholder="Create a password (min 4 characters)"
              value={form.password}
              onChange={handleChange}
              required
              minLength={4}
              style={{ ...commonStyles.input, borderColor: errors.password ? '#ff6b6b' : '#333' }}
              onFocus={inputHandlers.onFocus}
              onBlur={(e) => {
                inputHandlers.onBlur(e);
                validateForm();
              }}
              aria-label="Password"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            {errors.password && <div id="password-error" style={{ fontSize: '12px', color: '#ff6b6b', marginTop: '4px' }}>{errors.password}</div>}
            {!errors.password && form.password && form.password.length < 4 && (
              <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>Password must be at least 4 characters</div>
            )}
          </div>

          <button
            type="submit"
            style={commonStyles.primaryButton}
            onMouseEnter={buttonHandlers.primaryHover}
            onMouseLeave={buttonHandlers.primaryLeave}
            aria-label="Register"
          >
            Register
          </button>
        </form>

        {message && (
          <div style={message.includes('successful') ? commonStyles.messageSuccess : commonStyles.messageError} role="alert">
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

export default MyRegistrationPage;