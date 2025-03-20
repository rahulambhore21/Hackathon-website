import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/Navbar/Navbar';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import './AddEvent.css';

const AddEvent = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get event ID if editing
  const { currentUser } = useAuth() || {};
  const { showSuccess, showError } = useNotification() || {};
  
  // Form data state
  const [formData, setFormData] = useState({
    title: '',
    organizerName: '',
    organizerEmail: '',
    organizerPhone: '',
    websiteUrl: '',
    eventType: 'in-person',
    date: '',
    startTime: '',
    endDate: '',
    endTime: '',
    timezone: 'UTC',
    location: '',
    venueName: '',
    venueAddress: '',
    city: '',
    state: '',
    country: '',
    virtualPlatform: '',
    virtualLink: '',
    tagline: '',
    description: '',
    tracks: [{ name: '', description: '' }],
    rules: '',
    prizes: [{ position: '', prize: '' }],
    eligibility: '',
    ageRestrictions: '',
    geographicRestrictions: '',
    skillLevel: 'all',
    minTeamSize: 1,
    maxTeamSize: 4,
    price: 0,
    registrationDeadline: '',
    accommodation: false,
    accommodationDetails: '',
    travelReimbursement: false,
    travelReimbursementDetails: '',
    foodArrangements: '',
    swagDetails: '',
    sponsors: [{ name: '', level: 'Gold', website: '', logoUrl: '' }],
    partnerOrganizations: '',
    codeOfConduct: '',
    termsAndConditions: '',
    photoRelease: false,
    faqs: [{ question: '', answer: '' }],
    category: 'ai',
    time: '',
  });
  
  const [previewImage, setPreviewImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Categories for the dropdown
  const categories = [
    { id: 'ai', name: 'AI & Machine Learning' },
    { id: 'web', name: 'Web Development' },
    { id: 'mobile', name: 'Mobile Development' },
    { id: 'blockchain', name: 'Blockchain' },
    { id: 'iot', name: 'IoT' },
    { id: 'cloud', name: 'Cloud Computing' },
    { id: 'security', name: 'Cybersecurity' },
    { id: 'game', name: 'Game Development' },
    { id: 'data', name: 'Data Science' },
    { id: 'design', name: 'Design' },
    { id: 'open', name: 'Open Innovation' }
  ];
  
  // Load event data if editing
  useEffect(() => {
    if (id) {
      setIsEditing(true);
      fetchEventDetails();
    }
  }, [id]);
  
  // Fetch event details for editing
  const fetchEventDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/events/${id}`);
      const event = response.data;
      
      // Format date for input field (YYYY-MM-DD)
      const formattedDate = event.date ? new Date(event.date).toISOString().split('T')[0] : '';
      const formattedDeadline = event.registrationDeadline ? 
        new Date(event.registrationDeadline).toISOString().split('T')[0] : '';
      
      setFormData({
        title: event.title || '',
        description: event.description || '',
        date: formattedDate,
        time: event.time || '',
        location: event.location || 'web',
        category: event.category || 'web',
        price: event.price || 0,
        registrationDeadline: formattedDeadline,
        eligibility: event.eligibility || '',
        maxTeamSize: event.maxTeamSize || 4,
        format: event.format || '',
        prizes: event.prizes && event.prizes.length ? event.prizes : [{ position: '1st Place', prize: '' }],
        sponsors: event.sponsors && event.sponsors.length ? event.sponsors : [''],
        faqs: event.faqs && event.faqs.length ? event.faqs : [{ question: '', answer: '' }]
      });
      
      // Set preview image if it exists
      if (event.img) {
        const imgUrl = event.img.startsWith('http') ? 
          event.img : `http://localhost:5000${event.img}`;
        setPreviewImage(imgUrl);
      }
    } catch (err) {
      console.error('Error fetching event details:', err);
      showError('Failed to load event details');
    }
  };
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Handle prize field changes
  const handlePrizeChange = (index, field, value) => {
    const updatedPrizes = [...formData.prizes];
    updatedPrizes[index][field] = value;
    setFormData(prev => ({
      ...prev,
      prizes: updatedPrizes
    }));
  };
  
  // Add more prize fields
  const addPrizeField = () => {
    setFormData(prev => ({
      ...prev,
      prizes: [...prev.prizes, { position: `${prev.prizes.length + 1}${getOrdinal(prev.prizes.length + 1)} Place`, prize: '' }]
    }));
  };
  
  // Remove prize field
  const removePrizeField = (index) => {
    if (formData.prizes.length > 1) {
      const updatedPrizes = [...formData.prizes];
      updatedPrizes.splice(index, 1);
      setFormData(prev => ({
        ...prev,
        prizes: updatedPrizes
      }));
    }
  };
  
  // Get ordinal suffix (1st, 2nd, 3rd, etc)
  const getOrdinal = (n) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };
  
  // Handle sponsor field changes
  const handleSponsorChange = (index, field, value) => {
    const updatedSponsors = [...formData.sponsors];
    updatedSponsors[index][field] = value;
    setFormData(prev => ({
      ...prev,
      sponsors: updatedSponsors
    }));
  };
  
  // Add more sponsor fields
  const addSponsorField = () => {
    setFormData(prev => ({
      ...prev,
      sponsors: [...prev.sponsors, { name: '', level: 'Gold', website: '', logoUrl: '' }]
    }));
  };

  // Handle sponsor logo upload
  const handleSponsorLogoUpload = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      // Preview the image and set it to logoUrl
      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedSponsors = [...formData.sponsors];
        updatedSponsors[index].logoUrl = reader.result;
        setFormData(prev => ({
          ...prev,
          sponsors: updatedSponsors
        }));
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Remove sponsor field
  const removeSponsorField = (index) => {
    if (formData.sponsors.length > 1) {
      const updatedSponsors = [...formData.sponsors];
      updatedSponsors.splice(index, 1);
      setFormData(prev => ({
        ...prev,
        sponsors: updatedSponsors
      }));
    }
  };
  
  // Handle FAQ field changes
  const handleFaqChange = (index, field, value) => {
    const updatedFaqs = [...formData.faqs];
    updatedFaqs[index][field] = value;
    setFormData(prev => ({
      ...prev,
      faqs: updatedFaqs
    }));
  };
  
  // Add more FAQ fields
  const addFaqField = () => {
    setFormData(prev => ({
      ...prev,
      faqs: [...prev.faqs, { question: '', answer: '' }]
    }));
  };
  
  // Remove FAQ field
  const removeFaqField = (index) => {
    if (formData.faqs.length > 1) {
      const updatedFaqs = [...formData.faqs];
      updatedFaqs.splice(index, 1);
      setFormData(prev => ({
        ...prev,
        faqs: updatedFaqs
      }));
    }
  };
  
  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Preview the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Validate form
  const validateForm = () => {
    if (!formData.title) {
      setError('Event title is required');
      return false;
    }
    
    if (!formData.description) {
      setError('Event description is required');
      return false;
    }
    
    if (!formData.date) {
      setError('Event date is required');
      return false;
    }
    
    if (!formData.time) {
      setError('Event time is required');
      return false;
    }
    
    if (!formData.location) {
      setError('Event location is required');
      return false;
    }
    
    if (!formData.registrationDeadline) {
      setError('Registration deadline is required');
      return false;
    }
    
    if (!formData.eligibility) {
      setError('Eligibility criteria is required');
      return false;
    }
    
    // Check if at least one prize has both position and value
    if (formData.prizes.length > 0) {
      const validPrizes = formData.prizes.filter(prize => 
        prize.position.trim() !== '' && prize.prize.trim() !== ''
      );
      
      if (validPrizes.length === 0) {
        setError('Please add at least one valid prize');
        return false;
      }
    }
    
    // Check if we have an image for new events
    if (!isEditing && !previewImage) {
      setError('Event image is required');
      return false;
    }
    
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validateForm()) {
      return;
    }
    
    // Check if user is logged in and is an admin
    if (!currentUser) {
      setError('You must be logged in to create an event.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create FormData object to handle file uploads
      const eventData = new FormData();
      
      // Add all text fields to the FormData
      eventData.append('title', formData.title);
      eventData.append('description', formData.description);
      eventData.append('date', formData.date);
      eventData.append('time', formData.time);
      eventData.append('location', formData.location);
      eventData.append('category', formData.category);
      eventData.append('price', formData.price);
      eventData.append('registrationDeadline', formData.registrationDeadline);
      eventData.append('eligibility', formData.eligibility);
      eventData.append('maxTeamSize', formData.maxTeamSize);
      eventData.append('format', formData.format);
      
      // Convert arrays to JSON strings before appending
      eventData.append('faqs', JSON.stringify(formData.faqs));
      eventData.append('tracks', JSON.stringify(formData.tracks));
      eventData.append('prizes', JSON.stringify(formData.prizes));
      eventData.append('sponsors', JSON.stringify(formData.sponsors));
      
      // Get the file from the input element
      const fileInput = document.querySelector('#img');
      if (fileInput.files.length > 0) {
        eventData.append('img', fileInput.files[0]);
      } else if (previewImage && !isEditing) {
        // If we have a preview but no file (unlikely scenario but just in case)
        // Convert base64 to blob and append
        const response = await fetch(previewImage);
        const blob = await response.blob();
        eventData.append('img', blob, 'image.jpg');
      }
      
      // Add sponsor logos if any
      const sponsorLogosInput = document.querySelector('#sponsorLogos');
      if (sponsorLogosInput && sponsorLogosInput.files.length > 0) {
        Array.from(sponsorLogosInput.files).forEach((file, index) => {
          eventData.append(`sponsorLogos[${index}]`, file);
        });
      }
      
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      
      let response;
      
      if (isEditing) {
        // Update existing event
        response = await axios.put(
          `http://localhost:5000/api/events/${id}`,
          eventData,
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            } 
          }
        );
        
        setSuccess('Event updated successfully!');
        if (showSuccess) showSuccess('Event updated successfully!');
      } else {
        // Create new event
        response = await axios.post(
          'http://localhost:5000/api/events', 
          eventData,
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            } 
          }
        );
        
        setSuccess('Event created successfully!');
        if (showSuccess) showSuccess('Event created successfully!');
      }
      
      setIsSubmitting(false);
      
      // Redirect to the event page after success
      setTimeout(() => {
        navigate(`/events/${response.data._id}`);
      }, 2000);
      
    } catch (err) {
      console.error('Error saving event:', err);
      const errorMessage = err.response?.data?.message || 'Failed to save event. Please try again.';
      setError(errorMessage);
      if (showError) showError(errorMessage);
      setIsSubmitting(false);
    }
  };

  // Function to add a track
  const addTrack = () => {
    setFormData(prev => ({
      ...prev,
      tracks: [...prev.tracks, { name: '', description: '' }]
    }));
  };
  
  // Function to update a track
  const updateTrack = (index, field, value) => {
    setFormData(prev => {
      const tracks = [...prev.tracks];
      tracks[index][field] = value;
      return { ...prev, tracks };
    });
  };
  
  // Function to remove a track
  const removeTrack = (index) => {
    if (formData.tracks.length > 1) {
      setFormData(prev => {
        const tracks = [...prev.tracks];
        tracks.splice(index, 1);
        return { ...prev, tracks };
      });
    } else {
      showError('You must have at least one track');
    }
  };
  
  // Similar functions for prizes and sponsors
  const addPrize = () => {
    setFormData(prev => ({
      ...prev,
      prizes: [...prev.prizes, { position: '', prize: '' }]
    }));
  };
  
  const updatePrize = (index, field, value) => {
    setFormData(prev => {
      const prizes = [...prev.prizes];
      prizes[index][field] = value;
      return { ...prev, prizes };
    });
  };
  
  const removePrize = (index) => {
    if (formData.prizes.length > 1) {
      setFormData(prev => {
        const prizes = [...prev.prizes];
        prizes.splice(index, 1);
        return { ...prev, prizes };
      });
    } else {
      showError('You must have at least one prize');
    }
  };
  
  const addSponsor = () => {
    setFormData(prev => ({
      ...prev,
      sponsors: [...prev.sponsors, { name: '', level: 'Gold', website: '', logoUrl: '' }]
    }));
  };
  
  const updateSponsor = (index, field, value) => {
    setFormData(prev => {
      const sponsors = [...prev.sponsors];
      sponsors[index][field] = value;
      return { ...prev, sponsors };
    });
  };
  
  const removeSponsor = (index) => {
    if (formData.sponsors.length > 1) {
      setFormData(prev => {
        const sponsors = [...prev.sponsors];
        sponsors.splice(index, 1);
        return { ...prev, sponsors };
      });
    } else {
      showError('You must have at least one sponsor');
    }
  };
  
  const addFaq = () => {
    setFormData(prev => ({
      ...prev,
      faqs: [...prev.faqs, { question: '', answer: '' }]
    }));
  };
  
  const updateFaq = (index, field, value) => {
    setFormData(prev => {
      const faqs = [...prev.faqs];
      faqs[index][field] = value;
      return { ...prev, faqs };
    });
  };
  
  const removeFaq = (index) => {
    if (formData.faqs.length > 1) {
      setFormData(prev => {
        const faqs = [...prev.faqs];
        faqs.splice(index, 1);
        return { ...prev, faqs };
      });
    } else {
      showError('You must have at least one FAQ');
    }
  };

  return (
    <>
      <Navbar />
      <div className="add-event-container">
        <div className="add-event-header">
          <h1>{isEditing ? 'Edit Hackathon' : 'Create New Hackathon'}</h1>
          <p>{isEditing ? 'Update your hackathon details' : 'Host your own hackathon event'}</p>
        </div>
        
        {error && <div className="error-alert">{error}</div>}
        {success && <div className="success-alert">{success}</div>}
        
        <form className="add-event-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h2>Basic Information</h2>
            
            <div className="form-group">
              <label htmlFor="title">Event Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter the hackathon title"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Provide a detailed description of your hackathon"
                rows="5"
                required
              ></textarea>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date">Event Date *</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="time">Event Time *</label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="location">Location *</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Event venue or online platform"
                required
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="price">Entry Fee (USD)</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>
          
          <div className="form-section">
            <h2>Event Details</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="registrationDeadline">Registration Deadline *</label>
                <input
                  type="date"
                  id="registrationDeadline"
                  name="registrationDeadline"
                  value={formData.registrationDeadline}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="maxTeamSize">Maximum Team Size</label>
                <input
                  type="number"
                  id="maxTeamSize"
                  name="maxTeamSize"
                  value={formData.maxTeamSize}
                  onChange={handleInputChange}
                  min="1"
                  max="10"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="eligibility">Eligibility Criteria *</label>
              <textarea
                id="eligibility"
                name="eligibility"
                value={formData.eligibility}
                onChange={handleInputChange}
                placeholder="Who can participate in this hackathon"
                rows="3"
                required
              ></textarea>
            </div>
            
            <div className="form-group">
              <label htmlFor="format">Event Format</label>
              <textarea
                id="format"
                name="format"
                value={formData.format}
                onChange={handleInputChange}
                placeholder="Describe the format, schedule, and judging criteria"
                rows="4"
              ></textarea>
            </div>
          </div>
          
          <div className="form-section">
            <h2>Prizes</h2>
            
            {formData.prizes.map((prize, index) => (
              <div key={index} className="form-row prize-row">
                <div className="form-group">
                  <label htmlFor={`prize-position-${index}`}>Position</label>
                  <input
                    type="text"
                    id={`prize-position-${index}`}
                    value={prize.position}
                    onChange={(e) => handlePrizeChange(index, 'position', e.target.value)}
                    placeholder="e.g., 1st Place"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor={`prize-value-${index}`}>Prize</label>
                  <input
                    type="text"
                    id={`prize-value-${index}`}
                    value={prize.prize}
                    onChange={(e) => handlePrizeChange(index, 'prize', e.target.value)}
                    placeholder="e.g., $1000"
                  />
                </div>
                
                <button 
                  type="button" 
                  className="remove-field-btn"
                  onClick={() => removePrizeField(index)}
                  disabled={formData.prizes.length <= 1}
                  title="Remove prize"
                >
                  X
                </button>
              </div>
            ))}
            
            <button 
              type="button" 
              className="add-field-btn"
              onClick={addPrizeField}
            >
              <i className="fas fa-plus"></i> Add Prize
            </button>
          </div>
          
          <div className="form-section">
            <h2>Sponsors</h2>
            <p className="section-description">Add organizations supporting your hackathon. The more sponsors, the better!</p>
            
            {formData.sponsors.map((sponsor, index) => (
              <div key={index} className="sponsor-card">
                <div className="sponsor-header">
                  <h3>Sponsor #{index + 1}</h3>
                  <button 
                    type="button" 
                    className="remove-field-btn"
                    onClick={() => removeSponsorField(index)}
                    disabled={formData.sponsors.length <= 1}
                    title="Remove sponsor"
                  >
                    X
                  </button>
                </div>
                
                <div className="sponsor-content">
                  <div className="sponsor-logo-section">
                    <div className="sponsor-logo-preview">
                      {sponsor.logoUrl ? (
                        <img src={sponsor.logoUrl} alt={`${sponsor.name} logo`} />
                      ) : (
                        <div className="no-logo">
                          <i className="fas fa-building"></i>
                          <p>No logo</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="logo-upload">
                      <label htmlFor={`sponsor-logo-${index}`} className="custom-file-upload">
                        <i className="fas fa-upload"></i> Upload Logo
                      </label>
                      <input
                        type="file"
                        id={`sponsor-logo-${index}`}
                        accept="image/*"
                        onChange={(e) => handleSponsorLogoUpload(index, e)}
                      />
                    </div>
                  </div>
                  
                  <div className="sponsor-details">
                    <div className="form-group">
                      <label htmlFor={`sponsor-name-${index}`}>Sponsor Name *</label>
                      <input
                        type="text"
                        id={`sponsor-name-${index}`}
                        value={sponsor.name}
                        onChange={(e) => handleSponsorChange(index, 'name', e.target.value)}
                        placeholder="e.g., Acme Corporation"
                        required
                      />
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor={`sponsor-level-${index}`}>Sponsorship Tier</label>
                        <select
                          id={`sponsor-level-${index}`}
                          value={sponsor.level}
                          onChange={(e) => handleSponsorChange(index, 'level', e.target.value)}
                        >
                          <option value="Platinum">Platinum</option>
                          <option value="Gold">Gold</option>
                          <option value="Silver">Silver</option>
                          <option value="Bronze">Bronze</option>
                          <option value="Partner">Partner</option>
                          <option value="In-Kind">In-Kind</option>
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor={`sponsor-website-${index}`}>Website URL</label>
                        <input
                          type="url"
                          id={`sponsor-website-${index}`}
                          value={sponsor.website}
                          onChange={(e) => handleSponsorChange(index, 'website', e.target.value)}
                          placeholder="https://example.com"
                        />
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor={`sponsor-logoUrl-${index}`}>Logo URL</label>
                      <input
                        type="url"
                        id={`sponsor-logoUrl-${index}`}
                        value={sponsor.logoUrl}
                        onChange={(e) => handleSponsorChange(index, 'logoUrl', e.target.value)}
                        placeholder="https://example.com/logo.png"
                      />
                      <p className="field-hint">If you don't upload a logo, you can provide a URL</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <button 
              type="button" 
              className="add-field-btn sponsor-add-btn"
              onClick={addSponsorField}
            >
              <i className="fas fa-plus"></i> Add Another Sponsor
            </button>
          </div>
          
          <div className="form-section">
            <h2>FAQs</h2>
            
            {formData.faqs.map((faq, index) => (
              <div key={index} className="faq-row">
                <div className="form-group">
                  <label htmlFor={`faq-question-${index}`}>Question</label>
                  <input
                    type="text"
                    id={`faq-question-${index}`}
                    value={faq.question}
                    onChange={(e) => updateFaq(index, 'question', e.target.value)}
                    placeholder="e.g., What should I bring?"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor={`faq-answer-${index}`}>Answer</label>
                  <textarea
                    id={`faq-answer-${index}`}
                    value={faq.answer}
                    onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                    placeholder="Provide a detailed answer"
                    rows="3"
                  ></textarea>
                </div>
                
                <button 
                  type="button" 
                  className="remove-field-btn"
                  onClick={() => removeFaqField(index)}
                  disabled={formData.faqs.length <= 1}
                  title="Remove FAQ"
                >
                  X
                </button>
              </div>
            ))}
            
            <button 
              type="button" 
              className="add-field-btn"
              onClick={addFaqField}
            >
              <i className="fas fa-plus"></i> Add FAQ
            </button>
          </div>
          
          <div className="form-section">
            <h2>Event Image</h2>
            
            <div className="image-upload-container">
              <div className="image-preview">
                {previewImage ? (
                  <img src={previewImage} alt="Event preview" />
                ) : (
                  <div className="no-image">
                    <i className="fas fa-image"></i>
                    <p>No image selected</p>
                  </div>
                )}
              </div>
              
              <div className="image-upload">
                <label htmlFor="img" className="custom-file-upload">
                  <i className="fas fa-cloud-upload-alt"></i> 
                  {isEditing ? 'Change Image' : 'Upload Image'}
                </label>
                <input
                  type="file"
                  id="img"
                  name="img"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <p className="file-hint">Recommended size: 1200 x 400 pixels (max 5MB)</p>
              </div>
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-btn"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Hackathon' : 'Create Hackathon'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AddEvent;
