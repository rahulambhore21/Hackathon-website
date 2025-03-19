import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/Navbar/Navbar';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import './MyHackathons.css';

const MyHackathons = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth() || {};
  const notification = useNotification() || {};
  const { showError, showSuccess } = notification;
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch events created by the user
  useEffect(() => {
    const fetchUserEvents = async () => {
      if (!currentUser) {
        navigate('/authentication');
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Using the admin endpoint to get events created by the current user
        const response = await axios.get(
          `http://localhost:5000/api/events?createdBy=${currentUser.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setEvents(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user events:', err);
        setError('Failed to load your hackathons. Please try again.');
        setLoading(false);
        
        if (showError) {
          showError('Failed to load your hackathons');
        }
      }
    };

    fetchUserEvents();
  }, [currentUser, navigate, showError]);

  // Handle opening the delete confirmation modal
  const handleOpenDeleteModal = (event) => {
    setSelectedEvent(event);
    setShowDeleteModal(true);
  };

  // Handle closing the delete confirmation modal
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedEvent(null);
  };

  // Handle deleting an event
  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;

    try {
      setDeleting(true);
      const token = localStorage.getItem('token');
      
      await axios.delete(
        `http://localhost:5000/api/events/${selectedEvent._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Remove the deleted event from the state
      setEvents(events.filter(event => event._id !== selectedEvent._id));
      
      setDeleting(false);
      setShowDeleteModal(false);
      setSelectedEvent(null);
      
      if (showSuccess) {
        showSuccess('Hackathon deleted successfully');
      }
    } catch (err) {
      console.error('Error deleting event:', err);
      setDeleting(false);
      
      if (showError) {
        showError('Failed to delete hackathon');
      }
    }
  };

  // Get formatted date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Navigate to edit event page
  const navigateToEditEvent = (eventId) => {
    navigate(`/edit-event/${eventId}`);
  };

  // Navigate to view registrations page
  const navigateToRegistrations = (eventId) => {
    navigate(`/event-registrations/${eventId}`);
  };

  return (
    <>
      <Navbar />
      <div className="my-hackathons-container">
        <div className="my-hackathons-header">
          <h1>My Hackathons</h1>
          <p>Manage the hackathons you've created</p>
          
          <div className="my-hackathons-actions">
            <Link to="/add-event" className="create-event-btn">
              + Create New Hackathon
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your hackathons...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Try Again</button>
          </div>
        ) : events.length > 0 ? (
          <div className="my-hackathons-grid">
            {events.map((event) => (
              <div key={event._id} className="my-hackathon-card">
                <div className="my-hackathon-image">
                  <img 
                    src={event.img.startsWith('http') ? event.img : `http://localhost:5000${event.img}`} 
                    alt={event.title} 
                  />
                  <div className="my-hackathon-status">
                    {new Date(event.date) > new Date() ? 'Upcoming' : 'Past'}
                  </div>
                </div>
                
                <div className="my-hackathon-content">
                  <h3>{event.title}</h3>
                  <p className="my-hackathon-date">
                    <i className="far fa-calendar-alt"></i> {formatDate(event.date)}
                  </p>
                  <p className="my-hackathon-location">
                    <i className="fas fa-map-marker-alt"></i> {event.location}
                  </p>
                  <div className="my-hackathon-stats">
                    <div className="my-hackathon-stat">
                      <span className="stat-value">{event.registeredCount || 0}</span>
                      <span className="stat-label">Registered</span>
                    </div>
                    <div className="my-hackathon-stat">
                      <span className="stat-value">₹{event.price}</span>
                      <span className="stat-label">Price</span>
                    </div>
                  </div>
                </div>
                
                <div className="my-hackathon-actions">
                  <Link to={`/event/${event._id}`} className="action-btn view-btn">
                    <i className="fas fa-eye"></i> View
                  </Link>
                  <button 
                    className="action-btn edit-btn"
                    onClick={() => navigateToEditEvent(event._id)}
                  >
                    <i className="fas fa-edit"></i> Edit
                  </button>
                  <button 
                    className="action-btn registrations-btn"
                    onClick={() => navigateToRegistrations(event._id)}
                  >
                    <i className="fas fa-users"></i> Registrations
                  </button>
                  <button 
                    className="action-btn delete-btn"
                    onClick={() => handleOpenDeleteModal(event)}
                  >
                    <i className="fas fa-trash"></i> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-hackathons">
            <div className="no-hackathons-content">
              <i className="fas fa-calendar-times"></i>
              <h2>No Hackathons Created Yet</h2>
              <p>You haven't created any hackathons yet. Click the button below to create your first hackathon!</p>
              <Link to="/add-event" className="create-first-event-btn">
                Create Your First Hackathon
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <h2>Confirm Deletion</h2>
            <p>Are you sure you want to delete the hackathon <strong>{selectedEvent?.title}</strong>?</p>
            <p className="warning-text">This action cannot be undone. All registrations for this hackathon will be deleted.</p>
            
            <div className="delete-modal-actions">
              <button 
                className="cancel-btn"
                onClick={handleCloseDeleteModal}
                disabled={deleting}
              >
                Cancel
              </button>
              <button 
                className="delete-btn"
                onClick={handleDeleteEvent}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete Hackathon'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MyHackathons;
