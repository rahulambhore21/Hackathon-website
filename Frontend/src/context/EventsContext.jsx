import React, { createContext, useState, useEffect, useContext } from 'react';

// Create the context
const EventsContext = createContext();

// Custom hook to use the events context
export const useEvents = () => {
  return useContext(EventsContext);
};

export const EventsProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Sample hackathon events data with categories
  const mockEvents = [
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

  // Load events on initial mount
  useEffect(() => {
    fetchEvents();
  }, []);

  // Filter events when active filter changes
  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredEvents(events);
    } else {
      setFilteredEvents(events.filter(event => event.category === activeFilter));
    }
  }, [activeFilter, events]);

  // Fetch events (mock implementation)
  const fetchEvents = async () => {
    setLoading(true);
    try {
      // In a real app, this would be an API call
      // For now, we're using mock data
      setTimeout(() => {
        setEvents(mockEvents);
        setFilteredEvents(mockEvents);
        setLoading(false);
      }, 500);
    } catch (err) {
      setError('Failed to fetch events');
      setLoading(false);
    }
  };

  // Get an event by ID
  const getEventById = (id) => {
    return events.find(event => event.id === parseInt(id));
  };

  // Add a new event
  const addEvent = (event) => {
    const newEvent = {
      ...event,
      id: events.length + 1,
    };
    
    setEvents([...events, newEvent]);
    return newEvent;
  };

  // Register for an event
  const registerForEvent = (eventId, userId) => {
    // In a real app, this would be an API call
    console.log(`User ${userId} registered for event ${eventId}`);
    return true;
  };

  // Context value
  const value = {
    events,
    filteredEvents,
    activeFilter,
    setActiveFilter,
    loading,
    error,
    categories,
    getEventById,
    addEvent,
    registerForEvent,
    refreshEvents: fetchEvents
  };

  return (
    <EventsContext.Provider value={value}>
      {children}
    </EventsContext.Provider>
  );
};

export default EventsContext;
