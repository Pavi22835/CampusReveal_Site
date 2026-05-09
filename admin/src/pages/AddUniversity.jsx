import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  X, 
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
  Filter,
  Bus,
  Home,
  Users,
  Image,
  CheckCircle,
  ChevronRight
} from 'lucide-react';
import './AddUniversity.css';

// Custom SVG Icons for Social Media
const InstagramIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const LinkedinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const TwitterIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
  </svg>
);

const AddUniversity = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [logoPreview, setLogoPreview] = useState('');
  const [activeSection, setActiveSection] = useState('basic');
  const [error, setError] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    shortName: '',
    established: '',
    type: '',
    category: '',
    location: '',
    city: '',
    state: 'Tamil Nadu',
    pincode: '',
    googleMapsLink: '',
    accreditation: '',
    affiliation: '',
    mission: '',
    vision: '',
    academicStream: '',
    academicLevel: '',
    department: '',
    offeredCourses: [],
    entranceExam: '',
    rating: 4.0,
    studentCount: '',
    facultyCount: '',
    placementRate: '',
    medianSalary: '',
    transportScore: 50,
    walkScore: '',
    walkDescription: '',
    transit: '',
    transitDetail: '',
    scholarship: false,
    hostelAvailable: false,
    genderType: 'CO_ED',
    religiousAffiliation: '',
    tuitionFee: '',
    hostelFee: '',
    description: '',
    imageUrl: '',
    logoUrl: '',
    phone: '',
    email: '',
    website: '',
    instagram: '',
    linkedin: '',
    twitter: ''
  });

  const sections = [
    { id: 'basic', label: 'Basic Info', icon: GraduationCap },
    { id: 'logo', label: 'Logo & Images', icon: Image },
    { id: 'academic', label: 'Academic', icon: BookOpen },
    { id: 'filters', label: 'Filters', icon: Filter },
    { id: 'location', label: 'Location', icon: MapPin },
    { id: 'stats', label: 'Statistics', icon: TrendingUp },
    { id: 'fees', label: 'Fees', icon: DollarSign },
    { id: 'description', label: 'Description', icon: Building }
  ];

  const academicStreams = [
    { value: '', label: 'Select Academic Stream' },
    { value: 'Engineering', label: 'Engineering' },
    { value: 'Arts', label: 'Arts' },
    { value: 'Commerce', label: 'Commerce' },
    { value: 'Science', label: 'Science' },
    { value: 'Law', label: 'Law' },
    { value: 'Management', label: 'Management' }
  ];

  const academicLevels = [
    { value: '', label: 'Select Academic Level' },
    { value: 'UG', label: 'Undergraduate (UG)' },
    { value: 'PG', label: 'Postgraduate (PG)' },
    { value: 'Diploma', label: 'Diploma' },
    { value: 'PhD', label: 'PhD / Doctorate' }
  ];

  const departments = [
    { value: '', label: 'Select Department' },
    { value: 'Computer Science', label: 'Computer Science' },
    { value: 'Mechanical Engineering', label: 'Mechanical Engineering' },
    { value: 'Civil Engineering', label: 'Civil Engineering' },
    { value: 'Electronics', label: 'Electronics & Communication' }
  ];

  const allCourses = ['B.Tech', 'M.Tech', 'BBA', 'MBA', 'BCA', 'MCA', 'B.Com', 'M.Com'];

  const entranceExams = [
    { value: '', label: 'Select Entrance Exam' },
    { value: 'JEE Main', label: 'JEE Main' },
    { value: 'CAT', label: 'CAT' },
    { value: 'GATE', label: 'GATE' }
  ];

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

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.match('image.*')) {
      setError('Please upload an image file (JPEG, PNG, or WebP)');
      return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Logo image should be less than 2MB');
      return;
    }
    
    setUploadingLogo(true);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const imageData = reader.result;
      setLogoPreview(imageData);
      setFormData(prev => ({ ...prev, logoUrl: imageData }));
      setUploadingLogo(false);
      setError('');
    };
    
    reader.onerror = () => {
      setError('Error reading file. Please try again.');
      setUploadingLogo(false);
    };
    
    reader.readAsDataURL(file);
  };

  const handleLogoUrlChange = (e) => {
    const url = e.target.value;
    setFormData(prev => ({ ...prev, logoUrl: url }));
    setLogoPreview(url);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    // Validate each file
    const validFiles = [];
    const errors = [];
    
    files.forEach(file => {
      if (!file.type.match('image.*')) {
        errors.push(`${file.name} is not an image file`);
      } else if (file.size > 5 * 1024 * 1024) {
        errors.push(`${file.name} should be less than 5MB`);
      } else {
        validFiles.push(file);
      }
    });
    
    if (errors.length > 0) {
      setError(errors.join(', '));
      return;
    }
    
    if (images.length + validFiles.length > 5) {
      setError(`Maximum 5 images allowed. You already have ${images.length} image(s).`);
      return;
    }
    
    setUploadingImages(true);
    
    let processedCount = 0;
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImages(prev => [...prev, reader.result]);
        setImages(prev => [...prev, file]);
        processedCount++;
        if (processedCount === validFiles.length) {
          setUploadingImages(false);
          setError('');
        }
      };
      reader.onerror = () => {
        setError(`Error reading file: ${file.name}`);
        setUploadingImages(false);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeLogo = () => {
    setLogoPreview('');
    setFormData(prev => ({ ...prev, logoUrl: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || formData.name.trim() === '') {
      setError('University name is required');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const submitData = {
        name: formData.name.trim(),
        shortName: formData.shortName || '',
        established: formData.established || '',
        type: formData.type || '',
        category: formData.category || '',
        location: formData.location || `${formData.city || ''}, ${formData.state || 'Tamil Nadu'}`,
        city: formData.city || '',
        state: formData.state || 'Tamil Nadu',
        pincode: formData.pincode || '',
        googleMapsLink: formData.googleMapsLink || '',
        accreditation: formData.accreditation || '',
        affiliation: formData.affiliation || '',
        mission: formData.mission || '',
        vision: formData.vision || '',
        academicStream: formData.academicStream || '',
        academicLevel: formData.academicLevel || '',
        department: formData.department || '',
        offeredCourses: formData.offeredCourses || [],
        entranceExam: formData.entranceExam || '',
        rating: parseFloat(formData.rating) || 4.0,
        studentCount: parseInt(formData.studentCount) || 0,
        facultyCount: formData.facultyCount || '',
        placementRate: formData.placementRate || '',
        medianSalary: formData.medianSalary || '',
        transportScore: parseInt(formData.transportScore) || 50,
        walkScore: formData.walkScore ? parseInt(formData.walkScore) : null,
        walkDescription: formData.walkDescription || '',
        transit: formData.transit || '',
        transitDetail: formData.transitDetail || '',
        scholarship: formData.scholarship,
        hostelAvailable: formData.hostelAvailable,
        genderType: formData.genderType,
        religiousAffiliation: formData.religiousAffiliation || '',
        tuitionFee: formData.tuitionFee || '',
        hostelFee: formData.hostelFee || '',
        description: formData.description || '',
        imageUrl: formData.imageUrl || '',
        logoUrl: formData.logoUrl || '',
        phone: formData.phone || '',
        email: formData.email || '',
        website: formData.website || '',
        instagram: formData.instagram || '',
        linkedin: formData.linkedin || '',
        twitter: formData.twitter || '',
        images: previewImages || []
      };
      
      const result = await api.createUniversity(submitData, token);
      
      if (result.success) {
        alert('University added successfully!');
        navigate('/admin/universities');
      } else {
        alert(result.message || 'Failed to add university');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const renderFormContent = () => {
    switch(activeSection) {
      case 'basic':
        return (
          <>
            <h3>Basic Information</h3>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>University Name <span className="required">*</span></label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g., Indian Institute of Technology Madras" />
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
                </select>
              </div>
              <div className="form-group">
                <label>Category</label>
                <select name="category" value={formData.category} onChange={handleChange}>
                  <option value="">Select Category</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Arts & Science">Arts & Science</option>
                  <option value="Management">Management</option>
                </select>
              </div>
            </div>
          </>
        );
      
      case 'logo':
        return (
          <>
            <h3>Logo & Images</h3>
            
            <div className="logo-section">
              <label>University Logo</label>
              <div className="logo-upload-wrapper">
                {logoPreview ? (
                  <div className="logo-preview-card">
                    <img src={logoPreview} alt="University Logo Preview" />
                    <button type="button" onClick={removeLogo} className="remove-btn">
                      <X size={14} /> Remove Logo
                    </button>
                  </div>
                ) : (
                  <label className={`logo-drop-zone ${uploadingLogo ? 'upload-loading' : ''}`}>
                    {uploadingLogo ? (
                      <>
                        <div className="spinner"></div>
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={48} />
                        <span>Upload Logo</span>
                        <small>Click or drag & drop</small>
                        <small>JPG, PNG, WebP (Max 2MB)</small>
                      </>
                    )}
                    <input type="file" accept="image/jpeg, image/png, image/webp" onChange={handleLogoUpload} hidden />
                  </label>
                )}
                <div className="logo-url-field">
                  <input 
                    type="url" 
                    placeholder="Or enter logo URL" 
                    name="logoUrl" 
                    value={formData.logoUrl} 
                    onChange={handleLogoUrlChange} 
                  />
                  <small>Enter a direct image URL instead</small>
                </div>
              </div>
            </div>

            <div className="gallery-section">
              <div className="gallery-header">
                <label>Gallery Images (Max 5)</label>
                <span className="gallery-counter">{previewImages.length} / 5 images uploaded</span>
              </div>
              <div className="gallery-grid">
                {previewImages.map((img, idx) => (
                  <div key={idx} className="gallery-item">
                    <img src={img} alt={`Gallery ${idx + 1}`} />
                    <button type="button" onClick={() => removeImage(idx)} className="remove-image-btn" title="Remove image">
                      <X size={14} />
                    </button>
                    <span className="image-order">{idx + 1}</span>
                  </div>
                ))}
                {previewImages.length < 5 && (
                  <label className={`gallery-add ${uploadingImages ? 'upload-loading' : ''}`}>
                    {uploadingImages ? (
                      <>
                        <div className="spinner-small"></div>
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={28} />
                        <span>Add Image</span>
                      </>
                    )}
                    <input type="file" accept="image/jpeg, image/png, image/webp" onChange={handleImageUpload} hidden multiple />
                  </label>
                )}
              </div>
              {previewImages.length === 0 && !uploadingImages && (
                <p className="image-hint">No images uploaded yet. Click "Add Image" to upload gallery photos.</p>
              )}
              {previewImages.length > 0 && (
                <p className="image-success">✓ {previewImages.length} image(s) uploaded successfully</p>
              )}
            </div>

            <div className="form-group">
              <label>Cover Image URL</label>
              <input type="url" name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="https://example.com/cover.jpg" />
              <small>Main cover image for the university page</small>
            </div>
          </>
        );
      
      case 'academic':
        return (
          <>
            <h3>Academic Details</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Academic Stream</label>
                <select name="academicStream" value={formData.academicStream} onChange={handleChange}>
                  {academicStreams.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Academic Level</label>
                <select name="academicLevel" value={formData.academicLevel} onChange={handleChange}>
                  {academicLevels.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Department</label>
                <select name="department" value={formData.department} onChange={handleChange}>
                  {departments.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Courses Offered</label>
                <select multiple value={formData.offeredCourses} onChange={handleMultiSelect} className="multi-select">
                  {allCourses.map(course => <option key={course} value={course}>{course}</option>)}
                </select>
                <small>Hold Ctrl/Cmd to select multiple</small>
              </div>
              <div className="form-group">
                <label>Entrance Exam</label>
                <select name="entranceExam" value={formData.entranceExam} onChange={handleChange}>
                  {entranceExams.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Accreditation</label>
                <input type="text" name="accreditation" value={formData.accreditation} onChange={handleChange} placeholder="e.g., NAAC A++" />
              </div>
              <div className="form-group">
                <label>Affiliation</label>
                <input type="text" name="affiliation" value={formData.affiliation} onChange={handleChange} placeholder="e.g., Anna University" />
              </div>
              <div className="form-group full-width">
                <label>Mission</label>
                <textarea name="mission" value={formData.mission} onChange={handleChange} rows="2" placeholder="University mission statement..." />
              </div>
              <div className="form-group full-width">
                <label>Vision</label>
                <textarea name="vision" value={formData.vision} onChange={handleChange} rows="2" placeholder="University vision statement..." />
              </div>
            </div>
          </>
        );
      
      case 'filters':
        return (
          <>
            <h3>Filters & Facilities</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Transport Score (0-100)</label>
                <input type="range" name="transportScore" min="0" max="100" value={formData.transportScore} onChange={handleChange} />
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
                <input type="text" name="transitDetail" value={formData.transitDetail} onChange={handleChange} placeholder="e.g., Closest metro station" />
              </div>
            </div>
            
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input type="checkbox" name="scholarship" checked={formData.scholarship} onChange={handleChange} />
                <span>Scholarship Available</span>
              </label>
              <label className="checkbox-label">
                <input type="checkbox" name="hostelAvailable" checked={formData.hostelAvailable} onChange={handleChange} />
                <span>Hostel Available</span>
              </label>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Gender Type</label>
                <select name="genderType" value={formData.genderType} onChange={handleChange}>
                  <option value="CO_ED">Co-educational</option>
                  <option value="WOMEN_ONLY">Women Only</option>
                  <option value="MEN_ONLY">Men Only</option>
                </select>
              </div>
              <div className="form-group">
                <label>Religious Affiliation</label>
                <input type="text" name="religiousAffiliation" value={formData.religiousAffiliation} onChange={handleChange} placeholder="Optional" />
              </div>
            </div>
          </>
        );
      
      case 'location':
        return (
          <>
            <h3>Location Details</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>City</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="e.g., Chennai" />
              </div>
              <div className="form-group">
                <label>State</label>
                <input type="text" name="state" value={formData.state} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Pincode</label>
                <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} placeholder="e.g., 600036" />
              </div>
              <div className="form-group full-width">
                <label>Full Address</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Complete address" />
              </div>
              <div className="form-group full-width">
                <label>Google Maps Link</label>
                <input type="url" name="googleMapsLink" value={formData.googleMapsLink} onChange={handleChange} placeholder="https://maps.google.com/..." />
              </div>
            </div>
          </>
        );
      
      case 'stats':
        return (
          <>
            <h3>Statistics & Ratings</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Rating (0-5)</label>
                <input type="number" step="0.1" min="0" max="5" name="rating" value={formData.rating} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Total Students</label>
                <input type="number" name="studentCount" value={formData.studentCount} onChange={handleChange} placeholder="e.g., 10000" />
              </div>
              <div className="form-group">
                <label>Total Faculty</label>
                <input type="text" name="facultyCount" value={formData.facultyCount} onChange={handleChange} placeholder="e.g., 500" />
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
          </>
        );
      
      case 'fees':
        return (
          <>
            <h3>Fee Structure</h3>
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
          </>
        );
      
      case 'description':
        return (
          <>
            <h3>About the University</h3>
            <div className="form-group full-width">
              <label>Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows="5" placeholder="Detailed description of the university..." />
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label><Globe size={14} /> Website</label>
                <input type="url" name="website" value={formData.website} onChange={handleChange} placeholder="https://..." />
              </div>
              <div className="form-group">
                <label><Phone size={14} /> Phone</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Contact number" />
              </div>
              <div className="form-group full-width">
                <label><Mail size={14} /> Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="admin@university.edu" />
              </div>
              <div className="form-group">
                <label><InstagramIcon /> Instagram</label>
                <input type="url" name="instagram" value={formData.instagram} onChange={handleChange} placeholder="Instagram URL" />
              </div>
              <div className="form-group">
                <label><LinkedinIcon /> LinkedIn</label>
                <input type="url" name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="LinkedIn URL" />
              </div>
              <div className="form-group">
                <label><TwitterIcon /> Twitter</label>
                <input type="url" name="twitter" value={formData.twitter} onChange={handleChange} placeholder="Twitter URL" />
              </div>
            </div>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="add-university-page">
      <div className="page-header">
        <button onClick={() => navigate('/admin/universities')} className="back-btn">
          <ArrowLeft size={18} />
          Back to Universities
        </button>
        <div>
          <h1>Add New University</h1>
          <p>Fill in the details to add a university to the platform</p>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="add-university-form">
        {/* Top Navigation - Section Names */}
        <div className="top-navigation">
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              className={`nav-tab ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              <section.icon size={18} />
              <span>{section.label}</span>
            </button>
          ))}
        </div>

        {/* Two Containers - Attached Together Same Size */}
        <div className="two-containers">
          {/* Left Container - Form Content */}
          <div className="container-left">
            <div className="form-content">
              {renderFormContent()}
            </div>
            <div className="form-actions">
              <button type="button" onClick={() => navigate('/admin/universities')} className="cancel-btn">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="submit-btn">
                <Save size={18} />
                {loading ? 'Creating...' : 'Create University'}
              </button>
            </div>
          </div>

          {/* Right Container - Live Preview */}
          <div className="container-right">
            <div className="preview-content">
              <h3>Live Preview</h3>
              <div className="preview-logo">
                {logoPreview ? (
                  <img src={logoPreview} alt="Preview" />
                ) : (
                  <div className="preview-placeholder">
                    <GraduationCap size={40} />
                  </div>
                )}
              </div>
              <div className="preview-info">
                <h4>{formData.name || 'University Name'}</h4>
                <p className="preview-location">{formData.location || 'City, State'}</p>
                <div className="preview-rating">
                  <span>⭐ {formData.rating || '4.0'}</span>
                  <span className="preview-type">{formData.type || 'University Type'}</span>
                </div>
                <p className="preview-short-desc">
                  {formData.description ? formData.description.slice(0, 100) + (formData.description.length > 100 ? '...' : '') : 'Add a description to see preview...'}
                </p>
                {formData.academicStream && (
                  <div className="preview-tags">
                    <span>{formData.academicStream}</span>
                    {formData.academicLevel && <span>{formData.academicLevel}</span>}
                  </div>
                )}
                {previewImages.length > 0 && (
                  <div className="preview-images-count">
                    📸 {previewImages.length} gallery image(s)
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddUniversity;