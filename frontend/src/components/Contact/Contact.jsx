import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock, Send, MessageSquare, User, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import './Contact.css';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [contactInfo, setContactInfo] = useState(null);
  const [loadingInfo, setLoadingInfo] = useState(true);

  // ✅ Fetch contact information from API
  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        setLoadingInfo(true);
        const response = await api.getContactInfo?.();
        if (response?.success && response?.data) {
          setContactInfo(response.data);
        }
      } catch (err) {
        console.error('Error fetching contact info:', err);
      } finally {
        setLoadingInfo(false);
      }
    };
    fetchContactInfo();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    if (!formData.message.trim()) {
      setError('Please enter your message');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // ✅ Call actual API to submit contact form
      const response = await api.submitContactForm?.(formData);
      
      if (response?.success) {
        setSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
        
        // Hide success message after 5 seconds
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        setError(response?.message || 'Failed to send message. Please try again.');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Static contact info removed - Now using dynamic data from API
  // Only show contact cards if data is available from API

  return (
    <div className="contact-page">
      <div className="contact-container">
        
        {/* Hero Section */}
        <div className="contact-hero">
          <h1>Get in Touch</h1>
          <p>Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
        </div>

        <div className="contact-wrapper">
          
          {/* Contact Info Cards - Only show if data exists */}
          {contactInfo && !loadingInfo && (
            <div className="contact-info-grid">
              {contactInfo.address && (
                <div className="contact-info-card">
                  <div className="contact-icon">
                    <MapPin size={24} />
                  </div>
                  <h3>Address</h3>
                  <p>{contactInfo.address}</p>
                </div>
              )}
              
              {contactInfo.phone && (
                <div className="contact-info-card">
                  <div className="contact-icon">
                    <Phone size={24} />
                  </div>
                  <h3>Phone</h3>
                  <p>{contactInfo.phone}</p>
                </div>
              )}
              
              {contactInfo.email && (
                <div className="contact-info-card">
                  <div className="contact-icon">
                    <Mail size={24} />
                  </div>
                  <h3>Email</h3>
                  <p>{contactInfo.email}</p>
                </div>
              )}
              
              {contactInfo.businessHours && (
                <div className="contact-info-card">
                  <div className="contact-icon">
                    <Clock size={24} />
                  </div>
                  <h3>Business Hours</h3>
                  <p>{contactInfo.businessHours}</p>
                </div>
              )}
            </div>
          )}

          {/* Contact Form */}
          <div className="contact-form-section">
            <div className="contact-form-left">
              <h2>Send us a Message</h2>
              <p>Fill out the form and our team will get back to you within 24 hours.</p>
              
              <div className="contact-features">
                <div className="feature">
                  <MessageSquare size={18} />
                  <span>Quick Response</span>
                </div>
                <div className="feature">
                  <CheckCircle size={18} />
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>

            <form className="contact-form" onSubmit={handleSubmit}>
              {submitted && (
                <div className="success-message">
                  <CheckCircle size={20} />
                  Thank you! We'll get back to you soon.
                </div>
              )}
              
              {error && (
                <div className="error-message">
                  <AlertCircle size={20} />
                  {error}
                </div>
              )}
              
              <div className="form-group">
                <User size={18} />
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <Mail size={18} />
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <MessageSquare size={18} />
                <input
                  type="text"
                  name="subject"
                  placeholder="Subject"
                  value={formData.subject}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group textarea-group">
                <textarea
                  name="message"
                  placeholder="Your Message"
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Sending...' : 'Send Message'}
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}