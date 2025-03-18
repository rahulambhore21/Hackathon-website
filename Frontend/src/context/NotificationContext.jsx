import React, { createContext, useState, useEffect, useContext } from 'react';

// Create the context
const NotificationContext = createContext();

// Custom hook to use the notification context
export const useNotification = () => {
  return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Add a new notification
  const addNotification = (message, type = 'info', duration = 5000) => {
    const id = Date.now();
    
    const newNotification = {
      id,
      message,
      type,
      duration
    };
    
    setNotifications(prevNotifications => [
      ...prevNotifications,
      newNotification
    ]);
    
    // Auto remove notification after duration
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
    
    return id;
  };
  
  // Remove a notification by id
  const removeNotification = (id) => {
    setNotifications(prevNotifications => 
      prevNotifications.filter(notification => notification.id !== id)
    );
  };
  
  // Show success notification
  const showSuccess = (message, duration = 5000) => {
    return addNotification(message, 'success', duration);
  };
  
  // Show error notification
  const showError = (message, duration = 5000) => {
    return addNotification(message, 'error', duration);
  };
  
  // Show info notification
  const showInfo = (message, duration = 5000) => {
    return addNotification(message, 'info', duration);
  };
  
  // Show warning notification
  const showWarning = (message, duration = 5000) => {
    return addNotification(message, 'warning', duration);
  };
  
  // Clear all notifications
  const clearAll = () => {
    setNotifications([]);
  };

  // Context value
  const value = {
    notifications,
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    clearAll
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
