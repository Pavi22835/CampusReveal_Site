import React, { useState, useEffect } from 'react';
import { X, User, GraduationCap, BookOpen, Calendar, Mail, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import './ProfileDetailsModal.css';

const ProfileDetailsModal = ({ isOpen, onClose, onSuccess }) => {
  const { user, updateUserProfile, showToast } = useAuth();
  const [loading, setLoading] = useState(false);
  const [colleges, setColleges] = useState([]);
  const [selectedUniversityId, setSelectedUniversityId] = useState(null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    collegeName: '',
    department: '',
    graduationYear: '',
    email: user?.email || ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const result = await api.getUniversities({ limit: 100 });
        if (result.success && result.data) {
          setColleges(result.data);
        }
      } catch (error) {
        console.error('Error fetching colleges:', error);
      }
    };
    fetchColleges();
  }, []);

  useEffect(() => {
    if (isOpen) {
      const uniId = localStorage.getItem('reviewUniversityId');
      if (uniId) {
        setSelectedUniversityId(uniId);
      }
      
      if (user) {
        if (user.name && !formData.name) {
          setFormData(prev => ({ ...prev, name: user.name }));
        }
        if (user.major && !formData.department) {
          setFormData(prev => ({ ...prev, department: user.major }));
        }
        if (user.graduationYear && !formData.graduationYear) {
          setFormData(prev => ({ ...prev, graduationYear: user.graduationYear.toString() }));
        }
      }
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.collegeName.trim()) newErrors.collegeName = 'College name is required';
    if (!formData.department.trim()) newErrors.department = 'Department is required';
    if (!formData.graduationYear) newErrors.graduationYear = 'Passed out year is required';
    else if (formData.graduationYear < 1950 || formData.graduationYear > 2030) {
      newErrors.graduationYear = 'Please enter a valid year';
    }
    return newErrors;
  };

  const findOrCreateUniversity = async (collegeName) => {
    try {
      const result = await api.getUniversities({ search: collegeName, limit: 5 });
      if (result.success && result.data && result.data.length > 0) {
        const found = result.data.find(u => 
          u.name.toLowerCase() === collegeName.toLowerCase() ||
          u.name.toLowerCase().includes(collegeName.toLowerCase())
        );
        if (found) return found.id;
      }
      
      const createResult = await api.createUniversity({
        name: collegeName,
        location: 'Not specified',
        city: 'Not specified',
        state: 'Tamil Nadu',
        description: 'Added by user during review'
      }, localStorage.getItem('token'));
      
      if (createResult.success && createResult.data) {
        return createResult.data.id;
      }
      
      return null;
    } catch (error) {
      console.error('Error finding/creating university:', error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      let universityId = selectedUniversityId;
      if (!universityId && formData.collegeName) {
        universityId = await findOrCreateUniversity(formData.collegeName);
      }

      const profileData = {
        name: formData.name,
        universityId: universityId,
        collegeName: formData.collegeName,
        department: formData.department,
        graduationYear: parseInt(formData.graduationYear),
        email: formData.email
      };

      const result = await updateUserProfile(profileData);
      
      if (result.success) {
        // STORE ALL DATA IN LOCALSTORAGE
        if (universityId) {
          localStorage.setItem('reviewUniversityId', universityId);
          localStorage.setItem('reviewUniversityName', formData.collegeName);
        }
        localStorage.setItem('userDepartment', formData.department);
        localStorage.setItem('userGraduationYear', formData.graduationYear);
        localStorage.setItem('userCollegeName', formData.collegeName);
        
        if (showToast) {
          showToast('Your profile has been verified!', 'success');
        } else {
          alert('Your profile has been verified!');
        }
        
        if (onSuccess) {
          onSuccess(universityId);
        }
        
        onClose();
      } else {
        if (showToast) {
          showToast(result.message || 'Failed to verify profile', 'error');
        } else {
          alert(result.message || 'Failed to verify profile');
        }
      }
    } catch (error) {
      console.error('Profile submission error:', error);
      if (showToast) {
        showToast('Something went wrong. Please try again.', 'error');
      } else {
        alert('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="profile-modal-header">
          <div className="profile-modal-icon">
            <CheckCircle size={28} />
          </div>
          <h2>Complete Your Profile</h2>
          <p>Please provide your details to continue</p>
          <button className="profile-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="profile-modal-form">
          <div className="profile-form-group">
            <label>
              <User size={16} />
              Full Name <span className="required">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="profile-form-group">
            <label>
              <GraduationCap size={16} />
              College Name <span className="required">*</span>
            </label>
            <input
              type="text"
              name="collegeName"
              value={formData.collegeName}
              onChange={handleChange}
              placeholder="Enter your college name"
              className={errors.collegeName ? 'error' : ''}
              list="colleges-list"
              autoComplete="off"
            />
            <datalist id="colleges-list">
              {colleges.map(college => (
                <option key={college.id} value={college.name} />
              ))}
            </datalist>
            {errors.collegeName && <span className="error-text">{errors.collegeName}</span>}
          </div>

          <div className="profile-form-group">
            <label>
              <BookOpen size={16} />
              Department <span className="required">*</span>
            </label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="e.g., Computer Science, Mechanical Engineering"
              className={errors.department ? 'error' : ''}
            />
            {errors.department && <span className="error-text">{errors.department}</span>}
          </div>

          <div className="profile-form-group">
            <label>
              <Calendar size={16} />
              Passed Out Year <span className="required">*</span>
            </label>
            <select
              name="graduationYear"
              value={formData.graduationYear}
              onChange={handleChange}
              className={errors.graduationYear ? 'error' : ''}
            >
              <option value="">Select year</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            {errors.graduationYear && <span className="error-text">{errors.graduationYear}</span>}
          </div>

          <div className="profile-form-group">
            <label>
              <Mail size={16} />
              Email (Optional)
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
            />
          </div>

          <button type="submit" className="profile-submit-btn" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify & Continue'}
          </button>
        </form>

        <p className="profile-modal-footer">
          Your information helps us personalize your experience
        </p>
      </div>
    </div>
  );
};

export default ProfileDetailsModal;