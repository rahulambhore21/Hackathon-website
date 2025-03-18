import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './Blogs.css'
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';

function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching blog data
    setTimeout(() => {
      setBlogs(mockBlogs);
      setLoading(false);
    }, 1000);
  }, []);

  const handleFilterChange = (category) => {
    setFilter(category);
  };

  const filteredBlogs = filter === 'all' 
    ? blogs 
    : blogs.filter(blog => blog.category === filter);

  return (
    <>
    <Navbar/>
    <div className="blogs-container">
      <div className="blogs-header">
        <h1>Hackathon Stories</h1>
        <p>Insights, experiences, and tips from the hackathon community</p>
      </div>

      <div className="blogs-filter">
        <button 
          className={filter === 'all' ? 'active' : ''} 
          onClick={() => handleFilterChange('all')}
        >
          All Posts
        </button>
        <button 
          className={filter === 'participants' ? 'active' : ''} 
          onClick={() => handleFilterChange('participants')}
        >
          From Participants
        </button>
        <button 
          className={filter === 'organizers' ? 'active' : ''} 
          onClick={() => handleFilterChange('organizers')}
        >
          From Organizers
        </button>
        <button 
          className={filter === 'mentors' ? 'active' : ''} 
          onClick={() => handleFilterChange('mentors')}
        >
          From Mentors
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading blog posts...</div>
      ) : (
        <div className="blogs-grid">
          {filteredBlogs.map(blog => (
            <Link to={`/blogs/${blog.id}`} className="blog-card-link" key={blog.id}>
              <div className="blog-card">
                <div className="blog-image-container">
                  <img src={blog.image} alt={blog.title} className="blog-image" />
                  <span className={`blog-category ${blog.category}`}>{blog.category}</span>
                </div>
                <div className="blog-content">
                  <h3 className="blog-title">{blog.title}</h3>
                  <p className="blog-excerpt">{blog.excerpt}</p>
                  <div className="blog-meta">
                    <div className="blog-author">
                      <img src={blog.authorImg} alt={blog.author} className="author-image" />
                      <span>{blog.author}</span>
                    </div>
                    <span className="blog-date">{blog.date}</span>
                  </div>
                  <button className="read-more-btn">Read More</button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {filteredBlogs.length === 0 && !loading && (
        <div className="no-blogs">No blog posts found in this category.</div>
      )}

      {/* Mock data for blogs */}
      {/* This would typically be in a separate file or fetched from an API */}
    </div>
    <Footer/>
    </>
  )
}

const mockBlogs = [
  {
    id: 1,
    title: "How We Built a Climate Change Solution in 48 Hours",
    excerpt: "Our team's journey of creating a sustainable solution during the Green Tech Hackathon.",
    author: "Alex Johnson",
    authorImg: "https://randomuser.me/api/portraits/men/32.jpg",
    date: "May 15, 2023",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3",
    category: "participants"
  },
  {
    id: 2,
    title: "5 Tips for Running a Successful Virtual Hackathon",
    excerpt: "Lessons learned from organizing remote hackathons in a post-pandemic world.",
    author: "Sarah Chen",
    authorImg: "https://randomuser.me/api/portraits/women/44.jpg",
    date: "June 2, 2023",
    image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-4.0.3",
    category: "organizers"
  },
  {
    id: 3,
    title: "The Art of Mentoring: Supporting Hackathon Teams",
    excerpt: "How to provide valuable guidance without taking over the project.",
    author: "David Kumar",
    authorImg: "https://randomuser.me/api/portraits/men/62.jpg",
    date: "April 18, 2023",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3",
    category: "mentors"
  },
  {
    id: 4,
    title: "From Hackathon Project to Startup: Our Journey",
    excerpt: "How our weekend project evolved into a venture-backed company.",
    author: "Maya Williams",
    authorImg: "https://randomuser.me/api/portraits/women/65.jpg",
    date: "July 7, 2023",
    image: "https://images.unsplash.com/photo-1556761175-4b46a572b786?ixlib=rb-4.0.3",
    category: "participants"
  },
  {
    id: 5,
    title: "Building Diverse and Inclusive Hackathon Communities",
    excerpt: "Strategies for creating events where everyone feels welcome and empowered.",
    author: "James Lee",
    authorImg: "https://randomuser.me/api/portraits/men/22.jpg",
    date: "May 30, 2023",
    image: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?ixlib=rb-4.0.3",
    category: "organizers"
  },
  {
    id: 6,
    title: "Effective Technical Debugging During Hackathons",
    excerpt: "How to quickly troubleshoot common issues when time is of the essence.",
    author: "Priya Patel",
    authorImg: "https://randomuser.me/api/portraits/women/57.jpg",
    date: "June 22, 2023",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3",
    category: "mentors"
  }
];

export default Blogs