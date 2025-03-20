import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Event.css";
import Navbar from "../../components/Navbar/Navbar";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";

const Event = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth() || {};
  const { showSuccess, showError } = useNotification() || {};
  
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    // Get the event from the backend API
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:5000/api/events/${id}`);
        setEvent(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching event:", err);
        setError("Failed to load event details. Please try again later.");
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  // Handle user registration for the event
  const registerForEvent = async () => {
    // Check if the user is logged in with a valid ID
    if (!currentUser?.id) {
      setError('Please login to register for this event.');
      setSuccess('');
      if (showError) showError('Please login to register for this event.');
      navigate('/authentication');
      return;
    }
    
    // Show registering state
    setRegistering(true);
    
    try {
      const token = localStorage.getItem('token');
      
      // Call the backend API to register for event
      const response = await axios.post(
        `http://localhost:5000/api/events/${id}/register`, 
        {}, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('Registration successful:', response.data);
      
      // Update the event state to reflect registration
      setEvent(prev => ({
        ...prev,
        registeredCount: (prev.registeredCount || 0) + 1,
        registeredUsers: [...(prev.registeredUsers || []), currentUser.id]
      }));
      
      setSuccess('Successfully registered for the event!');
      setError('');
      setRegistering(false);
      
      if (showSuccess) showSuccess('Successfully registered for the event!');
    } catch (err) {
      console.error('Error registering for event:', err);
      const errorMessage = err.response?.data?.message || 'Failed to register for event. Please try again.';
      setError(errorMessage);
      setSuccess('');
      setRegistering(false);
      
      if (showError) showError(errorMessage);
    }
  };

  // Function to share the event
  const shareEvent = (platform) => {
    const eventUrl = window.location.href;
    const eventTitle = event ? event.title : "Check out this event!";
    
    let shareUrl = "";
    
    switch(platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(eventTitle)}&url=${encodeURIComponent(eventUrl)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(eventUrl)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(eventTitle + " " + eventUrl)}`;
        break;
      default:
        // Copy to clipboard
        navigator.clipboard.writeText(eventUrl).then(() => {
          setSuccess("Event URL copied to clipboard!");
          setTimeout(() => setSuccess(""), 3000);
        });
        return;
    }
    
    // Open share dialog
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar/>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading event details...</p>
        </div>
      </>
    );
  }

  if (!event) {
    return (
      <>
        <Navbar/>
        <div className="text-center p-5">
          <h2 className="text-2xl font-bold text-red-600">Event not found</h2>
          <p>The event you're looking for doesn't exist or has been removed.</p>
          <button 
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
            onClick={() => navigate('/events')}
          >
            Return to Events
          </button>
        </div>
      </>
    );
  }

  const formatTime = (time) => {
    return time; // Backend already provides formatted time
  };

  // Format date function
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', options);
    } catch (err) {
      return dateString;
    }
  };

  // Format registration deadline
  const formatDeadline = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      
      const diffTime = date.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 0) {
        return "Closed";
      } else if (diffDays === 1) {
        return "Last day!";
      } else if (diffDays <= 3) {
        return `${diffDays} days left!`;
      } else {
        return formatDate(dateString);
      }
    } catch (err) {
      return dateString;
    }
  };

  // Get image URL (handle both absolute and relative URLs)
  const getImageUrl = (imgPath) => {
    if (!imgPath) return '';
    return imgPath.startsWith('http') ? imgPath : `http://localhost:5000${imgPath}`;
  };

  return (
    <>
    <Navbar/>
      <button 
        onClick={() => navigate('/events')}
        className="back-button ml-4 mt-4 flex items-center"
      >
        <span className="mr-2">←</span> Back to Events
      </button>
    
      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 mx-4 mt-4" role="alert">
          <p>{success}</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 mx-4 mt-4" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      <div className="event-container">
        <div className="event-img">
          <img src={getImageUrl(event.img)} alt={event.title} />
        </div>
        <div className="event-content">
          <div className="register p-4 rounded-3xl">
            <h2 className="font-bold text-4xl text-blue-800">₹{event.price}</h2>
            <button 
              className={`bg-blue-800 p-2 text-center text-2xl font-bold text-white rounded-2xl w-100 ${registering ? 'opacity-75 cursor-not-allowed' : ''}`}
              onClick={registerForEvent}
              disabled={registering}
            >
              {registering ? 'Registering...' : 'Register Now'}
            </button>
            <h2 className="text-lg">
              <span className="font-semibold block">Registration Deadline</span> 
              <span className="font-bold text-red-600 block">{formatDeadline(event.registrationDeadline)}</span>
            </h2>
            <h4 className="text-lg">
              <span className="font-semibold">People registered:</span>{" "}
              <span className="font-bold text-blue-600">{event.registeredCount}</span>
            </h4>
            <h4 className="text-lg mt-2">
              <span className="font-semibold">Max Team Size:</span>{" "}
              <span className="font-bold text-blue-600">{event.maxTeamSize} members</span>
            </h4>
          </div>
          <div className="eligiblilty rounded-3xl p-7">
            <h2 className="font-bold text-xl text-blue-800 mb-3">Eligibility Criteria</h2>
            <p>{event.eligibility}</p>
          </div>
          
          <div className="contact-info rounded-3xl p-7 bg-white mt-4 shadow-md">
            <h2 className="font-bold text-xl text-blue-800 mb-3">Contact Organizer</h2>
            <p className="mb-2">
              <span className="font-semibold">Email:</span> {event.createdBy?.email || 'organizer@hackathon.com'}
            </p>
            <p className="mb-2">
              <span className="font-semibold">Organizer:</span> {event.createdBy?.name || 'Hackathon Organizer'}
            </p>
          </div>
        </div>
        <div className="event-details">
          <h1 className="font-bold text-4xl">{event.title}</h1>
          
          <div className="detail-section">
            <h2 className="font-bold text-xl">Category: <span className="font-normal text-gray-700">{event.category}</span></h2>
            <h2 className="font-bold text-xl">Location: <span className="font-normal text-gray-700">{event.location}</span></h2>
            <h2 className="font-bold text-xl">Date: <span className="font-normal text-gray-700">{formatDate(event.date)}</span></h2>
            <h2 className="font-bold text-xl">Time: <span className="font-normal text-gray-700">{formatTime(event.time)}</span></h2>
          </div>
          
          <div className="description-section">
            <h2 className="font-bold text-2xl">About This Event</h2>
            <p>{event.description}</p>
          </div>
          
          {/* Event Format Section */}
          {event.format && (
            <div className="format-section mt-6 pt-5 border-t border-gray-200">
              <h2 className="font-bold text-2xl mb-3">Event Format</h2>
              <p>{event.format}</p>
            </div>
          )}
          
          {/* Prizes Section */}
          {event.prizes && event.prizes.length > 0 && (
            <div className="prizes-section mt-6 pt-5 border-t border-gray-200">
              <h2 className="font-bold text-2xl mb-3">Prizes</h2>
              <div className="prizes-grid grid grid-cols-1 md:grid-cols-2 gap-4">
                {event.prizes.map((prize, index) => (
                  <div key={index} className="prize-card bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <h3 className="text-lg font-bold text-blue-800">{prize.position}</h3>
                    <p className="text-gray-700">{prize.prize}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Sponsors Section */}
          {event.sponsors && event.sponsors.length > 0 && (
            <div className="sponsors-section mt-6 pt-5 border-t border-gray-200">
              <h2 className="font-bold text-2xl mb-3">Sponsors</h2>
              <div className="sponsors-list flex flex-wrap gap-2">
                {event.sponsors.map((sponsor, index) => (
                  <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full">
                    {sponsor}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* FAQ Section */}
          {event.faqs && event.faqs.length > 0 && (
            <div className="faq-section mt-6 pt-5 border-t border-gray-200">
              <h2 className="font-bold text-2xl mb-3">Frequently Asked Questions</h2>
              <div className="faqs-list">
                {event.faqs.map((faq, index) => (
                  <div key={index} className="faq-item mb-4">
                    <h3 className="text-lg font-bold text-blue-700">{faq.question}</h3>
                    <p className="text-gray-700">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Share section */}
          <div className="share-section mt-6 pt-5 border-t border-gray-200">
            <h2 className="font-bold text-2xl mb-3">Share This Event</h2>
            <div className="share-buttons flex flex-wrap gap-3">
              <button onClick={() => shareEvent('twitter')} className="share-btn twitter">
                Twitter
              </button>
              <button onClick={() => shareEvent('facebook')} className="share-btn facebook">
                Facebook
              </button>
              <button onClick={() => shareEvent('whatsapp')} className="share-btn whatsapp">
                WhatsApp
              </button>
              <button onClick={() => shareEvent('copy')} className="share-btn copy">
                Copy Link
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Event;
