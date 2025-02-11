import React from 'react';
import ai from '../../assets/ai.png';
import people from '../../assets/people.png';
import background from '../../assets/background.jpg';
import './Hero.css';

const Hero = () => (
  <div className="header section__padding text-white px-4" id="home" style={{ backgroundImage: `url(${background})`, backgroundSize: 'cover' }}>
    <div className="header-content">
      <h1 className="gradient__text">Discover Your Dream Hackathons</h1>
      <p>Welcome to the ultimate platform for finding and participating in hackathons. Whether you're a seasoned coder or a beginner, we connect you with the best hackathon competitions to showcase your skills and creativity.</p>

      <div className="header-content__input">
        <input type="email" placeholder="Enter Your Email to Stay Updated" />
        <button type="button">Subscribe</button>
      </div>

      <div className="header-content__people">
        <img src={people} />
        <p>Over 2,000 innovators joined us in the last 24 hours</p>
      </div>
    </div>

    <div className="header-image">
      <img src={ai} />
    </div>

    {/* <div className="header-cta">
      <button className="cta-button" type="button">Join Now</button>
    </div> */}
  </div>
);

export default Hero;