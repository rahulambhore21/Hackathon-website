import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './EventRegistrations.css';
import Navbar from '../../components/Navbar/Navbar';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

const EventRegistrations = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth() || {};
  const notification = useNotification() || {};
  const { showError } = notification;
  
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('registrationDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [expandedUser, setExpandedUser] = useState(null);

  // Fetch event details and registrations
  useEffect(() => {
    const fetchEventAndRegistrations = async () => {
      if (!currentUser) {
        navigate('/authentication');
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Get event details
        const eventResponse = await axios.get(
          `http://localhost:5000/api/events/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setEvent(eventResponse.data);
        
        // Check if current user is the creator of the event
        if (eventResponse.data.createdBy._id !== currentUser.id && currentUser.role !== 'admin') {
          navigate('/my-hackathons');
          if (showError) showError('You do not have permission to view these registrations');
          return;
        }

        // Get all registered users
        if (eventResponse.data.registeredUsers && eventResponse.data.registeredUsers.length > 0) {
          // In a real app, you would fetch user details for each registered user
          // For this demo, we'll create mock user data
          const mockRegistrations = eventResponse.data.registeredUsers.map((userId, index) => ({
            id: userId,
            user: {
              id: userId,
              name: `Participant ${index + 1}`,
              email: `participant${index + 1}@example.com`,
              college: 'Example University',
              phone: `+91 98765${10000 + index}`,
              skills: ['JavaScript', 'React', 'Node.js']
            },
            registrationDate: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
            teamName: `Team ${Math.floor(Math.random() * 100)}`,
            teamSize: Math.floor(Math.random() * 4) + 1,
            paymentStatus: Math.random() > 0.2 ? 'Paid' : 'Pending',
            notes: ''
          }));
          
          setRegistrations(mockRegistrations);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching event registrations:', err);
        setError('Failed to load registrations. Please try again.');
        setLoading(false);
        
        if (showError) {
          showError('Failed to load registrations');
        }
      }
    };

    fetchEventAndRegistrations();
  }, [id, currentUser, navigate, showError]);

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Filter registrations based on search term
  const filteredRegistrations = registrations.filter(reg => 
    reg.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.teamName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort registrations
  const sortedRegistrations = [...filteredRegistrations].sort((a, b) => {
    let compareResult = 0;
    
    switch (sortBy) {
      case 'name':
        compareResult = a.user.name.localeCompare(b.user.name);
        break;
      case 'email':
        compareResult = a.user.email.localeCompare(b.user.email);
        break;
      case 'teamName':
        compareResult = a.teamName.localeCompare(b.teamName);
        break;
      case 'teamSize':
        compareResult = a.teamSize - b.teamSize;
        break;
      case 'paymentStatus':
        compareResult = a.paymentStatus.localeCompare(b.paymentStatus);
        break;
      case 'registrationDate':
      default:
        compareResult = new Date(a.registrationDate) - new Date(b.registrationDate);
    }
    
    return sortOrder === 'asc' ? compareResult : -compareResult;
  });

  // Handle sort change
  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  // Export registrations to CSV
  const exportToCSV = () => {
    if (!registrations.length) return;
    
    const headers = ['Name', 'Email', 'College', 'Phone', 'Team Name', 'Team Size', 'Registration Date', 'Payment Status'];
    const csvRows = [
      headers.join(','),
      ...registrations.map(reg => [
        `"${reg.user.name}"`,
        `"${reg.user.email}"`,
        `"${reg.user.college}"`,
        `"${reg.user.phone || ''}"`,
        `"${reg.teamName}"`,
        reg.teamSize,
        `"${formatDate(reg.registrationDate)}"`,
        `"${reg.paymentStatus}"`
      ].join(','))
    ];
    
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${event.title.replace(/\s+/g, '-')}_registrations.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Toggle user details expanded view
  const toggleUserDetails = (userId) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };

  // Handle note updates
  const handleNoteChange = (userId, note) => {
    setRegistrations(registrations.map(reg => 
      reg.id === userId ? {...reg, notes: note} : reg
    ));
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="registrations-loading">
          <div className="loading-spinner"></div>
          <p>Loading registrations...</p>
        </div>
      </>
    );
  }

  if (!event) {
    return (
      <>
        <Navbar />
        <div className="registrations-error">
          <h2>Event not found</h2>
          <p>The event you're looking for doesn't exist or has been removed.</p>
          <button onClick={() => navigate('/my-hackathons')}>Return to My Hackathons</button>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="registrations-container">
        <div className="registrations-header">
          <div className="registrations-title-section">
            <button 
              onClick={() => navigate('/my-hackathons')}
              className="back-button"
            >
              <i className="fas fa-arrow-left"></i> Back to My Hackathons
            </button>
            <h1>Registrations: {event.title}</h1>
            <p>Manage participant registrations for your hackathon</p>
          </div>

          <div className="registrations-stats">
            <div className="stat-card">
              <span className="stat-value">{registrations.length}</span>
              <span className="stat-label">Total Registrations</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">
                {registrations.filter(r => r.paymentStatus === 'Paid').length}
              </span>
              <span className="stat-label">Payments Completed</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">
                {registrations.reduce((total, r) => total + r.teamSize, 0)}
              </span>
              <span className="stat-label">Total Participants</span>
            </div>
          </div>
        </div>

        <div className="registrations-tools">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input 
              type="text" 
              placeholder="Search by name, email, or team..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="registrations-actions">
            <button 
              className="export-btn"
              onClick={exportToCSV}
              disabled={registrations.length === 0}
            >
              <i className="fas fa-download"></i> Export to CSV
            </button>
            <Link 
              to={`/event/${event._id}`}
              className="view-event-btn"
            >
              <i className="fas fa-eye"></i> View Event
            </Link>
          </div>
        </div>

        {error ? (
          <div className="registrations-error">
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Try Again</button>
          </div>
        ) : registrations.length > 0 ? (
          <>
            <div className="registrations-table">
              <table>
                <thead>
                  <tr>
                    <th 
                      className={sortBy === 'name' ? `sorted ${sortOrder}` : ''}
                      onClick={() => handleSortChange('name')}
                    >
                      Name <i className="fas fa-sort"></i>
                    </th>
                    <th 
                      className={sortBy === 'email' ? `sorted ${sortOrder}` : ''}
                      onClick={() => handleSortChange('email')}
                    >
                      Email <i className="fas fa-sort"></i>
                    </th>
                    <th 
                      className={sortBy === 'teamName' ? `sorted ${sortOrder}` : ''}
                      onClick={() => handleSortChange('teamName')}
                    >
                      Team <i className="fas fa-sort"></i>
                    </th>
                    <th 
                      className={sortBy === 'teamSize' ? `sorted ${sortOrder}` : ''}
                      onClick={() => handleSortChange('teamSize')}
                    >
                      Size <i className="fas fa-sort"></i>
                    </th>
                    <th 
                      className={sortBy === 'registrationDate' ? `sorted ${sortOrder}` : ''}
                      onClick={() => handleSortChange('registrationDate')}
                    >
                      Registered On <i className="fas fa-sort"></i>
                    </th>
                    <th 
                      className={sortBy === 'paymentStatus' ? `sorted ${sortOrder}` : ''}
                      onClick={() => handleSortChange('paymentStatus')}
                    >
                      Payment <i className="fas fa-sort"></i>
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedRegistrations.map(registration => (
                    <React.Fragment key={registration.id}>
                      <tr>
                        <td>{registration.user.name}</td>
                        <td>{registration.user.email}</td>
                        <td>{registration.teamName}</td>
                        <td>{registration.teamSize}</td>
                        <td>{formatDate(registration.registrationDate)}</td>
                        <td>
                          <span className={`payment-status ${registration.paymentStatus.toLowerCase()}`}>
                            {registration.paymentStatus}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="details-btn"
                            onClick={() => toggleUserDetails(registration.id)}
                          >
                            {expandedUser === registration.id ? 'Hide Details' : 'Show Details'}
                          </button>
                        </td>
                      </tr>
                      {expandedUser === registration.id && (
                        <tr className="details-row">
                          <td colSpan="7">
                            <div className="user-details">
                              <div className="details-section">
                                <h4>Participant Details</h4>
                                <div className="details-grid">
                                  <div className="detail-item">
                                    <span className="detail-label">College:</span>
                                    <span className="detail-value">{registration.user.college}</span>
                                  </div>
                                  <div className="detail-item">
                                    <span className="detail-label">Phone:</span>
                                    <span className="detail-value">{registration.user.phone || 'Not provided'}</span>
                                  </div>
                                  <div className="detail-item skills">
                                    <span className="detail-label">Skills:</span>
                                    <div className="skills-list">
                                      {registration.user.skills?.map((skill, idx) => (
                                        <span key={idx} className="skill-tag">{skill}</span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="details-section">
                                <h4>Organizer Notes</h4>
                                <textarea
                                  value={registration.notes}
                                  onChange={(e) => handleNoteChange(registration.id, e.target.value)}
                                  placeholder="Add notes about this participant..."
                                  className="notes-textarea"
                                ></textarea>
                              </div>
                              <div className="details-section">
                                <h4>Actions</h4>
                                <div className="details-actions">
                                  <button className="send-email-btn">
                                    <i className="fas fa-envelope"></i> Send Email
                                  </button>
                                  <button className="update-payment-btn">
                                    <i className="fas fa-money-bill-wave"></i> Update Payment
                                  </button>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="no-registrations">
            <i className="fas fa-users-slash"></i>
            <h2>No Registrations Yet</h2>
            <p>There are no registrations for this hackathon yet. Check back later or promote your event.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default EventRegistrations;
