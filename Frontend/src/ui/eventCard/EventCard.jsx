import React from 'react';
import { useNavigate } from 'react-router-dom';
import './EventCard.css';

const EventCard = ({ id, title, description, img, date, location, onClick }) => {
  const navigate = useNavigate();
  
  // Handle card click, either use the provided onClick or navigate to event details
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/events/${id}`);
    }
  };
  
  // Truncate description if it's too long
  const truncateDescription = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <div className="event-card" onClick={handleClick}>
      <div className="event-card-img">
        <img src={img || 'https://via.placeholder.com/300x200?text=Hackathon'} alt={title} />
        <div className="event-date-badge">{date}</div>
      </div>
      <div className="event-card-content">
        <h3 className="event-card-title">{title}</h3>
        <p className="event-card-description">{truncateDescription(description)}</p>
        <div className="event-card-footer">
          <div className="event-location">
            <i className="fas fa-map-marker-alt"></i> {location}
          </div>
          <button className="event-details-btn">View Details</button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;