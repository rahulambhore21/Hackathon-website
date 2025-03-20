import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import Navbar from '../../components/Navbar/Navbar';
import ChangePasswordModal from '../../components/ChangePasswordModal/ChangePasswordModal';
import { useAuth } from '../../context/AuthContext';
import { useEvents } from '../../context/EventsContext';
import { useNotification } from '../../context/NotificationContext';
import EventCard from '../../ui/eventCard/EventCard';
import axios from 'axios';

// Default profile data outside the component to avoid re-creation on every render
const DEFAULT_PROFILE = {
  name: 'Rahul Sharma',
  email: 'rahul.sharma@example.com',
  phone: '9876543210',
  bio: 'Passionate full-stack developer with 3+ years of experience in React, Node.js, and cloud technologies. Regular hackathon participant and open-source contributor. Currently focused on building innovative solutions for real-world problems. Looking to collaborate on projects related to AI and sustainable technology.',
  location: 'Bangalore, Karnataka, India',
  skills: ['React', 'Node.js', 'JavaScript', 'MongoDB', 'Express', 'UI/UX', 'AWS', 'Docker', 'TypeScript', 'GraphQL'],
  linkedin: 'https://linkedin.com/in/rahulsharma',
  github: 'https://github.com/rahulsharma-dev',
  website: 'https://rahulsharma.dev'
};

const DEFAULT_PROFILE_IMAGE = 'https://randomuser.me/api/portraits/men/32.jpg';

function Profile() {
  const navigate = useNavigate();
  
  // Add error handling for context hooks
  const auth = useAuth() || {};
  const { currentUser, logout, isAuthenticated } = auth;
  
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
  const [userProfile, setUserProfile] = useState(DEFAULT_PROFILE);
  
  // Mock registered events (in a real app, this would come from the backend)
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [loading, setLoading] = useState(false); // Change to false initially
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
        setUserProfile(prev => ({
          ...prev,
          name: currentUser.name || prev.name,
          email: currentUser.email || prev.email,
        }));
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

  const handleSkillsChange = (e) => {
    const skills = e.target.value.split(',').map(skill => skill.trim());
    setUserProfile({
      ...userProfile,
      skills
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

  const handleSaveProfile = () => {
    // Validate form
    if (!userProfile.name.trim() || !userProfile.email.trim()) {
      safeShowError('Name and email are required');
      return;
    }
    
    // In a real app, you would send this data to the backend
    console.log('Saving profile:', userProfile);
    console.log('New profile image:', profileImageFile);
    
    if (typeof showSuccess === 'function') {
      showSuccess('Profile updated successfully!');
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    // Reset form to original data
    if (currentUser) {
      setUserProfile({
        ...DEFAULT_PROFILE,
        name: currentUser.name || DEFAULT_PROFILE.name,
        email: currentUser.email || DEFAULT_PROFILE.email,
      });
      setProfileImage(DEFAULT_PROFILE_IMAGE);
    } else {
      setUserProfile(DEFAULT_PROFILE);
      setProfileImage(DEFAULT_PROFILE_IMAGE);
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
            <p className="profile-location">{userProfile.location}</p>
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
                <h2>About Me</h2>
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
                    <label>Bio</label>
                    <textarea 
                      name="bio" 
                      value={userProfile.bio} 
                      onChange={handleInputChange} 
                      rows="4"
                    ></textarea>
                  </div>

                  <div className="profile-form-group">
                    <label>Skills (comma separated)</label>
                    <input 
                      type="text" 
                      name="skills" 
                      value={userProfile.skills.join(', ')} 
                      onChange={handleSkillsChange} 
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
                    <label>GitHub URL</label>
                    <input 
                      type="url" 
                      name="github" 
                      value={userProfile.github} 
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
                  <div className="profile-bio">
                    <p>{userProfile.bio}</p>
                  </div>
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
                    <div className="profile-info-item">
                      <div className="profile-info-label">
                        <i className="fas fa-map-marker-alt"></i> Location
                      </div>
                      <div className="profile-info-value">{userProfile.location}</div>
                    </div>
                  </div>
                  <div className="profile-skills">
                    <h3>Skills</h3>
                    <div className="profile-skills-list">
                      {userProfile.skills.map((skill, index) => (
                        <span key={index} className="profile-skill-tag">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
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