import React from 'react';
import { Link } from 'react-router-dom';
import './EventCard.css';

function EventCard({ id, title, description, img, date = "Upcoming", location = "Virtual" }) {
  // Truncate description if it's too long
  const truncatedDescription = description && description.length > 100 
    ? `${description.substring(0, 100)}...` 
    : description;
  
  return (
    <Link to={`/event/${id}`} className="event-card-link">
      <div className="event-card">
        <div className="card-image-container">
          <img 
            src={img || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1000'} 
            alt={title} 
            className="card-image" 
          />
          <div className="event-badge">{date}</div>
        </div>
        
        <div className="card-content">
          <h3 className="card-title">{title || "Event Title"}</h3>
          <div className="location-tag">
            <span>{location}</span>
          </div>
          <p className="card-description">
            {truncatedDescription || "Join us for this amazing event that will feature great speakers, networking opportunities, and much more!"}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default EventCard;