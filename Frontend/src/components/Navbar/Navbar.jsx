import React, { useState } from 'react';
import { RiMenu3Line, RiCloseLine } from 'react-icons/ri';
import { NavLink } from 'react-router';
import logo from '../../assets/logo.jpg';
import './Navbar.css';

const Navbar = () => {
  const [toggleMenu, setToggleMenu] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('John Doe'); // Example user name
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="bg-black navbar">
      <div className="navbar-links">
        <div className="navbar-links_logo">
          <img src={logo} alt="logo" />
        </div>
        <div className="navbar-links_container">
          <NavLink to="#home" activeClassName="active-link">Home</NavLink>
          <NavLink to="#possibility" activeClassName="active-link">DISCOVER</NavLink>
          <NavLink to="#features" activeClassName="active-link">Categories</NavLink>
          <NavLink to="#wgpt3" activeClassName="active-link">Upcoming Hackthons</NavLink>
          <NavLink to="#blog" activeClassName="active-link">Blog</NavLink>
        </div>
      </div>
      <div className="navbar-sign">
        {isLoggedIn ? (
          <div className="navbar-user-dropdown">
            <span className="navbar-user" onClick={() => setShowDropdown(!showDropdown)}>
              Welcome, {userName}
            </span>
            {showDropdown && (
              <div className="navbar-dropdown">
                <p onClick={() => setIsLoggedIn(false)}>Logout</p>
                <p>Profile</p>
              </div>
            )}
          </div>
        ) : (
          <button type="button" onClick={() => setIsLoggedIn(true)}>LOGIN</button>
        )}
      </div>
      <div className="navbar-menu">
        {toggleMenu
          ? <RiCloseLine color="#fff" size={27} onClick={() => setToggleMenu(false)} />
          : <RiMenu3Line color="#fff" size={27} onClick={() => setToggleMenu(true)} />}
        {toggleMenu && (
        <div className="navbar-menu_container scale-up-center">
          <div className="navbar-menu_container-links">
            <NavLink to="#home" activeClassName="active-link">Home</NavLink>
            <NavLink to="#wgpt3" activeClassName="active-link">Upcoming Hackthons</NavLink>
            <NavLink to="#possibility" activeClassName="active-link">DISCOVER</NavLink>
            <NavLink to="#features" activeClassName="active-link">Categories</NavLink>
            <NavLink to="#blog" activeClassName="active-link">Blog</NavLink>
          </div>
          <div className="navbar-menu_container-links-sign">
            {isLoggedIn ? (
              <div className="navbar-user-dropdown">
                <span className="navbar-user" onClick={() => setShowDropdown(!showDropdown)}>
                  Welcome, {userName}
                </span>
                {showDropdown && (
                  <div className="navbar-dropdown">
                    <p onClick={() => setIsLoggedIn(false)}>Logout</p>
                    <p>Profile</p>
                  </div>
                )}
              </div>
            ) : (
              <button type="button" onClick={() => setIsLoggedIn(true)}>LOGIN</button>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;