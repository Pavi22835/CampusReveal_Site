import React from 'react';
import './Legal.css';

export default function Terms() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <h1>Terms of Service</h1>
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        
        <section>
          <h2>Acceptance of Terms</h2>
          <p>By accessing or using CampusReveal, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.</p>
        </section>

        <section>
          <h2>User Accounts</h2>
          <p>You must be at least 13 years old to use this platform. You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account.</p>
        </section>

        <section>
          <h2>User Content</h2>
          <p>You retain ownership of your reviews and content. By posting, you grant CampusReveal a non-exclusive license to use, display, and share your content on our platform.</p>
        </section>

        <section>
          <h2>Prohibited Conduct</h2>
          <p>You agree not to post false, misleading, or inappropriate content. We reserve the right to remove any content that violates our guidelines.</p>
        </section>

        <section>
          <h2>Limitation of Liability</h2>
          <p>CampusReveal is not responsible for the accuracy of user-generated reviews. Always verify information directly with educational institutions.</p>
        </section>

        <section>
          <h2>Contact Us</h2>
          <p>For questions about these Terms, contact us at <a href="mailto:support@campusreveal.com">support@campusreveal.com</a></p>
        </section>
      </div>
    </div>
  );
}