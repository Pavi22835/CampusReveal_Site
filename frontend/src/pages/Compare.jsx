import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import './Compare.css';

export default function Compare() {
  const [searchParams] = useSearchParams();
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get university IDs from URL query params
  const universityIds = searchParams.get('ids')?.split(',') || [];

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        setLoading(true);
        setError(null);

        if (universityIds.length === 0) {
          setUniversities([]);
          setLoading(false);
          return;
        }

        // Fetch each university
        const results = await Promise.all(
          universityIds.map((id) => api.getUniversityById?.(id))
        );

        const validUniversities = results.filter((result) => result?.success && result?.data);
        setUniversities(validUniversities.map((result) => result.data));
      } catch (err) {
        console.error('Error fetching universities for comparison:', err);
        setError('Failed to load universities for comparison');
      } finally {
        setLoading(false);
      }
    };

    fetchUniversities();
  }, [universityIds]);

  const handleRemove = (id) => {
    const updatedIds = universityIds.filter((uId) => uId !== id);
    const newParams = new URLSearchParams();
    if (updatedIds.length > 0) {
      newParams.set('ids', updatedIds.join(','));
    }
    window.history.replaceState({}, '', `/compare${updatedIds.length > 0 ? '?' + newParams : ''}`);
    setUniversities(universities.filter((u) => u.id !== id));
  };

  if (loading) {
    return (
      <div className="compare-page">
        <div className="compare__loading">Loading comparison...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="compare-page">
        <div className="compare__error">{error}</div>
      </div>
    );
  }

  if (universities.length === 0) {
    return (
      <div className="compare-page">
        <div className="compare__empty">
          <h2>No Universities Selected</h2>
          <p>Select multiple universities from the colleges page to compare them side by side.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="compare-page">
      <div className="compare__container">
        <h1 className="compare__title">Compare Universities</h1>

        <div className="compare__table-wrapper">
          <table className="compare__table">
            <thead>
              <tr>
                <th className="compare__field-header">Field</th>
                {universities.map((uni) => (
                  <th key={uni.id} className="compare__uni-header">
                    <div className="compare__uni-name">{uni.name}</div>
                    <button
                      className="compare__remove-btn"
                      onClick={() => handleRemove(uni.id)}
                      title="Remove from comparison"
                    >
                      ✕
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="compare__field">Location</td>
                {universities.map((uni) => (
                  <td key={uni.id}>{uni.location || 'N/A'}</td>
                ))}
              </tr>
              <tr>
                <td className="compare__field">Type</td>
                {universities.map((uni) => (
                  <td key={uni.id}>{uni.type || 'N/A'}</td>
                ))}
              </tr>
              <tr>
                <td className="compare__field">Rating</td>
                {universities.map((uni) => (
                  <td key={uni.id}>
                    <div className="compare__rating">
                      {uni.rating ? `${uni.rating}/5.0` : 'N/A'}
                    </div>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="compare__field">Reviews Count</td>
                {universities.map((uni) => (
                  <td key={uni.id}>{uni.reviewCount || 0}</td>
                ))}
              </tr>
              <tr>
                <td className="compare__field">Established</td>
                {universities.map((uni) => (
                  <td key={uni.id}>{uni.established || 'N/A'}</td>
                ))}
              </tr>
              <tr>
                <td className="compare__field">Website</td>
                {universities.map((uni) => (
                  <td key={uni.id}>
                    {uni.website ? (
                      <a href={uni.website} target="_blank" rel="noopener noreferrer">
                        Visit
                      </a>
                    ) : (
                      'N/A'
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
