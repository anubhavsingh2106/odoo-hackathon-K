import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';

// Page Imports
import Login from './pages/Login';
import Signup from './pages/Signup'; // New Signup Page
import Dashboard from './pages/Dashboard'; // Handles Role-Based Views (Admin/Manager/Staff)
import Operations from './pages/Operations';
import Inventory from './pages/Inventory';
import History from './pages/History';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* --- PUBLIC ROUTES --- */}
          {/* These pages do not have the Sidebar/Header */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* --- PROTECTED ROUTES --- */}
          {/* All these routes are wrapped in Layout (Sidebar + Header) */}
          {/* The Layout component checks if user is logged in */}
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/operations" element={<Operations />} />
            <Route path="/history" element={<History />} />
          </Route>

          {/* --- FALLBACK --- */}
          {/* If user goes to unknown URL, redirect to home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;