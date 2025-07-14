import React, { useState, useEffect, useCallback } from 'react';
import { notificationAPI } from '../services/api';

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const loadNotifications = useCallback(async () => {
    try {
      const response = showAll 
        ? await notificationAPI.getAll()
        : await notificationAPI.getUnread();
      setNotifications(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setLoading(false);
    }
  }, [showAll]);

  const loadUnreadCount = useCallback(async () => {
    try {
      const response = await notificationAPI.getUnreadCount();
      setUnreadCount(response.data);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
  }, [loadNotifications, loadUnreadCount]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      loadNotifications();
      loadUnreadCount();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      loadNotifications();
      loadUnreadCount();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationAPI.delete(id);
      loadNotifications();
      loadUnreadCount();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const toggleShowAll = () => {
    setShowAll(!showAll);
    setLoading(true);
  };

  if (loading) return <div className="loading">Loading notifications...</div>;

  return (
    <div className="notifications">
      <div className="notifications-header">
        <h2>Thông báo</h2>
        <div className="notifications-controls">
          <span className="unread-count">
            {unreadCount} unread
          </span>
          <button onClick={toggleShowAll} className="toggle-btn">
            {showAll ? 'Show Unread Only' : 'Show All'}
          </button>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllAsRead} className="mark-all-btn">
              Mark All as Read
            </button>
          )}
        </div>
      </div>

      <div className="notifications-list">
        {notifications.length === 0 ? (
          <p>Không tìm thấy thông báo nào</p>
        ) : (
          notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
            >
              <div className="notification-content">
                <div className="notification-header">
                  <h4>{notification.title}</h4>
                  <span className={`notification-type ${notification.type.toLowerCase()}`}>
                    {notification.type}
                  </span>
                </div>
                <p>{notification.message}</p>
                <small>
                  {new Date(notification.createdAt).toLocaleString()}
                </small>
              </div>
              <div className="notification-actions">
                {!notification.isRead && (
                  <button 
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="mark-read-btn"
                  >
                    Mark as Read
                  </button>
                )}
                <button 
                  onClick={() => handleDelete(notification.id)}
                  className="delete-btn"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notification;