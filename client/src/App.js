import React, { useState, useEffect } from 'react';
import { HashRouter, Route, Routes, Navigate } from 'react-router-dom';
import MyLoginPage from './pages/MyLoginPage';
import MyRegistrationPage from './pages/MyRegistrationPage';
import MyUserPortal from './pages/MyUserPortal';
import ForgotPasswordPage from './pages/ForgotMyPassword';
import Dashboard from './pages/Dashboard';
import axios from 'axios';
import './App.css';

// const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const user = sessionStorage.getItem('user');
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<MyLoginPage />} />
        <Route path="/register" element={<MyRegistrationPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        <Route
          path="/portal"
          element={
            <ProtectedRoute>
              <MyUserPortal />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </HashRouter>
  );
}

export default App;