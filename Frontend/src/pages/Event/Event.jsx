import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Event.css";
import Navbar from "../../components/Navbar/Navbar";

const Event = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  
  // Mock event data (simulating what would come from the backend)
  const mockEvents = {
    "1": {
      id: 1,
      title: "AI Innovation Hackathon",
      description: "Join the AI Innovation Hackathon and build cutting-edge AI solutions. This 48-hour event brings together developers, designers, and AI enthusiasts to create innovative applications. Participants will work in teams to solve real-world problems using artificial intelligence and machine learning. Expert mentors from leading tech companies will be available throughout the event to provide guidance. The hackathon concludes with project presentations and an awards ceremony where outstanding solutions will be recognized.",
      category: "Artificial Intelligence",
      location: "Tech Innovation Hub, Silicon Valley",
      date: "2024-05-15",
      time: "09:00",
      price: 499,
      img: "https://images.unsplash.com/photo-1526378800651-dd5dde11e39a?q=80&w=1000",
      registrationDeadline: "2024-05-01",
      registeredCount: 128,
      eligibility: "Open to all developers, designers, and AI enthusiasts. Basic knowledge of programming is required. Participants can register individually or as teams of up to 4 members.",
      maxTeamSize: 4,
      prizes: [
        { position: "1st Place", prize: "₹100,000 + AWS Credits worth ₹50,000" },
        { position: "2nd Place", prize: "₹50,000 + Google Cloud Credits worth ₹25,000" },
        { position: "3rd Place", prize: "₹25,000 + Microsoft Azure Credits worth ₹15,000" },
        { position: "Best UI/UX", prize: "₹15,000 + 1-year Figma Professional Subscription" }
      ],
      format: "48-hour in-person hackathon with teams working on AI projects. Includes opening ceremony, team formation, workshops, mentoring sessions, and final presentations.",
      sponsors: ["Google", "Microsoft", "AWS", "NVIDIA", "Intel"],
      faqs: [
        { 
          question: "Do I need to have a team before registering?", 
          answer: "No, you can register individually and form teams at the event. We will have a team formation session." 
        },
        { 
          question: "What should I bring to the hackathon?", 
          answer: "Please bring your laptop, charger, and any other equipment you might need. Food and beverages will be provided." 
        },
        { 
          question: "Is there a specific theme I need to follow?", 
          answer: "Themes will be announced at the opening ceremony. You'll have multiple problem statements to choose from." 
        }
      ]
    },
    "2": {
      id: 2,
      title: "Blockchain Revolution Hackfest",
      description: "Explore the future of decentralized applications at the Blockchain Revolution Hackfest. Build solutions using blockchain technology and compete for amazing prizes. This event focuses on creating innovative solutions in areas such as DeFi, NFTs, smart contracts, and distributed ledger applications. Industry leaders will share insights on current blockchain trends and future possibilities.",
      category: "Blockchain",
      location: "Crypto Convention Center, Miami",
      date: "2024-06-08",
      time: "10:00",
      price: 599,
      img: "https://images.unsplash.com/photo-1561489413-985b06da5bee?q=80&w=1000",
      registrationDeadline: "2024-05-20",
      registeredCount: 85,
      eligibility: "Open to blockchain developers, enthusiasts, and innovators. Basic understanding of blockchain concepts and some coding experience preferred.",
      maxTeamSize: 3,
      prizes: [
        { position: "1st Place", prize: "₹120,000 + Ethereum worth ₹50,000" },
        { position: "2nd Place", prize: "₹60,000 + Bitcoin worth ₹25,000" },
        { position: "3rd Place", prize: "₹30,000 + Solana worth ₹15,000" },
        { position: "Best Smart Contract", prize: "₹20,000" }
      ],
      format: "36-hour virtual hackathon with opening and closing ceremonies held online. Teams will build and deploy blockchain solutions with access to mentors via Discord.",
      sponsors: ["Ethereum Foundation", "Binance", "Polygon", "Coinbase", "Solana"],
      faqs: [
        { 
          question: "Do I need prior blockchain experience?", 
          answer: "Some basic understanding of blockchain concepts is recommended, but we'll have beginner-friendly workshops." 
        },
        { 
          question: "Will there be starter code or templates provided?", 
          answer: "Yes, we will provide boilerplate code and templates for different blockchain platforms." 
        },
        { 
          question: "How will projects be judged?", 
          answer: "Projects will be judged based on innovation, technical complexity, design, and real-world applicability." 
        }
      ]
    },
    "3": {
      id: 3,
      title: "Health Tech Innovation Challenge",
      description: "Create healthcare solutions that impact lives at the Health Tech Innovation Challenge. Connect with healthcare professionals and build meaningful applications. This hackathon focuses on addressing critical challenges in healthcare delivery, patient monitoring, medical data management, and telehealth services. Participants will have access to anonymized healthcare datasets and APIs to build their solutions.",
      category: "Healthcare",
      location: "Medical Research Center, Boston",
      date: "2024-07-22",
      time: "08:30",
      price: 449,
      img: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1000",
      registrationDeadline: "2024-07-01",
      registeredCount: 62,
      eligibility: "Open to developers, healthcare professionals, and students interested in health technology. Teams must include at least one member with healthcare background or experience.",
      maxTeamSize: 5,
      prizes: [
        { position: "1st Place", prize: "₹80,000 + Opportunity to pilot at leading hospitals" },
        { position: "2nd Place", prize: "₹40,000 + Mentorship from healthcare VCs" },
        { position: "3rd Place", prize: "₹20,000" },
        { position: "Most Innovative Solution", prize: "₹15,000" }
      ],
      format: "72-hour hybrid hackathon with optional in-person attendance. Includes healthcare data workshops, patient panels, and presentations to healthcare investors.",
      sponsors: ["Johnson & Johnson", "Philips Healthcare", "Mayo Clinic", "GE Healthcare", "Medtronic"],
      faqs: [
        { 
          question: "Do teams need to include healthcare professionals?", 
          answer: "We recommend having at least one team member with healthcare background, but it's not mandatory. Healthcare mentors will be available." 
        },
        { 
          question: "Will the event provide healthcare datasets?", 
          answer: "Yes, we will provide anonymized healthcare datasets and APIs for participants to use in their projects." 
        },
        { 
          question: "Are there intellectual property considerations?", 
          answer: "Teams retain ownership of their projects, but sponsors may approach teams for potential collaboration opportunities." 
        }
      ]
    }
  };

  useEffect(() => {
    // Get the event based on the ID parameter
    setLoading(true);
    // Simulating network delay
    setTimeout(() => {
      const foundEvent = mockEvents[id];
      
      if (foundEvent) {
        setEvent(foundEvent);
      } else {
        console.error("Event not found for ID:", id);
      }
      setLoading(false);
    }, 800);
  }, [id]);

  // Handle user registration for the event
  const registerForEvent = () => {
    // Check if the user is logged in (mock implementation)
    const token = localStorage.getItem('token');
    
    if (!token) {
      setError('Please login to register for this event.');
      setSuccess('');
      return;
    }
    
    // Show registering state
    setRegistering(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      // Simulate successful registration
      setSuccess('Successfully registered for the event!');
      setError('');
      setRegistering(false);
      
      // In a real implementation, you would make an API call here
      console.log(`User registered for event ${id}`);
    }, 1500);
  };

  // Function to share the event
  const shareEvent = (platform) => {
    const eventUrl = window.location.href;
    const eventTitle = event ? event.title : "Check out this event!";
    
    let shareUrl = "";
    
    switch(platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(eventTitle)}&url=${encodeURIComponent(eventUrl)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(eventUrl)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(eventTitle + " " + eventUrl)}`;
        break;
      default:
        // Copy to clipboard
        navigator.clipboard.writeText(eventUrl).then(() => {
          setSuccess("Event URL copied to clipboard!");
          setTimeout(() => setSuccess(""), 3000);
        });
        return;
    }
    
    // Open share dialog
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar/>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading event details...</p>
        </div>
      </>
    );
  }

  if (!event) {
    return (
      <>
        <Navbar/>
        <div className="text-center p-5">
          <h2 className="text-2xl font-bold text-red-600">Event not found</h2>
          <p>The event you're looking for doesn't exist or has been removed.</p>
          <button 
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
            onClick={() => navigate('/events')}
          >
            Return to Events
          </button>
        </div>
      </>
    );
  }

  const formatTime = (time) => {
    const [hour, minute] = time.split(':');
    const period = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minute} ${period}`;
  };

  // Format date function
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', options);
    } catch (err) {
      return dateString;
    }
  };

  // Format registration deadline
  const formatDeadline = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      
      const diffTime = date.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 0) {
        return "Closed";
      } else if (diffDays === 1) {
        return "Last day!";
      } else if (diffDays <= 3) {
        return `${diffDays} days left!`;
      } else {
        return formatDate(dateString);
      }
    } catch (err) {
      return dateString;
    }
  };

  return (
    <>
    <Navbar/>
      <button 
        onClick={() => navigate('/events')}
        className="back-button ml-4 mt-4 flex items-center"
      >
        <span className="mr-2">←</span> Back to Events
      </button>
    
      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 mx-4 mt-4" role="alert">
          <p>{success}</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 mx-4 mt-4" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      <div className="event-container">
        <div className="event-img">
          <img src={event.img} alt={event.title} />
        </div>
        <div className="event-content">
          <div className="register p-4 rounded-3xl">
            <h2 className="font-bold text-4xl text-blue-800">₹{event.price}</h2>
            <button 
              className={`bg-blue-800 p-2 text-center text-2xl font-bold text-white rounded-2xl w-100 ${registering ? 'opacity-75 cursor-not-allowed' : ''}`}
              onClick={registerForEvent}
              disabled={registering}
            >
              {registering ? 'Registering...' : 'Register Now'}
            </button>
            <h2 className="text-lg">
              <span className="font-semibold block">Registration Deadline</span> 
              <span className="font-bold text-red-600 block">{formatDeadline(event.registrationDeadline)}</span>
            </h2>
            <h4 className="text-lg">
              <span className="font-semibold">People registered:</span>{" "}
              <span className="font-bold text-blue-600">{event.registeredCount}</span>
            </h4>
            <h4 className="text-lg mt-2">
              <span className="font-semibold">Max Team Size:</span>{" "}
              <span className="font-bold text-blue-600">{event.maxTeamSize} members</span>
            </h4>
          </div>
          <div className="eligiblilty rounded-3xl p-7">
            <h2 className="font-bold text-xl text-blue-800 mb-3">Eligibility Criteria</h2>
            <p>{event.eligibility}</p>
          </div>
          
          <div className="contact-info rounded-3xl p-7 bg-white mt-4 shadow-md">
            <h2 className="font-bold text-xl text-blue-800 mb-3">Contact Organizer</h2>
            <p className="mb-2">
              <span className="font-semibold">Email:</span> organizer@{event.title.toLowerCase().replace(/\s+/g, '')}hackathon.com
            </p>
            <p className="mb-2">
              <span className="font-semibold">Phone:</span> +1 (555) 123-4567
            </p>
          </div>
        </div>
        <div className="event-details">
          <h1 className="font-bold text-4xl">{event.title}</h1>
          
          <div className="detail-section">
            <h2 className="font-bold text-xl">Category: <span className="font-normal text-gray-700">{event.category}</span></h2>
            <h2 className="font-bold text-xl">Location: <span className="font-normal text-gray-700">{event.location}</span></h2>
            <h2 className="font-bold text-xl">Date: <span className="font-normal text-gray-700">{formatDate(event.date)}</span></h2>
            <h2 className="font-bold text-xl">Time: <span className="font-normal text-gray-700">{formatTime(event.time)}</span></h2>
          </div>
          
          <div className="description-section">
            <h2 className="font-bold text-2xl">About This Event</h2>
            <p>{event.description}</p>
          </div>
          
          {/* Event Format Section */}
          <div className="format-section mt-6 pt-5 border-t border-gray-200">
            <h2 className="font-bold text-2xl mb-3">Event Format</h2>
            <p>{event.format}</p>
          </div>
          
          {/* Prizes Section */}
          <div className="prizes-section mt-6 pt-5 border-t border-gray-200">
            <h2 className="font-bold text-2xl mb-3">Prizes</h2>
            <div className="prizes-grid grid grid-cols-1 md:grid-cols-2 gap-4">
              {event.prizes.map((prize, index) => (
                <div key={index} className="prize-card bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <h3 className="text-lg font-bold text-blue-800">{prize.position}</h3>
                  <p className="text-gray-700">{prize.prize}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Sponsors Section */}
          <div className="sponsors-section mt-6 pt-5 border-t border-gray-200">
            <h2 className="font-bold text-2xl mb-3">Sponsors</h2>
            <div className="sponsors-list flex flex-wrap gap-2">
              {event.sponsors.map((sponsor, index) => (
                <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full">
                  {sponsor}
                </span>
              ))}
            </div>
          </div>
          
          {/* FAQ Section */}
          <div className="faq-section mt-6 pt-5 border-t border-gray-200">
            <h2 className="font-bold text-2xl mb-3">Frequently Asked Questions</h2>
            <div className="faqs-list">
              {event.faqs.map((faq, index) => (
                <div key={index} className="faq-item mb-4">
                  <h3 className="text-lg font-bold text-blue-700">{faq.question}</h3>
                  <p className="text-gray-700">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Share section */}
          <div className="share-section mt-6 pt-5 border-t border-gray-200">
            <h2 className="font-bold text-2xl mb-3">Share This Event</h2>
            <div className="share-buttons flex flex-wrap gap-3">
              <button onClick={() => shareEvent('twitter')} className="share-btn twitter">
                Twitter
              </button>
              <button onClick={() => shareEvent('facebook')} className="share-btn facebook">
                Facebook
              </button>
              <button onClick={() => shareEvent('whatsapp')} className="share-btn whatsapp">
                WhatsApp
              </button>
              <button onClick={() => shareEvent('copy')} className="share-btn copy">
                Copy Link
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Event;
