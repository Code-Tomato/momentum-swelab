import React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import MyLoginPage from './pages/MyLoginPage';
import MyRegistrationPage from './pages/MyRegistrationPage';
import MyUserPortal from './pages/MyUserPortal';
import ForgotPasswordPage from './pages/ForgotMyPassword';
import ResetPasswordPage from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const user = sessionStorage.getItem('user');
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
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
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;