import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, MessageSquare, User, CheckCircle } from 'lucide-react';
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Form submitted:', formData);
      setSubmitted(true);
      setLoading(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    }, 1000);
  };

  const contactInfo = [
    { icon: MapPin, title: 'Address', details: ['Chennai, Tamil Nadu', 'India - 600001'] },
    { icon: Phone, title: 'Phone', details: ['+91 12345 67890', '+91 98765 43210'] },
    { icon: Mail, title: 'Email', details: ['support@campusreveal.com', 'info@campusreveal.com'] },
    { icon: Clock, title: 'Business Hours', details: ['Monday - Friday: 9AM - 6PM', 'Saturday: 10AM - 2PM'] }
  ];

  return (
    <div className="contact-page">
      <div className="contact-container">
        <div className="contact-hero">
          <h1>Get in Touch</h1>
          <p>Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
        </div>

        <div className="contact-wrapper">
          <div className="contact-info-grid">
            {contactInfo.map((item, index) => (
              <div key={index} className="contact-info-card">
                <div className="contact-icon">
                  <item.icon size={24} />
                </div>
                <h3>{item.title}</h3>
                {item.details.map((detail, i) => (
                  <p key={i}>{detail}</p>
                ))}
              </div>
            ))}
          </div>

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
              
              <div className="form-group">
                <User size={18} />
                <input type="text" name="name" placeholder="Your Name" value={formData.name} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <Mail size={18} />
                <input type="email" name="email" placeholder="Your Email" value={formData.email} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <MessageSquare size={18} />
                <input type="text" name="subject" placeholder="Subject" value={formData.subject} onChange={handleChange} required />
              </div>

              <div className="form-group textarea-group">
                <textarea name="message" placeholder="Your Message" rows="5" value={formData.message} onChange={handleChange} required></textarea>
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