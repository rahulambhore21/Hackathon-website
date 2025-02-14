import React, { useState } from 'react';
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
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isSignup ? 'http://localhost:5000/user/signup' : 'http://localhost:5000/user/login';
    try {
      const response = await axios.post(url, formData);
      setMessage(response.data.message);
      if (!isSignup) {
        navigate('/');
      }
    } catch (error) {
      setMessage('error.response.data.message');
      console.error(error);
    }
  };

  return (
    <div className='h-screen w-screen justify-center items-center flex' style={{ backgroundColor: '#333', color: '#fff', backgroundImage: `url(${backgroundimg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="container">
        <div className="form_area">
          <p className="title">{isSignup ? 'SIGN UP' : 'LOGIN'}</p>
          {message && <p className="message">{message}</p>}
          <form onSubmit={handleSubmit}>
            {isSignup && (
              <div className="form_group">
                <label className="sub_title" htmlFor="name">Name</label>
                <input name="name" placeholder="Enter your full name" className="form_style" type="text" value={formData.name} onChange={handleChange} style={{ backgroundColor: '#555', color: '#fff' }} />
              </div>
            )}
            <div className="form_group">
              <label className="sub_title" htmlFor="email">Email</label>
              <input name="email" placeholder="Enter your email" id="email" className="form_style" type="email" value={formData.email} onChange={handleChange} style={{ backgroundColor: '#555', color: '#fff' }} />
            </div>
            <div className="form_group">
              <label className="sub_title" htmlFor="password">Password</label>
              <input name="password" placeholder="Enter your password" id="password" className="form_style" type="password" value={formData.password} onChange={handleChange} style={{ backgroundColor: '#555', color: '#fff' }} />
            </div>
            <div>
              <button className="btn" type="submit" style={{ backgroundColor: '#777', color: '#fff' }}>{isSignup ? 'SIGN UP' : 'LOGIN'}</button>
              <p>
                {isSignup ? 'Have an Account?' : "Don't have an Account?"}
                <span className="link" onClick={() => setIsSignup(!isSignup)} style={{ color: '#fff' }}>
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