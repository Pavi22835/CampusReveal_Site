const express = require('express');
const router = express.Router();
const { prisma } = require('../prisma');

const buildSearchWhere = (query) => {
  const term = query?.trim();
  if (!term) return null;

  return {
    OR: [
      { name: { contains: term, mode: 'insensitive' } },
      { location: { contains: term, mode: 'insensitive' } },
      { city: { contains: term, mode: 'insensitive' } },
      { state: { contains: term, mode: 'insensitive' } },
      { category: { contains: term, mode: 'insensitive' } },
      { type: { contains: term, mode: 'insensitive' } },
      { affiliation: { contains: term, mode: 'insensitive' } },
      { shortName: { contains: term, mode: 'insensitive' } },
      { description: { contains: term, mode: 'insensitive' } },
      { specializations: { contains: term, mode: 'insensitive' } },
      { keywords: { contains: term, mode: 'insensitive' } }
    ]
  };
};

// ==================== CONTROLLER FUNCTIONS ====================

// @desc    Get all universities (excluding trashed)
// @route   GET /api/universities
// @access  Public
const getUniversities = async (req, res) => {
  try {
    const { search, limit = 50, page = 1 } = req.query;
    
    let where = {
      isTrashed: false
    };
    
    if (search) {
      const searchWhere = buildSearchWhere(search);
      if (searchWhere) where = { ...where, ...searchWhere };
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const universities = await prisma.university.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { rating: 'desc' },
      select: {
        id: true,
        name: true,
        shortName: true,
        logoUrl: true,
        imageUrl: true,
        images: true,
        location: true,
        city: true,
        state: true,
        rating: true,
        studentCount: true,
        description: true,
        isTrashed: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { reviews: true }
        }
      }
    });

    const total = await prisma.university.count({ where });
    
    res.json({
      success: true,
      data: universities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get universities error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Get all trashed universities (soft deleted)
// @route   GET /api/universities/trashed
// @access  Admin
const getTrashedUniversities = async (req, res) => {
  try {
    const { search, limit = 50, page = 1 } = req.query;
    
    let where = {
      isTrashed: true
    };
    
    if (search) {
      const searchWhere = buildSearchWhere(search);
      if (searchWhere) where = { ...where, ...searchWhere };
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const universities = await prisma.university.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { trashedAt: 'desc' },
      select: {
        id: true,
        name: true,
        shortName: true,
        logoUrl: true,
        imageUrl: true,
        images: true,
        location: true,
        city: true,
        state: true,
        rating: true,
        studentCount: true,
        description: true,
        isTrashed: true,
        createdAt: true,
        updatedAt: true,
        trashedAt: true,
        _count: {
          select: { reviews: true }
        }
      }
    });

    const total = await prisma.university.count({ where });
    
    res.json({
      success: true,
      data: universities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get trashed universities error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Soft delete university (move to trash)
// @route   PATCH /api/universities/:id/soft-delete
// @access  Admin
const softDeleteUniversity = async (req, res) => {
  try {
    const { id } = req.params;
    
    const university = await prisma.university.findUnique({
      where: { id }
    });
    
    if (!university) {
      return res.status(404).json({
        success: false,
        message: 'University not found'
      });
    }
    
    if (university.isTrashed) {
      return res.status(400).json({
        success: false,
        message: 'University is already in trash'
      });
    }
    
    const updatedUniversity = await prisma.university.update({
      where: { id },
      data: {
        isTrashed: true,
        trashedAt: new Date()
      }
    });
    
    res.json({
      success: true,
      message: 'University moved to trash successfully',
      data: updatedUniversity
    });
  } catch (error) {
    console.error('Soft delete university error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Restore university from trash
// @route   PATCH /api/universities/:id/restore
// @access  Admin
const restoreUniversity = async (req, res) => {
  try {
    const { id } = req.params;
    
    const university = await prisma.university.findUnique({
      where: { id }
    });
    
    if (!university) {
      return res.status(404).json({
        success: false,
        message: 'University not found'
      });
    }
    
    if (!university.isTrashed) {
      return res.status(400).json({
        success: false,
        message: 'University is not in trash'
      });
    }
    
    const restoredUniversity = await prisma.university.update({
      where: { id },
      data: {
        isTrashed: false,
        trashedAt: null
      }
    });
    
    res.json({
      success: true,
      message: 'University restored from trash successfully',
      data: restoredUniversity
    });
  } catch (error) {
    console.error('Restore university error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Permanently delete university
// @route   DELETE /api/universities/:id/permanent
// @access  Admin
const permanentDeleteUniversity = async (req, res) => {
  try {
    const { id } = req.params;
    
    const university = await prisma.university.findUnique({
      where: { id }
    });
    
    if (!university) {
      return res.status(404).json({
        success: false,
        message: 'University not found'
      });
    }
    
    await prisma.university.delete({
      where: { id }
    });
    
    res.json({
      success: true,
      message: 'University permanently deleted successfully'
    });
  } catch (error) {
    console.error('Permanent delete university error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Get single university by ID
// @route   GET /api/universities/:id
// @access  Public
const getUniversityById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Fetching university with ID:', id);
    
    const university = await prisma.university.findUnique({
      where: { id: id },
      include: {
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                graduationYear: true,
                major: true
              }
            }
          }
        },
        _count: {
          select: { reviews: true }
        }
      }
    });
    
    if (!university) {
      console.log('University not found for ID:', id);
      return res.status(404).json({ 
        success: false, 
        message: 'University not found' 
      });
    }
    
    console.log('University found:', university.name);
    res.json({
      success: true,
      data: university
    });
  } catch (error) {
    console.error('Get university error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Get trending universities
// @route   GET /api/universities/trending
// @access  Public
const getTrendingUniversities = async (req, res) => {
  try {
    const universities = await prisma.university.findMany({
      where: { isTrashed: false },
      take: 6,
      orderBy: { rating: 'desc' },
      select: {
        id: true,
        name: true,
        logoUrl: true,
        imageUrl: true,
        location: true,
        city: true,
        rating: true,
        studentCount: true,
        _count: {
          select: { reviews: true }
        }
      }
    });
    
    res.json({
      success: true,
      data: universities
    });
  } catch (error) {
    console.error('Get trending error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Search universities
// @route   GET /api/universities/search
// @access  Public
const searchUniversities = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ success: true, data: [] });
    }
    
    const universities = await prisma.university.findMany({
      where: {
        ...buildSearchWhere(q),
        isTrashed: false
      },
      take: 20,
      select: {
        id: true,
        name: true,
        logoUrl: true,
        imageUrl: true,
        location: true,
        city: true,
        state: true,
        rating: true,
        studentCount: true,
        description: true,
        _count: {
          select: { reviews: true }
        }
      }
    });
    
    res.json({
      success: true,
      data: universities
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Advanced search universities
// @route   GET /api/universities/search/advanced
// @access  Public
const searchUniversitiesAdvanced = async (req, res) => {
  try {
    const { search, location, course, degree, stream, level } = req.query;
    const types = req.query.type ? (Array.isArray(req.query.type) ? req.query.type : [req.query.type]) : [];

    const filters = [{ isTrashed: false }];

    if (search) {
      const searchWhere = buildSearchWhere(search);
      if (searchWhere) filters.push(searchWhere);
    }

    if (location) {
      filters.push({
        OR: [
          { location: { contains: location, mode: 'insensitive' } },
          { city: { contains: location, mode: 'insensitive' } },
          { state: { contains: location, mode: 'insensitive' } },
          { name: { contains: location, mode: 'insensitive' } }
        ]
      });
    }

    if (course) {
      filters.push({ offeredCourses: { has: course } });
    }

    if (degree) {
      filters.push({ academicLevels: { has: degree } });
    }

    if (stream) {
      filters.push({ academicStreams: { has: stream } });
    }

    if (level) {
      filters.push({ academicLevels: { has: level } });
    }

    if (types.length) {
      filters.push({
        OR: types.map((type) => ({
          type: { contains: type, mode: 'insensitive' }
        }))
      });
    }

    const universities = await prisma.university.findMany({
      where: { AND: filters.length > 1 ? filters : [{ isTrashed: false }] },
      take: 50,
      orderBy: { rating: 'desc' },
      select: {
        id: true,
        name: true,
        logoUrl: true,
        imageUrl: true,
        location: true,
        city: true,
        state: true,
        rating: true,
        studentCount: true,
        description: true,
        type: true,
        category: true,
        established: true,
        naacGrade: true,
        _count: {
          select: { reviews: true }
        }
      }
    });

    res.json({ success: true, data: universities });
  } catch (error) {
    console.error('Advanced search error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Create a new university (Admin only)
// @route   POST /api/universities
// @access  Private/Admin
const createUniversity = async (req, res) => {
  try {
    console.log('\n=== CREATE UNIVERSITY ===');
    
    let body = req.body;
    
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
        console.log('Parsed body from string');
      } catch (e) {
        console.log('Failed to parse body string');
      }
    }
    
    console.log('Request body received');
    
    const name = body?.name;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'University name is required'
      });
    }
    
    const existing = await prisma.university.findUnique({
      where: { name: name.trim() }
    });
    
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'University with this name already exists'
      });
    }
    
    // Prepare data with all new fields
    const universityData = {
      // 1. Basic Information
      name: name.trim(),
      shortName: body.shortName || null,
      established: body.established || null,
      type: body.type || null,
      category: body.category || null,
      naacGrade: body.naacGrade || null,
      
      // 2. Branding & Media
      logoUrl: body.logoUrl || null,
      campusVideoUrl: body.campusVideoUrl || null,
      images: Array.isArray(body.images) ? body.images : [],
      
      // 3. Academic Information
      academicStreams: Array.isArray(body.academicStreams) ? body.academicStreams : [],
      academicLevels: Array.isArray(body.academicLevels) ? body.academicLevels : [],
      departments: Array.isArray(body.departments) ? body.departments : [],
      offeredCourses: Array.isArray(body.offeredCourses) ? body.offeredCourses : [],
      specializations: body.specializations || null,
      affiliation: body.affiliation || null,
      approvedBy: body.approvedBy || null,
      mission: body.mission || null,
      vision: body.vision || null,
      
      // 4. Facilities & Campus
      hostelAvailable: body.hostelAvailable || false,
      hostelType: body.hostelType || null,
      transportAvailable: body.transportAvailable || false,
      campusFacilities: Array.isArray(body.campusFacilities) ? body.campusFacilities : [],
      
      // 5. Location Information
      country: body.country || 'India',
      state: body.state || null,
      city: body.city || null,
      pincode: body.pincode || null,
      location: body.location || `${body.city || ''}, ${body.state || 'Tamil Nadu'}`,
      googleMapsLink: body.googleMapsLink || null,
      
      // 6. Placement & Statistics
      rating: parseFloat(body.rating) || 0,
      studentCount: parseInt(body.studentCount) || 0,
      facultyCount: parseInt(body.facultyCount) || null,
      placementRate: body.placementRate || null,
      highestPackage: body.highestPackage || null,
      averagePackage: body.averagePackage || null,
      topRecruiters: body.topRecruiters || null,
      
      // 7. Fees Structure
      tuitionFee: body.tuitionFee || null,
      hostelFee: body.hostelFee || null,
      scholarshipAvailable: body.scholarshipAvailable || false,
      
      // 8. Contact & Social Links
      website: body.website || null,
      phone: body.phone || null,
      email: body.email || null,
      instagram: body.instagram || null,
      linkedin: body.linkedin || null,
      facebook: body.facebook || null,
      youtube: body.youtube || null,
      
      // 9. Description & SEO
      description: body.description || null,
      keywords: body.keywords || null,
      
      // Legacy fields for compatibility
      imageUrl: body.imageUrl || body.logoUrl || null
    };
    
    console.log('Creating university with name:', universityData.name);
    
    const university = await prisma.university.create({
      data: universityData
    });
    
    console.log('✅ University created successfully:', university.name);
    
    res.status(201).json({
      success: true,
      data: university,
      message: "University added successfully!"
    });
  } catch (error) {
    console.error('❌ Create university error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Update university (Admin only)
// @route   PUT /api/universities/:id
// @access  Private/Admin
const updateUniversity = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;
    
    console.log('Updating university with ID:', id);
    
    // Check if university exists
    const existing = await prisma.university.findUnique({
      where: { id }
    });
    
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'University not found'
      });
    }
    
    // Prepare update data with all new fields
    const updateData = {
      // 1. Basic Information
      name: body.name?.trim(),
      shortName: body.shortName || null,
      established: body.established || null,
      type: body.type || null,
      category: body.category || null,
      naacGrade: body.naacGrade || null,
      
      // 2. Branding & Media
      logoUrl: body.logoUrl || null,
      campusVideoUrl: body.campusVideoUrl || null,
      images: Array.isArray(body.images) ? body.images : existing.images,
      
      // 3. Academic Information
      academicStreams: Array.isArray(body.academicStreams) ? body.academicStreams : existing.academicStreams,
      academicLevels: Array.isArray(body.academicLevels) ? body.academicLevels : existing.academicLevels,
      departments: Array.isArray(body.departments) ? body.departments : existing.departments,
      offeredCourses: Array.isArray(body.offeredCourses) ? body.offeredCourses : existing.offeredCourses,
      specializations: body.specializations || null,
      affiliation: body.affiliation || null,
      approvedBy: body.approvedBy || null,
      mission: body.mission || null,
      vision: body.vision || null,
      
      // 4. Facilities & Campus
      hostelAvailable: body.hostelAvailable !== undefined ? body.hostelAvailable : existing.hostelAvailable,
      hostelType: body.hostelType || null,
      transportAvailable: body.transportAvailable !== undefined ? body.transportAvailable : existing.transportAvailable,
      campusFacilities: Array.isArray(body.campusFacilities) ? body.campusFacilities : existing.campusFacilities,
      
      // 5. Location Information
      country: body.country || 'India',
      state: body.state || null,
      city: body.city || null,
      pincode: body.pincode || null,
      location: body.location || `${body.city || existing.city || ''}, ${body.state || existing.state || 'Tamil Nadu'}`,
      googleMapsLink: body.googleMapsLink || null,
      
      // 6. Placement & Statistics
      rating: body.rating !== undefined ? parseFloat(body.rating) : existing.rating,
      studentCount: body.studentCount !== undefined ? parseInt(body.studentCount) : existing.studentCount,
      facultyCount: body.facultyCount !== undefined ? parseInt(body.facultyCount) : existing.facultyCount,
      placementRate: body.placementRate || null,
      highestPackage: body.highestPackage || null,
      averagePackage: body.averagePackage || null,
      topRecruiters: body.topRecruiters || null,
      
      // 7. Fees Structure
      tuitionFee: body.tuitionFee || null,
      hostelFee: body.hostelFee || null,
      scholarshipAvailable: body.scholarshipAvailable !== undefined ? body.scholarshipAvailable : existing.scholarshipAvailable,
      
      // 8. Contact & Social Links
      website: body.website || null,
      phone: body.phone || null,
      email: body.email || null,
      instagram: body.instagram || null,
      linkedin: body.linkedin || null,
      facebook: body.facebook || null,
      youtube: body.youtube || null,
      
      // 9. Description & SEO
      description: body.description || null,
      keywords: body.keywords || null,
      
      // Legacy
      imageUrl: body.imageUrl || body.logoUrl || existing.imageUrl
    };
    
    const university = await prisma.university.update({
      where: { id },
      data: updateData
    });
    
    console.log('✅ University updated successfully:', university.name);
    
    res.json({
      success: true,
      data: university,
      message: "University updated successfully!"
    });
  } catch (error) {
    console.error('Update university error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Delete university (Admin only) - Original hard delete
// @route   DELETE /api/universities/:id
// @access  Private/Admin
const deleteUniversity = async (req, res) => {
  try {
    const { id } = req.params;
    
    const university = await prisma.university.findUnique({
      where: { id }
    });
    
    if (!university) {
      return res.status(404).json({
        success: false,
        message: 'University not found'
      });
    }
    
    await prisma.university.delete({
      where: { id }
    });
    
    res.json({
      success: true,
      message: "University deleted successfully!"
    });
  } catch (error) {
    console.error('Delete university error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ==================== ROUTES ====================

// Public routes
router.get('/search/advanced', searchUniversitiesAdvanced);
router.get('/search', searchUniversities);
router.get('/trending', getTrendingUniversities);
router.get('/', getUniversities);

// Trash routes (Admin only - Add auth middleware in your main app)
router.get('/trashed', getTrashedUniversities);
router.patch('/:id/soft-delete', softDeleteUniversity);
router.patch('/:id/restore', restoreUniversity);
router.delete('/:id/permanent', permanentDeleteUniversity);

// Get single university by ID
router.get('/:id', getUniversityById);

// CRUD routes (Admin only - Add auth middleware in your main app)
router.post('/', createUniversity);
router.put('/:id', updateUniversity);
router.delete('/:id', deleteUniversity);

module.exports = router;