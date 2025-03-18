import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import './Blog.css'

function Blog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    // Reset state when id changes
    setBlog(null);
    setError(null);
    setLoading(true);
    
    // Simulate fetching a specific blog post
    setTimeout(() => {
      try {
        const blogId = parseInt(id);
        const foundBlog = mockBlogs.find(blog => blog.id === blogId);
        
        if (!foundBlog) {
          setError('Blog post not found');
          setLoading(false);
          return;
        }
        
        // Find related posts (same category, excluding current post)
        const related = mockBlogs
          .filter(post => post.category === foundBlog.category && post.id !== blogId)
          .slice(0, 3);
        
        setBlog(foundBlog);
        setRelatedPosts(related);
      } catch (err) {
        setError('Error loading blog post');
      } finally {
        setLoading(false);
      }
    }, 800);
  }, [id]);

  if (loading) {
    return (
      <div className="blog-container">
        <div className="blog-loading">
          <div className="loader"></div>
          <p>Loading amazing content...</p>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="blog-container">
        <div className="blog-error">
          <h2>{error || 'Blog post not found'}</h2>
          <p>We couldn't find the blog post you were looking for.</p>
          <button 
            onClick={() => navigate('/blogs')}
            className="error-button"
          >
            Return to blogs
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="blog-container">
      <div className="blog-header">
        <span className={`blog-category ${blog.category}`}>{blog.category}</span>
        <h1>{blog.title}</h1>
        <div className="blog-meta">
          <div className="blog-author">
            <img src={blog.authorImg} alt={blog.author} />
            <span>{blog.author}</span>
          </div>
          <span className="blog-date">{formatDate(blog.date)}</span>
        </div>
      </div>

      <div className="blog-hero-image">
        <img src={blog.image} alt={blog.title} />
      </div>

      <div className="blog-content">
        <p className="blog-excerpt"><strong>{blog.excerpt}</strong></p>
        
        {/* This would be the full blog content */}
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, 
          urna eu tincidunt consectetur, nisl nunc euismod nisi, eu porttitor 
          nisl nisl eu nisi. Sed euismod, urna eu tincidunt consectetur, nisl 
          nunc euismod nisi, eu porttitor nisl nisl eu nisi.
        </p>
        
        <h2>The Challenge</h2>
        <p>
          Proin convallis libero ac metus efficitur pharetra. Praesent vel ultricies 
          leo, vitae convallis nunc. Aenean vel gravida augue. Vestibulum ante 
          ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; 
          Nullam rutrum, neque in scelerisque commodo, nisl nulla dapibus metus, 
          sit amet aliquet nulla tellus non lacus.
        </p>
        
        <p>
          In this hackathon, we faced numerous technical challenges including:
        </p>
        
        <ul>
          <li>Real-time data processing with limited resources</li>
          <li>Creating an intuitive UI within the time constraints</li>
          <li>Integrating multiple APIs with different response formats</li>
          <li>Ensuring scalability for potential future growth</li>
        </ul>
        
        <h2>Our Solution</h2>
        <p>
          Nullam rutrum, neque in scelerisque commodo, nisl nulla dapibus metus, 
          sit amet aliquet nulla tellus non lacus. Proin convallis libero ac metus 
          efficitur pharetra. Praesent vel ultricies leo, vitae convallis nunc. 
          Aenean vel gravida augue.
        </p>
        
        <p>
          The solution we built combined innovative approaches to data visualization
          with accessible design principles to create a product that could be useful
          for everyone regardless of technical ability.
        </p>
        
        <h2>Key Takeaways</h2>
        <p>
          The hackathon taught us valuable lessons about teamwork, rapid prototyping, and
          the importance of user-focused design. We learned to prioritize features based on
          user needs and deliver a working product within tight deadlines.
        </p>
      </div>

      <div className="blog-author-bio">
        <img src={blog.authorImg} alt={blog.author} />
        <div>
          <h3>About {blog.author}</h3>
          <p>
            {blog.author} is a passionate developer and hackathon enthusiast 
            with experience in building solutions for social impact. When not coding, 
            they enjoy hiking and playing the guitar.
          </p>
        </div>
      </div>

      {relatedPosts.length > 0 && (
        <div className="related-posts">
          <h2>Related Posts</h2>
          <div className="related-posts-grid">
            {relatedPosts.map(post => (
              <Link to={`/blogs/${post.id}`} className="related-post-card" key={post.id}>
                <img src={post.image} alt={post.title} />
                <h3>{post.title}</h3>
                <p>{formatDate(post.date)}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="back-to-blogs">
        <Link to="/blogs">← Back to all blogs</Link>
      </div>
    </div>
  )
}

// Using the same mock data as in Blogs.jsx
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

export default Blog