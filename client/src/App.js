import React, { useState, useEffect } from 'react';
import { HashRouter, Route, Routes, Navigate } from 'react-router-dom';
import MyLoginPage from './pages/MyLoginPage';
import MyRegistrationPage from './pages/MyRegistrationPage';
import MyUserPortal from './pages/MyUserPortal';
import ForgotPasswordPage from './pages/ForgotMyPassword';
import Dashboard from './pages/Dashboard';
import CreateProjectPage from './pages/CreateProjectPage';
import JoinProjectPage from './pages/JoinProjectPage';
import HardwareSet1Page from './pages/HardwareSet1Page';
import HardwareSet2Page from './pages/HardwareSet2Page';
import axios from 'axios';
import './App.css';

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

        {/* Protected Portal Routes */}
        <Route
          path="/portal"
          element={
            <ProtectedRoute>
              <MyUserPortal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/portal/create-project"
          element={
            <ProtectedRoute>
              <CreateProjectPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/portal/join-project"
          element={
            <ProtectedRoute>
              <JoinProjectPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/portal/hardware-set1"
          element={
            <ProtectedRoute>
              <HardwareSet1Page />
            </ProtectedRoute>
          }
        />
        <Route
          path="/portal/hardware-set2"
          element={
            <ProtectedRoute>
              <HardwareSet2Page />
            </ProtectedRoute>
          }
        />

        {/* Catch-All Redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </HashRouter>
  );
}

export default App;