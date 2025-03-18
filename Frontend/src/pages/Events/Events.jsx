import React, { useState, useEffect } from 'react';
import EventCard from '../../ui/eventCard/EventCard';
import './Events.css';
import Navbar from '../../components/Navbar/Navbar';

function Events() {
  // State for filtering
  const [activeFilter, setActiveFilter] = useState('all');
  const [filteredEvents, setFilteredEvents] = useState([]);

  // Sample hackathon events data with categories
  const hackathons = [
    {
      id: 1,
      title: "AI Innovation Hackathon",
      description: "Join the AI Innovation Hackathon and build cutting-edge AI solutions. This 48-hour event brings together developers, designers, and AI enthusiasts to create innovative applications.",
      img: "https://images.unsplash.com/photo-1526378800651-dd5dde11e39a?q=80&w=1000",
      date: "May 15-17, 2024",
      category: "ai"
    },
    {
      id: 2,
      title: "Blockchain Revolution Hackfest",
      description: "Explore the future of decentralized applications at the Blockchain Revolution Hackfest. Build solutions using blockchain technology and compete for amazing prizes.",
      img: "https://images.unsplash.com/photo-1561489413-985b06da5bee?q=80&w=1000",
      date: "June 8-10, 2024",
      category: "blockchain"
    },
    {
      id: 3,
      title: "Health Tech Innovation Challenge",
      description: "Create healthcare solutions that impact lives at the Health Tech Innovation Challenge. Connect with healthcare professionals and build meaningful applications.",
      img: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1000",
      date: "July 22-24, 2024",
      category: "health"
    },
    {
      id: 4,
      title: "Green Energy Hackathon",
      description: "Help solve climate change challenges at the Green Energy Hackathon. Develop innovative solutions for a sustainable future and connect with environmental experts.",
      img: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=1000",
      date: "August 5-7, 2024",
      category: "environment"
    },
    {
      id: 5,
      title: "Student Developer Challenge",
      description: "A hackathon exclusively for students to showcase their coding talents. Build projects that solve real-world problems and gain industry exposure.",
      img: "https://images.unsplash.com/photo-1530099486328-e021101a494a?q=80&w=1000",
      date: "September 12-14, 2024",
      category: "education"
    },
    {
      id: 6,
      title: "Web3 & Metaverse Hackathon",
      description: "Dive into the world of Web3 and the Metaverse. Create immersive experiences and decentralized applications that push the boundaries of digital interaction.",
      img: "https://images.unsplash.com/photo-1581091226033-c6e0f5f4ab03?q=80&w=1000",
      date: "October 19-21, 2024",
      category: "blockchain"
    }
  ];

  // Filter categories
  const categories = [
    { id: 'all', name: 'All Events' },
    { id: 'ai', name: 'AI & Machine Learning' },
    { id: 'blockchain', name: 'Blockchain & Web3' },
    { id: 'health', name: 'Healthcare' },
    { id: 'environment', name: 'Environment' },
    { id: 'education', name: 'Education' }
  ];

  // Filter events when active filter changes
  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredEvents(hackathons);
    } else {
      setFilteredEvents(hackathons.filter(hackathon => hackathon.category === activeFilter));
    }
  }, [activeFilter]);

  return (
    <>
    <Navbar/>
    <div className="events-container">
      <div className="events-header">
        <h1>Upcoming Hackathons</h1>
        <p>Discover exciting hackathon events and showcase your skills with the developer community</p>
      </div>
      
      <div className="events-filters">
        {categories.map(category => (
          <button 
            key={category.id}
            className={`filter-button ${activeFilter === category.id ? 'active' : ''}`}
            onClick={() => setActiveFilter(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>
      
      <div className="events-grid">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((hackathon) => (
            <EventCard 
              key={hackathon.id}
              id={hackathon.id}
              title={hackathon.title}
              description={hackathon.description}
              img={hackathon.img}
              date={hackathon.date}
            />
          ))
        ) : (
          <div className="no-events">
            <h3>No events found in this category</h3>
            <p>Please check back later or try another category</p>
          </div>
        )}
      </div>
    </div>
    </>
  );
}

export default Events;