import React, { useState, useEffect, useRef } from 'react';
import { RiMenu3Line, RiCloseLine, RiMoonLine, RiSunLine, RiUser3Line, RiSettings5Line, RiLogoutCircleRLine, RiDashboardLine } from 'react-icons/ri';
import { NavLink, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import logo from '../../assets/logo.jpg';
import './Navbar.css';

const Navbar = () => {
  const [toggleMenu, setToggleMenu] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [isMenuScrollable, setIsMenuScrollable] = useState(false);
  
  const { currentUser, logout, loading, authInitialized } = useAuth() || {};
  const { showSuccess } = useNotification() || {};
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const menuRef = useRef(null);
  const menuContentRef = useRef(null);

  // Handle scroll effect with improved threshold
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Toggle body scroll when menu is open/closed
  useEffect(() => {
    if (toggleMenu) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
    
    return () => {
      document.body.classList.remove('menu-open');
    };
  }, [toggleMenu]);

  // Close dropdown when clicking outside with useRef hook
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      
      if (menuRef.current && !menuRef.current.contains(event.target) && !event.target.classList.contains('menu-icon')) {
        setToggleMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setToggleMenu(false);
  }, [location.pathname]);

  // Handle theme toggle with persistence in localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkTheme(savedTheme === 'dark');
      document.body.classList.toggle('light-theme', savedTheme === 'light');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkTheme;
    setIsDarkTheme(newTheme);
    document.body.classList.toggle('light-theme', !newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  // Handle navigation with smooth page transition
  const handleNavigate = (path) => {
    setToggleMenu(false);
    navigate(path);
  };

  // Handle user logout with proper navigation
  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate('/');
    
    // Use showSuccess if available
    if (typeof showSuccess === 'function') {
      showSuccess('Logged out successfully');
    }
  };

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Check if mobile menu content is scrollable
  useEffect(() => {
    if (toggleMenu && menuContentRef.current) {
      const checkScrollable = () => {
        const element = menuContentRef.current;
        setIsMenuScrollable(element.scrollHeight > element.clientHeight);
      };
      
      checkScrollable();
      window.addEventListener('resize', checkScrollable);
      
      return () => {
        window.removeEventListener('resize', checkScrollable);
      };
    }
  }, [toggleMenu]);

  return (
    <div className={`navbar ${scrolled ? 'navbar-scrolled' : ''} ${isDarkTheme ? 'dark-theme' : 'light-theme'}`}>
      <div className="navbar-links">
        <div className="navbar-links_logo" onClick={() => navigate('/')}>
          <img src={logo} alt="logo" />
        </div>
        <div className="navbar-links_container">
          <NavLink to="/" className={({isActive}) => isActive ? "active-link" : ""}>
            <p>Home</p>
          </NavLink>
          <NavLink to="/events" className={({isActive}) => isActive ? "active-link" : ""}>
            <p>Hackathons</p>
          </NavLink>
          {/* <NavLink to="/upcoming" className={({isActive}) => isActive ? "active-link" : ""}>
            <p>Upcoming Hackathons</p>
          </NavLink> */}
          <NavLink to="/blogs" className={({isActive}) => isActive ? "active-link" : ""}>
            <p>Blog</p>
          </NavLink>
        </div>
      </div>
      
      <div className="navbar-controls">
        <div className="theme-toggle" onClick={toggleTheme} title={isDarkTheme ? "Switch to Light Mode" : "Switch to Dark Mode"}>
          {isDarkTheme ? <RiSunLine /> : <RiMoonLine />}
        </div>
        
        <div className="navbar-sign">
          {(!authInitialized || loading) ? (
            <div className="navbar-loading">
              <div className="loading-spinner-small"></div>
              <span>Loading...</span>
            </div>
          ) : currentUser && currentUser.id ? (
            <div className="navbar-user-dropdown" ref={dropdownRef}>
              <div 
                className="navbar-user" 
                onClick={() => setShowDropdown(!showDropdown)}
                aria-expanded={showDropdown}
                aria-haspopup="true"
              >
                <div className="user-avatar">{getInitials(currentUser.name)}</div>
                <span className="user-name">Welcome, {currentUser.name}</span>
                <span className="dropdown-arrow">{showDropdown ? '▲' : '▼'}</span>
              </div>
              {showDropdown && (
                <div className="navbar-dropdown">
                  <Link to="/profile" onClick={() => setShowDropdown(false)}>
                    <p><RiUser3Line style={{marginRight: '10px', verticalAlign: 'middle'}} /> Profile</p>
                  </Link>
                  <Link to="/my-hackathons" onClick={() => setShowDropdown(false)}>
                    <p><RiDashboardLine style={{marginRight: '10px', verticalAlign: 'middle'}} /> My Hackathons</p>
                  </Link>
                  <Link to="/host-dashboard" onClick={() => setShowDropdown(false)}>
                    <p><RiDashboardLine style={{marginRight: '10px', verticalAlign: 'middle'}} /> Host Dashboard</p>
                  </Link>
                  <Link to="/settings" onClick={() => setShowDropdown(false)}>
                    <p><RiSettings5Line style={{marginRight: '10px', verticalAlign: 'middle'}} /> Settings</p>
                  </Link>
                  <Link to="/my-events" onClick={() => setShowDropdown(false)}>
                    <p>My Events</p>
                  </Link>
                  <hr />
                  <p onClick={handleLogout}><RiLogoutCircleRLine style={{marginRight: '10px', verticalAlign: 'middle'}} /> Logout</p>
                </div>
              )}
            </div>
          ) : (
            <button type="button" onClick={() => navigate('/authentication')}>LOGIN</button>
          )}
        </div>
        
        <div className="navbar-menu">
          {toggleMenu
            ? <RiCloseLine className="menu-icon" onClick={() => setToggleMenu(false)} />
            : <RiMenu3Line className="menu-icon" onClick={() => setToggleMenu(true)} />}
          {toggleMenu && (
          <div 
            className={`navbar-menu_container scale-up-center ${isMenuScrollable ? 'scrollable' : ''}`} 
            ref={menuRef}
          >
            {/* Removed extra wrapping div around menu items for better scrolling */}
            <p onClick={() => handleNavigate('/')}>Home</p>
            <p onClick={() => handleNavigate('/events')}>Hackathons</p>
            <p onClick={() => handleNavigate('/blogs')}>Blog</p>
            
            {/* This section is only shown on mobile */}
            <div className="navbar-menu_container-links-sign">
              {(!authInitialized || loading) ? (
                <div className="mobile-loading">
                  <div className="loading-spinner-small"></div>
                  <span>Loading...</span>
                </div>
              ) : currentUser ? (
                <div className="mobile-user-menu">
                  <div className="mobile-user-header">
                    <div className="mobile-user-avatar">{getInitials(currentUser.name)}</div>
                    <p>Welcome, {currentUser.name}</p>
                  </div>
                  <p onClick={() => handleNavigate('/profile')}>
                    <RiUser3Line style={{marginRight: '10px'}} /> Profile
                  </p>
                  <p onClick={() => handleNavigate('/my-hackathons')}>
                    <RiDashboardLine style={{marginRight: '10px'}} /> My Hackathons
                  </p>
                  <p onClick={() => handleNavigate('/host-dashboard')}>
                    <RiDashboardLine style={{marginRight: '10px'}} /> Host Dashboard
                  </p>
                  <p onClick={() => handleNavigate('/settings')}>
                    <RiSettings5Line style={{marginRight: '10px'}} /> Settings
                  </p>
                  <p onClick={() => handleNavigate('/my-events')}>My Events</p>
                  <p onClick={handleLogout}>
                    <RiLogoutCircleRLine style={{marginRight: '10px'}} /> Logout
                  </p>
                </div>
              ) : (
                <button type="button" onClick={() => handleNavigate('/authentication')}>LOGIN</button>
              )}
              <div className="mobile-theme-toggle" onClick={toggleTheme}>
                {isDarkTheme ? 
                  <><RiSunLine /> <span>Light Mode</span></> : 
                  <><RiMoonLine /> <span>Dark Mode</span></>
                }
              </div>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;