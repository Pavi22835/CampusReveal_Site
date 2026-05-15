const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { protect, adminOnly } = require('../middleware/auth');

const prisma = new PrismaClient();

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
      { academicStreams: { has: term } },
      { academicLevels: { has: term } },
      { departments: { has: term } },
      { offeredCourses: { has: term } }
    ]
  };
};

// ==================== CONTROLLER FUNCTIONS ====================

// @desc    Get all universities (excluding trashed)
// @route   GET /api/universities
// @access  Public
const getUniversities = async (req, res) => {
  try {
    const { 
      search, 
      limit = 1000, 
      page = 1,
      academicStream,
      academicLevel,
      department,
      scholarship,
      hostelAvailable,
      minRating,
      city,
      state
    } = req.query;
    
    let where = {
      isTrashed: false
    };
    
    if (search) {
      const searchWhere = buildSearchWhere(search);
      if (searchWhere) where = { ...where, ...searchWhere };
    }
    
    // Apply advanced filters - FIXED: use plural field names from schema
    if (academicStream) where.academicStreams = { has: academicStream };
    if (academicLevel) where.academicLevels = { has: academicLevel };
    if (department) where.departments = { has: department };
    if (hostelAvailable === 'true') where.hostelAvailable = true;
    if (minRating) where.rating = { gte: parseFloat(minRating) };
    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (state) where.state = { contains: state, mode: 'insensitive' };
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [universities, total] = await Promise.all([
      prisma.university.findMany({
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
          academicStreams: true,
          academicLevels: true,
          departments: true,
          offeredCourses: true,
          hostelAvailable: true,
          tuitionFee: true,
          hostelFee: true,
          placementRate: true,
          website: true,
          email: true,
          phone: true,
          category: true,
          type: true,
          established: true,
          _count: {
            select: { reviews: true }
          }
        }
      }),
      prisma.university.count({ where })
    ]);

    console.log(`✅ Universities API: Fetched ${universities.length} of ${total} total universities`);
    
    res.json({
      success: true,
      data: universities,
      total: total,
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
    
    const [universities, total] = await Promise.all([
      prisma.university.findMany({
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
          trashedAt: true,
          _count: {
            select: { reviews: true }
          }
        }
      }),
      prisma.university.count({ where })
    ]);
    
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
    
    // Delete related records first
    await prisma.review.deleteMany({ where: { universityId: id } });
    await prisma.universityCourse.deleteMany({ where: { universityId: id } });
    
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
    
    // Validate ID format
    if (!id || id.length < 5) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid university ID format' 
      });
    }
    
    console.log('Fetching university with ID:', id);
    
    const university = await prisma.university.findUnique({
      where: { id: id },
      include: {
        reviews: {
          where: { isTrashed: false },
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
          select: { reviews: true, users: true }
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
        images: true,
        location: true,
        city: true,
        rating: true,
        studentCount: true,
        category: true,
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
      where: { AND: filters },
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
        academicStreams: true,
        academicLevels: true,
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

// @desc    Get filter options for dropdowns
// @route   GET /api/universities/filters/options
// @access  Public
const getFilterOptions = async (req, res) => {
  try {
    const universities = await prisma.university.findMany({
      where: { isTrashed: false },
      select: {
        academicStreams: true,
        academicLevels: true,
        departments: true,
        city: true,
        state: true
      }
    });

    const academicStreams = [...new Set(universities.flatMap(u => u.academicStreams || []))];
    const academicLevels = [...new Set(universities.flatMap(u => u.academicLevels || []))];
    const departments = [...new Set(universities.flatMap(u => u.departments || []))];
    const cities = [...new Set(universities.map(u => u.city).filter(Boolean))];
    const states = [...new Set(universities.map(u => u.state).filter(Boolean))];

    res.json({
      success: true,
      data: {
        academicStreams,
        academicLevels,
        departments,
        cities,
        states
      }
    });
  } catch (error) {
    console.error('Get filter options error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch filter options',
      error: error.message
    });
  }
};

// @desc    Create a new university (Admin only)
// @route   POST /api/universities
// @access  Private/Admin
const createUniversity = async (req, res) => {
  try {
    console.log('\n=== CREATE UNIVERSITY ===');
    
    const body = req.body;
    
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
    
    const universityData = {
      name: name.trim(),
      shortName: body.shortName || null,
      established: body.established || null,
      type: body.type || null,
      category: body.category || null,
      naacGrade: body.naacGrade || null,
      logoUrl: body.logoUrl || null,
      imageUrl: body.imageUrl || body.logoUrl || null,
      images: Array.isArray(body.images) ? body.images : [],
      location: body.location || `${body.city || ''}, ${body.state || 'Tamil Nadu'}`,
      city: body.city || null,
      state: body.state || 'Tamil Nadu',
      pincode: body.pincode || null,
      googleMapsLink: body.googleMapsLink || null,
      affiliation: body.affiliation || null,
      mission: body.mission || null,
      vision: body.vision || null,
      academicStreams: Array.isArray(body.academicStreams) ? body.academicStreams : [],
      academicLevels: Array.isArray(body.academicLevels) ? body.academicLevels : [],
      departments: Array.isArray(body.departments) ? body.departments : [],
      offeredCourses: Array.isArray(body.offeredCourses) ? body.offeredCourses : [],
      campusFacilities: Array.isArray(body.campusFacilities) ? body.campusFacilities : [],
      rating: parseFloat(body.rating) || 0,
      studentCount: parseInt(body.studentCount) || 0,
      facultyCount: body.facultyCount ? parseInt(body.facultyCount) : null,
      placementRate: body.placementRate || null,
      highestPackage: body.highestPackage || null,
      averagePackage: body.averagePackage || null,
      tuitionFee: body.tuitionFee || null,
      hostelFee: body.hostelFee || null,
      hostelAvailable: body.hostelAvailable === true || body.hostelAvailable === 'true',
      transportAvailable: body.transportAvailable === true || body.transportAvailable === 'true',
      scholarshipAvailable: body.scholarshipAvailable === true || body.scholarshipAvailable === 'true',
      description: body.description || null,
      website: body.website || null,
      phone: body.phone || null,
      email: body.email || null,
      instagram: body.instagram || null,
      linkedin: body.linkedin || null,
      isActive: body.isActive !== undefined ? body.isActive : true,
      isFeatured: body.isFeatured !== undefined ? body.isFeatured : false
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
    
    const existing = await prisma.university.findUnique({
      where: { id }
    });
    
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'University not found'
      });
    }
    
    const updateData = {
      name: body.name?.trim(),
      shortName: body.shortName || null,
      established: body.established || null,
      type: body.type || null,
      category: body.category || null,
      naacGrade: body.naacGrade || null,
      logoUrl: body.logoUrl || null,
      imageUrl: body.imageUrl || body.logoUrl || null,
      images: Array.isArray(body.images) ? body.images : existing.images,
      location: body.location || `${body.city || existing.city || ''}, ${body.state || existing.state || 'Tamil Nadu'}`,
      city: body.city || null,
      state: body.state || 'Tamil Nadu',
      pincode: body.pincode || null,
      googleMapsLink: body.googleMapsLink || null,
      affiliation: body.affiliation || null,
      mission: body.mission || null,
      vision: body.vision || null,
      academicStreams: Array.isArray(body.academicStreams) ? body.academicStreams : existing.academicStreams,
      academicLevels: Array.isArray(body.academicLevels) ? body.academicLevels : existing.academicLevels,
      departments: Array.isArray(body.departments) ? body.departments : existing.departments,
      offeredCourses: Array.isArray(body.offeredCourses) ? body.offeredCourses : existing.offeredCourses,
      campusFacilities: Array.isArray(body.campusFacilities) ? body.campusFacilities : existing.campusFacilities,
      rating: body.rating !== undefined ? parseFloat(body.rating) : existing.rating,
      studentCount: body.studentCount !== undefined ? parseInt(body.studentCount) : existing.studentCount,
      facultyCount: body.facultyCount ? parseInt(body.facultyCount) : existing.facultyCount,
      placementRate: body.placementRate || null,
      highestPackage: body.highestPackage || null,
      averagePackage: body.averagePackage || null,
      tuitionFee: body.tuitionFee || null,
      hostelFee: body.hostelFee || null,
      hostelAvailable: body.hostelAvailable !== undefined ? body.hostelAvailable : existing.hostelAvailable,
      transportAvailable: body.transportAvailable !== undefined ? body.transportAvailable : existing.transportAvailable,
      scholarshipAvailable: body.scholarshipAvailable !== undefined ? body.scholarshipAvailable : existing.scholarshipAvailable,
      description: body.description || null,
      website: body.website || null,
      phone: body.phone || null,
      email: body.email || null,
      instagram: body.instagram || null,
      linkedin: body.linkedin || null,
      isActive: body.isActive !== undefined ? body.isActive : existing.isActive,
      isFeatured: body.isFeatured !== undefined ? body.isFeatured : existing.isFeatured
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

// ✅ FIXED: Added protect, adminOnly to admin routes

// Public routes (order matters - specific routes first)
router.get('/filters/options', getFilterOptions);
router.get('/search/advanced', searchUniversitiesAdvanced);
router.get('/search', searchUniversities);
router.get('/trending', getTrendingUniversities);
router.get('/', getUniversities);

// ✅ Admin only - Trash routes
router.get('/trashed', protect, adminOnly, getTrashedUniversities);
router.patch('/:id/soft-delete', protect, adminOnly, softDeleteUniversity);
router.patch('/:id/restore', protect, adminOnly, restoreUniversity);
router.delete('/:id/permanent', protect, adminOnly, permanentDeleteUniversity);

// Get single university by ID (must be after specific routes)
router.get('/:id', getUniversityById);

// ✅ Admin only - CRUD routes
router.post('/', protect, adminOnly, createUniversity);
router.put('/:id', protect, adminOnly, updateUniversity);
router.delete('/:id', protect, adminOnly, deleteUniversity);

module.exports = router;