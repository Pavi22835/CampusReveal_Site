import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { ArrowLeft, MapPin, Star, Users, Calendar, Building2, GraduationCap, DollarSign, Phone, Mail, Globe, Award, BookOpen, Wifi, Coffee, Dumbbell, Heart } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import './ViewUniversity.css';

const ViewUniversity = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [university, setUniversity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUniversity = async () => {
      try {
        const result = await api.getUniversity(id);
        if (result.success && result.data) {
          setUniversity(result.data);
        } else {
          setError(result.message || 'No Data Available');
        }
      } catch (err) {
        setError('Failed to load university details');
      } finally {
        setLoading(false);
      }
    };

    fetchUniversity();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return null;
    }
  };

  const formatLocation = () => {
    if (!university) return null;
    const parts = [];
    if (university.city) parts.push(university.city);
    if (university.state) parts.push(university.state);
    if (university.country && university.country !== 'India') parts.push(university.country);
    return parts.length > 0 ? parts.join(', ') : null;
  };

  const renderStars = (rating) => {
    if (!rating) return null;
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={`full-${i}`} className="star filled">★</span>);
    }
    if (hasHalfStar) {
      stars.push(<span key="half" className="star half">★</span>);
    }
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star empty">★</span>);
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Loading university details...</p>
      </div>
    );
  }

  if (error || !university) {
    return (
      <EmptyState 
        title="No Data Available"
        message={error || "University information not found"}
        actionButton="Back to Universities"
        onAction={() => navigate('/universities')}
      />
    );
  }

  return (
    <div className="view-university-page">
      <div className="page-header">
        <button onClick={() => navigate('/universities')} className="back-btn">
          <ArrowLeft size={18} />
          Back to Universities
        </button>
      </div>

      {/* Hero Section */}
      <div className="university-hero">
        <div className="hero-content">
          {university.logoUrl && (
            <div className="hero-logo">
              <img src={university.logoUrl} alt={university.name} />
            </div>
          )}
          <h1>{university.name}</h1>
          {university.shortName && <p className="short-name">{university.shortName}</p>}
          {formatLocation() && (
            <div className="hero-location">
              <MapPin size={18} />
              <span>{formatLocation()}</span>
            </div>
          )}
          {university.rating && (
            <div className="hero-rating">
              <div className="stars">{renderStars(university.rating)}</div>
              <span className="rating-value">{university.rating}</span>
            </div>
          )}
        </div>
      </div>

      <div className="university-content">
        {/* Basic Information Section */}
        {(university.established || university.type || university.category || university.naacGrade) && (
          <div className="info-section">
            <h2>
              <GraduationCap size={20} />
              Basic Information
            </h2>
            <div className="info-grid">
              {university.established && (
                <div className="info-item">
                  <label>Established</label>
                  <p>{university.established}</p>
                </div>
              )}
              {university.type && (
                <div className="info-item">
                  <label>Type</label>
                  <p>{university.type}</p>
                </div>
              )}
              {university.category && (
                <div className="info-item">
                  <label>Category</label>
                  <p>{university.category}</p>
                </div>
              )}
              {university.naacGrade && (
                <div className="info-item">
                  <label>NAAC Grade</label>
                  <p>{university.naacGrade}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Academic Information Section */}
        {(university.academicStreams?.length > 0 || 
          university.academicLevels?.length > 0 || 
          university.departments?.length > 0 || 
          university.offeredCourses?.length > 0 ||
          university.specializations ||
          university.affiliation ||
          university.approvedBy) && (
          <div className="info-section">
            <h2>
              <BookOpen size={20} />
              Academic Information
            </h2>
            {university.academicStreams?.length > 0 && (
              <div className="info-item full-width">
                <label>Academic Streams</label>
                <div className="tags">
                  {university.academicStreams.map((stream, idx) => (
                    <span key={idx} className="tag">{stream}</span>
                  ))}
                </div>
              </div>
            )}
            {university.academicLevels?.length > 0 && (
              <div className="info-item full-width">
                <label>Academic Levels</label>
                <div className="tags">
                  {university.academicLevels.map((level, idx) => (
                    <span key={idx} className="tag">{level}</span>
                  ))}
                </div>
              </div>
            )}
            {university.departments?.length > 0 && (
              <div className="info-item full-width">
                <label>Departments</label>
                <div className="tags">
                  {university.departments.map((dept, idx) => (
                    <span key={idx} className="tag">{dept}</span>
                  ))}
                </div>
              </div>
            )}
            {university.offeredCourses?.length > 0 && (
              <div className="info-item full-width">
                <label>Courses Offered</label>
                <div className="tags">
                  {university.offeredCourses.map((course, idx) => (
                    <span key={idx} className="tag course-tag">{course}</span>
                  ))}
                </div>
              </div>
            )}
            {university.specializations && (
              <div className="info-item full-width">
                <label>Specializations</label>
                <p>{university.specializations}</p>
              </div>
            )}
            {university.affiliation && (
              <div className="info-item">
                <label>Affiliation</label>
                <p>{university.affiliation}</p>
              </div>
            )}
            {university.approvedBy && (
              <div className="info-item">
                <label>Approved By</label>
                <p>{university.approvedBy}</p>
              </div>
            )}
          </div>
        )}

        {/* Facilities Section */}
        {university.campusFacilities?.length > 0 && (
          <div className="info-section">
            <h2>
              <Building2 size={20} />
              Campus Facilities
            </h2>
            <div className="facilities-grid">
              {university.campusFacilities.includes('library') && (
                <div className="facility-item"><BookOpen size={18} /> Library</div>
              )}
              {university.campusFacilities.includes('canteen') && (
                <div className="facility-item"><Coffee size={18} /> Canteen</div>
              )}
              {university.campusFacilities.includes('wifi') && (
                <div className="facility-item"><Wifi size={18} /> WiFi</div>
              )}
              {university.campusFacilities.includes('sports') && (
                <div className="facility-item"><Dumbbell size={18} /> Sports Complex</div>
              )}
              {university.campusFacilities.includes('gym') && (
                <div className="facility-item"><Heart size={18} /> Gym</div>
              )}
            </div>
            {university.hostelAvailable && university.hostelType && (
              <div className="info-item">
                <label>Hostel Available</label>
                <p>{university.hostelType} Hostel</p>
              </div>
            )}
            {university.transportAvailable && (
              <div className="info-item">
                <label>Transport</label>
                <p>Transport facility available</p>
              </div>
            )}
          </div>
        )}

        {/* Statistics Section */}
        {(university.studentCount || university.facultyCount || university.placementRate || university.highestPackage || university.averagePackage) && (
          <div className="info-section">
            <h2>
              <Users size={20} />
              Statistics
            </h2>
            <div className="stats-grid">
              {university.studentCount && (
                <div className="stat-item">
                  <label>Total Students</label>
                  <p>{university.studentCount.toLocaleString()}</p>
                </div>
              )}
              {university.facultyCount && (
                <div className="stat-item">
                  <label>Total Faculty</label>
                  <p>{university.facultyCount}</p>
                </div>
              )}
              {university.placementRate && (
                <div className="stat-item">
                  <label>Placement Rate</label>
                  <p>{university.placementRate}</p>
                </div>
              )}
              {university.highestPackage && (
                <div className="stat-item">
                  <label>Highest Package</label>
                  <p>{university.highestPackage}</p>
                </div>
              )}
              {university.averagePackage && (
                <div className="stat-item">
                  <label>Average Package</label>
                  <p>{university.averagePackage}</p>
                </div>
              )}
              {university.topRecruiters && (
                <div className="info-item full-width">
                  <label>Top Recruiters</label>
                  <p>{university.topRecruiters}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Fees Section */}
        {(university.tuitionFee || university.hostelFee) && (
          <div className="info-section">
            <h2>
              <DollarSign size={20} />
              Fees Structure
            </h2>
            <div className="info-grid">
              {university.tuitionFee && (
                <div className="info-item">
                  <label>Tuition Fee (per year)</label>
                  <p>{university.tuitionFee}</p>
                </div>
              )}
              {university.hostelFee && (
                <div className="info-item">
                  <label>Hostel Fee (per year)</label>
                  <p>{university.hostelFee}</p>
                </div>
              )}
              {university.scholarshipAvailable && (
                <div className="info-item">
                  <label>Scholarship</label>
                  <p>Available</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contact Information Section */}
        {(university.website || university.phone || university.email || university.instagram || university.linkedin || university.facebook || university.youtube) && (
          <div className="info-section">
            <h2>
              <Globe size={20} />
              Contact & Social
            </h2>
            <div className="info-grid">
              {university.website && (
                <div className="info-item">
                  <label>Website</label>
                  <p><a href={university.website} target="_blank" rel="noopener noreferrer">{university.website}</a></p>
                </div>
              )}
              {university.phone && (
                <div className="info-item">
                  <label>Phone</label>
                  <p><a href={`tel:${university.phone}`}>{university.phone}</a></p>
                </div>
              )}
              {university.email && (
                <div className="info-item">
                  <label>Email</label>
                  <p><a href={`mailto:${university.email}`}>{university.email}</a></p>
                </div>
              )}
              {university.instagram && (
                <div className="info-item">
                  <label>Instagram</label>
                  <p><a href={university.instagram} target="_blank" rel="noopener noreferrer">Follow on Instagram</a></p>
                </div>
              )}
              {university.linkedin && (
                <div className="info-item">
                  <label>LinkedIn</label>
                  <p><a href={university.linkedin} target="_blank" rel="noopener noreferrer">Connect on LinkedIn</a></p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Description Section */}
        {university.description && (
          <div className="info-section">
            <h2>Description</h2>
            <div className="description-content">
              <p>{university.description}</p>
            </div>
          </div>
        )}

        {/* Mission & Vision Section */}
        {(university.mission || university.vision) && (
          <div className="info-section">
            <h2>
              <Award size={20} />
              Institutional Vision
            </h2>
            {university.mission && (
              <div className="mission-vision">
                <label>Mission</label>
                <p>{university.mission}</p>
              </div>
            )}
            {university.vision && (
              <div className="mission-vision">
                <label>Vision</label>
                <p>{university.vision}</p>
              </div>
            )}
          </div>
        )}

        {/* Gallery Section */}
        {university.images && university.images.length > 0 && (
          <div className="info-section">
            <h2>Gallery</h2>
            <div className="gallery-grid">
              {university.images.map((img, idx) => (
                <div key={idx} className="gallery-image">
                  <img src={img} alt={`${university.name} - ${idx + 1}`} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Campus Video */}
        {university.campusVideoUrl && (
          <div className="info-section">
            <h2>Campus Tour</h2>
            <div className="video-container">
              <iframe
                src={university.campusVideoUrl.replace('watch?v=', 'embed/')}
                title="Campus Tour"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        )}

        {/* Google Maps */}
        {university.mapLink && (
          <div className="info-section">
            <h2>Location Map</h2>
            <div className="map-container">
              <iframe
                src={university.mapLink}
                title="University Location"
                frameBorder="0"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewUniversity;