import React from 'react'
import Hero from '../../components/Hero/Hero'
import './Home.css'
import Features from '../../components/Features/Features'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'

function Home() {
  return (
    <>
    <Navbar/>
      <div className="hero">
        <Hero/>

      </div>
      <div className="features">
        <Features/>
      </div>

      {/* Testimonials Section */}
      <div className="testimonials">
        <div className="section-transition top-curve"></div>
        <div className="testimonials-container">
          <h2>What Our Community Says</h2>
          <div className="testimonial-cards">
            <div className="testimonial-card">
              <div className="testimonial-quote">
                "This platform connected me with the perfect hackathon that aligned with my skills. I ended up winning first place and landing a job!"
              </div>
              <div className="testimonial-author">
                <div className="testimonial-avatar"></div>
                <div>
                  <h4>Sarah Johnson</h4>
                  <p>Full Stack Developer</p>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-quote">
                "As a beginner, I was afraid to join hackathons. This platform helped me find beginner-friendly events where I learned so much!"
              </div>
              <div className="testimonial-author">
                <div className="testimonial-avatar"></div>
                <div>
                  <h4>Mike Chen</h4>
                  <p>Computer Science Student</p>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-quote">
                "We use this platform to host our company hackathons. The tools make it easy to organize and attract talented developers."
              </div>
              <div className="testimonial-author">
                <div className="testimonial-avatar"></div>
                <div>
                  <h4>Lisa Martinez</h4>
                  <p>Tech Event Manager</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="section-transition bottom-curve"></div>
      </div>

      {/* Call to Action Section */}
      <div className="cta-section">
        <div className="cta-container">
          <h2>Ready to Showcase Your Skills?</h2>
          <p>Join thousands of developers and innovators participating in hackathons worldwide</p>
          <div className="cta-buttons">
            <Link to="/upcoming" className="cta-button primary">Find Hackathons</Link>
            <Link to="/authentication" className="cta-button secondary">Sign Up Now</Link>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button 
        className="scroll-to-top" 
        onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
      >
        ↑
      </button>
      <Footer/>
    </>
  )
}

export default Home