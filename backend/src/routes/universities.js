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
      { courses: { contains: term, mode: 'insensitive' } },
      { shortName: { contains: term, mode: 'insensitive' } },
      { description: { contains: term, mode: 'insensitive' } }
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
      isTrashed: false  // Exclude trashed universities
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
      include: {
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
      isTrashed: true  // Only get trashed universities
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
      include: {
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
    
    // Check if university exists
    const university = await prisma.university.findUnique({
      where: { id }
    });
    
    if (!university) {
      return res.status(404).json({
        success: false,
        message: 'University not found'
      });
    }
    
    // Check if already trashed
    if (university.isTrashed) {
      return res.status(400).json({
        success: false,
        message: 'University is already in trash'
      });
    }
    
    // Soft delete the university
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
    
    // Check if university exists
    const university = await prisma.university.findUnique({
      where: { id }
    });
    
    if (!university) {
      return res.status(404).json({
        success: false,
        message: 'University not found'
      });
    }
    
    // Check if not in trash
    if (!university.isTrashed) {
      return res.status(400).json({
        success: false,
        message: 'University is not in trash'
      });
    }
    
    // Restore the university
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
        projects: {
          take: 5,
          orderBy: { createdAt: 'desc' }
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
      include: {
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
      include: {
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
    const { search, location, course, degree } = req.query;
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
      filters.push({ courses: { contains: course, mode: 'insensitive' } });
    }

    if (degree) {
      filters.push({ courses: { contains: degree, mode: 'insensitive' } });
    }

    if (types.length) {
      filters.push({
        OR: types.map((type) => ({
          type: { contains: type, mode: 'insensitive' }
        }))
      });
    }

    if (filters.length === 1) {
      return res.json({ success: true, data: [] });
    }

    const universities = await prisma.university.findMany({
      where: { AND: filters },
      take: 50,
      orderBy: { rating: 'desc' },
      include: {
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
    
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    const name = body?.name;
    console.log('Extracted name:', name);
    
    if (!name || name.trim() === '') {
      console.log('ERROR: No name provided');
      return res.status(400).json({
        success: false,
        message: 'University name is required'
      });
    }
    
    const existing = await prisma.university.findUnique({
      where: { name: name.trim() }
    });
    
    if (existing) {
      console.log('University already exists:', name);
      return res.status(400).json({
        success: false,
        message: 'University with this name already exists'
      });
    }
    
    const university = await prisma.university.create({
      data: {
        name: name.trim(),
        location: body.location || `${body.city || ''}, ${body.state || 'Tamil Nadu'}`,
        city: body.city || '',
        state: body.state || 'Tamil Nadu',
        googleMapsLink: body.googleMapsLink || '',
        rating: parseFloat(body.rating) || 0,
        studentCount: parseInt(body.studentCount) || 0,
        description: body.description || '',
        medianSalary: body.medianSalary || '',
        acceptanceRate: body.acceptanceRate || '',
        financialAid: body.financialAid || '',
        walkScore: parseInt(body.walkScore) || 0,
        walkDescription: body.walkDescription || '',
        transit: body.transit || '',
        transitDetail: body.transitDetail || '',
        images: Array.isArray(body.images) ? body.images : [],
        academicStream: body.academicStream || '',
        academicLevel: body.academicLevel || '',
        department: body.department || '',
        offeredCourses: Array.isArray(body.offeredCourses) ? body.offeredCourses : [],
        entranceExam: body.entranceExam || '',
        ratings: {
          academics: 0,
          placements: 0,
          infrastructure: 0,
          socialLife: 0,
          metadata: {
            shortName: body.shortName || '',
            established: body.established || '',
            type: body.type || '',
            category: body.category || '',
            pincode: body.pincode || '',
            phone: body.phone || '',
            email: body.email || '',
            website: body.website || '',
            accreditation: body.accreditation || '',
            affiliation: body.affiliation || '',
            facultyCount: body.facultyCount ? parseInt(body.facultyCount) : 0,
            placementRate: body.placementRate || '',
            tuitionFee: body.tuitionFee || '',
            hostelFee: body.hostelFee || '',
            mission: body.mission || '',
            vision: body.vision || '',
            instagram: body.instagram || '',
            linkedin: body.linkedin || '',
            twitter: body.twitter || ''
          }
        }
      }
    });
    
    console.log('✅ University created successfully:', university.name);
    console.log('===========================\n');
    
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
    let updateData = { ...req.body };
    
    // Remove id from update data if present
    delete updateData.id;
    
    // Convert numeric fields to proper types
    if (updateData.rating !== undefined) updateData.rating = parseFloat(updateData.rating);
    if (updateData.studentCount !== undefined) updateData.studentCount = parseInt(updateData.studentCount);
    if (updateData.facultyCount !== undefined) updateData.facultyCount = parseInt(updateData.facultyCount);
    if (updateData.walkScore !== undefined) updateData.walkScore = parseInt(updateData.walkScore);
    
    // Handle metadata in ratings field
    if (updateData.instagram || updateData.linkedin || updateData.twitter || 
        updateData.mission || updateData.vision || updateData.shortName ||
        updateData.established || updateData.type || updateData.category ||
        updateData.phone || updateData.email || updateData.website ||
        updateData.accreditation || updateData.affiliation || updateData.placementRate ||
        updateData.tuitionFee || updateData.hostelFee || updateData.pincode) {
      
      // Get existing university to preserve existing metadata
      const existing = await prisma.university.findUnique({
        where: { id }
      });
      
      const existingMetadata = existing?.ratings?.metadata || {};
      
      updateData.ratings = {
        academics: existing?.ratings?.academics || 0,
        placements: existing?.ratings?.placements || 0,
        infrastructure: existing?.ratings?.infrastructure || 0,
        socialLife: existing?.ratings?.socialLife || 0,
        metadata: {
          ...existingMetadata,
          shortName: updateData.shortName || existingMetadata.shortName,
          established: updateData.established || existingMetadata.established,
          type: updateData.type || existingMetadata.type,
          category: updateData.category || existingMetadata.category,
          pincode: updateData.pincode || existingMetadata.pincode,
          phone: updateData.phone || existingMetadata.phone,
          email: updateData.email || existingMetadata.email,
          website: updateData.website || existingMetadata.website,
          accreditation: updateData.accreditation || existingMetadata.accreditation,
          affiliation: updateData.affiliation || existingMetadata.affiliation,
          facultyCount: updateData.facultyCount || existingMetadata.facultyCount,
          placementRate: updateData.placementRate || existingMetadata.placementRate,
          tuitionFee: updateData.tuitionFee || existingMetadata.tuitionFee,
          hostelFee: updateData.hostelFee || existingMetadata.hostelFee,
          mission: updateData.mission || existingMetadata.mission,
          vision: updateData.vision || existingMetadata.vision,
          instagram: updateData.instagram || existingMetadata.instagram,
          linkedin: updateData.linkedin || existingMetadata.linkedin,
          twitter: updateData.twitter || existingMetadata.twitter
        }
      };
      
      // Remove these fields from top level as they're now in metadata
      delete updateData.shortName;
      delete updateData.established;
      delete updateData.type;
      delete updateData.category;
      delete updateData.pincode;
      delete updateData.phone;
      delete updateData.email;
      delete updateData.website;
      delete updateData.accreditation;
      delete updateData.affiliation;
      delete updateData.facultyCount;
      delete updateData.placementRate;
      delete updateData.tuitionFee;
      delete updateData.hostelFee;
      delete updateData.mission;
      delete updateData.vision;
      delete updateData.instagram;
      delete updateData.linkedin;
      delete updateData.twitter;
    }
    
    console.log('Updating university with data:', JSON.stringify(updateData, null, 2));
    
    const university = await prisma.university.update({
      where: { id },
      data: updateData
    });
    
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