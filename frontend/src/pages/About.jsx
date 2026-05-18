import React, { useState, useEffect } from 'react';
import { GraduationCap, Users, Award, Shield, Target, Heart, MessageSquare, TrendingUp } from 'lucide-react';
import { api } from '../services/api';
import './About.css';

export default function About() {
  const [stats, setStats] = useState({
    colleges: 0,
    reviews: 0,
    students: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch real stats from API
        const universitiesResult = await api.getUniversities({ limit: 1 });
        const reviewsResult = await api.getAllReviews();
        
        const collegesCount = universitiesResult.total || universitiesResult.data?.length || 0;
        const reviewsCount = reviewsResult.data?.length || 0;
        
        // Calculate total students from universities
        let totalStudents = 0;
        if (universitiesResult.data && Array.isArray(universitiesResult.data)) {
          totalStudents = universitiesResult.data.reduce((sum, uni) => sum + (uni.studentCount || 0), 0);
        }
        
        setStats({
          colleges: collegesCount,
          reviews: reviewsCount,
          students: totalStudents
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  // Format number for display
  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k+';
    }
    return num + '+';
  };

  const displayStats = [
    { icon: GraduationCap, value: formatNumber(stats.colleges), label: 'Colleges Listed' },
    { icon: Users, value: formatNumber(stats.reviews), label: 'Student Reviews' },
    { icon: TrendingUp, value: formatNumber(stats.students), label: 'Happy Students' }
  ];

  const teamValues = [
    { icon: Target, title: 'Our Mission', desc: 'To empower students with authentic insights for informed career decisions.' },
    { icon: Heart, title: 'Our Vision', desc: 'To be a trusted education guidance platform.' },
    { icon: Shield, title: 'Our Promise', desc: 'Verified reviews from real students.' }
  ];

  if (loading) {
    return (
      <div className="about-page">
        <div className="about-container">
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="about-page">
      <div className="about-container">
        
        {/* Hero Section */}
        <div className="about-hero">
          <h1>About <span>CampusReveal</span></h1>
          <p>A platform for authentic college reviews and insights</p>
        </div>

        {/* Stats Section - Dynamic from API */}
        <div className="about-stats">
          {displayStats.map((stat, index) => (
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
          <p>CampusReveal was created to help students make informed decisions about their education. We provide a platform where real students share genuine experiences about their colleges, helping aspiring students find their perfect fit.</p>
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
              <p>Reviews from verified students</p>
            </div>
            <div className="why-item">
              <Shield size={24} />
              <h4>Privacy First</h4>
              <p>Your identity is protected</p>
            </div>
            <div className="why-item">
              <GraduationCap size={24} />
              <h4>Comprehensive Data</h4>
              <p>Detailed information about colleges</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}