import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import './PreferencesForm.css';

const specialties = [
  'Full-stack developer',
  'Front-end developer',
  'Back-end developer',
  'Mobile developer',
  'Data scientist',
  'Designer',
  'Product manager',
  'Business',
  'Other'
];

const hackathonInterests = [
  'AR/VR',
  'Beginner Friendly',
  'Blockchain',
  'Communication',
  'Cybersecurity',
  'Databases',
  'Design',
  'DevOps',
  'E-commerce/Retail',
  'Education',
  'Enterprise',
  'Fintech',
  'Gaming',
  'Health',
  'IoT',
  'Lifehacks',
  'Low/No Code',
  'Machine Learning/AI',
  'Mobile',
  'Music/Art',
  'Open Ended',
  'Productivity',
  'Quantum',
  'Robotic Process Automation',
  'Social Good',
  'Voice skills',
  'Web'
];

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const PreferencesForm = ({ onComplete }) => {
  const { currentUser, updateUserProfile } = useAuth();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    specialty: '',
    skills: '',
    interests: [],
    location: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    occupation: 'Student',
    studentLevel: 'College',
    school: '',
    graduationMonth: '',
    graduationYear: new Date().getFullYear() + 4,
    birthMonth: '',
    birthYear: new Date().getFullYear() - 20
  });
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Redirect if no user is logged in
    if (!currentUser) {
      navigate('/authentication');
    }
  }, [currentUser, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInterestToggle = (interest) => {
    setFormData(prev => {
      const interests = [...prev.interests];
      
      if (interests.includes(interest)) {
        // Remove interest if already selected
        return {
          ...prev,
          interests: interests.filter(i => i !== interest)
        };
      } else {
        // Add interest if not already selected
        return {
          ...prev,
          interests: [...interests, interest]
        };
      }
    });
  };

  const handleNext = () => {
    // Validate current step
    if (step === 1 && !formData.specialty) {
      showError('Please select your specialty');
      return;
    }
    
    if (step === 2 && formData.interests.length === 0) {
      showError('Please select at least one interest');
      return;
    }
    
    if (step === 3 && !formData.location) {
      showError('Please enter your location');
      return;
    }

    setStep(prev => prev + 1);
  };

  const handlePrevious = () => {
    setStep(prev => prev - 1);
  };

  // Handle form submit to prevent default action when Enter is pressed
  const handleFormKeyDown = (e) => {
    // If Enter key is pressed and it's not in a textarea or submit button
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && 
        !e.target.classList.contains('btn-primary')) {
      e.preventDefault();
      
      // If on the last step, submit the form
      if (step === 4) {
        handleSubmit(e);
      } else {
        // Otherwise, go to next step
        handleNext();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showError('Authentication error. Please login again.');
        navigate('/authentication');
        return;
      }
      
      // Format the data for the API
      const profileData = {
        specialty: formData.specialty,
        skills: formData.skills.split(',').map(skill => skill.trim()),
        interests: formData.interests,
        location: formData.location,
        timezone: formData.timezone,
        education: {
          occupation: formData.occupation,
          studentLevel: formData.occupation === 'Student' ? formData.studentLevel : null,
          school: formData.school,
          graduationMonth: formData.graduationMonth,
          graduationYear: formData.graduationYear
        },
        birthMonth: formData.birthMonth,
        birthYear: formData.birthYear
      };
      
      // Update user profile in backend
      const response = await axios.put(
        'http://localhost:5000/api/profiles',
        profileData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update user context if provided by the context
      if (typeof updateUserProfile === 'function') {
        updateUserProfile(response.data);
      }
      
      showSuccess('Preferences saved successfully!');
      
      // Call the onComplete prop if provided
      if (typeof onComplete === 'function') {
        onComplete();
      }
      
      // Navigate to profile page
      navigate('/profile');
      
    } catch (err) {
      console.error('Error saving preferences:', err);
      showError('Failed to save preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepOne = () => (
    <div className="preferences-step">
      <h2>Tell us about yourself</h2>
      <div className="form-group">
        <label>What's your specialty?</label>
        <div className="specialty-options">
          {specialties.map(specialty => (
            <div 
              key={specialty}
              className={`specialty-option ${formData.specialty === specialty ? 'selected' : ''}`}
              onClick={() => setFormData(prev => ({ ...prev, specialty }))}
            >
              {specialty}
            </div>
          ))}
        </div>
      </div>
      
      <div className="form-group">
        <label>What are your skills?</label>
        <p className="form-hint">Comma separated list of skills (e.g. React, Node.js, MongoDB)</p>
        <input 
          type="text" 
          name="skills" 
          value={formData.skills} 
          onChange={handleInputChange}
          placeholder="website, nodejs, react, express, mongodb"
        />
      </div>
    </div>
  );

  const renderStepTwo = () => (
    <div className="preferences-step">
      <h2>Hackathon Preferences</h2>
      <div className="form-group">
        <label>What types of hackathons are you interested in?</label>
        <p className="form-hint">Select all that apply</p>
        <div className="interests-grid">
          {hackathonInterests.map(interest => (
            <div 
              key={interest}
              className={`interest-tag ${formData.interests.includes(interest) ? 'selected' : ''}`}
              onClick={() => handleInterestToggle(interest)}
            >
              {interest}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStepThree = () => (
    <div className="preferences-step">
      <h2>Location & Timezone</h2>
      <div className="form-group">
        <label>Location</label>
        <input 
          type="text" 
          name="location" 
          value={formData.location} 
          onChange={handleInputChange}
          placeholder="City, State, Country"
        />
      </div>
      
      <div className="form-group">
        <label>Timezone</label>
        <select 
          name="timezone" 
          value={formData.timezone} 
          onChange={handleInputChange}
        >
          {Intl.supportedValuesOf('timeZone').map(zone => (
            <option key={zone} value={zone}>
              {zone.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderStepFour = () => (
    <div className="preferences-step">
      <h2>Education & Background</h2>
      <div className="form-group">
        <label>Occupation</label>
        <div className="radio-options">
          <label className="radio-option">
            <input 
              type="radio" 
              name="occupation" 
              value="Student" 
              checked={formData.occupation === 'Student'} 
              onChange={handleInputChange} 
            />
            <span>Student</span>
          </label>
          <label className="radio-option">
            <input 
              type="radio" 
              name="occupation" 
              value="Professional / Post Grad" 
              checked={formData.occupation === 'Professional / Post Grad'} 
              onChange={handleInputChange} 
            />
            <span>Professional / Post Grad</span>
          </label>
        </div>
      </div>
      
      {formData.occupation === 'Student' && (
        <>
          <div className="form-group">
            <label>Current student level</label>
            <div className="radio-options">
              <label className="radio-option">
                <input 
                  type="radio" 
                  name="studentLevel" 
                  value="College" 
                  checked={formData.studentLevel === 'College'} 
                  onChange={handleInputChange} 
                />
                <span>College</span>
              </label>
              <label className="radio-option">
                <input 
                  type="radio" 
                  name="studentLevel" 
                  value="High School" 
                  checked={formData.studentLevel === 'High School'} 
                  onChange={handleInputChange} 
                />
                <span>High School</span>
              </label>
              <label className="radio-option">
                <input 
                  type="radio" 
                  name="studentLevel" 
                  value="Middle School" 
                  checked={formData.studentLevel === 'Middle School'} 
                  onChange={handleInputChange} 
                />
                <span>Middle School</span>
              </label>
            </div>
          </div>
          
          <div className="form-group">
            <label>School name</label>
            <input 
              type="text" 
              name="school" 
              value={formData.school} 
              onChange={handleInputChange}
              placeholder="Enter your school name"
            />
          </div>
          
          <div className="form-group">
            <label>Graduation month & year</label>
            <div className="date-inputs">
              <select 
                name="graduationMonth" 
                value={formData.graduationMonth} 
                onChange={handleInputChange}
              >
                <option value="">Select Month</option>
                {months.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
              
              <select 
                name="graduationYear" 
                value={formData.graduationYear} 
                onChange={handleInputChange}
              >
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </>
      )}
      
      <div className="form-group">
        <label>Birth month & year</label>
        <p className="form-hint">Most hackathons have age requirements</p>
        <div className="date-inputs">
          <select 
            name="birthMonth" 
            value={formData.birthMonth} 
            onChange={handleInputChange}
          >
            <option value="">Select Month</option>
            {months.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
          
          <select 
            name="birthYear" 
            value={formData.birthYear} 
            onChange={handleInputChange}
          >
            {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - 10 - i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <div className="preferences-container">
      <div className="preferences-card">
        <div className="preferences-progress">
          {[1, 2, 3, 4].map(stepNumber => (
            <div 
              key={stepNumber}
              className={`progress-step ${step >= stepNumber ? 'active' : ''}`}
              onClick={() => step > stepNumber && setStep(stepNumber)}
            >
              {stepNumber}
            </div>
          ))}
        </div>
        
        <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown}>
          {step === 1 && renderStepOne()}
          {step === 2 && renderStepTwo()}
          {step === 3 && renderStepThree()}
          {step === 4 && renderStepFour()}
          
          <div className="form-actions">
            {step > 1 && (
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={handlePrevious}
                disabled={loading}
              >
                Previous
              </button>
            )}
            
            {step < 4 ? (
              <button 
                type="button" 
                className="btn-primary" 
                onClick={handleNext}
              >
                Next
              </button>
            ) : (
              <button 
                type="submit" 
                className="btn-primary" 
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Complete Setup'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default PreferencesForm;
