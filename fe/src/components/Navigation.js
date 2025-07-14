import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { notificationAPI } from '../services/api';

const Navigation = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { hasAnyRole } = useAuth(); // Removed unused 'user' variable
  const location = useLocation();

  useEffect(() => {
    loadUnreadCount();
    // Refresh count every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const response = await notificationAPI.getUnreadCount();
      setUnreadCount(response.data);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navigation">
      <div className="nav-links">
        <Link to="/dashboard" className={isActive('/dashboard')}>
          Dashboard
        </Link>
        <Link to="/errors" className={isActive('/errors')}>
          Errors
        </Link>
        {hasAnyRole(['Admin', 'Manager']) && (
          <Link to="/processes" className={isActive('/processes')}>
            Processes
          </Link>
        )}
        {hasAnyRole(['Admin']) && (
          <Link to="/users" className={isActive('/users')}>
            Users
          </Link>
        )}
        <Link to="/notifications" className={`${isActive('/notifications')} notification-link`}>
          Notifications
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount}</span>
          )}
        </Link>
        <Link to="/reports" className={isActive('/reports')}>
          Reports
        </Link>
      </div>
    </nav>
  );
};

export default Navigation;