import React, { useState, useEffect, useRef } from 'react';
import backgroundimg from '../../assets/loginbackground1.jpg'
import axios from 'axios';
import './Authentication.css';
import { useNavigate } from 'react-router';

function Authentication() {
  const [isSignup, setIsSignup] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const particlesContainerRef = useRef(null);
  const navigate = useNavigate();

  // Create particle effect
  useEffect(() => {
    const createParticles = () => {
      if (!particlesContainerRef.current) return;
      
      const container = particlesContainerRef.current;
      container.innerHTML = '';
      
      const numberOfParticles = 20;
      
      for (let i = 0; i < numberOfParticles; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        // Random position
        const posX = Math.random() * container.offsetWidth;
        const posY = Math.random() * container.offsetHeight;
        
        // Random size
        const size = Math.random() * 15 + 5;
        
        // Random animation duration
        const duration = Math.random() * 8 + 4;
        const delay = Math.random() * 5;
        
        // Apply styles
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${posX}px`;
        particle.style.bottom = `${posY}px`;
        particle.style.animationDuration = `${duration}s`;
        particle.style.animationDelay = `${delay}s`;
        
        container.appendChild(particle);
      }
    };

    createParticles();
    
    window.addEventListener('resize', createParticles);
    
    const interval = setInterval(createParticles, 10000);
    
    return () => {
      window.removeEventListener('resize', createParticles);
      clearInterval(interval);
    };
  }, []);

  const validateForm = () => {
    let errors = {};
    let isValid = true;

    if (isSignup && !formData.name.trim()) {
      errors.name = "Name is required";
      isValid = false;
    }

    if (!formData.email) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
      isValid = false;
    }

    if (!formData.password) {
      errors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    setErrors(errors);
    return isValid;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: null
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    const url = isSignup ? 'http://localhost:5000/user/signup' : 'http://localhost:5000/user/login';
    setIsLoading(true);
    setMessage('');
    
    try {
      const response = await axios.post(url, formData);
      setMessageType('success');
      setMessage(response.data.message || (isSignup ? 'Sign up successful!' : 'Login successful!'));
      
      if (rememberMe && !isSignup) {
        localStorage.setItem('userEmail', formData.email);
      }
      
      if (!isSignup) {
        // Store token or user data if provided by the backend
        if (response.data.token) {
          localStorage.setItem('authToken', response.data.token);
        }
        
        // Redirect after a short delay to show the success message
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        // Clear form after signup
        setFormData({
          name: '',
          email: '',
          password: ''
        });
        // Auto switch to login after successful signup
        setTimeout(() => {
          setIsSignup(false);
        }, 1500);
      }
    } catch (error) {
      setMessageType('error');
      setMessage(error.response?.data?.message || 'Something went wrong. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAuthMode = () => {
    // Add a fade-out effect when toggling
    const formArea = document.querySelector('.form_area');
    if (formArea) {
      formArea.style.opacity = '0';
      formArea.style.transform = 'translateY(10px)';
      
      setTimeout(() => {
        setIsSignup(!isSignup);
        setMessage('');
        setErrors({});
        
        // Reset transform and opacity with a slight delay to create an animation
        setTimeout(() => {
          formArea.style.opacity = '1';
          formArea.style.transform = 'translateY(0)';
        }, 50);
      }, 300);
    } else {
      setIsSignup(!isSignup);
      setMessage('');
      setErrors({});
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setMessage("Password reset link sent to your email!");
    setMessageType("success");
    // Here you would typically add your actual forgot password logic
  };

  // Check if there's a remembered email
  useEffect(() => {
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail && !isSignup) {
      setFormData(prev => ({...prev, email: savedEmail}));
      setRememberMe(true);
    }
  }, [isSignup]);

  return (
    <div className='h-screen w-screen justify-center items-center flex' 
      style={{ 
        backgroundImage: `linear-gradient(rgba(38, 65, 67, 0.8), rgba(222, 84, 153, 0.8)), url(${backgroundimg})`, 
        backgroundSize: 'cover', 
        backgroundPosition: 'center'
      }}>
      <div className="background-animation" ref={particlesContainerRef}></div>
      <div className="container">
        <div className="form_area">
          <p className="title">{isSignup ? 'SIGN UP' : 'LOGIN'}</p>
          {message && (
            <div className={`message ${messageType === 'error' ? 'error-message' : 'success-message'}`}>
              {message}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            {isSignup && (
              <div className="form_group">
                <label className="sub_title" htmlFor="name">Name</label>
                <input 
                  name="name" 
                  placeholder="Enter your full name" 
                  className="form_style" 
                  type="text" 
                  value={formData.name} 
                  onChange={handleChange} 
                />
                {errors.name && <span style={{color: 'rgba(255, 87, 87, 0.9)', fontSize: '0.8rem', marginTop: '5px'}}>{errors.name}</span>}
              </div>
            )}
            <div className="form_group">
              <label className="sub_title" htmlFor="email">Email</label>
              <input 
                name="email" 
                placeholder="Enter your email" 
                id="email" 
                className="form_style" 
                type="email" 
                value={formData.email} 
                onChange={handleChange} 
              />
              {errors.email && <span style={{color: 'rgba(255, 87, 87, 0.9)', fontSize: '0.8rem', marginTop: '5px'}}>{errors.email}</span>}
            </div>
            <div className="form_group">
              <label className="sub_title" htmlFor="password">Password</label>
              <div className="password-field-container">
                <input 
                  name="password" 
                  placeholder="Enter your password" 
                  id="password" 
                  className="form_style" 
                  type={showPassword ? "text" : "password"} 
                  value={formData.password} 
                  onChange={handleChange} 
                />
                <button 
                  type="button" 
                  className="password-toggle" 
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              {errors.password && <span style={{color: 'rgba(255, 87, 87, 0.9)', fontSize: '0.8rem', marginTop: '5px'}}>{errors.password}</span>}
              {!isSignup && (
                <div className="forgot-password">
                  <a href="#" onClick={handleForgotPassword}>Forgot Password?</a>
                </div>
              )}
            </div>
            
            {!isSignup && (
              <div className="checkbox-container">
                <label>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                  />
                  <span className="checkmark"></span>
                  Remember me
                </label>
              </div>
            )}
            
            <div>
              <button 
                className="btn" 
                type="submit" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    {isSignup ? 'SIGNING UP' : 'LOGGING IN'}
                    <span className="loading-spinner"></span>
                  </>
                ) : (
                  isSignup ? 'SIGN UP' : 'LOGIN'
                )}
              </button>
              <p style={{color: 'rgba(255, 255, 255, 0.8)'}}>
                {isSignup ? 'Have an Account?' : "Don't have an Account?"}
                <span className="link" onClick={toggleAuthMode}>
                  {isSignup ? ' Login!' : ' Sign Up!'}
                </span>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Authentication;