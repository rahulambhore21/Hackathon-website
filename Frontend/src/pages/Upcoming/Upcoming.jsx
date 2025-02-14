import React from 'react'
import './Upcoming.css'

function Upcoming() {
  const hackathons = [
    { name: 'Hackathon 1', date: '2023-11-01', location: 'New York' },
    { name: 'Hackathon 2', date: '2023-12-15', location: 'San Francisco' },
    { name: 'Hackathon 3', date: '2024-01-20', location: 'Los Angeles' },
  ];

  return (
    <div className="upcoming-container">
      <h1>Upcoming Hackathons</h1>
      <ul>
        {hackathons.map((hackathon, index) => (
          <li key={index} className="hackathon-item">
            <h2>{hackathon.name}</h2>
            <p>Date: {hackathon.date}</p>
            <p>Location: {hackathon.location}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Upcoming