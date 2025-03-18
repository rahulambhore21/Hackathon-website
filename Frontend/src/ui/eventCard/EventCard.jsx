import React from 'react';
import { Link } from 'react-router-dom';
import './EventCard.css';

function EventCard({ id, title, description, img, date = "Upcoming" }) {
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
          
          <p className="card-description">
            {truncatedDescription || "Join us for this amazing event that will feature great speakers, networking opportunities, and much more!"}
          </p>
          
          <div className="card-footer">
            <Link 
              to={`/event/${id}`} 
              className="read-more-btn"
              onClick={(e) => e.stopPropagation()}
            >
              Read More
            </Link>
            
            <div className="card-date">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
              </svg>
              {date}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default EventCard;