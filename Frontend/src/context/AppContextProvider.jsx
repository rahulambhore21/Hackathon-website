import React from 'react';
import { AuthProvider } from './AuthContext';
import { NotificationProvider } from './NotificationContext';
import { EventsProvider } from './EventsContext';

// This component centralizes all context providers
const AppContextProvider = ({ children }) => {
  return (
    <NotificationProvider>
      <AuthProvider>
        <EventsProvider>
          {children}
        </EventsProvider>
      </AuthProvider>
    </NotificationProvider>
  );
};

export default AppContextProvider;
