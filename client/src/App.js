import React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import MyLoginPage from './pages/MyLoginPage';
import MyRegistrationPage from './pages/MyRegistrationPage';
import MyUserPortal from './pages/MyUserPortal';
import ForgotPasswordPage from './pages/ForgotMyPassword';
import ResetPasswordPage from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import AccountSettings from './pages/AccountSettings';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const user = sessionStorage.getItem('user');
  return user ? children : <Navigate to="/login" />;
};

function App() {
  // Use basename for GitHub Pages subdirectory deployment
  // PUBLIC_URL is automatically set by react-scripts based on homepage in package.json
  const basename = process.env.PUBLIC_URL || '';
  
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<MyLoginPage />} />
        <Route path="/register" element={<MyRegistrationPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        <Route
          path="/portal"
          element={
            <ProtectedRoute>
              <MyUserPortal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account-settings"
          element={
            <ProtectedRoute>
              <AccountSettings />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;