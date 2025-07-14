import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ErrorList from './components/ErrorList';
import ProcessManagement from './components/ProcessManagement';
import Notification from './components/Notification';
import Reports from './components/Reports';
import Navigation from './components/Navigation';
import './App.css';

function AppContent() {
  const { isAuthenticated, loading, logout, user } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        {isAuthenticated && (
          <>
            <header className="App-header">
              <h1>Hệ thống quản lý lỗi</h1>
              <div className="header-user">
                <span>Welcome, {user?.fullName} ({user?.role})</span>
                <button onClick={logout} className="logout-btn">
                  Logout
                </button>
              </div>
            </header>
            <Navigation />
          </>
        )}
        
        <main className="main-content">
          <Routes>
            <Route 
              path="/login" 
              element={
                isAuthenticated ? <Navigate to="/dashboard" /> : <Login />
              } 
            />
            <Route 
              path="/register" 
              element={
                isAuthenticated ? <Navigate to="/dashboard" /> : <Register />
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                isAuthenticated ? <Dashboard /> : <Navigate to="/login" />
              } 
            />
            <Route 
              path="/errors" 
              element={
                isAuthenticated ? <ErrorList /> : <Navigate to="/login" />
              } 
            />
            <Route 
              path="/processes" 
              element={
                isAuthenticated ? <ProcessManagement /> : <Navigate to="/login" />
              } 
            />
            <Route 
              path="/notifications" 
              element={
                isAuthenticated ? <Notification /> : <Navigate to="/login" />
              } 
            />
            <Route 
              path="/reports" 
              element={
                isAuthenticated ? <Reports /> : <Navigate to="/login" />
              } 
            />
            <Route 
              path="/" 
              element={
                <Navigate to={isAuthenticated ? "/dashboard" : "/login"} />
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;