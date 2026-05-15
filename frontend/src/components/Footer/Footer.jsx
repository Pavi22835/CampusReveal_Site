import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__container">
        
        {/* Brand Section */}
        <div className="footer__brand-section">
          <h2 className="footer__brand">
            Campus<span className="footer__accent">Reveal</span>
          </h2>
          <p className="footer__text">Empowering students with authentic insights.</p>
          <div className="footer__stats">
            <span>500+ Colleges</span>
            <span>10K+ Reviews</span>
            <span>100% Verified</span>
          </div>
        </div>

        {/* Platform Links */}
        <div>
          <h3 className="footer__heading">Platform</h3>
          <ul>
            <li><Link to="/colleges" className="footer__link">Universities</Link></li>
            <li><Link to="/reviews" className="footer__link">Student Reviews</Link></li>
          </ul>
        </div>

        {/* Community Links */}
        <div>
          <h3 className="footer__heading">Community</h3>
          <ul>
            <li><Link to="/community" className="footer__link">Community Forum</Link></li>
          </ul>
        </div>

        {/* Support Links */}
        <div>
          <h3 className="footer__heading">Support</h3>
          <ul>
            <li><Link to="/write-review" className="footer__link">Write a Review</Link></li>
            <li><Link to="/help" className="footer__link">Help Center</Link></li>
          </ul>
        </div>

        {/* Company Links */}
        <div>
          <h3 className="footer__heading">Company</h3>
          <ul>
            <li><Link to="/about" className="footer__link">About Us</Link></li>
            <li><Link to="/contact" className="footer__link">Contact Us</Link></li>
            <li><Link to="/privacy" className="footer__link">Privacy Policy</Link></li>
            <li><Link to="/terms" className="footer__link">Terms of Service</Link></li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer__bottom">
        <p>© {currentYear} CampusReveal. All rights reserved.</p>
      </div>
    </footer>
  );
}