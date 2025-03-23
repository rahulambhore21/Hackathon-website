import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/Navbar/Navbar';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import './EventDetails.css';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth() || {};
  const { showSuccess, showError } = useNotification() || {};

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/events/${id}`);
      setEvent(response.data);
      
      // Check if user is registered for this event
      if (currentUser && response.data.registeredUsers) {
        setIsRegistered(response.data.registeredUsers.includes(currentUser.id));
      }
    } catch (err) {
      console.error('Error fetching event details:', err);
      setError('Failed to load event details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!currentUser) {
      // Redirect to login page if not logged in
      navigate('/authentication', { state: { returnUrl: `/events/${id}` } });
      return;
    }

    setRegisterLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/events/${id}/register`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      showSuccess('Successfully registered for the hackathon!');
      setIsRegistered(true);
    } catch (err) {
      console.error('Error registering for event:', err);
      const errorMessage = err.response?.data?.message || 'Failed to register for the event.';
      showError(errorMessage);
    } finally {
      setRegisterLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'TBA';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTimeRemaining = (dateString) => {
    const eventDate = new Date(dateString);
    const now = new Date();
    const difference = eventDate - now;
    
    if (difference <= 0) return 'Event has started';
    
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return `${days} days, ${hours} hours remaining`;
  };

  // Helper function to render sponsors with the new format
  const renderSponsors = () => {
    if (!event.sponsors || event.sponsors.length === 0) {
      return <p>No sponsors listed for this event.</p>;
    }

    // Group sponsors by level
    const sponsorsByLevel = {};
    event.sponsors.forEach(sponsor => {
      const level = sponsor.level || 'Gold';
      if (!sponsorsByLevel[level]) {
        sponsorsByLevel[level] = [];
      }
      sponsorsByLevel[level].push(sponsor);
    });

    // Order of sponsor levels from highest to lowest
    const levelOrder = ['Platinum', 'Gold', 'Silver', 'Bronze', 'Partner', 'In-Kind'];

    return (
      <div className="sponsors-section">
        {levelOrder.map(level => {
          if (!sponsorsByLevel[level]) return null;
          
          return (
            <div key={level} className={`sponsor-level ${level.toLowerCase()}-sponsors`}>
              <h3>{level} Sponsors</h3>
              <div className="sponsor-grid">
                {sponsorsByLevel[level].map((sponsor, index) => (
                  <div key={index} className="sponsor-card">
                    {sponsor.logoUrl && (
                      <div className="sponsor-logo">
                        <img src={sponsor.logoUrl} alt={`${sponsor.name} logo`} />
                      </div>
                    )}
                    <div className="sponsor-info">
                      <h4>{sponsor.name}</h4>
                      {sponsor.website && (
                        <a 
                          href={sponsor.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="sponsor-website"
                        >
                          Visit Website <i className="fas fa-external-link-alt"></i>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="event-details-loading">
          <div className="loading-spinner"></div>
          <p>Loading event details...</p>
        </div>
      </>
    );
  }

  if (error || !event) {
    return (
      <>
        <Navbar />
        <div className="event-details-error">
          <h2>Oops! Something went wrong</h2>
          <p>{error || 'Failed to load event details.'}</p>
          <div className="event-details-actions">
            <button onClick={fetchEventDetails}>Try Again</button>
            <button onClick={() => navigate('/events')}>Browse Events</button>
          </div>
        </div>
      </>
    );
  }

  const eventImage = event.img && typeof event.img === 'string'
    ? (event.img.startsWith('http') ? event.img : `http://localhost:5000${event.img}`)
    : 'https://via.placeholder.com/1200x500?text=Hackathon';

  const isUpcoming = new Date(event.date) > new Date();
  const isPastDeadline = new Date(event.registrationDeadline) < new Date();

  return (
    <>
      <Navbar />
      <div className="event-details-container">
        <div 
          className="event-details-hero" 
          style={{ 
            backgroundImage: `url(${eventImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center center'
          }}
        >
          <div className="event-hero-overlay"></div>
          <div className="event-hero-content">
            <div className="event-meta">
              <span className="event-category">{event.category}</span>
              <span className="event-date">{formatDate(event.date)}</span>
            </div>
            <h1 className="event-title">{event.title}</h1>
            <div className="event-location">
              <i className="fas fa-map-marker-alt"></i> {event.location}
            </div>
            {isUpcoming && (
              <div className="event-countdown">
                {getTimeRemaining(event.date)}
              </div>
            )}
          </div>
        </div>

        <div className="event-details-main">
          <div className="event-details-content">
            <div className="event-details-tabs">
              <button 
                className={`event-tab ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button 
                className={`event-tab ${activeTab === 'details' ? 'active' : ''}`}
                onClick={() => setActiveTab('details')}
              >
                Details
              </button>
              <button 
                className={`event-tab ${activeTab === 'prizes' ? 'active' : ''}`}
                onClick={() => setActiveTab('prizes')}
              >
                Prizes
              </button>
              <button 
                className={`event-tab ${activeTab === 'rules' ? 'active' : ''}`}
                onClick={() => setActiveTab('rules')}
              >
                Rules
              </button>
              <button 
                className={`event-tab ${activeTab === 'faqs' ? 'active' : ''}`}
                onClick={() => setActiveTab('faqs')}
              >
                FAQs
              </button>
            </div>
            
            <div className="event-tab-content">
              {activeTab === 'overview' && (
                <div className="event-overview">
                  <h2>About This Hackathon</h2>
                  <p>{event.description}</p>
                  
                  <div className="event-highlights">
                    <div className="highlight-card">
                      <i className="fas fa-users"></i>
                      <h3>Team Size</h3>
                      <p>Up to {event.maxTeamSize} members</p>
                    </div>
                    <div className="highlight-card">
                      <i className="fas fa-trophy"></i>
                      <h3>Prizes</h3>
                      <p>{event.prizes && event.prizes.length ? 'Available' : 'To be announced'}</p>
                    </div>
                    <div className="highlight-card">
                      <i className="fas fa-calendar-check"></i>
                      <h3>Registration Deadline</h3>
                      <p>{formatDate(event.registrationDeadline)}</p>
                    </div>
                    {event.price > 0 ? (
                      <div className="highlight-card">
                        <i className="fas fa-ticket-alt"></i>
                        <h3>Entry Fee</h3>
                        <p>${event.price.toFixed(2)}</p>
                      </div>
                    ) : (
                      <div className="highlight-card">
                        <i className="fas fa-ticket-alt"></i>
                        <h3>Entry Fee</h3>
                        <p>Free</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'details' && (
                <div className="event-details-section">
                  <h2>Event Details</h2>
                  <div className="event-details-grid">
                    <div className="detail-item">
                      <h3>Date & Time</h3>
                      <p>{formatDate(event.date)}</p>
                      <p>{event.time}</p>
                    </div>
                    <div className="detail-item">
                      <h3>Location</h3>
                      <p>{event.location}</p>
                    </div>
                    <div className="detail-item">
                      <h3>Format</h3>
                      <p>{event.format || 'Standard hackathon format'}</p>
                    </div>
                    <div className="detail-item">
                      <h3>Eligibility</h3>
                      <p>{event.eligibility}</p>
                    </div>
                  </div>
                  
                  <h3>Schedule</h3>
                  <div className="event-schedule">
                    <div className="schedule-item">
                      <div className="schedule-time">Day 1</div>
                      <div className="schedule-details">
                        <h4>Opening Ceremony & Team Formation</h4>
                        <p>Welcome address, rules explanation, and team formation</p>
                      </div>
                    </div>
                    <div className="schedule-item">
                      <div className="schedule-time">Day 2</div>
                      <div className="schedule-details">
                        <h4>Hacking Time</h4>
                        <p>Full day of coding and building your projects</p>
                      </div>
                    </div>
                    <div className="schedule-item">
                      <div className="schedule-time">Day 3</div>
                      <div className="schedule-details">
                        <h4>Presentations & Awards</h4>
                        <p>Project presentations, judging, and award ceremony</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'prizes' && (
                <div className="event-prizes-section">
                  <h2>Prizes</h2>
                  {event.prizes && event.prizes.length > 0 ? (
                    <div className="prizes-grid">
                      {event.prizes.map((prize, index) => (
                        <div key={index} className={`prize-card ${index === 0 ? 'first-place' : index === 1 ? 'second-place' : index === 2 ? 'third-place' : ''}`}>
                          <div className="prize-position">{prize.position}</div>
                          <div className="prize-value">{prize.prize}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-prizes">
                      <p>Prize details will be announced soon!</p>
                    </div>
                  )}
                  
                  {event.sponsors && event.sponsors.length > 0 && (
                    <>
                      <h3>Sponsors</h3>
                      {renderSponsors()}
                    </>
                  )}
                </div>
              )}

              {activeTab === 'rules' && (
                <div className="event-rules-section">
                  <h2>Rules & Guidelines</h2>
                  <div className="rules-list">
                    <div className="rule-item">
                      <h3>Team Formation</h3>
                      <p>Teams can consist of up to {event.maxTeamSize} members. Individual participation is also allowed.</p>
                    </div>
                    <div className="rule-item">
                      <h3>Code of Conduct</h3>
                      <p>All participants must adhere to the hackathon's code of conduct, promoting respect, inclusivity, and fair play.</p>
                    </div>
                    <div className="rule-item">
                      <h3>Projects</h3>
                      <p>All projects must be original work created during the hackathon period. Pre-existing projects are not allowed.</p>
                    </div>
                    <div className="rule-item">
                      <h3>Intellectual Property</h3>
                      <p>Participants retain ownership of their projects, but grant the organizers the right to showcase the projects for promotional purposes.</p>
                    </div>
                    <div className="rule-item">
                      <h3>Submission</h3>
                      <p>All projects must be submitted before the deadline to be eligible for judging and prizes.</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'faqs' && (
                <div className="event-faqs-section">
                  <h2>Frequently Asked Questions</h2>
                  <div className="faqs-list">
                    {event.faqs && event.faqs.length > 0 ? (
                      event.faqs.map((faq, index) => (
                        <div key={index} className="faq-item">
                          <h3>{faq.question}</h3>
                          <p>{faq.answer}</p>
                        </div>
                      ))
                    ) : (
                      <div className="default-faqs">
                        <div className="faq-item">
                          <h3>What is a hackathon?</h3>
                          <p>A hackathon is an event where programmers, designers, and others collaborate intensively on software projects within a limited time frame, typically ranging from 24 to 48 hours.</p>
                        </div>
                        <div className="faq-item">
                          <h3>Do I need to have a team to participate?</h3>
                          <p>No, you can register as an individual and form teams at the event, or work solo if you prefer.</p>
                        </div>
                        <div className="faq-item">
                          <h3>What should I bring?</h3>
                          <p>Bring your laptop, charger, any hardware you plan to work with, and personal items for overnight stays if applicable.</p>
                        </div>
                        <div className="faq-item">
                          <h3>Will food be provided?</h3>
                          <p>Yes, meals, snacks, and beverages will be provided throughout the hackathon.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="event-details-sidebar">
            <div className="event-registration-card">
              <h3>Registration</h3>
              <div className="event-price">
                {event.price > 0 ? `$${event.price.toFixed(2)}` : 'Free Entry'}
              </div>
              
              <div className="registration-info">
                <div className="info-item">
                  <i className="fas fa-users"></i>
                  <span>{event.registeredCount || 0} people registered</span>
                </div>
                <div className="info-item">
                  <i className="fas fa-clock"></i>
                  <span>
                    {isPastDeadline 
                      ? 'Registration closed' 
                      : `Deadline: ${formatDate(event.registrationDeadline)}`}
                  </span>
                </div>
              </div>
              
              {isRegistered ? (
                <div className="already-registered">
                  <i className="fas fa-check-circle"></i> You are registered!
                </div>
              ) : (
                <button 
                  className="register-button"
                  onClick={handleRegister}
                  disabled={registerLoading || isPastDeadline || !isUpcoming}
                >
                  {registerLoading 
                    ? 'Registering...' 
                    : isPastDeadline 
                      ? 'Registration Closed' 
                      : !isUpcoming 
                        ? 'Event Has Started' 
                        : 'Register Now'}
                </button>
              )}
              
              {!currentUser && (
                <p className="login-prompt">
                  <a href="/authentication">Sign in</a> to register for this hackathon
                </p>
              )}
              
              <div className="social-share">
                <p>Share this event:</p>
                <div className="share-buttons">
                  <button className="share-btn facebook">
                    <i className="fab fa-facebook-f"></i>
                  </button>
                  <button className="share-btn twitter">
                    <i className="fab fa-twitter"></i>
                  </button>
                  <button className="share-btn linkedin">
                    <i className="fab fa-linkedin-in"></i>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="organizer-card">
              <h3>Organizer</h3>
              <div className="organizer-info">
                <img 
                  src="https://randomuser.me/api/portraits/men/32.jpg" 
                  alt="Organizer" 
                  className="organizer-image" 
                />
                <div>
                  <p className="organizer-name">
                    {event.createdBy?.name || 'Hackathon Team'}
                  </p>
                  <p className="organizer-contact">
                    {event.createdBy?.email || 'contact@hackathon.com'}
                  </p>
                </div>
              </div>
              <button className="contact-button">
                <i className="fas fa-envelope"></i> Contact Organizer
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EventDetails;
