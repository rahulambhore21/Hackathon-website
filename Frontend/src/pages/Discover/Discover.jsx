import React from 'react'
import './Discover.css'

function Discover() {
  return (
    <div className="discover-container">
      <h1>Discover</h1>
      <input type="text" placeholder="Search..." className="search-bar" />
      <div className="items-list">
        <div className="item">Item 1</div>
        <div className="item">Item 2</div>
        <div className="item">Item 3</div>
      </div>
    </div>
  )
}

export default Discover