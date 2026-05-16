import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, 
  Star, 
  Users, 
  MessageCircle,
  Clock,
  Award,
  ThumbsUp,
  TrendingUp
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    universities: 0,
    reviews: 0,
    users: 0,
    discussions: 0,
    pendingReviews: 0,
    avgRating: 0,
    totalRatings: 0,
    avgReviewsPerUni: 0
  });
  const [loading, setLoading] = useState(true);

  const { token } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const fetchDashboardData = async () => {
    try {
      const response = await api.getAdminStats(token);
      if (!response.success) {
        throw new Error(response.message || 'Failed to load dashboard stats');
      }

      const data = response.data || {};

      setStats({
        universities: data.universities ?? 0,
        reviews: data.reviews ?? 0,
        users: data.users ?? 0,
        discussions: data.discussions ?? 0,
        pendingReviews: data.pendingReviews ?? 0,
        avgRating: parseFloat((data.avgRating ?? 0).toFixed(1)),
        totalRatings: data.totalRatings ?? 0,
        avgReviewsPerUni: data.avgReviewsPerUni ?? 0
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  // All cards data
  const mainCards = [
    { icon: GraduationCap, value: stats.universities, label: 'Total Universities', color: '#5b6cff', bg: '#e9ecff' },
    { icon: Star, value: stats.reviews, label: 'Total Reviews', color: '#f59e0b', bg: '#fef3c7' },
    { icon: Users, value: stats.users.toLocaleString(), label: 'Total Users', color: '#10b981', bg: '#d1fae5' },
    { icon: MessageCircle, value: stats.discussions, label: 'Discussions', color: '#8b5cf6', bg: '#ede9fe' },
    { icon: Clock, value: stats.pendingReviews, label: 'Pending Reviews', color: '#ef4444', bg: '#fee2e2' },
    { icon: Award, value: stats.avgRating, label: 'Average Rating', color: '#f59e0b', bg: '#fef3c7', suffix: '/5' },
    { icon: ThumbsUp, value: stats.totalRatings, label: 'Total Ratings', color: '#10b981', bg: '#d1fae5' },
    { icon: TrendingUp, value: stats.avgReviewsPerUni, label: 'Avg Reviews/Uni', color: '#5b6cff', bg: '#e9ecff' }
  ];

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1>Analytics Dashboard</h1>
        <p>CampusReveal platform performance overview</p>
      </div>

      {/* All Cards Grid */}
      <div className="cards-grid">
        {mainCards.map((card, index) => (
          <div key={index} className="stat-card">
            <div className="stat-card-icon" style={{ background: card.bg, color: card.color }}>
              <card.icon size={20} />
            </div>
            <div className="stat-card-value">
              {card.value}
              {card.suffix && <span className="stat-card-suffix">{card.suffix}</span>}
            </div>
            <div className="stat-card-label">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Powered By */}
      <div className="powered-by">
        Powered by CampusReveal
      </div>
    </div>
  );
};

export default Dashboard;