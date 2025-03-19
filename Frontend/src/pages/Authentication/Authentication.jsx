import React, { useState, useEffect, useRef } from 'react';
import backgroundimg from '../../assets/loginbackground1.jpg';
import './Authentication.css';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';

function Authentication() {
  const { login, register, error, loading } = useAuth();
  const [isSignup, setIsSignup] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    college: '',
    phone: '',
    bio: '',
    location: '',
    skills: '',
    profileImage: '',
    socialLinks: {
      linkedin: '',
      github: '',
      website: ''
    },
    emailNotifications: {
      eventReminders: true,
      announcements: true,
      marketing: false
    }
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    let errors = {};
    let isValid = true;

    if (isSignup && !formData.name.trim()) {
      errors.name = 'Name is required';
      isValid = false;
    }
    if (isSignup && !formData.college.trim()) {
      errors.college = 'College is required';
      isValid = false;
    }
    if (isSignup && !formData.phone.trim()) {
      errors.phone = 'Phone number is required';
      isValid = false;
    }

    if (!formData.email) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
      isValid = false;
    }

    if (!formData.password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    if (isSignup && formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(errors);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle nested objects (socialLinks and emailNotifications)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const success = isSignup
      ? await register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          college: formData.college,
          phone: formData.phone,
          bio: formData.bio || '',
          location: formData.location || '',
          skills: formData.skills ? formData.skills.split(',').map(skill => skill.trim()) : [],
          profileImage: formData.profileImage || '',
          socialLinks: formData.socialLinks,
          emailNotifications: formData.emailNotifications
        })
      : await login(formData.email, formData.password);

    if (success) {
      setMessage(isSignup ? 'Sign up successful!' : 'Login successful!');
      setTimeout(() => navigate('/'), 1500);
    }
  };

  const toggleAuthMode = () => {
    setIsSignup(!isSignup);
    setMessage('');
    setErrors({});
  };

  return (
    <div
      className="min-h-screen w-full flex justify-center items-center py-6 px-4"
      style={{
        backgroundImage: `linear-gradient(rgba(21, 25, 40, 0.9), rgba(92, 225, 230, 0.7)), url(${backgroundimg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        overflowY: 'auto',
      }}
    >
      {/* Add animated background particles for a more interactive feel */}
      <div className="background-animation">
        {Array.from({ length: 15 }).map((_, index) => (
          <div 
            key={index}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 30 + 10}px`,
              height: `${Math.random() * 30 + 10}px`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 5}s`
            }}
          />
        ))}
      </div>
      
      <div className="container max-w-md">
        <div className="form_area bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-xl overflow-y-auto max-h-[85vh]">
          <p className="title text-center text-xl md:text-2xl font-bold mb-2">{isSignup ? 'SIGN UP' : 'LOGIN'}</p>
          {message && <div className="success-message text-green-500 text-center text-sm mb-2">{message}</div>}
          {error && <div className="error-message text-red-500 text-center text-sm mb-2">{error}</div>}
          
          {/* Make progress indicator optional based on screen size */}
          {isSignup && (
            <div className="hidden md:flex justify-center mb-2">
              <div className="w-full max-w-xs bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#6C63FF] to-[#5CE1E6] rounded-full transition-all duration-300"
                  style={{ width: formData.bio ? '75%' : formData.college ? '50%' : '25%' }}
                />
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-2 mt-2 compact-form">
            {/* Conditionally render fields based on signup/login state */}
            {isSignup ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="form_group">
                    <label className="sub_title text-sm" htmlFor="name">Name*</label>
                    <input
                      name="name"
                      placeholder="Enter your full name"
                      className="form_style py-2"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                    />
                    {errors.name && <span className="error-text">{errors.name}</span>}
                  </div>
                  
                  <div className="form_group">
                    <label className="sub_title text-sm" htmlFor="email">Email*</label>
                    <input
                      name="email"
                      placeholder="Enter your email"
                      className="form_style py-2"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                    {errors.email && <span className="error-text">{errors.email}</span>}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="form_group">
                    <label className="sub_title text-sm" htmlFor="college">College*</label>
                    <input
                      name="college"
                      placeholder="Enter your college name"
                      className="form_style py-2"
                      type="text"
                      value={formData.college}
                      onChange={handleChange}
                    />
                    {errors.college && <span className="error-text">{errors.college}</span>}
                  </div>
                  
                  <div className="form_group">
                    <label className="sub_title text-sm" htmlFor="phone">Phone*</label>
                    <input
                      name="phone"
                      placeholder="Enter your phone number"
                      className="form_style py-2"
                      type="text"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                    {errors.phone && <span className="error-text">{errors.phone}</span>}
                  </div>
                </div>
                
                {/* Optional fields in collapsible section */}
                <div className="form_group">
                  <details className="w-full">
                    <summary className="sub_title text-sm cursor-pointer mb-1">Additional Info (Optional)</summary>
                    <div className="space-y-2 pt-1">
                      <div className="form_group">
                        <label className="sub_title text-sm" htmlFor="bio">Bio</label>
                        <textarea
                          name="bio"
                          placeholder="Tell us about yourself"
                          className="form_style resize-none h-16"
                          value={formData.bio}
                          onChange={handleChange}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div className="form_group">
                          <label className="sub_title text-sm" htmlFor="location">Location</label>
                          <input
                            name="location"
                            placeholder="Enter your location"
                            className="form_style py-2"
                            type="text"
                            value={formData.location}
                            onChange={handleChange}
                          />
                        </div>
                        
                        <div className="form_group">
                          <label className="sub_title text-sm" htmlFor="skills">Skills</label>
                          <input
                            name="skills"
                            placeholder="Enter skills (comma separated)"
                            className="form_style py-2"
                            type="text"
                            value={formData.skills}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      
                      <div className="form_group">
                        <label className="sub_title text-sm" htmlFor="profileImage">Profile Image URL</label>
                        <input
                          name="profileImage"
                          placeholder="Enter profile image URL"
                          className="form_style py-2"
                          type="text"
                          value={formData.profileImage}
                          onChange={handleChange}
                        />
                      </div>
                      
                      {/* Social Links Section */}
                      <div className="form_group">
                        <label className="sub_title text-sm">Social Links</label>
                        <div className="space-y-2">
                          <div className="form_group">
                            <input
                              name="socialLinks.linkedin"
                              placeholder="LinkedIn URL"
                              className="form_style py-2"
                              type="text"
                              value={formData.socialLinks.linkedin}
                              onChange={handleChange}
                            />
                          </div>
                          <div className="form_group">
                            <input
                              name="socialLinks.github"
                              placeholder="GitHub URL"
                              className="form_style py-2"
                              type="text"
                              value={formData.socialLinks.github}
                              onChange={handleChange}
                            />
                          </div>
                          <div className="form_group">
                            <input
                              name="socialLinks.website"
                              placeholder="Personal Website URL"
                              className="form_style py-2"
                              type="text"
                              value={formData.socialLinks.website}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Email Notifications Section */}
                      <div className="form_group">
                        <label className="sub_title text-sm">Email Notifications</label>
                        <div className="space-y-2 mt-2">
                          <div className="checkbox-container">
                            <label>
                              <input
                                name="emailNotifications.eventReminders"
                                type="checkbox"
                                checked={formData.emailNotifications.eventReminders}
                                onChange={handleChange}
                              />
                              <span className="checkmark"></span>
                              Event Reminders
                            </label>
                          </div>
                          <div className="checkbox-container">
                            <label>
                              <input
                                name="emailNotifications.announcements"
                                type="checkbox"
                                checked={formData.emailNotifications.announcements}
                                onChange={handleChange}
                              />
                              <span className="checkmark"></span>
                              Announcements
                            </label>
                          </div>
                          <div className="checkbox-container">
                            <label>
                              <input
                                name="emailNotifications.marketing"
                                type="checkbox"
                                checked={formData.emailNotifications.marketing}
                                onChange={handleChange}
                              />
                              <span className="checkmark"></span>
                              Marketing
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </details>
                </div>
              </>
            ) : (
              <div className="form_group">
                <label className="sub_title" htmlFor="email">Email</label>
                <input
                  name="email"
                  placeholder="Enter your email"
                  className="form_style"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>
            )}
            
            {/* Password fields */}
            <div className="form_group">
              <label className="sub_title text-sm" htmlFor="password">Password*</label>
              <div className="password-field-container">
                <input
                  name="password"
                  placeholder="Enter your password"
                  className="form_style py-2"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                />
                <button 
                  type="button"
                  className="password-toggle" 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>
            
            {isSignup && (
              <div className="form_group">
                <label className="sub_title text-sm" htmlFor="confirmPassword">Confirm Password*</label>
                <input
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  className="form_style py-2"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
              </div>
            )}
            
            {/* Submit button */}
            <button 
              className="btn py-2 mt-3" 
              type="submit" 
              disabled={loading}
            >
              {loading ? (
                <>
                  {isSignup ? 'Signing Up' : 'Logging In'}
                  <span className="loading-spinner ml-2"></span>
                </>
              ) : (
                isSignup ? 'Sign Up' : 'Login'
              )}
            </button>
            
            {/* Social login buttons - only for login */}
            {!isSignup && (
              <div className="mt-3">
                <p className="text-center text-white/70 text-xs mb-2">Or continue with</p>
                <div className="flex justify-center space-x-4">
                  <button type="button" className="social-btn" aria-label="Login with Google">
                    <span className="social-icon">G</span>
                  </button>
                  <button type="button" className="social-btn" aria-label="Login with GitHub">
                    <span className="social-icon">GH</span>
                  </button>
                </div>
              </div>
            )}
            
            {/* Toggle between signup and login */}
            <p className="text-center mt-3 text-sm">
              {isSignup ? 'Have an Account?' : "Don't have an Account?"}{' '}
              <span className="link" onClick={toggleAuthMode}>
                {isSignup ? 'Login!' : 'Sign Up!'}
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Authentication;