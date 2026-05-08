import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { ArrowLeft } from 'lucide-react';
import './EditUniversity.css';

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
          setError(result.message || 'University not found');
        }
      } catch (err) {
        setError('Failed to load university details');
      } finally {
        setLoading(false);
      }
    };

    fetchUniversity();
  }, [id]);

  if (loading) {
    return <div className="loading-state">Loading university details...</div>;
  }

  if (error) {
    return (
      <div className="loading-state">
        <p>{error}</p>
        <button className="submit-btn" onClick={() => navigate('/universities')}>Back</button>
      </div>
    );
  }

  return (
    <div className="edit-university-page">
      <div className="page-header">
        <button onClick={() => navigate('/universities')} className="back-btn">
          <ArrowLeft size={18} />
          Back to Universities
        </button>
        <h1>{university.name}</h1>
        <p>View university details</p>
      </div>

      <div className="edit-form">
        <div className="form-grid">
          <div className="form-group">
            <label>Location</label>
            <p>{university.location || 'N/A'}</p>
          </div>
          <div className="form-group">
            <label>City</label>
            <p>{university.city || 'N/A'}</p>
          </div>
          <div className="form-group">
            <label>State</label>
            <p>{university.state || 'N/A'}</p>
          </div>
          <div className="form-group">
            <label>Rating</label>
            <p>{university.rating ?? 'N/A'}</p>
          </div>
          <div className="form-group">
            <label>Student Count</label>
            <p>{university.studentCount?.toLocaleString() || 'N/A'}</p>
          </div>
          <div className="form-group full-width">
            <label>Description</label>
            <p>{university.description || 'No description available.'}</p>
          </div>
          <div className="form-group full-width">
            <label>Images</label>
            <div className="image-previews">
              {(university.images || []).length > 0 ? (
                university.images.map((img, idx) => (
                  <div key={idx} className="image-preview-card">
                    <img src={img} alt={`University ${idx + 1}`} />
                  </div>
                ))
              ) : (
                <p>No images uploaded.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewUniversity;
