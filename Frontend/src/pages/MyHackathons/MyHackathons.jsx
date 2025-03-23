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
      // Skip fetching if auth is still loading or user isn't logged in
      if (!currentUser?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          navigate('/authentication');
          return;
        }

        // Fetch events created by the current user
        const response = await axios.get(
          `http://localhost:5000/api/events?createdBy=${currentUser.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setEvents(response.data);
      } catch (err) {
        console.error('Error fetching created events:', err);
        setError('Failed to load your created hackathons');
        if (showError) {
          showError('Error loading your created hackathons');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserEvents();
  }, [currentUser, navigate, showError]);

  // Handle event deletion
  const handleDeleteClick = (event) => {
    setSelectedEvent(event);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedEvent) return;

    try {
      setDeleting(true);
      const token = localStorage.getItem('token');
      
      await axios.delete(
        `http://localhost:5000/api/events/${selectedEvent._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Remove the deleted event from state
      setEvents(events.filter(event => event._id !== selectedEvent._id));
      
      if (showSuccess) {
        showSuccess('Hackathon deleted successfully');
      }
      
      setShowDeleteModal(false);
    } catch (err) {
      console.error('Error deleting event:', err);
      if (showError) {
        showError('Failed to delete hackathon');
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setSelectedEvent(null);
  };

  // Handle event creation
  const handleCreateEvent = () => {
    navigate('/create-event');
  };

  // Handle editing an event
  const handleEditEvent = (eventId) => {
    navigate(`/edit-event/${eventId}`);
  };

  return (
    <>
      <Navbar />
      <div className="my-hackathons-container">
        <div className="my-hackathons-header">
          <h1>My Hosted Hackathons</h1>
          <p>Manage the hackathons you've created</p>
          <div className="header-actions">
            <button 
              className="create-hackathon-button"
              onClick={handleCreateEvent}
            >
              <i className="fas fa-plus"></i> Create New Hackathon
            </button>
            <button 
              className="dashboard-button"
              onClick={() => navigate('/host-dashboard')}
            >
              <i className="fas fa-tachometer-alt"></i> Host Dashboard
            </button>
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
            <button onClick={() => setLoading(true)}>Try Again</button>
          </div>
        ) : events.length > 0 ? (
          <div className="hackathons-grid">
            {events.map(event => {
              const imgUrl = event.img && typeof event.img === 'string' 
                ? (event.img.startsWith('http') ? event.img : `http://localhost:5000${event.img}`)
                : 'https://via.placeholder.com/300x200?text=Hackathon';
                
              const eventDate = event.date 
                ? new Date(event.date).toLocaleDateString('en-US', {
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric'
                  })
                : "Upcoming";
                
              return (
                <div className="hackathon-card" key={event._id}>
                  <div className="hackathon-image">
                    <img src={imgUrl} alt={event.title} />
                  </div>
                  <div className="hackathon-content">
                    <h3>{event.title}</h3>
                    <p className="hackathon-date">{eventDate}</p>
                    <p className="hackathon-location">
                      <i className="fas fa-map-marker-alt"></i> {event.location || "Virtual"}
                    </p>
                    <p className="hackathon-participants">
                      <i className="fas fa-users"></i> {event.registeredCount || 0} registered
                    </p>
                  </div>
                  <div className="hackathon-actions">
                    <button 
                      className="view-button"
                      onClick={() => navigate(`/events/${event._id}`)}
                    >
                      <i className="fas fa-eye"></i> View
                    </button>
                    <button 
                      className="edit-button"
                      onClick={() => handleEditEvent(event._id)}
                    >
                      <i className="fas fa-edit"></i> Edit
                    </button>
                    <button 
                      className="delete-button"
                      onClick={() => handleDeleteClick(event)}
                    >
                      <i className="fas fa-trash"></i> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-hackathons">
            <i className="fas fa-calendar-alt"></i>
            <h3>No hackathons created</h3>
            <p>You haven't created any hackathons yet.</p>
            <button 
              className="create-first-button"
              onClick={handleCreateEvent}
            >
              Create Your First Hackathon
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedEvent && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <h2>Delete Hackathon</h2>
            <p>Are you sure you want to delete "{selectedEvent.title}"?</p>
            <p className="warning">This action cannot be undone.</p>
            
            <div className="modal-actions">
              <button 
                className="cancel-button"
                onClick={handleDeleteCancel}
                disabled={deleting}
              >
                Cancel
              </button>
              <button 
                className="delete-confirm-button"
                onClick={handleDeleteConfirm}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MyHackathons;
