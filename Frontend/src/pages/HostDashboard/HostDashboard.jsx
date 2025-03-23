import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/Navbar/Navbar';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import './HostDashboard.css';

const HostDashboard = () => {

  const navigate = useNavigate();
  const { currentUser } = useAuth() || {};
  const { showSuccess, showError } = useNotification() || {};
  
  const [hostedEvents, setHostedEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(false);
  const [error, setError] = useState('');
  const [userError, setUserError] = useState('');
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalRegistrations: 0,
    upcomingEvents: 0,
    completedEvents: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [eventFilter, setEventFilter] = useState('all'); // 'all', 'upcoming', 'past'

  // Fetch hosted events on component mount
  useEffect(() => {
    if (!currentUser?.id) {
      setLoading(false);
      return;
    }
    
    fetchHostedEvents();
  }, [currentUser, navigate]);

  // Fetch hosted events data
  const fetchHostedEvents = async () => {
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

      setHostedEvents(response.data);
      
      // Calculate dashboard stats
      const now = new Date();
      const upcomingEvents = response.data.filter(event => new Date(event.date) > now);
      const pastEvents = response.data.filter(event => new Date(event.date) <= now);
      const totalRegistrations = response.data.reduce((acc, event) => acc + (event.registeredCount || 0), 0);
      
      setStats({
        totalEvents: response.data.length,
        totalRegistrations,
        upcomingEvents: upcomingEvents.length,
        completedEvents: pastEvents.length
      });
      
      // If we have events, select the first one by default
      if (response.data.length > 0) {
        setSelectedEvent(response.data[0]);
        fetchRegisteredUsers(response.data[0]._id);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching hosted events:', err);
      setError('Failed to load your hosted events');
      if (showError) showError('Error loading your hosted events');
      setLoading(false);
    }
  };

  // Fetch registered users for a specific event
  const fetchRegisteredUsers = async (eventId) => {
    try {
      setUserLoading(true);
      setUserError('');
      
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `http://localhost:5000/api/events/${eventId}/registrations`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setRegisteredUsers(response.data);
      setUserLoading(false);
    } catch (err) {
      console.error('Error fetching registered users:', err);
      setUserError('Failed to load registered users for this event');
      setUserLoading(false);
    }
  };

  // Handle event selection
  const handleEventSelect = (event) => {
    setSelectedEvent(event);
    fetchRegisteredUsers(event._id);
  };

  // Handle removing a user from an event
  const handleRemoveUser = async (userId) => {
    if (!selectedEvent || !userId) return;
    
    try {
      const token = localStorage.getItem('token');
      
      await axios.delete(
        `http://localhost:5000/api/events/${selectedEvent._id}/registrations/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update UI by removing the user
      setRegisteredUsers(registeredUsers.filter(reg => reg.user.id !== userId));
      
      // Update the selected event's registration count
      setSelectedEvent(prev => ({
        ...prev,
        registeredCount: (prev.registeredCount || 0) - 1
      }));
      
      // Update the event in the hosted events list
      setHostedEvents(hostedEvents.map(event => {
        if (event._id === selectedEvent._id) {
          return {
            ...event,
            registeredCount: (event.registeredCount || 0) - 1
          };
        }
        return event;
      }));
      
      if (showSuccess) showSuccess('User removed from event successfully');
    } catch (err) {
      console.error('Error removing user:', err);
      if (showError) showError('Failed to remove user from event');
    }
  };

  // Handle edit event
  const handleEditEvent = (eventId) => {
    navigate(`/edit-event/${eventId}`);
  };

  // Handle delete event
  const handleDeleteEvent = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.delete(
        `http://localhost:5000/api/events/${eventId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Remove event from state
      setHostedEvents(hostedEvents.filter(event => event._id !== eventId));
      
      // If deleted event was selected, clear selection
      if (selectedEvent && selectedEvent._id === eventId) {
        setSelectedEvent(null);
        setRegisteredUsers([]);
      }
      
      // Update stats
      setStats(prev => ({
        ...prev,
        totalEvents: prev.totalEvents - 1
      }));
      
      if (showSuccess) showSuccess('Event deleted successfully');
    } catch (err) {
      console.error('Error deleting event:', err);
      if (showError) showError('Failed to delete event');
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
      return dateString;
    }
  };

  // Filter events based on selected filter
  const getFilteredEvents = () => {
    const now = new Date();
    
    switch(eventFilter) {
      case 'upcoming':
        return hostedEvents.filter(event => new Date(event.date) > now);
      case 'past':
        return hostedEvents.filter(event => new Date(event.date) <= now);
      default:
        return hostedEvents;
    }
  };

  // Filter registered users based on search term
  const getFilteredUsers = () => {
    if (!searchTerm.trim()) return registeredUsers;
    
    return registeredUsers.filter(registration => {
      const searchLower = searchTerm.toLowerCase();
      return (
        registration.user.name.toLowerCase().includes(searchLower) ||
        registration.user.email.toLowerCase().includes(searchLower) ||
        (registration.user.college && registration.user.college.toLowerCase().includes(searchLower))
      );
    });
  };

  // Export registered users to CSV
  const exportToCSV = () => {
    if (!registeredUsers.length) return;
    
    const csvContent = [
      // CSV header
      ['Name', 'Email', 'College', 'Registration Date'].join(','),
      // CSV data rows
      ...registeredUsers.map(reg => [
        reg.user.name.replace(/,/g, ' '), // Replace commas to avoid CSV issues
        reg.user.email,
        (reg.user.college || 'Not specified').replace(/,/g, ' '),
        formatDate(reg.registrationDate)
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedEvent.title}-registrations.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!currentUser) {
    return (
      <>
        <Navbar />
        <div className="host-dashboard-container">
          <div className="auth-required">
            <h2>Authentication Required</h2>
            <p>You must be logged in to access the host dashboard.</p>
            <button onClick={() => navigate('/authentication')}>
              Login / Sign Up
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="host-dashboard-container">
        <div className="dashboard-header">
          <div className="header-content">
            <h1>Host Dashboard</h1>
            <p>Manage your hackathons and view participant registrations</p>
          </div>
          <button 
            className="create-event-button"
            onClick={() => navigate('/create-event')}
          >
            <i className="fas fa-plus"></i> Create New Hackathon
          </button>
        </div>

        {loading ? (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <p>Loading your dashboard...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={fetchHostedEvents}>Try Again</button>
          </div>
        ) : hostedEvents.length === 0 ? (
          <div className="no-events-message">
            <h2>No Hackathons Created Yet</h2>
            <p>You haven't created any hackathon events.</p>
            <button 
              className="create-first-event"
              onClick={() => navigate('/create-event')}
            >
              Create Your First Hackathon
            </button>
          </div>
        ) : (
          <>
            <div className="dashboard-stats">
              <div className="stat-card">
                <div className="stat-value">{stats.totalEvents}</div>
                <div className="stat-label">Total Hackathons</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.totalRegistrations}</div>
                <div className="stat-label">Total Registrations</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.upcomingEvents}</div>
                <div className="stat-label">Upcoming Hackathons</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.completedEvents}</div>
                <div className="stat-label">Completed Hackathons</div>
              </div>
            </div>

            <div className="dashboard-content">
              <div className="events-list">
                <div className="events-header">
                  <h2>Your Hackathons</h2>
                  <div className="event-filters">
                    <button 
                      className={`filter-btn ${eventFilter === 'all' ? 'active' : ''}`}
                      onClick={() => setEventFilter('all')}
                    >
                      All
                    </button>
                    <button 
                      className={`filter-btn ${eventFilter === 'upcoming' ? 'active' : ''}`}
                      onClick={() => setEventFilter('upcoming')}
                    >
                      Upcoming
                    </button>
                    <button 
                      className={`filter-btn ${eventFilter === 'past' ? 'active' : ''}`}
                      onClick={() => setEventFilter('past')}
                    >
                      Past
                    </button>
                  </div>
                </div>
                
                {getFilteredEvents().length === 0 ? (
                  <div className="no-filtered-events">
                    <p>No {eventFilter} hackathons found</p>
                  </div>
                ) : (
                  getFilteredEvents().map(event => (
                    <div 
                      key={event._id}
                      className={`event-item ${selectedEvent && selectedEvent._id === event._id ? 'selected' : ''}`}
                      onClick={() => handleEventSelect(event)}
                    >
                      <div className="event-item-info">
                        <h3>{event.title}</h3>
                        <div className="event-item-details">
                          <span>{formatDate(event.date)}</span>
                          <span>•</span>
                          <span>{event.registeredCount || 0} registered</span>
                        </div>
                      </div>
                      <div className="event-item-actions">
                        <button 
                          className="edit-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditEvent(event._id);
                          }}
                          title="Edit event"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          className="delete-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Are you sure you want to delete "${event.title}"?`)) {
                              handleDeleteEvent(event._id);
                            }
                          }}
                          title="Delete event"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="registrations-panel">
                <div className="registrations-header">
                  <h2>
                    {selectedEvent ? `Registrations for "${selectedEvent.title}"` : 'Registrations'}
                  </h2>
                  
                  {selectedEvent && registeredUsers.length > 0 && (
                    <div className="registrations-actions">
                      <div className="search-container">
                        <input
                          type="text"
                          placeholder="Search participants..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="search-input"
                        />
                        {searchTerm && (
                          <button 
                            className="clear-search" 
                            onClick={() => setSearchTerm('')}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        )}
                      </div>
                      <button 
                        className="export-button"
                        onClick={exportToCSV}
                        title="Export to CSV"
                      >
                        <i className="fas fa-download"></i> Export
                      </button>
                    </div>
                  )}
                </div>
                
                {!selectedEvent ? (
                  <div className="no-event-selected">
                    <p>Select a hackathon to view registrations</p>
                  </div>
                ) : userLoading ? (
                  <div className="loading-indicator">
                    <div className="spinner"></div>
                    <p>Loading registrations...</p>
                  </div>
                ) : userError ? (
                  <div className="error-message">
                    <p>{userError}</p>
                    <button onClick={() => fetchRegisteredUsers(selectedEvent._id)}>Try Again</button>
                  </div>
                ) : registeredUsers.length === 0 ? (
                  <div className="no-registrations">
                    <p>No one has registered for this hackathon yet.</p>
                  </div>
                ) : getFilteredUsers().length === 0 ? (
                  <div className="no-search-results">
                    <p>No participants match your search for "{searchTerm}"</p>
                    <button 
                      className="clear-search-button"
                      onClick={() => setSearchTerm('')}
                    >
                      Clear Search
                    </button>
                  </div>
                ) : (
                  <div className="registrations-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>College</th>
                          <th>Registration Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getFilteredUsers().map(registration => (
                          <tr key={registration.id}>
                            <td>{registration.user.name}</td>
                            <td>{registration.user.email}</td>
                            <td>{registration.user.college || 'Not specified'}</td>
                            <td>{formatDate(registration.registrationDate)}</td>
                            <td>
                              <button 
                                className="remove-user-button"
                                onClick={() => {
                                  if (window.confirm(`Remove ${registration.user.name} from this event?`)) {
                                    handleRemoveUser(registration.user.id);
                                  }
                                }}
                                title="Remove user from event"
                              >
                                <i className="fas fa-user-minus"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default HostDashboard;
