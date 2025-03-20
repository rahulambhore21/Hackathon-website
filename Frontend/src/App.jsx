import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import Authentication from './pages/Authentication/Authentication';
import Profile from './pages/Profile/Profile';
import MyEvents from './pages/MyEvents/MyEvents';
import MyHackathons from './pages/MyHackathons/MyHackathons';
import EventsPage from './pages/Events/EventsPage';
import EventDetails from './pages/EventDetails/EventDetails';
import NotificationToast from './components/Notifications/NotificationToast';
import PreferencesForm from './components/PreferencesForm/PreferencesForm';
import AddEvent from './pages/AddEvent/AddEvent';
import AppContextProvider from './context/AppContextProvider';
import { useAuth } from './context/AuthContext';
import './App.css';

function AppRoutes() {
  const { showPreferences } = useAuth() || {};
  
  return (
    <>
      <NotificationToast />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/authentication" element={<Authentication />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/my-events" element={<MyEvents />} />
        <Route path="/my-hackathons" element={<MyHackathons />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/create-event" element={<AddEvent />} />
        <Route path="/edit-event/:id" element={<AddEvent />} />
        <Route path="/preferences" element={<PreferencesForm />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContextProvider>
        <AppRoutes />
      </AppContextProvider>
    </Router>
  );
}

export default App;
