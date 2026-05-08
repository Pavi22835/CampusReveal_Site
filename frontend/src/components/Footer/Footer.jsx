import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__container">
        <div>
          <h2 className="footer__brand text-xl font-black mb-2">
            Campus<span className="footer__accent">Reveal</span>
          </h2>
          <p className="footer__text">Empowering students with authentic insights.</p>
        </div>

        <div>
          <h3 className="footer__heading">Platform</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/colleges" className="footer__link">Universities</Link></li>
            <li><Link to="/compare" className="footer__link">Compare</Link></li>
            <li><Link to="/reviews" className="footer__link">Reviews</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="footer__heading">Community</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/community" className="footer__link">Forums</Link></li>
            <li><Link to="/community" className="footer__link">Mentorship</Link></li>
            <li><Link to="/community" className="footer__link">Events</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="footer__heading">Support</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/help" className="footer__link">Help</Link></li>
            <li><Link to="/contact" className="footer__link">Contact</Link></li>
            <li><Link to="/privacy" className="footer__link">Privacy</Link></li>
          </ul>
        </div>
      </div>
      <div className="footer__bottom">
        <div className="footer__copyright">
          © {currentYear} CampusReveal. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
