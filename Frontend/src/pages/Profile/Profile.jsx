import React from 'react'
import './Profile.css'
import profile from '../../assets/profile.jpg'

function Profile() {
  return (
    <div className="profile-container">
      <div className="card">
        <div className="img">
          <img src={profile} alt="profile" />
        </div>
        <div className="details">
          <h2>John Doe</h2>
          <p>Email: john.doe@example.com</p>
          <p>Location: New York, USA</p>
          <button className="edit-btn">Edit Profile</button>
        </div>
      </div>
    </div>
  )
}

export default Profile