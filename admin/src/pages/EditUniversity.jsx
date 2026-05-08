import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  ArrowLeft, 
  Save, 
  MapPin, 
  GraduationCap,
  Building,
  AlertCircle,
  BookOpen,
  TrendingUp,
  DollarSign,
  Globe,
  Phone,
  Mail,
  Upload,
  X,
  Filter,
  Bus,
  Home,
  Users,
  Award
} from 'lucide-react';
import './EditUniversity.css';

// Custom SVG Icons for Social Media
const InstagramIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const LinkedinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const TwitterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
  </svg>
);

const EditUniversity = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [existingImages, setExistingImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [activeSection, setActiveSection] = useState('basic');
  
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    shortName: '',
    established: '',
    type: '',
    category: '',
    
    // Location
    location: '',
    city: '',
    state: '',
    pincode: '',
    googleMapsLink: '',
    
    // Academic Details
    accreditation: '',
    affiliation: '',
    mission: '',
    vision: '',
    
    // NEW FILTER FIELDS - Academic Stream, Level, Department
    academicStream: '',
    academicLevel: '',
    department: '',
    offeredCourses: [],
    entranceExam: '',
    
    // Statistics
    rating: 0,
    studentCount: '',
    facultyCount: '',
    placementRate: '',
    medianSalary: '',
    
    // Transport & Facilities
    transportScore: 50,
    walkScore: '',
    walkDescription: '',
    transit: '',
    transitDetail: '',
    
    // Additional Filters
    scholarship: false,
    hostelAvailable: false,
    genderType: 'CO_ED',
    religiousAffiliation: '',
    
    // Fees
    tuitionFee: '',
    hostelFee: '',
    
    // Contact & Social
    description: '',
    imageUrl: '',
    phone: '',
    email: '',
    website: '',
    instagram: '',
    linkedin: '',
    twitter: ''
  });

  // Dropdown options (same as AddUniversity)
  const academicStreams = [
    { value: '', label: 'Select Academic Stream' },
    { value: 'Engineering', label: 'Engineering' },
    { value: 'Arts', label: 'Arts' },
    { value: 'Commerce', label: 'Commerce' },
    { value: 'Science', label: 'Science' },
    { value: 'Law', label: 'Law' },
    { value: 'Management', label: 'Management' },
    { value: 'Agriculture', label: 'Agriculture' },
    { value: 'Design', label: 'Design' },
    { value: 'Architecture', label: 'Architecture' }
  ];

  const academicLevels = [
    { value: '', label: 'Select Academic Level' },
    { value: 'UG', label: 'Undergraduate (UG)' },
    { value: 'PG', label: 'Postgraduate (PG)' },
    { value: 'Diploma', label: 'Diploma' },
    { value: 'PhD', label: 'PhD / Doctorate' },
    { value: 'Certificate', label: 'Certificate Courses' },
    { value: 'Integrated', label: 'Integrated (UG+PG)' }
  ];

  const departments = [
    { value: '', label: 'Select Department' },
    { value: 'Computer Science', label: 'Computer Science' },
    { value: 'Mechanical Engineering', label: 'Mechanical Engineering' },
    { value: 'Civil Engineering', label: 'Civil Engineering' },
    { value: 'Electronics', label: 'Electronics & Communication' },
    { value: 'Electrical', label: 'Electrical Engineering' },
    { value: 'Business Administration', label: 'Business Administration' },
    { value: 'Economics', label: 'Economics' },
    { value: 'Physics', label: 'Physics' },
    { value: 'Chemistry', label: 'Chemistry' },
    { value: 'Mathematics', label: 'Mathematics' },
    { value: 'Law', label: 'Law' }
  ];

  const allCourses = [
    'B.Tech', 'M.Tech', 'BBA', 'MBA', 'BCA', 'MCA',
    'B.Com', 'M.Com', 'BA', 'MA', 'B.Sc', 'M.Sc', 'LLB', 'LLM',
    'B.Arch', 'B.Des', 'B.Ed', 'M.Ed'
  ];

  const entranceExams = [
    { value: '', label: 'Select Entrance Exam' },
    { value: 'JEE Main', label: 'JEE Main' },
    { value: 'JEE Advanced', label: 'JEE Advanced' },
    { value: 'CAT', label: 'CAT' },
    { value: 'MAT', label: 'MAT' },
    { value: 'XAT', label: 'XAT' },
    { value: 'GATE', label: 'GATE' },
    { value: 'CLAT', label: 'CLAT' },
    { value: 'NATA', label: 'NATA' },
    { value: 'NID DAT', label: 'NID DAT' }
  ];

  const genderTypes = [
    { value: 'CO_ED', label: 'Co-educational' },
    { value: 'WOMEN_ONLY', label: 'Women Only' },
    { value: 'MEN_ONLY', label: 'Men Only' }
  ];

  const sections = [
    { id: 'basic', label: 'Basic Info', icon: GraduationCap, description: 'University name, type, and category' },
    { id: 'academic', label: 'Academic', icon: BookOpen, description: 'Stream, level, department, courses' },
    { id: 'filters', label: 'Filters', icon: Filter, description: 'Transport, facilities, scholarships' },
    { id: 'location', label: 'Location', icon: MapPin, description: 'Address, city, and state details' },
    { id: 'stats', label: 'Statistics', icon: TrendingUp, description: 'Ratings, students, placements' },
    { id: 'fees', label: 'Fees', icon: DollarSign, description: 'Tuition and hostel fees' },
    { id: 'description', label: 'Description', icon: Building, description: 'About the university & contact' }
  ];

  useEffect(() => {
    fetchUniversity();
  }, [id]);

  const fetchUniversity = async () => {
    try {
      const result = await api.getUniversity(id);
      if (result.success && result.data) {
        const uni = result.data;
        
        setFormData({
          // Basic Info
          name: uni.name || '',
          shortName: uni.shortName || '',
          established: uni.established || '',
          type: uni.type || '',
          category: uni.category || '',
          
          // Location
          location: uni.location || '',
          city: uni.city || '',
          state: uni.state || '',
          pincode: uni.pincode || '',
          googleMapsLink: uni.googleMapsLink || '',
          
          // Academic Details
          accreditation: uni.accreditation || '',
          affiliation: uni.affiliation || '',
          mission: uni.mission || '',
          vision: uni.vision || '',
          
          // NEW FILTER FIELDS
          academicStream: uni.academicStream || '',
          academicLevel: uni.academicLevel || '',
          department: uni.department || '',
          offeredCourses: uni.offeredCourses || [],
          entranceExam: uni.entranceExam || '',
          
          // Statistics
          rating: uni.rating || 0,
          studentCount: uni.studentCount || '',
          facultyCount: uni.facultyCount || '',
          placementRate: uni.placementRate || '',
          medianSalary: uni.medianSalary || '',
          
          // Transport & Facilities
          transportScore: uni.transportScore || 50,
          walkScore: uni.walkScore || '',
          walkDescription: uni.walkDescription || '',
          transit: uni.transit || '',
          transitDetail: uni.transitDetail || '',
          
          // Additional Filters
          scholarship: uni.scholarship || false,
          hostelAvailable: uni.hostelAvailable || false,
          genderType: uni.genderType || 'CO_ED',
          religiousAffiliation: uni.religiousAffiliation || '',
          
          // Fees
          tuitionFee: uni.tuitionFee || '',
          hostelFee: uni.hostelFee || '',
          
          // Contact & Social
          description: uni.description || '',
          imageUrl: uni.imageUrl || '',
          phone: uni.phone || '',
          email: uni.email || '',
          website: uni.website || '',
          instagram: uni.instagram || '',
          linkedin: uni.linkedin || '',
          twitter: uni.twitter || ''
        });
        setExistingImages(Array.isArray(uni.images) ? uni.images : []);
      }
    } catch (error) {
      console.error('Error fetching university:', error);
      setError('Failed to load university data');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    setError('');
  };

  const handleMultiSelect = (e) => {
    const options = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({ ...prev, offeredCourses: options }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (existingImages.length + previewImages.length + files.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImages(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    if (index < existingImages.length) {
      setExistingImages(prev => prev.filter((_, i) => i !== index));
      return;
    }
    const previewIndex = index - existingImages.length;
    setPreviewImages(prev => prev.filter((_, i) => i !== previewIndex));
  };

  const currentSectionIndex = sections.findIndex((section) => section.id === activeSection);
  const isFirstSection = currentSectionIndex === 0;
  const isLastSection = currentSectionIndex === sections.length - 1;

  const goToSection = (index) => {
    if (index >= 0 && index < sections.length) {
      setActiveSection(sections[index].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const nextSection = () => {
    goToSection(currentSectionIndex + 1);
  };

  const prevSection = () => {
    goToSection(currentSectionIndex - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const submitData = {
        // Basic Info
        name: formData.name.trim(),
        shortName: formData.shortName || '',
        established: formData.established || '',
        type: formData.type || '',
        category: formData.category || '',
        
        // Location
        location: formData.location || `${formData.city || ''}, ${formData.state || ''}`,
        city: formData.city || '',
        state: formData.state || '',
        pincode: formData.pincode || '',
        googleMapsLink: formData.googleMapsLink || '',
        
        // Academic Details
        accreditation: formData.accreditation || '',
        affiliation: formData.affiliation || '',
        mission: formData.mission || '',
        vision: formData.vision || '',
        
        // NEW FILTER FIELDS
        academicStream: formData.academicStream || '',
        academicLevel: formData.academicLevel || '',
        department: formData.department || '',
        offeredCourses: formData.offeredCourses || [],
        entranceExam: formData.entranceExam || '',
        
        // Statistics
        rating: parseFloat(formData.rating) || 0,
        studentCount: parseInt(formData.studentCount) || 0,
        facultyCount: formData.facultyCount || '',
        placementRate: formData.placementRate || '',
        medianSalary: formData.medianSalary || '',
        
        // Transport & Facilities
        transportScore: parseInt(formData.transportScore) || 50,
        walkScore: formData.walkScore ? parseInt(formData.walkScore) : null,
        walkDescription: formData.walkDescription || '',
        transit: formData.transit || '',
        transitDetail: formData.transitDetail || '',
        
        // Additional Filters
        scholarship: formData.scholarship,
        hostelAvailable: formData.hostelAvailable,
        genderType: formData.genderType,
        religiousAffiliation: formData.religiousAffiliation || '',
        
        // Fees
        tuitionFee: formData.tuitionFee || '',
        hostelFee: formData.hostelFee || '',
        
        // Contact & Social
        description: formData.description || '',
        imageUrl: formData.imageUrl || '',
        phone: formData.phone || '',
        email: formData.email || '',
        website: formData.website || '',
        instagram: formData.instagram || '',
        linkedin: formData.linkedin || '',
        twitter: formData.twitter || '',
        
        images: [...existingImages, ...previewImages]
      };
      
      const result = await api.updateUniversity(id, submitData, token);
      
      if (result.success) {
        alert('University updated successfully!');
        navigate('/admin/universities');
      } else {
        setError(result.message || 'Failed to update university');
      }
    } catch (error) {
      console.error('Update error:', error);
      setError(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="loading-state">Loading university details...</div>;
  }

  return (
    <div className="edit-university-page">
      <div className="page-header">
        <button onClick={() => navigate('/admin/universities')} className="back-btn">
          <ArrowLeft size={18} />
          Back to Universities
        </button>
        <div>
          <h1>Edit University</h1>
          <p>Update the university details</p>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="edit-university-form">
        {/* Section Navigation */}
        <div className="form-nav">
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              className={`nav-btn ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              <section.icon size={18} />
              <div className="nav-text">
                <span className="nav-label">{section.label}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="form-layout">
          <div className="form-main">
            {/* Basic Information Section */}
            <div className={`form-section ${activeSection === 'basic' ? 'active' : ''}`}>
              <div className="section-header">
                <GraduationCap size={22} />
                <h2>Basic Information</h2>
              </div>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>University Name <span className="required">*</span></label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    required 
                    placeholder="e.g., Indian Institute of Technology Madras"
                  />
                </div>
                <div className="form-group">
                  <label>Short Name</label>
                  <input type="text" name="shortName" value={formData.shortName} onChange={handleChange} placeholder="e.g., IIT Madras" />
                </div>
                <div className="form-group">
                  <label>Established Year</label>
                  <input type="text" name="established" value={formData.established} onChange={handleChange} placeholder="e.g., 1959" />
                </div>
                <div className="form-group">
                  <label>University Type</label>
                  <select name="type" value={formData.type} onChange={handleChange}>
                    <option value="">Select Type</option>
                    <option value="Government">Government</option>
                    <option value="Private">Private</option>
                    <option value="Deemed">Deemed University</option>
                    <option value="Central">Central University</option>
                    <option value="State">State University</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select name="category" value={formData.category} onChange={handleChange}>
                    <option value="">Select Category</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Arts & Science">Arts & Science</option>
                    <option value="Law">Law</option>
                    <option value="Management">Management</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Image URL</label>
                  <input type="url" name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="https://example.com/university-image.jpg" />
                </div>
              </div>
            </div>

            {/* Academic Details Section with Filter Fields */}
            <div className={`form-section ${activeSection === 'academic' ? 'active' : ''}`}>
              <div className="section-header">
                <BookOpen size={22} />
                <h2>Academic Details</h2>
              </div>
              
              {/* Academic Classification */}
              <div className="sub-section">
                <h3 className="sub-section-title">Academic Classification</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Academic Stream</label>
                    <select name="academicStream" value={formData.academicStream} onChange={handleChange}>
                      {academicStreams.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Academic Level</label>
                    <select name="academicLevel" value={formData.academicLevel} onChange={handleChange}>
                      {academicLevels.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Department</label>
                    <select name="department" value={formData.department} onChange={handleChange}>
                      {departments.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Courses Offered</label>
                    <select multiple name="offeredCourses" value={formData.offeredCourses} onChange={handleMultiSelect} style={{ height: '120px' }}>
                      {allCourses.map(course => (
                        <option key={course} value={course}>{course}</option>
                      ))}
                    </select>
                    <small>Hold Ctrl/Cmd to select multiple</small>
                  </div>
                  <div className="form-group">
                    <label>Entrance Exam Required</label>
                    <select name="entranceExam" value={formData.entranceExam} onChange={handleChange}>
                      {entranceExams.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Accreditation & Affiliation */}
              <div className="sub-section">
                <h3 className="sub-section-title">Accreditation & Affiliation</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Accreditation</label>
                    <input type="text" name="accreditation" value={formData.accreditation} onChange={handleChange} placeholder="e.g., NAAC A++" />
                  </div>
                  <div className="form-group">
                    <label>Affiliation</label>
                    <input type="text" name="affiliation" value={formData.affiliation} onChange={handleChange} placeholder="e.g., Anna University" />
                  </div>
                </div>
              </div>

              {/* Mission & Vision */}
              <div className="sub-section">
                <h3 className="sub-section-title">Mission & Vision</h3>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Mission</label>
                    <textarea name="mission" value={formData.mission} onChange={handleChange} rows="3" placeholder="University mission statement..." />
                  </div>
                  <div className="form-group full-width">
                    <label>Vision</label>
                    <textarea name="vision" value={formData.vision} onChange={handleChange} rows="3" placeholder="University vision statement..." />
                  </div>
                </div>
              </div>
            </div>

            {/* Filters Section - Transport, Facilities, Scholarships */}
            <div className={`form-section ${activeSection === 'filters' ? 'active' : ''}`}>
              <div className="section-header">
                <Filter size={22} />
                <h2>Filters & Facilities</h2>
              </div>
              
              {/* Transport */}
              <div className="sub-section">
                <h3 className="sub-section-title"><Bus size={16} /> Transport & Walkability</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Transport Score (0-100)</label>
                    <input 
                      type="range" 
                      name="transportScore" 
                      min="0" 
                      max="100" 
                      value={formData.transportScore} 
                      onChange={handleChange}
                    />
                    <span className="range-value">{formData.transportScore}/100</span>
                  </div>
                  <div className="form-group">
                    <label>Walk Score</label>
                    <input type="number" name="walkScore" value={formData.walkScore} onChange={handleChange} placeholder="e.g., 85" />
                  </div>
                  <div className="form-group">
                    <label>Walk Description</label>
                    <input type="text" name="walkDescription" value={formData.walkDescription} onChange={handleChange} placeholder="e.g., Walker's Paradise" />
                  </div>
                  <div className="form-group">
                    <label>Transit Options</label>
                    <input type="text" name="transit" value={formData.transit} onChange={handleChange} placeholder="e.g., Metro, Bus" />
                  </div>
                  <div className="form-group full-width">
                    <label>Transit Details</label>
                    <input type="text" name="transitDetail" value={formData.transitDetail} onChange={handleChange} placeholder="e.g., Closest metro station: Central" />
                  </div>
                </div>
              </div>

              {/* Facilities & Amenities */}
              <div className="sub-section">
                <h3 className="sub-section-title"><Home size={16} /> Facilities & Amenities</h3>
                <div className="form-grid checkboxes">
                  <label className="checkbox-label">
                    <input type="checkbox" name="scholarship" checked={formData.scholarship} onChange={handleChange} />
                    <span>Scholarship Available</span>
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" name="hostelAvailable" checked={formData.hostelAvailable} onChange={handleChange} />
                    <span>Hostel Available</span>
                  </label>
                </div>
              </div>

              {/* Gender & Religious Affiliation */}
              <div className="sub-section">
                <h3 className="sub-section-title"><Users size={16} /> Demographics</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Gender Type</label>
                    <select name="genderType" value={formData.genderType} onChange={handleChange}>
                      {genderTypes.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Religious Affiliation</label>
                    <input type="text" name="religiousAffiliation" value={formData.religiousAffiliation} onChange={handleChange} placeholder="e.g., Christian, Hindu, Muslim, None" />
                  </div>
                </div>
              </div>
            </div>

            {/* Location Information Section */}
            <div className={`form-section ${activeSection === 'location' ? 'active' : ''}`}>
              <div className="section-header">
                <MapPin size={22} />
                <h2>Location Details</h2>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>City</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="e.g., Chennai" />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input type="text" name="state" value={formData.state} onChange={handleChange} placeholder="e.g., Tamil Nadu" />
                </div>
                <div className="form-group">
                  <label>Pincode</label>
                  <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} placeholder="e.g., 600036" />
                </div>
                <div className="form-group full-width">
                  <label>Full Address</label>
                  <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="e.g., Chennai, Tamil Nadu" />
                </div>
                <div className="form-group full-width">
                  <label>Google Maps Link</label>
                  <input type="url" name="googleMapsLink" value={formData.googleMapsLink} onChange={handleChange} placeholder="https://www.google.com/maps/place/..." />
                </div>
              </div>
            </div>

            {/* Statistics Section */}
            <div className={`form-section ${activeSection === 'stats' ? 'active' : ''}`}>
              <div className="section-header">
                <TrendingUp size={22} />
                <h2>Statistics & Ratings</h2>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Rating (0-5)</label>
                  <input 
                    type="number" 
                    name="rating" 
                    step="0.1" 
                    min="0" 
                    max="5" 
                    value={formData.rating} 
                    onChange={handleChange} 
                  />
                </div>
                <div className="form-group">
                  <label>Total Students</label>
                  <input 
                    type="number" 
                    name="studentCount" 
                    value={formData.studentCount} 
                    onChange={handleChange} 
                    placeholder="e.g., 10000" 
                  />
                </div>
                <div className="form-group">
                  <label>Total Faculty</label>
                  <input 
                    type="text" 
                    name="facultyCount" 
                    value={formData.facultyCount} 
                    onChange={handleChange} 
                    placeholder="e.g., 500" 
                  />
                </div>
                <div className="form-group">
                  <label>Placement Rate (%)</label>
                  <input type="text" name="placementRate" value={formData.placementRate} onChange={handleChange} placeholder="e.g., 85%" />
                </div>
                <div className="form-group">
                  <label>Median Salary</label>
                  <input type="text" name="medianSalary" value={formData.medianSalary} onChange={handleChange} placeholder="e.g., ₹8 LPA" />
                </div>
              </div>
            </div>

            {/* Fees Structure Section */}
            <div className={`form-section ${activeSection === 'fees' ? 'active' : ''}`}>
              <div className="section-header">
                <DollarSign size={22} />
                <h2>Fee Structure</h2>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Tuition Fee (per year)</label>
                  <input type="text" name="tuitionFee" value={formData.tuitionFee} onChange={handleChange} placeholder="e.g., ₹2,00,000" />
                </div>
                <div className="form-group">
                  <label>Hostel Fee (per year)</label>
                  <input type="text" name="hostelFee" value={formData.hostelFee} onChange={handleChange} placeholder="e.g., ₹80,000" />
                </div>
              </div>
            </div>

            {/* Description Section with Contact & Social Media */}
            <div className={`form-section ${activeSection === 'description' ? 'active' : ''}`}>
              <div className="section-header">
                <Building size={22} />
                <h2>About the University</h2>
              </div>
              
              {/* Description */}
              <div className="form-group full-width">
                <label>Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows="6" placeholder="Detailed description of the university..." />
              </div>

              {/* Contact Information */}
              <div className="sub-section">
                <h3 className="sub-section-title">Contact Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label><Globe size={14} /> Website</label>
                    <input type="url" name="website" value={formData.website} onChange={handleChange} placeholder="https://www.university.edu" />
                  </div>
                  <div className="form-group">
                    <label><Phone size={14} /> Phone Number</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="e.g., 044-2257 8000" />
                  </div>
                  <div className="form-group full-width">
                    <label><Mail size={14} /> Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="admin@university.edu" />
                  </div>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="sub-section">
                <h3 className="sub-section-title">Social Media Links</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label><InstagramIcon /> Instagram</label>
                    <input 
                      type="url" 
                      name="instagram" 
                      value={formData.instagram} 
                      onChange={handleChange} 
                      placeholder="https://instagram.com/university"
                    />
                  </div>
                  <div className="form-group">
                    <label><LinkedinIcon /> LinkedIn</label>
                    <input 
                      type="url" 
                      name="linkedin" 
                      value={formData.linkedin} 
                      onChange={handleChange} 
                      placeholder="https://linkedin.com/school/university"
                    />
                  </div>
                  <div className="form-group full-width">
                    <label><TwitterIcon /> X (Twitter)</label>
                    <input 
                      type="url" 
                      name="twitter" 
                      value={formData.twitter} 
                      onChange={handleChange} 
                      placeholder="https://twitter.com/university"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Image Upload */}
          <div className="form-sidebar">
            <div className="sidebar-card">
              <h3><Upload size={18} /> University Images</h3>
              <div className="image-grid">
                {[...existingImages, ...previewImages].map((img, idx) => (
                  <div key={idx} className="image-item">
                    <img src={img} alt={`University ${idx + 1}`} />
                    <button type="button" onClick={() => removeImage(idx)} className="remove-image-btn">
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {(existingImages.length + previewImages.length) < 5 && (
                  <label className="image-upload-btn">
                    <Upload size={24} />
                    <span>Upload</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} hidden multiple />
                  </label>
                )}
              </div>
              <p className="image-hint">{5 - (existingImages.length + previewImages.length)} images remaining</p>
            </div>

            <div className="sidebar-card preview-card">
              <div className="preview-header">
                <h3>Preview</h3>
                <span className="preview-badge">Live</span>
              </div>
              <div className="preview-image-wrap">
                {[...existingImages, ...previewImages][0] ? (
                  <img src={[...existingImages, ...previewImages][0]} alt="Preview cover" />
                ) : (
                  <div className="preview-placeholder">Image preview will appear here</div>
                )}
              </div>
              <div className="preview-details">
                <h4>{formData.name || 'University Name'}</h4>
                <p className="preview-subtitle">{formData.location || 'City, State'}</p>
                <div className="preview-meta">
                  <span>{formData.rating ? `Rating ${formData.rating}` : 'Rating 4.0'}</span>
                  <span>{formData.category || 'Category'}</span>
                  {formData.academicStream && <span className="preview-badge-small">{formData.academicStream}</span>}
                </div>
                <p className="preview-description">
                  {formData.description ? formData.description.slice(0, 120) + (formData.description.length > 120 ? '...' : '') : 'Add a short description to see it here.'}
                </p>
                {formData.website && (
                  <a href={formData.website} target="_blank" rel="noreferrer">{formData.website}</a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={prevSection} className="secondary-btn" disabled={isFirstSection}>
            Previous
          </button>
          <button type="button" onClick={() => navigate('/admin/universities')} className="cancel-btn">Cancel</button>
          {!isLastSection ? (
            <button type="button" onClick={nextSection} className="submit-btn">
              Next
            </button>
          ) : (
            <button type="submit" disabled={loading} className="submit-btn">
              <Save size={18} />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default EditUniversity;