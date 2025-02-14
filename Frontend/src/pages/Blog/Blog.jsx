import React from 'react'
import './Blog.css'

function Blog() {
  return (
    <div className="blog-container ">
      <header className="blog-header">
        <h1>Blog</h1>
        <p>Welcome to our blog. Stay updated with the latest posts.</p>
      </header>
      <main className="blog-main">
        <div className="blog-posts">
          <article className="blog-post card">
            <h2>Post Title 1</h2>
            <p>Post content 1...</p>
            <a href="#">Read more</a>
          </article>
          <article className="blog-post card">
            <h2>Post Title 2</h2>
            <p>Post content 2...</p>
            <a href="#">Read more</a>
          </article>
          {/* Add more blog posts as needed */}
        </div>
      </main>
      <aside className="blog-sidebar">
        <h3>About Us</h3>
        <p>Learn more about our blog and what we do.</p>
        <h3>Categories</h3>
        <ul>
          <li><a href="#">Category 1</a></li>
          <li><a href="#">Category 2</a></li>
        </ul>
      </aside>
      <footer className="blog-footer">
        <p>&copy; 2023 Blog. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default Blog