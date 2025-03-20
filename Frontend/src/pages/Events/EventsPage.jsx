import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import EventCard from '../../ui/eventCard/EventCard';
import axios from 'axios';
import './EventsPage.css';

const EventsPage = () => {
  const navigate = useNavigate();

  // State for events and filtering
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('date-asc');
  const [showUpcomingOnly, setShowUpcomingOnly] = useState(false);

  // Categories for filtering
  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'ai', name: 'AI & Machine Learning' },
    { id: 'web', name: 'Web Development' },
    { id: 'mobile', name: 'Mobile Development' },
    { id: 'blockchain', name: 'Blockchain' },
    { id: 'iot', name: 'IoT' },
    { id: 'cloud', name: 'Cloud Computing' },
    { id: 'security', name: 'Cybersecurity' },
    { id: 'game', name: 'Game Development' },
    { id: 'data', name: 'Data Science' },
    { id: 'design', name: 'Design' },
    { id: 'open', name: 'Open Innovation' },
  ];

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/events');
        setEvents(response.data);
        setFilteredEvents(response.data);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Apply filters when dependencies change
  useEffect(() => {
    let result = [...events];
    
    // Filter by category
    if (activeCategory !== 'all') {
      result = result.filter(event => event.category === activeCategory);
    }
    
    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(event => 
        event.title.toLowerCase().includes(search) || 
        event.description.toLowerCase().includes(search) ||
        event.location.toLowerCase().includes(search)
      );
    }
    
    // Filter upcoming events
    if (showUpcomingOnly) {
      const now = new Date();
      result = result.filter(event => new Date(event.date) >= now);
    }
    
    // Apply sorting
    result = sortEvents(result, sortOption);
    
    setFilteredEvents(result);
  }, [events, activeCategory, searchTerm, sortOption, showUpcomingOnly]);

  // Sort events based on selected option
  const sortEvents = (eventsToSort, option) => {
    const sorted = [...eventsToSort];
    
    switch (option) {
      case 'date-asc':
        return sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
      case 'date-desc':
        return sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
      case 'title-asc':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case 'title-desc':
        return sorted.sort((a, b) => b.title.localeCompare(a.title));
      case 'price-asc':
        return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
      case 'price-desc':
        return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
      default:
        return sorted;
    }
  };

  // Handle category selection
  const handleCategoryClick = (categoryId) => {
    setActiveCategory(categoryId);
  };

  // Handle search input
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle sort option change
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  // Toggle upcoming events filter
  const toggleUpcomingOnly = () => {
    setShowUpcomingOnly(!showUpcomingOnly);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'TBA';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Navigate to event creation page
  const handleCreateEvent = () => {
    navigate('/create-event');
  };

  return (
    <div className="events-page-container">
      <Navbar />
      
      <div className="events-hero">
        <div className="events-hero-content">
          <h1>Discover Amazing Hackathons</h1>
          <p>Find and join exciting hackathon events from around the world</p>
          <button className="create-event-btn" onClick={handleCreateEvent}>
            <i className="fas fa-plus"></i> Host Your Own Hackathon
          </button>
        </div>
      </div>
      
      <div className="events-main-content">
        <div className="events-filters">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search hackathons..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
            <button className="search-button">
              <i className="fas fa-search"></i>
            </button>
          </div>
          
          <div className="filter-options">
            <div className="sort-container">
              <select
                value={sortOption}
                onChange={handleSortChange}
                className="sort-select"
              >
                <option value="date-asc">Date: Upcoming First</option>
                <option value="date-desc">Date: Recent First</option>
                <option value="title-asc">Name: A-Z</option>
                <option value="title-desc">Name: Z-A</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
            
            <div className="upcoming-toggle">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={showUpcomingOnly}
                  onChange={toggleUpcomingOnly}
                />
                <span className="toggle-slider"></span>
              </label>
              <span>Upcoming only</span>
            </div>
          </div>
        </div>
        
        <div className="events-category-tabs">
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-tab ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => handleCategoryClick(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
        
        {loading ? (
          <div className="events-loading">
            <div className="loading-spinner"></div>
            <p>Loading hackathon events...</p>
          </div>
        ) : error ? (
          <div className="events-error">
            <i className="fas fa-exclamation-circle"></i>
            <h3>Oops! Something went wrong</h3>
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Try Again</button>
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="events-grid">
            {filteredEvents.map(event => {
              // Ensure image URL is properly constructed
              const imgUrl = event.img && typeof event.img === 'string' 
                ? (event.img.startsWith('http') ? event.img : `http://localhost:5000${event.img}`)
                : 'https://via.placeholder.com/300x200?text=Hackathon';
              
              return (
                <EventCard
                  key={event._id}
                  id={event._id}
                  title={event.title}
                  description={event.description}
                  img={imgUrl}
                  date={formatDate(event.date)}
                  location={event.location || "Virtual"}
                />
              );
            })}
          </div>
        ) : (
          <div className="events-empty">
            <i className="fas fa-search"></i>
            <h3>No hackathons found</h3>
            <p>Try changing your search criteria or check back later for new events.</p>
            {searchTerm || activeCategory !== 'all' || showUpcomingOnly ? (
              <button onClick={() => {
                setSearchTerm('');
                setActiveCategory('all');
                setShowUpcomingOnly(false);
              }}>
                Clear All Filters
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
