import React from 'react';
import { Link } from 'react-router-dom';
import './EventCard.css';

const EventCard = ({ id, title, description, img, date = "Upcoming", location = "Virtual" }) => {
  // Add error handling for image loading
  const handleImageError = (e) => {
    e.target.src = 'https://via.placeholder.com/300x150?text=No+Image';
  };
  
  // Truncate description to a reasonable length
  const truncateDescription = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  // For debugging
  console.log("EventCard props:", { id, title, description, img, date });

  return (
    <Link to={`/event/${id}`} className="event-card-link">
      <div className="event-card">
        <div className="card-image-container">
          <img 
            src={img || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1000'} 
            alt={title || "Event"} 
            className="card-image" 
            onError={handleImageError}
          />
          <div className="event-badge">{date}</div>
        </div>
        
        <div className="card-content">
          <h3 className="card-title">{title || "Event Title"}</h3>
          <div className="location-tag">
            <span>{location}</span>
          </div>
          <p className="card-description">
            {truncateDescription(description) || "Join us for this amazing event that will feature great speakers, networking opportunities, and much more!"}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;