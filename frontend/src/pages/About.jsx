import React from 'react';
import { GraduationCap, Users, Award, Shield, Target, Heart, MessageSquare, TrendingUp } from 'lucide-react';
import './About.css';

export default function About() {
  const stats = [
    { icon: GraduationCap, value: '500+', label: 'Colleges Listed' },
    { icon: Users, value: '10K+', label: 'Student Reviews' },
    { icon: MessageSquare, value: '98%', label: 'Authentic Reviews' },
    { icon: TrendingUp, value: '50K+', label: 'Happy Students' }
  ];

  const teamValues = [
    { icon: Target, title: 'Our Mission', desc: 'To empower students with authentic insights for informed career decisions.' },
    { icon: Heart, title: 'Our Vision', desc: 'To be India\'s most trusted education guidance platform.' },
    { icon: Shield, title: 'Our Promise', desc: '100% verified reviews from real students, no fake testimonials.' }
  ];

  return (
    <div className="about-page">
      <div className="about-container">
        
        {/* Hero Section */}
        <div className="about-hero">
          <h1>About <span>CampusReveal</span></h1>
          <p>India's most trusted platform for authentic college reviews and insights</p>
        </div>

        {/* Stats Section */}
        <div className="about-stats">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <stat.icon size={28} />
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Story Section */}
        <div className="about-story">
          <h2>Our Story</h2>
          <p>Founded in 2024, CampusReveal was born from a simple idea: students deserve to make informed decisions about their education. We provide a platform where real students share genuine experiences about their colleges, helping thousands of aspiring students find their perfect fit.</p>
          <p className="story-quote">"Every student has a story. We're here to help them find the right chapter."</p>
        </div>

        {/* Values Section */}
        <div className="about-values">
          {teamValues.map((item, index) => (
            <div key={index} className="value-card">
              <item.icon size={28} />
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Why Choose Us */}
        <div className="about-why">
          <h2>Why Choose CampusReveal?</h2>
          <div className="why-grid">
            <div className="why-item">
              <Award size={24} />
              <h4>Authentic Reviews</h4>
              <p>All reviews are verified from real students</p>
            </div>
            <div className="why-item">
              <Shield size={24} />
              <h4>Privacy First</h4>
              <p>Your identity is always protected</p>
            </div>
            <div className="why-item">
              <GraduationCap size={24} />
              <h4>Comprehensive Data</h4>
              <p>Detailed information about 500+ colleges</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}