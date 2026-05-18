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
    universities: null,
    reviews: null,
    users: null,
    discussions: null,
    pendingReviews: null,
    avgRating: null,
    totalRatings: null,
    avgReviewsPerUni: null
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
        universities: data.universities,
        reviews: data.reviews,
        users: data.users,
        discussions: data.discussions,
        pendingReviews: data.pendingReviews,
        avgRating: data.avgRating !== undefined ? parseFloat(data.avgRating.toFixed(1)) : null,
        totalRatings: data.totalRatings,
        avgReviewsPerUni: data.avgReviewsPerUni
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

  // All cards data - only show if data exists
  const mainCards = [
    { icon: GraduationCap, value: stats.universities, label: 'Total Universities', color: '#5b6cff', bg: '#e9ecff' },
    { icon: Star, value: stats.reviews, label: 'Total Reviews', color: '#f59e0b', bg: '#fef3c7' },
    { icon: Users, value: stats.users, label: 'Total Users', color: '#10b981', bg: '#d1fae5' },
    { icon: MessageCircle, value: stats.discussions, label: 'Discussions', color: '#8b5cf6', bg: '#ede9fe' },
    { icon: Clock, value: stats.pendingReviews, label: 'Pending Reviews', color: '#ef4444', bg: '#fee2e2' },
    { icon: Award, value: stats.avgRating, label: 'Average Rating', color: '#f59e0b', bg: '#fef3c7', suffix: '/5' },
    { icon: ThumbsUp, value: stats.totalRatings, label: 'Total Ratings', color: '#10b981', bg: '#d1fae5' },
    { icon: TrendingUp, value: stats.avgReviewsPerUni, label: 'Avg Reviews/Uni', color: '#5b6cff', bg: '#e9ecff' }
  ].filter(card => card.value !== null && card.value !== undefined);

  if (mainCards.length === 0) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Analytics Dashboard</h1>
          <p>Platform performance overview</p>
        </div>
        <div className="no-data-message">
          <p>No data available at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1>Analytics Dashboard</h1>
        <p>Platform performance overview</p>
      </div>

      {/* All Cards Grid */}
      <div className="cards-grid">
        {mainCards.map((card, index) => (
          <div key={index} className="stat-card">
            <div className="stat-card-icon" style={{ background: card.bg, color: card.color }}>
              <card.icon size={20} />
            </div>
            <div className="stat-card-value">
              {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
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