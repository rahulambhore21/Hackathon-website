import React, { useState, useEffect } from 'react';
import EventCard from '../../ui/eventCard/EventCard';
import './Events.css';
import Navbar from '../../components/Navbar/Navbar';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Events() {
  // State for filtering
  const [activeFilter, setActiveFilter] = useState('all');
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter categories
  const categories = [
    { id: 'all', name: 'All Events' },
    { id: 'ai', name: 'AI & Machine Learning' },
    { id: 'blockchain', name: 'Blockchain & Web3' },
    { id: 'health', name: 'Healthcare' },
    { id: 'environment', name: 'Environment' },
    { id: 'education', name: 'Education' }
  ];

  // Fetch events from backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/events');
        setEvents(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events. Please try again later.');
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Filter events when active filter changes
  useEffect(() => {
    if (events.length === 0) return;
    
    if (activeFilter === 'all') {
      setFilteredEvents(events);
    } else {
      setFilteredEvents(events.filter(event => event.category.toLowerCase() === activeFilter));
    }
  }, [activeFilter, events]);

  return (
    <>
    <Navbar/>
    <div className="events-container">
      <div className="events-header">
        <h1>Upcoming Hackathons</h1>
        <p>Discover exciting hackathon events and showcase your skills with the developer community</p>
        
        <div className="events-actions">
          <Link to="/add-event" className="create-event-btn">
            + Create New Hackathon
          </Link>
        </div>
      </div>
      
      <div className="events-filters">
        {categories.map(category => (
          <button 
            key={category.id}
            className={`filter-button ${activeFilter === category.id ? 'active' : ''}`}
            onClick={() => setActiveFilter(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading events...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      ) : (
        <div className="events-grid">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <EventCard 
                key={event._id}
                id={event._id}
                title={event.title}
                description={event.description}
                img={event.img.startsWith('http') ? event.img : `http://localhost:5000${event.img}`}
                date={new Date(event.date).toLocaleDateString('en-US', {
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric'
                })}
              />
            ))
          ) : (
            <div className="no-events">
              <h3>No events found in this category</h3>
              <p>Please check back later or try another category</p>
            </div>
          )}
        </div>
      )}
    </div>
    </>
  );
}

export default Events;