import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/Navbar/Navbar';
import EventCard from '../../ui/eventCard/EventCard';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import './MyEvents.css';

const MyEvents = () => {
  const navigate = useNavigate();
  const { currentUser, loading: authLoading, authInitialized } = useAuth() || {};
  const { showError } = useNotification() || {};
  
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Only attempt to fetch events or redirect when auth is fully initialized
    if (!authInitialized) return;

    if (!currentUser) {
      navigate('/authentication');
      return;
    }

    const fetchRegisteredEvents = async () => {
      try {
        setLoading(true);
        console.log("Fetching events for user:", currentUser.id);
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.log("No auth token found, navigating to login");
          navigate('/authentication');
          return;
        }
        
        // Fetch events that the user has registered for
        const response = await axios.get(
          `http://localhost:5000/api/events/user/${currentUser.id}`,
          { 
            headers: { Authorization: `Bearer ${token}` },
            // Add timestamp to prevent caching
            params: { _t: new Date().getTime() }
          }
        );
        
        console.log("API Response:", response.data);
        
        if (response.data && Array.isArray(response.data)) {
          setRegisteredEvents(response.data);
        } else {
          console.error("Invalid response format:", response.data);
          setRegisteredEvents([]);
        }
      } catch (err) {
        console.error("Error fetching registered events:", err.response || err);
        setRegisteredEvents([]);
        setError('Failed to load your registered events. Please try again.');
        
        if (showError) {
          showError('Failed to load your registered events');
        }
      } finally {
        setLoading(false);
      }
    };

    if (currentUser && currentUser.id) {
      fetchRegisteredEvents();
    }
  }, [currentUser, navigate, showError, authInitialized]);

  // Show loading state only when auth is initializing
  if (!authInitialized || authLoading) {
    return (
      <>
        <Navbar />
        <div className="my-events-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Verifying your login...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="my-events-container">
        <div className="my-events-header">
          <h1>My Registered Events</h1>
          <p>View all the hackathons you've registered for</p>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your events...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Try Again</button>
          </div>
        ) : registeredEvents.length > 0 ? (
          <div className="events-grid">
            {registeredEvents.map(event => {
              const imgUrl = event.img && typeof event.img === 'string' 
                ? (event.img.startsWith('http') ? event.img : `http://localhost:5000${event.img}`)
                : null;
                
              const eventDate = event.date 
                ? new Date(event.date).toLocaleDateString('en-US', {
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric'
                  })
                : "Upcoming";
                
              return (
                <EventCard
                  key={event._id}
                  id={event._id}
                  title={event.title}
                  description={event.description}
                  img={imgUrl}
                  date={eventDate}
                  location={event.location || "Virtual"}
                />
              );
            })}
          </div>
        ) : (
          <div className="no-events">
            <i className="fas fa-calendar-times"></i>
            <h3>No registered events</h3>
            <p>You haven't registered for any hackathons yet.</p>
            <button 
              className="find-events-button"
              onClick={() => navigate('/events')}
            >
              Browse Events
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default MyEvents;
