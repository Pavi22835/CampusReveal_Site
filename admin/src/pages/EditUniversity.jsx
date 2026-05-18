import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Home,
  Users,
  Image,
  Award,
  Wifi,
  Coffee,
  Dumbbell,
  Heart,
  Microscope,
  Video,
  FileText
} from 'lucide-react';
import './EditUniversity.css';

// Social Media Icons
const InstagramIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const LinkedinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const FacebookIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const YoutubeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
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
  const [logoPreview, setLogoPreview] = useState('');
  const [activeSection, setActiveSection] = useState('basic');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [dropdownOptions, setDropdownOptions] = useState({
    universityTypes: [],
    categories: [],
    naacGrades: [],
    academicStreamsOptions: [],
    academicLevelsOptions: [],
    departmentsOptions: [],
    allCourses: [],
    campusFacilitiesList: [],
    hostelTypes: [],
    approvedByOptions: []
  });
  
  const [formData, setFormData] = useState({
    name: '',
    shortName: '',
    established: '',
    type: '',
    category: '',
    naacGrade: '',
    logoUrl: '',
    campusVideoUrl: '',
    academicStreams: [],
    academicLevels: [],
    departments: [],
    offeredCourses: [],
    specializations: '',
    affiliation: '',
    approvedBy: '',
    mission: '',
    vision: '',
    hostelAvailable: false,
    hostelType: '',
    transportAvailable: false,
    campusFacilities: [],
    country: '',
    state: '',
    city: '',
    pincode: '',
    location: '',
    googleMapsLink: '',
    mapLink: '',
    rating: null,
    studentCount: '',
    facultyCount: '',
    placementRate: '',
    highestPackage: '',
    averagePackage: '',
    topRecruiters: '',
    tuitionFee: '',
    hostelFee: '',
    scholarshipAvailable: false,
    website: '',
    phone: '',
    email: '',
    instagram: '',
    linkedin: '',
    facebook: '',
    youtube: '',
    description: '',
    keywords: ''
  });

  const sections = [
    { id: 'basic', label: 'Basic Info', icon: GraduationCap },
    { id: 'branding', label: 'Branding & Media', icon: Image },
    { id: 'academic', label: 'Academic', icon: BookOpen },
    { id: 'facilities', label: 'Facilities', icon: Building },
    { id: 'location', label: 'Location', icon: MapPin },
    { id: 'placement', label: 'Placement', icon: TrendingUp },
    { id: 'fees', label: 'Fees', icon: DollarSign },
    { id: 'contact', label: 'Contact', icon: Globe },
    { id: 'seo', label: 'Description & SEO', icon: FileText }
  ];

  useEffect(() => {
    fetchDropdownOptions();
    fetchUniversity();
  }, [id]);

  const fetchDropdownOptions = async () => {
    try {
      // Fetch all dropdown options from API
      const options = await api.getDropdownOptions();
      if (options.success && options.data) {
        setDropdownOptions(options.data);
      }
    } catch (error) {
      console.error('Error fetching dropdown options:', error);
      // Don't set fallback options - let them remain empty
    }
  };

  const fetchUniversity = async () => {
    try {
      const result = await api.getUniversity(id);
      if (result.success && result.data) {
        const uni = result.data;
        
        setFormData({
          name: uni.name || '',
          shortName: uni.shortName || '',
          established: uni.established || '',
          type: uni.type || '',
          category: uni.category || '',
          naacGrade: uni.naacGrade || '',
          logoUrl: uni.logoUrl || '',
          campusVideoUrl: uni.campusVideoUrl || '',
          academicStreams: uni.academicStreams || [],
          academicLevels: uni.academicLevels || [],
          departments: uni.departments || [],
          offeredCourses: uni.offeredCourses || [],
          specializations: uni.specializations || '',
          affiliation: uni.affiliation || '',
          approvedBy: uni.approvedBy || '',
          mission: uni.mission || '',
          vision: uni.vision || '',
          hostelAvailable: uni.hostelAvailable || false,
          hostelType: uni.hostelType || '',
          transportAvailable: uni.transportAvailable || false,
          campusFacilities: uni.campusFacilities || [],
          country: uni.country || '',
          state: uni.state || '',
          city: uni.city || '',
          pincode: uni.pincode || '',
          location: uni.location || '',
          googleMapsLink: uni.googleMapsLink || '',
          mapLink: uni.mapLink || '',
          rating: uni.rating || null,
          studentCount: uni.studentCount || '',
          facultyCount: uni.facultyCount || '',
          placementRate: uni.placementRate || '',
          highestPackage: uni.highestPackage || '',
          averagePackage: uni.averagePackage || '',
          topRecruiters: uni.topRecruiters || '',
          tuitionFee: uni.tuitionFee || '',
          hostelFee: uni.hostelFee || '',
          scholarshipAvailable: uni.scholarshipAvailable || false,
          website: uni.website || '',
          phone: uni.phone || '',
          email: uni.email || '',
          instagram: uni.instagram || '',
          linkedin: uni.linkedin || '',
          facebook: uni.facebook || '',
          youtube: uni.youtube || '',
          description: uni.description || '',
          keywords: uni.keywords || ''
        });
        
        setLogoPreview(uni.logoUrl || '');
        setExistingImages(Array.isArray(uni.images) ? uni.images : []);
      } else {
        setError('No Data Available');
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

  const handleMultiSelect = (e, field) => {
    const options = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({ ...prev, [field]: options }));
  };

  const handleFacilityToggle = (facilityId) => {
    setFormData(prev => ({
      ...prev,
      campusFacilities: prev.campusFacilities.includes(facilityId)
        ? prev.campusFacilities.filter(f => f !== facilityId)
        : [...prev.campusFacilities, facilityId]
    }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.match('image.*')) {
      setError('Please upload an image file');
      return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
      setError('Logo image should be less than 2MB');
      return;
    }
    
    setUploadingLogo(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
      setFormData(prev => ({ ...prev, logoUrl: reader.result }));
      setUploadingLogo(false);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    const validFiles = [];
    files.forEach(file => {
      if (!file.type.match('image.*')) {
        setError(`${file.name} is not an image file`);
      } else if (file.size > 5 * 1024 * 1024) {
        setError(`${file.name} should be less than 5MB`);
      } else {
        validFiles.push(file);
      }
    });
    
    if (existingImages.length + previewImages.length + validFiles.length > 10) {
      setError(`Maximum 10 images allowed. You already have ${existingImages.length + previewImages.length} image(s).`);
      return;
    }
    
    setUploadingImages(true);
    let processedCount = 0;
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImages(prev => [...prev, reader.result]);
        processedCount++;
        if (processedCount === validFiles.length) {
          setUploadingImages(false);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    if (index < existingImages.length) {
      setExistingImages(prev => prev.filter((_, i) => i !== index));
    } else {
      const previewIndex = index - existingImages.length;
      setPreviewImages(prev => prev.filter((_, i) => i !== previewIndex));
    }
  };

  const removeLogo = () => {
    setLogoPreview('');
    setFormData(prev => ({ ...prev, logoUrl: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const submitData = {
        ...formData,
        name: formData.name.trim(),
        offeredCourses: formData.offeredCourses || [],
        campusFacilities: formData.campusFacilities || [],
        academicStreams: formData.academicStreams || [],
        academicLevels: formData.academicLevels || [],
        departments: formData.departments || [],
        images: [...existingImages, ...previewImages],
        mapLink: formData.mapLink || null,
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

  const renderFormContent = () => {
    switch(activeSection) {
      case 'basic':
        return (
          <>
            <h3>Basic Information</h3>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>University Name <span className="required">*</span></label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Short Name</label>
                <input type="text" name="shortName" value={formData.shortName} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Established Year</label>
                <input type="text" name="established" value={formData.established} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>University Type</label>
                <select name="type" value={formData.type} onChange={handleChange}>
                  <option value="">Select Type</option>
                  {dropdownOptions.universityTypes.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Category</label>
                <select name="category" value={formData.category} onChange={handleChange}>
                  <option value="">Select Category</option>
                  {dropdownOptions.categories.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>NAAC Grade</label>
                <select name="naacGrade" value={formData.naacGrade} onChange={handleChange}>
                  <option value="">Select NAAC Grade</option>
                  {dropdownOptions.naacGrades.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </>
        );
      
      case 'branding':
        return (
          <>
            <h3>Branding & Media</h3>
            
            <div className="logo-section">
              <label>Logo Image</label>
              <div className="logo-upload-wrapper">
                {logoPreview ? (
                  <div className="logo-preview-card">
                    <img src={logoPreview} alt="Logo" />
                    <button type="button" onClick={removeLogo} className="remove-btn">
                      <X size={14} /> Remove Logo
                    </button>
                  </div>
                ) : (
                  <label className={`logo-drop-zone ${uploadingLogo ? 'upload-loading' : ''}`}>
                    {uploadingLogo ? (
                      <><div className="spinner"></div><span>Uploading...</span></>
                    ) : (
                      <><Upload size={48} /><span>Upload Logo</span><small>JPG, PNG, WebP (Max 2MB)</small></>
                    )}
                    <input type="file" accept="image/jpeg, image/png, image/webp" onChange={handleLogoUpload} hidden />
                  </label>
                )}
                <div className="logo-url-field">
                  <input type="url" placeholder="Or enter logo URL" name="logoUrl" value={formData.logoUrl} onChange={handleChange} />
                </div>
              </div>
            </div>

            <div className="gallery-section">
              <div className="gallery-header">
                <label>Gallery Images (Max 10)</label>
                <span className="gallery-counter">{existingImages.length + previewImages.length} / 10 images uploaded</span>
              </div>
              <div className="gallery-grid">
                {[...existingImages, ...previewImages].map((img, idx) => (
                  <div key={idx} className="gallery-item">
                    <img src={img} alt={`Gallery ${idx + 1}`} />
                    <button type="button" onClick={() => removeImage(idx)} className="remove-image-btn"><X size={14} /></button>
                    <span className="image-order">{idx + 1}</span>
                  </div>
                ))}
                {(existingImages.length + previewImages.length) < 10 && (
                  <label className={`gallery-add ${uploadingImages ? 'upload-loading' : ''}`}>
                    {uploadingImages ? (
                      <><div className="spinner-small"></div><span>Uploading...</span></>
                    ) : (
                      <><Upload size={28} /><span>Add Image</span></>
                    )}
                    <input type="file" accept="image/jpeg, image/png, image/webp" onChange={handleImageUpload} hidden multiple />
                  </label>
                )}
              </div>
              {existingImages.length === 0 && previewImages.length === 0 && (
                <p className="no-images-message">No Images Available</p>
              )}
            </div>

            <div className="form-group">
              <label>Campus Video URL (optional)</label>
              <input type="url" name="campusVideoUrl" value={formData.campusVideoUrl} onChange={handleChange} />
              <small>YouTube or Vimeo link for campus tour</small>
            </div>
          </>
        );
      
      case 'academic':
        return (
          <>
            <h3>Academic Information</h3>
            
            <div className="sub-section">
              <h4>Academic Structure</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label>Academic Stream (Multiple select)</label>
                  <select multiple value={formData.academicStreams} onChange={(e) => handleMultiSelect(e, 'academicStreams')} className="multi-select">
                    {dropdownOptions.academicStreamsOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <small>Hold Ctrl/Cmd to select multiple</small>
                </div>
                <div className="form-group">
                  <label>Academic Level (Multiple select)</label>
                  <select multiple value={formData.academicLevels} onChange={(e) => handleMultiSelect(e, 'academicLevels')} className="multi-select">
                    {dropdownOptions.academicLevelsOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <small>Hold Ctrl/Cmd to select multiple</small>
                </div>
                <div className="form-group">
                  <label>Department (Multiple select)</label>
                  <select multiple value={formData.departments} onChange={(e) => handleMultiSelect(e, 'departments')} className="multi-select">
                    {dropdownOptions.departmentsOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <small>Hold Ctrl/Cmd to select multiple</small>
                </div>
                <div className="form-group">
                  <label>Courses Offered</label>
                  <select multiple value={formData.offeredCourses} onChange={(e) => handleMultiSelect(e, 'offeredCourses')} className="multi-select">
                    {dropdownOptions.allCourses.map(course => (
                      <option key={course} value={course}>{course}</option>
                    ))}
                  </select>
                  <small>Hold Ctrl/Cmd to select multiple</small>
                </div>
                <div className="form-group full-width">
                  <label>Specializations</label>
                  <input type="text" name="specializations" value={formData.specializations} onChange={handleChange} />
                </div>
              </div>
            </div>

            <div className="sub-section">
              <h4>Affiliation & Approval</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label>Affiliation</label>
                  <input type="text" name="affiliation" value={formData.affiliation} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Approved By</label>
                  <select name="approvedBy" value={formData.approvedBy} onChange={handleChange}>
                    <option value="">Select Approval Body</option>
                    {dropdownOptions.approvedByOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="sub-section">
              <h4>Institutional Details</h4>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Mission</label>
                  <textarea name="mission" value={formData.mission} onChange={handleChange} rows="2" />
                </div>
                <div className="form-group full-width">
                  <label>Vision</label>
                  <textarea name="vision" value={formData.vision} onChange={handleChange} rows="2" />
                </div>
              </div>
            </div>
          </>
        );
      
      case 'facilities':
        return (
          <>
            <h3>Facilities & Campus</h3>
            
            <div className="sub-section">
              <h4>Hostel & Accommodation</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label className="checkbox-label">
                    <input type="checkbox" name="hostelAvailable" checked={formData.hostelAvailable} onChange={handleChange} />
                    <span>Hostel Available</span>
                  </label>
                </div>
                {formData.hostelAvailable && (
                  <div className="form-group">
                    <label>Hostel Type</label>
                    <select name="hostelType" value={formData.hostelType} onChange={handleChange}>
                      <option value="">Select Hostel Type</option>
                      {dropdownOptions.hostelTypes.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="sub-section">
              <h4>Transport</h4>
              <div className="form-group">
                <label className="checkbox-label">
                  <input type="checkbox" name="transportAvailable" checked={formData.transportAvailable} onChange={handleChange} />
                  <span>Transport Available</span>
                </label>
              </div>
            </div>

            <div className="sub-section">
              <h4>Campus Facilities</h4>
              <div className="facilities-grid">
                {dropdownOptions.campusFacilitiesList.map(facility => (
                  <label key={facility.id} className="facility-checkbox">
                    <input 
                      type="checkbox" 
                      checked={formData.campusFacilities.includes(facility.id)}
                      onChange={() => handleFacilityToggle(facility.id)}
                    />
                    <span>{facility.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </>
        );
      
      case 'location':
        return (
          <>
            <h3>Location Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Country</label>
                <input type="text" name="country" value={formData.country} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>State</label>
                <input type="text" name="state" value={formData.state} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>City</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Pincode</label>
                <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} />
              </div>
              <div className="form-group full-width">
                <label>Full Address</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} />
              </div>
              <div className="form-group full-width">
                <label>Google Maps Link</label>
                <input type="url" name="googleMapsLink" value={formData.googleMapsLink} onChange={handleChange} />
                <small>Regular Google Maps link for redirection</small>
              </div>
              <div className="form-group full-width">
                <label>Google Maps Embed Link</label>
                <input 
                  type="url" 
                  name="mapLink" 
                  value={formData.mapLink} 
                  onChange={handleChange} 
                />
                <small>Paste the embed URL from Google Maps for iframe display</small>
              </div>
            </div>
          </>
        );
      
      case 'placement':
        return (
          <>
            <h3>Placement & Statistics</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Overall Rating (0-5)</label>
                <input type="number" step="0.1" min="0" max="5" name="rating" value={formData.rating || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Total Students</label>
                <input type="number" name="studentCount" value={formData.studentCount} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Total Faculty</label>
                <input type="text" name="facultyCount" value={formData.facultyCount} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Placement Rate (%)</label>
                <input type="text" name="placementRate" value={formData.placementRate} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Highest Package</label>
                <input type="text" name="highestPackage" value={formData.highestPackage} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Average Package</label>
                <input type="text" name="averagePackage" value={formData.averagePackage} onChange={handleChange} />
              </div>
              <div className="form-group full-width">
                <label>Top Recruiters</label>
                <input type="text" name="topRecruiters" value={formData.topRecruiters} onChange={handleChange} />
              </div>
            </div>
          </>
        );
      
      case 'fees':
        return (
          <>
            <h3>Fees Structure</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Tuition Fee (per year)</label>
                <input type="text" name="tuitionFee" value={formData.tuitionFee} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Hostel Fee (per year)</label>
                <input type="text" name="hostelFee" value={formData.hostelFee} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input type="checkbox" name="scholarshipAvailable" checked={formData.scholarshipAvailable} onChange={handleChange} />
                  <span>Scholarship Available</span>
                </label>
              </div>
            </div>
          </>
        );
      
      case 'contact':
        return (
          <>
            <h3>Contact & Social Links</h3>
            <div className="form-grid">
              <div className="form-group">
                <label><Globe size={14} /> Website</label>
                <input type="url" name="website" value={formData.website} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label><Phone size={14} /> Phone Number</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label><Mail size={14} /> Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label><InstagramIcon /> Instagram</label>
                <input type="url" name="instagram" value={formData.instagram} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label><LinkedinIcon /> LinkedIn</label>
                <input type="url" name="linkedin" value={formData.linkedin} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label><FacebookIcon /> Facebook</label>
                <input type="url" name="facebook" value={formData.facebook} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label><YoutubeIcon /> YouTube</label>
                <input type="url" name="youtube" value={formData.youtube} onChange={handleChange} />
              </div>
            </div>
          </>
        );
      
      case 'seo':
        return (
          <>
            <h3>Description & SEO</h3>
            <div className="form-group full-width">
              <label>Full Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows="5" />
            </div>
            <div className="form-group full-width">
              <label>Keywords / Tags</label>
              <input type="text" name="keywords" value={formData.keywords} onChange={handleChange} />
              <small>Comma separated keywords for SEO</small>
            </div>
          </>
        );
      
      default:
        return null;
    }
  };

  const hasLocationData = () => {
    return formData.city || formData.state || formData.location;
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

        <div className="two-containers">
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
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

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
                <h4>{formData.name || 'No Data Available'}</h4>
                
                {hasLocationData() && (
                  <p className="preview-location">
                    {[formData.city, formData.state].filter(Boolean).join(', ') || 'Location not added'}
                  </p>
                )}
                
                <div className="preview-rating">
                  {formData.rating && <span>⭐ {formData.rating}</span>}
                  {formData.type && <span className="preview-type">{formData.type}</span>}
                </div>
                
                {formData.description && (
                  <p className="preview-short-desc">
                    {formData.description.slice(0, 100)}{formData.description.length > 100 ? '...' : ''}
                  </p>
                )}
                
                {formData.academicStreams && formData.academicStreams.length > 0 && (
                  <div className="preview-tags">
                    {formData.academicStreams.map(stream => <span key={stream}>{stream}</span>)}
                  </div>
                )}
                
                {formData.naacGrade && (
                  <div className="preview-badge">
                    <Award size={12} /> NAAC {formData.naacGrade}
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

export default EditUniversity;