import React, { useState } from 'react';
import './Footer.css';
import { 
  FaFacebook, 
  FaTwitter, 
  FaInstagram, 
  FaLinkedin, 
  FaGithub,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaArrowRight,
  FaHome,
  FaInfoCircle,
  FaCalendarAlt,
  FaProjectDiagram,
  FaHeadset,
  FaAward,
  FaLightbulb,
  FaHandshake
} from 'react-icons/fa';

function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Thanks for subscribing with ${email}!`);
    setEmail('');
  };
  
  return (
    <>
      <div className="wave-divider"></div>
      <footer className="footer">
        {/* New top section with logo and newsletter */}
        <div className="footer-top">
          <div className="footer-logo-section">
            <div className="footer-logo">
              <h2>HackInnovate</h2>
            </div>
            <p>Empowering the next generation of innovators to create groundbreaking solutions through collaborative hackathons.</p>
            <div className="social-icons-horizontal">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebook /></a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer"><FaGithub /></a>
            </div>
          </div>
          
          <div className="newsletter-box">
            <h3>Subscribe to Our Newsletter</h3>
            <p>Stay updated with our latest events, hackathons, and tech news.</p>
            <form className="newsletter-form" onSubmit={handleSubmit}>
              <input 
                type="email" 
                placeholder="Enter your email address" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button type="submit"><FaArrowRight /></button>
            </form>
          </div>
        </div>
        
        {/* New grid-based layout for the main footer content */}
        <div className="footer-grid">
          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul>
              <li><a href="/"><FaHome /> Home</a></li>
              <li><a href="/about"><FaInfoCircle /> About Us</a></li>
              <li><a href="/events"><FaCalendarAlt /> Events</a></li>
              <li><a href="/projects"><FaProjectDiagram /> Projects</a></li>
              <li><a href="/contact"><FaHeadset /> Contact</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>Our Services</h3>
            <ul>
              <li><a href="/services/hackathons"><FaLightbulb /> Hackathon Organization</a></li>
              <li><a href="/services/workshops"><FaHandshake /> Technical Workshops</a></li>
              <li><a href="/services/mentorship"><FaAward /> Mentorship Programs</a></li>
              <li><a href="/services/innovation"><FaProjectDiagram /> Innovation Labs</a></li>
            </ul>
          </div>
          
          <div className="footer-section footer-contact-info">
            <h3>Contact Info</h3>
            <p><FaEnvelope /> info@hackinnovate.com</p>
            <p><FaPhone /> +1 (123) 456-7890</p>
            <p><FaMapMarkerAlt /> 123 Tech Street, Innovation City, CA 94043</p>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {currentYear} HackInnovate. All rights reserved. | <a href="/privacy">Privacy Policy</a> | <a href="/terms">Terms of Service</a></p>
        </div>
      </footer>
    </>
  );
}

export default Footer;