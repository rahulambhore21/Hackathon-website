import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import Navbar from '../../components/Navbar/Navbar';
import ChangePasswordModal from '../../components/ChangePasswordModal/ChangePasswordModal';
import { useAuth } from '../../context/AuthContext';
import { useEvents } from '../../context/EventsContext';
import { useNotification } from '../../context/NotificationContext';
import EventCard from '../../ui/eventCard/EventCard';
import PreferencesForm from '../../components/PreferencesForm/PreferencesForm';
import axios from 'axios';

// Default profile image as fallback
const DEFAULT_PROFILE_IMAGE = 'https://via.placeholder.com/150';

function Profile() {
  const navigate = useNavigate();
  
  // Add error handling for context hooks
  const auth = useAuth() || {};
  const { currentUser, logout, isAuthenticated, showPreferences } = auth;
  
  // Similar approach for other contexts
  const eventsContext = useEvents() || {};
  const { events = [] } = eventsContext;
  
  const notificationContext = useNotification() || {};
  const { showSuccess, showError } = notificationContext;
  
  // States for profile management
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(DEFAULT_PROFILE_IMAGE);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    phone: '',
    github: '',
    linkedin: '',
    website: '',
    location: '',
    specialty: '',
    skills: '',
    interests: [],
    timezone: '',
    education: {},
    birthMonth: '',
    birthYear: ''
  });
  
  // Mock registered events (in a real app, this would come from the backend)
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  // Add a flag to track if user data was loaded to prevent unnecessary updates
  const [userDataLoaded, setUserDataLoaded] = useState(false);

  // State for change password modal
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);

  // Safe check for authenticated - simplified to reduce potential issues
  const checkAuthentication = () => !!currentUser;

  // Redirect if not logged in
  useEffect(() => {
    // Check if we're still loading auth state
    const token = localStorage.getItem('token');
    
    // Only redirect if we're sure there's no token AND no current user
    if (!token && !currentUser && !window.location.pathname.includes('authentication')) {
      navigate('/authentication');
    }
  }, [currentUser, navigate]);

  // Load user data - Fixed to prevent infinite updates
  useEffect(() => {
    // Get token from localStorage to verify authentication
    const token = localStorage.getItem('token');
    
    // Only run once when component mounts and when currentUser changes
    // Also check if token exists as a fallback
    if ((!userDataLoaded && currentUser) || (!userDataLoaded && token)) {
      // If we have a currentUser, use that data
      if (currentUser) {
        setUserProfile({
          name: currentUser.name || '',
          email: currentUser.email || '',
          phone: currentUser.phone || '',
          // Set social links if available in the user profile
          github: currentUser.socialLinks?.github || '',
          linkedin: currentUser.socialLinks?.linkedin || '',
          website: currentUser.socialLinks?.website || '',
          // Add profile data
          specialty: currentUser.preferences?.specialty || '',
          location: currentUser.location || '',
          skills: Array.isArray(currentUser.skills) ? currentUser.skills.join(', ') : '',
          interests: currentUser.preferences?.interests || [],
          timezone: currentUser.preferences?.timezone || '',
          // Education information
          education: currentUser.education || {},
          birthMonth: currentUser.birthMonth || '',
          birthYear: currentUser.birthYear || '',
          college: currentUser.college || '',
          bio: currentUser.bio || ''
        });
        
        // Set profile image if available
        if (currentUser.profileImage) {
          const imageUrl = currentUser.profileImage.startsWith('http') 
            ? currentUser.profileImage 
            : `http://localhost:5000${currentUser.profileImage}`;
          setProfileImage(imageUrl);
        }
      }
      setUserDataLoaded(true);
    }
  }, [currentUser, userDataLoaded]);

  // Fetch registered events from backend - simplified for reliability
  useEffect(() => {
    const fetchRegisteredEvents = async () => {
      // Only attempt to fetch if we have a valid user ID and we're on the events tab
      if (!currentUser || !currentUser.id || activeTab !== 'events') {
        console.log("Skipping event fetch - no user ID or not on events tab");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        console.log("Fetching events for user:", currentUser.id);
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.log("No auth token found, skipping event fetch");
          setLoading(false);
          return;
        }
        
        // Fetch events that the user has registered for
        const response = await axios.get(
          `http://localhost:5000/api/events/user/${currentUser.id}`,
          { 
            headers: { Authorization: `Bearer ${token}` },
            // Add timestamp to prevent caching
            params: { _t: new Date().getTime() }
          }
        );
        
        console.log("API Response:", response.data);
        
        if (response.data && Array.isArray(response.data)) {
          setRegisteredEvents(response.data);
          console.log("Set registered events:", response.data);
        } else {
          console.error("Invalid response format:", response.data);
          setRegisteredEvents([]);
        }
      } catch (err) {
        console.error("Error fetching registered events:", err.response || err);
        setRegisteredEvents([]); // Set empty array on error
        if (typeof showError === 'function') {
          showError('Failed to load your registered events');
        }
      } finally {
        setLoading(false);
      }
    };

    // Call the fetch function when the tab changes to 'events'
    if (activeTab === 'events') {
      fetchRegisteredEvents();
    }
    
  }, [currentUser, activeTab, showError]);

  // Safe notification function to prevent errors if showError is undefined
  const safeShowError = (message) => {
    if (typeof showError === 'function') {
      showError(message);
    } else {
      console.error(message);
    }
  };

  // Handle user logout
  const handleLogout = () => {
    if (typeof logout === 'function') {
      logout();
      navigate('/');
      if (typeof showSuccess === 'function') {
        showSuccess('Logged out successfully');
      }
    } else {
      console.error('Logout function not available');
      navigate('/');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserProfile({
      ...userProfile,
      [name]: value
    });
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    // Validate form
    if (!userProfile.name.trim() || !userProfile.email.trim()) {
      safeShowError('Name and email are required');
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token || !currentUser || !currentUser.id) {
        safeShowError('Authentication required');
        setLoading(false);
        return;
      }
      
      // Prepare profile data
      const profileData = {
        name: userProfile.name,
        email: userProfile.email,
        phone: userProfile.phone,
        location: userProfile.location,
        skills: userProfile.skills.split(',').map(skill => skill.trim()).filter(Boolean),
        socialLinks: {
          github: userProfile.github,
          linkedin: userProfile.linkedin,
          website: userProfile.website
        },
        bio: userProfile.bio,
        college: userProfile.college
      };
      
      // Handle profile image upload if changed
      if (profileImageFile) {
        const formData = new FormData();
        formData.append('profileImage', profileImageFile);
        
        // First upload the image
        await axios.post(
          `http://localhost:5000/api/users/${currentUser.id}/profile-image`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      
      // Then update the profile data
      await axios.put(
        `http://localhost:5000/api/users/${currentUser.id}`,
        profileData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (typeof showSuccess === 'function') {
        showSuccess('Profile updated successfully!');
      }
      
      // Refresh user data in auth context if available
      if (typeof auth.refreshUserData === 'function') {
        auth.refreshUserData();
      }
      
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      safeShowError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset form to original data
    if (currentUser) {
      setUserProfile({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        github: currentUser.socialLinks?.github || '',
        linkedin: currentUser.socialLinks?.linkedin || '',
        website: currentUser.socialLinks?.website || '',
        location: currentUser.location || '',
        specialty: currentUser.preferences?.specialty || '',
        skills: Array.isArray(currentUser.skills) ? currentUser.skills.join(', ') : '',
        interests: currentUser.preferences?.interests || [],
        timezone: currentUser.preferences?.timezone || '',
        education: currentUser.education || {},
        birthMonth: currentUser.birthMonth || '',
        birthYear: currentUser.birthYear || '',
        college: currentUser.college || '',
        bio: currentUser.bio || ''
      });
      
      // Reset profile image
      if (currentUser.profileImage) {
        const imageUrl = currentUser.profileImage.startsWith('http') 
          ? currentUser.profileImage 
          : `http://localhost:5000${currentUser.profileImage}`;
        setProfileImage(imageUrl);
      } else {
        setProfileImage(DEFAULT_PROFILE_IMAGE);
      }
      
      setProfileImageFile(null);
    }
    setIsEditing(false);
  };

  // Handle opening change password modal
  const handleOpenChangePasswordModal = () => {
    setChangePasswordModalOpen(true);
  };

  // Handle closing change password modal
  const handleCloseChangePasswordModal = () => {
    setChangePasswordModalOpen(false);
  };

  // If user needs to complete preferences first, show the preferences form
  if (showPreferences) {
    return <PreferencesForm />;
  }

  // Render loading state - ensure it correctly shows when loading
  if (activeTab === 'events' && loading) {
    return (
      <>
        <Navbar />
        <div className="profile-loading">
          <div className="profile-loading-spinner"></div>
          <p>Loading your events...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-header-overlay"></div>
          <div className="profile-user-info">
            <div className="profile-avatar-container">
              {isEditing ? (
                <div className="profile-avatar-edit">
                  <img 
                    src={profileImage} 
                    alt={userProfile.name} 
                    className="profile-avatar" 
                  />
                  <label htmlFor="profile-image-upload" className="profile-avatar-edit-icon">
                    <i className="fas fa-camera"></i>
                    <span>Change</span>
                  </label>
                  <input 
                    type="file" 
                    id="profile-image-upload" 
                    accept="image/*" 
                    onChange={handleProfileImageChange} 
                    style={{ display: 'none' }}
                  />
                </div>
              ) : (
                <img 
                  src={profileImage} 
                  alt={userProfile.name} 
                  className="profile-avatar"
                />
              )}
            </div>
            <h1 className="profile-name">{userProfile.name}</h1>
            {userProfile.specialty && (
              <p className="profile-specialty">{userProfile.specialty}</p>
            )}
            <div className="profile-social-links">
              {userProfile.github && (
                <a href={userProfile.github} target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-github"></i>
                </a>
              )}
              {userProfile.linkedin && (
                <a href={userProfile.linkedin} target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-linkedin"></i>
                </a>
              )}
              {userProfile.website && (
                <a href={userProfile.website} target="_blank" rel="noopener noreferrer">
                  <i className="fas fa-globe"></i>
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="profile-tabs">
          <button 
            className={`profile-tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <i className="fas fa-user"></i> Profile
          </button>
          <button 
            className={`profile-tab ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => setActiveTab('events')}
          >
            <i className="fas fa-calendar-alt"></i> My Events
          </button>
          <button 
            className={`profile-tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <i className="fas fa-cog"></i> Settings
          </button>
        </div>

        <div className="profile-content">
          {activeTab === 'profile' && (
            <div className="profile-section">
              <div className="profile-section-header">
                <h2>Personal Information</h2>
                {!isEditing && (
                  <button 
                    className="profile-edit-button"
                    onClick={() => setIsEditing(true)}
                  >
                    <i className="fas fa-edit"></i> Edit Profile
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="profile-edit-form">
                  <div className="profile-form-group">
                    <label>Full Name</label>
                    <input 
                      type="text" 
                      name="name" 
                      value={userProfile.name} 
                      onChange={handleInputChange} 
                    />
                  </div>

                  <div className="profile-form-group">
                    <label>Email</label>
                    <input 
                      type="email" 
                      name="email" 
                      value={userProfile.email} 
                      onChange={handleInputChange} 
                    />
                  </div>

                  <div className="profile-form-group">
                    <label>Phone</label>
                    <input 
                      type="tel" 
                      name="phone" 
                      value={userProfile.phone} 
                      onChange={handleInputChange} 
                    />
                  </div>

                  <div className="profile-form-group">
                    <label>Location</label>
                    <input 
                      type="text" 
                      name="location" 
                      value={userProfile.location} 
                      onChange={handleInputChange} 
                    />
                  </div>

                  <div className="profile-form-group">
                    <label>GitHub URL</label>
                    <input 
                      type="url" 
                      name="github" 
                      value={userProfile.github} 
                      onChange={handleInputChange} 
                    />
                  </div>

                  <div className="profile-form-group">
                    <label>LinkedIn URL</label>
                    <input 
                      type="url" 
                      name="linkedin" 
                      value={userProfile.linkedin} 
                      onChange={handleInputChange} 
                    />
                  </div>

                  <div className="profile-form-group">
                    <label>Website URL</label>
                    <input 
                      type="url" 
                      name="website" 
                      value={userProfile.website} 
                      onChange={handleInputChange} 
                    />
                  </div>

                  <div className="profile-form-group">
                    <label>Skills (comma separated)</label>
                    <input 
                      type="text" 
                      name="skills" 
                      value={userProfile.skills} 
                      onChange={handleInputChange} 
                      placeholder="React, Node.js, MongoDB, etc."
                    />
                  </div>

                  <div className="profile-form-actions">
                    <button 
                      className="profile-save-button"
                      onClick={handleSaveProfile}
                    >
                      Save Changes
                    </button>
                    <button 
                      className="profile-cancel-button"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="profile-details">
                  <div className="profile-info-grid">
                    <div className="profile-info-item">
                      <div className="profile-info-label">
                        <i className="fas fa-envelope"></i> Email
                      </div>
                      <div className="profile-info-value">{userProfile.email}</div>
                    </div>
                    <div className="profile-info-item">
                      <div className="profile-info-label">
                        <i className="fas fa-phone"></i> Phone
                      </div>
                      <div className="profile-info-value">{userProfile.phone}</div>
                    </div>
                    {userProfile.location && (
                      <div className="profile-info-item">
                        <div className="profile-info-label">
                          <i className="fas fa-map-marker-alt"></i> Location
                        </div>
                        <div className="profile-info-value">{userProfile.location}</div>
                      </div>
                    )}
                    {userProfile.timezone && (
                      <div className="profile-info-item">
                        <div className="profile-info-label">
                          <i className="fas fa-globe"></i> Timezone
                        </div>
                        <div className="profile-info-value">{userProfile.timezone.replace(/_/g, ' ')}</div>
                      </div>
                    )}
                  </div>

                  {/* Display preferences information */}
                  {userProfile.specialty && (
                    <div className="profile-preferences-section">
                      <h3>Developer Profile</h3>
                      <div className="profile-info-item">
                        <div className="profile-info-label">
                          <i className="fas fa-laptop-code"></i> Specialty
                        </div>
                        <div className="profile-info-value">{userProfile.specialty}</div>
                      </div>
                    </div>
                  )}

                  {userProfile.skills && (
                    <div className="profile-skills-section">
                      <h3>Skills</h3>
                      <div className="profile-skills">
                        {typeof userProfile.skills === 'string' 
                          ? userProfile.skills.split(',').map(skill => skill.trim()).filter(Boolean).map((skill, index) => (
                              <span key={index} className="profile-skill-tag">{skill}</span>
                            ))
                          : Array.isArray(userProfile.skills) 
                            ? userProfile.skills.map((skill, index) => (
                                <span key={index} className="profile-skill-tag">{skill}</span>
                              ))
                            : null
                        }
                      </div>
                    </div>
                  )}

                  {userProfile.interests && userProfile.interests.length > 0 && (
                    <div className="profile-interests-section">
                      <h3>Hackathon Interests</h3>
                      <div className="profile-interests">
                        {userProfile.interests.map((interest, index) => (
                          <span key={index} className="profile-interest-tag">{interest}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Display education information */}
                  {userProfile.education && (
                    <div className="profile-education-section">
                      <h3>Education</h3>
                      {userProfile.education.occupation && (
                        <div className="profile-info-item">
                          <div className="profile-info-label">
                            <i className="fas fa-briefcase"></i> Occupation
                          </div>
                          <div className="profile-info-value">{userProfile.education.occupation}</div>
                        </div>
                      )}
                      
                      {userProfile.education.occupation === 'Student' && (
                        <>
                          {userProfile.education.studentLevel && (
                            <div className="profile-info-item">
                              <div className="profile-info-label">
                                <i className="fas fa-graduation-cap"></i> Education Level
                              </div>
                              <div className="profile-info-value">{userProfile.education.studentLevel}</div>
                            </div>
                          )}
                          
                          {userProfile.education.school && (
                            <div className="profile-info-item">
                              <div className="profile-info-label">
                                <i className="fas fa-school"></i> School
                              </div>
                              <div className="profile-info-value">{userProfile.education.school}</div>
                            </div>
                          )}
                          
                          {(userProfile.education.graduationMonth || userProfile.education.graduationYear) && (
                            <div className="profile-info-item">
                              <div className="profile-info-label">
                                <i className="fas fa-calendar-alt"></i> Expected Graduation
                              </div>
                              <div className="profile-info-value">
                                {userProfile.education.graduationMonth} {userProfile.education.graduationYear}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                  
                  {/* Display birth information */}
                  {(userProfile.birthMonth || userProfile.birthYear) && (
                    <div className="profile-birth-section">
                      <h3>Personal</h3>
                      <div className="profile-info-item">
                        <div className="profile-info-label">
                          <i className="fas fa-birthday-cake"></i> Birth Date
                        </div>
                        <div className="profile-info-value">
                          {userProfile.birthMonth} {userProfile.birthYear}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Social links section */}
                  <div className="profile-social-section">
                    <h3>Social Links</h3>
                    <div className="profile-social-grid">
                      {userProfile.github && (
                        <div className="profile-info-item">
                          <div className="profile-info-label">
                            <i className="fab fa-github"></i> GitHub
                          </div>
                          <div className="profile-info-value">
                            <a href={userProfile.github} target="_blank" rel="noopener noreferrer">
                              {userProfile.github.replace(/(https?:\/\/)?(www\.)?github\.com\//, '')}
                            </a>
                          </div>
                        </div>
                      )}
                      {userProfile.linkedin && (
                        <div className="profile-info-item">
                          <div className="profile-info-label">
                            <i className="fab fa-linkedin"></i> LinkedIn
                          </div>
                          <div className="profile-info-value">
                            <a href={userProfile.linkedin} target="_blank" rel="noopener noreferrer">
                              {userProfile.linkedin.replace(/(https?:\/\/)?(www\.)?linkedin\.com\/in\//, '')}
                            </a>
                          </div>
                        </div>
                      )}
                      {userProfile.website && (
                        <div className="profile-info-item">
                          <div className="profile-info-label">
                            <i className="fas fa-globe"></i> Website
                          </div>
                          <div className="profile-info-value">
                            <a href={userProfile.website} target="_blank" rel="noopener noreferrer">
                              {userProfile.website.replace(/(https?:\/\/)?(www\.)?/, '')}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'events' && (
            <div className="profile-section">
              <div className="profile-section-header">
                <h2>My Registered Events</h2>
              </div>
              
              {registeredEvents.length > 0 ? (
                <div className="registered-events-grid">
                  {registeredEvents.map(event => {
                    const imgUrl = event.img && typeof event.img === 'string' 
                      ? (event.img.startsWith('http') ? event.img : `http://localhost:5000${event.img}`)
                      : null;
                      
                    const eventDate = event.date 
                      ? new Date(event.date).toLocaleDateString('en-US', {
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric'
                        })
                      : "Upcoming";
                      
                    return (
                      <EventCard
                        key={event._id}
                        id={event._id}
                        title={event.title}
                        description={event.description}
                        img={imgUrl}
                        date={eventDate}
                        location={event.location || "Virtual"}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="no-events-message">
                  <i className="fas fa-calendar-times"></i>
                  <h3>No registered events</h3>
                  <p>You haven't registered for any hackathons yet.</p>
                  <button 
                    className="browse-events-button"
                    onClick={() => navigate('/events')}
                  >
                    Browse Events
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="profile-section">
              <div className="profile-section-header">
                <h2>Account Settings</h2>
              </div>
              <div className="profile-settings-options">
                <div className="profile-settings-group">
                  <h3>Password</h3>
                  <button 
                    className="profile-settings-button"
                    onClick={handleOpenChangePasswordModal}
                  >
                    Change Password
                  </button>
                </div>
                <div className="profile-settings-group">
                  <h3>Email Notifications</h3>
                  <div className="profile-settings-toggle">
                    <label className="profile-toggle">
                      <input type="checkbox" defaultChecked />
                      <span className="profile-toggle-slider"></span>
                    </label>
                    <span>Event reminders</span>
                  </div>
                  <div className="profile-settings-toggle">
                    <label className="profile-toggle">
                      <input type="checkbox" defaultChecked />
                      <span className="profile-toggle-slider"></span>
                    </label>
                    <span>New hackathon announcements</span>
                  </div>
                  <div className="profile-settings-toggle">
                    <label className="profile-toggle">
                      <input type="checkbox" />
                      <span className="profile-toggle-slider"></span>
                    </label>
                    <span>Marketing emails</span>
                  </div>
                </div>
                <div className="profile-settings-group profile-danger-zone">
                  <h3>Danger Zone</h3>
                  <button 
                    className="profile-logout-button"
                    onClick={handleLogout}
                  >
                    <i className="fas fa-sign-out-alt"></i> Logout
                  </button>
                  <button className="profile-delete-button">
                    <i className="fas fa-trash-alt"></i> Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal 
        isOpen={changePasswordModalOpen} 
        onClose={handleCloseChangePasswordModal} 
      />
    </>
  );
}

export default Profile;