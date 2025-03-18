import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddEvent.css';
import Navbar from '../../components/Navbar/Navbar';

const AddEvent = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  
  // State for the form fields
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: '',
    price: '',
    registrationDeadline: '',
    eligibility: '',
    img: '',
    maxTeamSize: 4,
    prizes: [
      { position: '1st Place', prize: '' },
      { position: '2nd Place', prize: '' },
      { position: '3rd Place', prize: '' }
    ],
    format: '',
    sponsors: [''],
    faqs: [
      { question: '', answer: '' }
    ]
  });

  // Categories for the dropdown
  const categories = [
    'Artificial Intelligence',
    'Blockchain',
    'Web Development',
    'Mobile App Development',
    'IoT',
    'Healthcare',
    'Environment',
    'Education',
    'Cybersecurity',
    'Gaming',
    'Other'
  ];

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    // Handle number inputs
    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: value === '' ? '' : Number(value)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setFormData({
          ...formData,
          img: reader.result // In a real app, you'd upload this to a server
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle prize changes
  const handlePrizeChange = (index, field, value) => {
    const updatedPrizes = [...formData.prizes];
    updatedPrizes[index] = { 
      ...updatedPrizes[index], 
      [field]: value 
    };
    
    setFormData({
      ...formData,
      prizes: updatedPrizes
    });
  };

  // Add new prize field
  const addPrize = () => {
    setFormData({
      ...formData,
      prizes: [
        ...formData.prizes,
        { position: `Special Prize`, prize: '' }
      ]
    });
  };

  // Remove prize field
  const removePrize = (index) => {
    const updatedPrizes = [...formData.prizes];
    updatedPrizes.splice(index, 1);
    
    setFormData({
      ...formData,
      prizes: updatedPrizes
    });
  };

  // Handle sponsor changes
  const handleSponsorChange = (index, value) => {
    const updatedSponsors = [...formData.sponsors];
    updatedSponsors[index] = value;
    
    setFormData({
      ...formData,
      sponsors: updatedSponsors
    });
  };

  // Add new sponsor field
  const addSponsor = () => {
    setFormData({
      ...formData,
      sponsors: [...formData.sponsors, '']
    });
  };

  // Remove sponsor field
  const removeSponsor = (index) => {
    const updatedSponsors = [...formData.sponsors];
    updatedSponsors.splice(index, 1);
    
    setFormData({
      ...formData,
      sponsors: updatedSponsors
    });
  };

  // Handle FAQ changes
  const handleFaqChange = (index, field, value) => {
    const updatedFaqs = [...formData.faqs];
    updatedFaqs[index] = { 
      ...updatedFaqs[index], 
      [field]: value 
    };
    
    setFormData({
      ...formData,
      faqs: updatedFaqs
    });
  };

  // Add new FAQ field
  const addFaq = () => {
    setFormData({
      ...formData,
      faqs: [
        ...formData.faqs,
        { question: '', answer: '' }
      ]
    });
  };

  // Remove FAQ field
  const removeFaq = (index) => {
    const updatedFaqs = [...formData.faqs];
    updatedFaqs.splice(index, 1);
    
    setFormData({
      ...formData,
      faqs: updatedFaqs
    });
  };

  // Form validation
  const validateForm = () => {
    const requiredFields = [
      'title', 'description', 'date', 'time', 'location', 
      'category', 'price', 'registrationDeadline', 'eligibility'
    ];
    
    for (const field of requiredFields) {
      if (!formData[field]) {
        setError(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field.`);
        return false;
      }
    }
    
    // Check if at least one prize is filled
    if (formData.prizes.length === 0 || !formData.prizes[0].prize) {
      setError('Please add at least one prize.');
      return false;
    }
    
    // Check if format is filled
    if (!formData.format) {
      setError('Please describe the event format.');
      return false;
    }
    
    // Validate that dates make sense
    const today = new Date();
    const eventDate = new Date(formData.date);
    const registrationDeadline = new Date(formData.registrationDeadline);
    
    if (registrationDeadline < today) {
      setError('Registration deadline cannot be in the past.');
      return false;
    }
    
    if (eventDate < today) {
      setError('Event date cannot be in the past.');
      return false;
    }
    
    if (registrationDeadline > eventDate) {
      setError('Registration deadline must be before the event date.');
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
    
    setIsSubmitting(true);
    
    try {
      // In a real app, you would make an API call here
      console.log('Submitting event:', formData);
      
      // Simulate API call
      setTimeout(() => {
        setSuccess('Event created successfully!');
        setIsSubmitting(false);
        
        // Redirect to events page after success
        setTimeout(() => {
          navigate('/events');
        }, 2000);
      }, 1500);
      
    } catch (err) {
      setError('Failed to create event. Please try again.');
      setIsSubmitting(false);
      console.error('Error creating event:', err);
    }
  };

  return (
    <>
      <Navbar />
      <div className="add-event-container">
        <div className="add-event-header">
          <h1>Create New Hackathon Event</h1>
          <p>Fill in the details below to create a new hackathon event</p>
        </div>

        {success && (
          <div className="success-message">
            <p>{success}</p>
          </div>
        )}
        
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

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
                onChange={handleChange}
                placeholder="e.g., AI Innovation Hackathon"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Event Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide a detailed description of your hackathon..."
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
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="time">Start Time *</label>
                <input 
                  type="time"
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
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
                onChange={handleChange}
                placeholder="e.g., Tech Innovation Hub, Silicon Valley or Virtual (Zoom)"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="form-section">
            <h2>Registration Details</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price">Registration Fee (₹) *</label>
                <input 
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  placeholder="e.g., 499"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="registrationDeadline">Registration Deadline *</label>
                <input 
                  type="date"
                  id="registrationDeadline"
                  name="registrationDeadline"
                  value={formData.registrationDeadline}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="eligibility">Eligibility Criteria *</label>
              <textarea
                id="eligibility"
                name="eligibility"
                value={formData.eligibility}
                onChange={handleChange}
                placeholder="Describe who can participate in this hackathon..."
                rows="3"
                required
              ></textarea>
            </div>
            
            <div className="form-group">
              <label htmlFor="maxTeamSize">Maximum Team Size *</label>
              <input 
                type="number"
                id="maxTeamSize"
                name="maxTeamSize"
                value={formData.maxTeamSize}
                onChange={handleChange}
                min="1"
                max="10"
                required
              />
            </div>
          </div>
          
          <div className="form-section">
            <h2>Event Image</h2>
            
            <div className="form-group image-upload">
              <label htmlFor="img">Event Banner Image *</label>
              <input 
                type="file"
                id="img"
                name="img"
                accept="image/*"
                onChange={handleImageChange}
                className="file-input"
              />
              <div className="file-input-wrapper">
                <button type="button" className="file-input-button">
                  Choose Image
                </button>
                <span>
                  {previewImage ? 'Image selected' : 'No image selected'}
                </span>
              </div>
              
              {previewImage && (
                <div className="image-preview">
                  <img src={previewImage} alt="Event preview" />
                </div>
              )}
              <p className="input-help">Recommended size: 1200 x 600 pixels. Max file size: 5MB</p>
            </div>
          </div>
          
          <div className="form-section">
            <h2>Event Format</h2>
            
            <div className="form-group">
              <label htmlFor="format">Event Format Description *</label>
              <textarea
                id="format"
                name="format"
                value={formData.format}
                onChange={handleChange}
                placeholder="Describe the format of the hackathon, duration, activities, etc..."
                rows="4"
                required
              ></textarea>
            </div>
          </div>
          
          <div className="form-section">
            <h2>Prizes</h2>
            
            {formData.prizes.map((prize, index) => (
              <div key={index} className="prize-item">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor={`prize-position-${index}`}>Position</label>
                    <input 
                      type="text"
                      id={`prize-position-${index}`}
                      value={prize.position}
                      onChange={(e) => handlePrizeChange(index, 'position', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor={`prize-value-${index}`}>Prize Details *</label>
                    <input 
                      type="text"
                      id={`prize-value-${index}`}
                      value={prize.prize}
                      onChange={(e) => handlePrizeChange(index, 'prize', e.target.value)}
                      placeholder="e.g., ₹100,000 + AWS Credits worth ₹50,000"
                      required
                    />
                  </div>
                  
                  {index > 0 && (
                    <button 
                      type="button" 
                      className="remove-item-btn"
                      onClick={() => removePrize(index)}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            <button 
              type="button"
              className="add-item-btn"
              onClick={addPrize}
            >
              + Add Another Prize
            </button>
          </div>
          
          <div className="form-section">
            <h2>Sponsors</h2>
            
            {formData.sponsors.map((sponsor, index) => (
              <div key={index} className="sponsor-item">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor={`sponsor-${index}`}>Sponsor Name</label>
                    <input 
                      type="text"
                      id={`sponsor-${index}`}
                      value={sponsor}
                      onChange={(e) => handleSponsorChange(index, e.target.value)}
                      placeholder="e.g., Google, Microsoft, etc."
                    />
                  </div>
                  
                  {index > 0 && (
                    <button 
                      type="button" 
                      className="remove-item-btn"
                      onClick={() => removeSponsor(index)}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            <button 
              type="button"
              className="add-item-btn"
              onClick={addSponsor}
            >
              + Add Another Sponsor
            </button>
          </div>
          
          <div className="form-section">
            <h2>Frequently Asked Questions</h2>
            
            {formData.faqs.map((faq, index) => (
              <div key={index} className="faq-item">
                <div className="form-group">
                  <label htmlFor={`faq-question-${index}`}>Question</label>
                  <input 
                    type="text"
                    id={`faq-question-${index}`}
                    value={faq.question}
                    onChange={(e) => handleFaqChange(index, 'question', e.target.value)}
                    placeholder="e.g., Do I need to have a team before registering?"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor={`faq-answer-${index}`}>Answer</label>
                  <textarea
                    id={`faq-answer-${index}`}
                    value={faq.answer}
                    onChange={(e) => handleFaqChange(index, 'answer', e.target.value)}
                    placeholder="Provide a detailed answer to the question..."
                    rows="2"
                  ></textarea>
                </div>
                
                {index > 0 && (
                  <button 
                    type="button" 
                    className="remove-item-btn faq-remove"
                    onClick={() => removeFaq(index)}
                  >
                    Remove FAQ
                  </button>
                )}
              </div>
            ))}
            
            <button 
              type="button"
              className="add-item-btn"
              onClick={addFaq}
            >
              + Add Another FAQ
            </button>
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-btn"
              onClick={() => navigate('/events')}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Event...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AddEvent;
