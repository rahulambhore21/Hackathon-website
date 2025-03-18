import React from 'react';
import { AuthProvider } from './AuthContext';
import { EventsProvider } from './EventsContext';
import { NotificationProvider } from './NotificationContext';

// Combines all context providers into a single provider component
const AppContextProvider = ({ children }) => {
  return (
    <AuthProvider>
      <EventsProvider>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </EventsProvider>
    </AuthProvider>
  );
};

export default AppContextProvider;
