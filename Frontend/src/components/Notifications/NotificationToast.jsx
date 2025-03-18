import React from 'react';
import { useNotification } from '../../context/NotificationContext';
import './NotificationToast.css';

const NotificationToast = () => {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <div 
          key={notification.id} 
          className={`notification-toast ${notification.type}`}
        >
          <div className="notification-content">
            <p>{notification.message}</p>
          </div>
          <button 
            className="notification-close"
            onClick={() => removeNotification(notification.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationToast;
