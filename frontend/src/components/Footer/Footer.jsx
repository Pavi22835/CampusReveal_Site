import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from "../../services/api";
import './Footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch real stats from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const result = await api.getFooterStats?.();
        if (result?.success && result?.data) {
          setStats(result.data);
        }
      } catch (error) {
        console.error('Error fetching footer stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <footer className="footer">
      <div className="footer__container">
        
        {/* Brand Section */}
        <div className="footer__brand-section">
          <h2 className="footer__brand">
            Campus<span className="footer__accent">Reveal</span>
          </h2>
          <p className="footer__text">Empowering students with authentic insights.</p>
          
          {/* Stats Section - Only show if data exists from API */}
          {stats && !loading && (
            <div className="footer__stats">
              {stats.colleges && (
                <span>{stats.colleges.toLocaleString()}+ Colleges</span>
              )}
              {stats.reviews && (
                <span>{stats.reviews.toLocaleString()}+ Reviews</span>
              )}
              {stats.verified && (
                <span>{stats.verified}% Verified</span>
              )}
            </div>
          )}
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