import React from 'react'
import './Categories.css'

function Categories() {
  const categories = ['Technology', 'Health', 'Finance', 'Education', 'Entertainment'];

  return (
    <div className="categories-container">
      <h1>Categories</h1>
      <ul className="categories-list">
        {categories.map((category, index) => (
          <li key={index} className="category-item">{category}</li>
        ))}
      </ul>
    </div>
  )
}

export default Categories