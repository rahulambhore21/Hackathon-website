import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import './MyEvents.css';

const MyEvents = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth() || {};
  const { showError } = useNotification() || {};
  
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, upcoming, past

  useEffect(() => {
    // Only fetch if user is logged in
    if (!currentUser?.id) {
      setLoading(false);
      return;
    }
    
    fetchRegisteredEvents();
  }, [currentUser]);

  const fetchRegisteredEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/authentication');
        return;
      }
      
      const response = await axios.get(
        'http://localhost:5000/api/profiles/events',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setRegisteredEvents(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching registered events:', err);
      setError('Failed to load your registered events');
      if (showError) showError('Failed to load your registered events');
      setLoading(false);
    }
  };

  const handleUnregister = async (eventId) => {
    if (!window.confirm('Are you sure you want to unregister from this event?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:5000/api/events/${eventId}/register`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Remove the event from state
      setRegisteredEvents(registeredEvents.filter(event => event._id !== eventId));
      
      if (showSuccess) showSuccess('Successfully unregistered from the event');
    } catch (err) {
      console.error('Error unregistering from event:', err);
      if (showError) showError('Failed to unregister from event');
    }
  };

  const filteredEvents = () => {
    const now = new Date();
    
    switch (filter) {
      case 'upcoming':
        return registeredEvents.filter(event => new Date(event.date) > now);
      case 'past':
        return registeredEvents.filter(event => new Date(event.date) <= now);
      default:
        return registeredEvents;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // If user is not logged in
  if (!currentUser) {
    return (
      <>
        <Navbar />
        <div className="my-events-container">
          <div className="auth-required">
            <h2>Authentication Required</h2>
            <p>Please login to see your registered events.</p>
            <button onClick={() => navigate('/authentication')}>Login / Sign Up</button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="my-events-container">
        <div className="my-events-header">
          <h1>My Registered Events</h1>
          <p>Track the hackathons you've registered for</p>
        </div>
        
        <div className="events-filter">
          <button 
            className={filter === 'all' ? 'active' : ''} 
            onClick={() => setFilter('all')}
          >
            All Events
          </button>
          <button 
            className={filter === 'upcoming' ? 'active' : ''} 
            onClick={() => setFilter('upcoming')}
          >
            Upcoming
          </button>
          <button 
            className={filter === 'past' ? 'active' : ''} 
            onClick={() => setFilter('past')}
          >
            Past
          </button>
        </div>
        
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your registered events...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p>{error}</p>
            <button onClick={fetchRegisteredEvents}>Try Again</button>
          </div>
        ) : filteredEvents().length > 0 ? (
          <div className="events-grid">
            {filteredEvents().map(event => {
              const imgUrl = event.img && typeof event.img === 'string' 
                ? (event.img.startsWith('http') ? event.img : `http://localhost:5000${event.img}`)
                : 'https://via.placeholder.com/300x200?text=Hackathon';
              
              const eventDate = event.date ? formatDate(event.date) : "Upcoming";
              const isPast = new Date(event.date) < new Date();
              
              return (
                <div className="event-card" key={event._id}>
                  <div className="event-image">
                    <img src={imgUrl} alt={event.title} />
                    {isPast && <div className="past-event-badge">COMPLETED</div>}
                  </div>
                  <div className="event-content">
                    <h3>{event.title}</h3>
                    <p className="event-date">{eventDate}</p>
                    <p className="event-location">
                      <i className="fas fa-map-marker-alt"></i> {event.location || "Virtual"}
                    </p>
                    <p className="registration-date">
                      <i className="fas fa-calendar-check"></i> Registered on {formatDate(event.registrationDate)}
                    </p>
                  </div>
                  <div className="event-actions">
                    <button 
                      className="view-button"
                      onClick={() => navigate(`/events/${event._id}`)}
                    >
                      <i className="fas fa-eye"></i> View Details
                    </button>
                    {!isPast && (
                      <button 
                        className="unregister-button"
                        onClick={() => handleUnregister(event._id)}
                      >
                        <i className="fas fa-times-circle"></i> Unregister
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-events">
            <i className="fas fa-calendar-times"></i>
            <h3>No events found</h3>
            <p>You haven't registered for any {filter !== 'all' ? filter : ''} hackathons yet.</p>
            <button 
              className="browse-events-button"
              onClick={() => navigate('/events')}
            >
              Browse Hackathons
            </button>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default MyEvents;
