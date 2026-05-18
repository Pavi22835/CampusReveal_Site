import React from 'react';
import './Legal.css';

export default function Privacy() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="legal-page">
      <div className="legal-container">
        <h1>Privacy Policy</h1>
        <p>Last updated: {currentDate}</p>
        
        <section>
          <h2>Information We Collect</h2>
          <p>We collect information you provide directly to us, such as when you create an account, write a review, or contact us. This may include your name, email address, phone number, and educational background.</p>
        </section>

        <section>
          <h2>How We Use Your Information</h2>
          <p>We use your information to provide, maintain, and improve our services, communicate with you, and protect our platform. Your reviews and contributions help other students make informed decisions.</p>
        </section>

        <section>
          <h2>Data Security</h2>
          <p>We implement appropriate security measures to protect your personal information. However, no method of transmission over the internet is 100% secure.</p>
        </section>

        <section>
          <h2>Sharing Your Information</h2>
          <p>We do not sell your personal information. We may share your information with your consent or as required by law.</p>
        </section>

        <section>
          <h2>Contact Us</h2>
          <p>If you have questions about this Privacy Policy, please contact us through our contact page.</p>
        </section>
      </div>
    </div>
  );
}