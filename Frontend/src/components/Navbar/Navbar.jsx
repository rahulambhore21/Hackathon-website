import React, { useState } from 'react';
import { RiMenu3Line, RiCloseLine } from 'react-icons/ri';
import { NavLink, useNavigate , Link } from 'react-router';
import logo from '../../assets/logo.jpg';
import './Navbar.css';

const Navbar = () => {
  const [toggleMenu, setToggleMenu] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('John Doe'); // Example user name
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="bg-black navbar">
      <div className="navbar-links">
        <div className="navbar-links_logo" onClick={() => navigate('/')}>
          <img src={logo} alt="logo" />
        </div>
        <div className="navbar-links_container">
          <NavLink to="/" activeClassName="active-link"><p>Home</p></NavLink>
          <NavLink to="/categories" activeClassName="active-link"><p>Categories</p></NavLink>
          <NavLink to="/upcoming" activeClassName="active-link"><p>Upcoming Hackthons</p></NavLink>
          <NavLink to="/blog" activeClassName="active-link"><p>Blog</p></NavLink>
        </div>
      </div>
      <div className="navbar-sign">
        {isLoggedIn ? (
          <div className="navbar-user-dropdown">
            <span className="navbar-user" onClick={() => setShowDropdown(!showDropdown)}>
              Welcome, {userName}
            </span>
            <div className={` navbar-dropdown ${showDropdown ? 'show' : ''}` } >
            <Link to={'/profile'}>  <p>Profile</p> </Link>
              <p onClick={() => setIsLoggedIn(false)}>Logout</p>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => navigate('/authentication')}>LOGIN</button>
        )}
      </div>
      <div className="navbar-menu">
        {toggleMenu
          ? <RiCloseLine color="#fff" size={27} onClick={() => setToggleMenu(false)} />
          : <RiMenu3Line color="#fff" size={27} onClick={() => setToggleMenu(true)} />}
        {toggleMenu && (
        <div className="navbar-menu_container scale-up-center">
          <div className="navbar-menu_container-links">
            <NavLink to="/" activeClassName="active-link">Home</NavLink>
            <NavLink to="/upcoming" activeClassName="active-link">Upcoming Hackthons</NavLink>
            <NavLink to="/discover" activeClassName="active-link">DISCOVER</NavLink>
            <NavLink to="/categories" activeClassName="active-link">Categories</NavLink>
            <NavLink to="/blog" activeClassName="active-link">Blog</NavLink>
          </div>
          <div className="navbar-menu_container-links-sign">
            {isLoggedIn ? (
              <div className="navbar-user-dropdown">
                <span className="navbar-user" onClick={() => setShowDropdown(!showDropdown)}>
                  Welcome, {userName}
                </span>
                <div className={`navbar-dropdown ${showDropdown ? 'show' : ''}`}>
                  <p onClick={() => setIsLoggedIn(false)}>Logout</p>
                 <Link to={'./profile'}> <p>Profile</p></Link>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => navigate('/authentication')}>LOGIN</button>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;