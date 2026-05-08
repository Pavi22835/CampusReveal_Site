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

// @desc    Get all universities (excluding trashed)
// @route   GET /api/universities
// @access  Public
const getUniversities = async (req, res) => {
  try {
    // FIXED: Changed default limit from 20 to 1000 to fetch all universities
    const { search, limit = 1000, page = 1 } = req.query;
    
    let where = {
      isTrashed: false  // Exclude trashed universities
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
        orderBy: { name: 'asc' }, // Changed to alphabetical order
        select: {
          id: true,
          name: true,
          location: true,
          city: true,
          state: true,
          rating: true,
          followers: true,
          walkScore: true,
          walkDescription: true,
          transit: true,
          transitDetail: true,
          acceptanceRate: true,
          medianSalary: true,
          financialAid: true,
          studentCount: true,
          description: true,
          imageUrl: true,
          images: true,
          ratings: true,
          tuitionFee: true,
          hostelFee: true,
          placementRate: true,
          accreditation: true,
          website: true,
          email: true,
          phone: true,
          category: true,
          type: true,
          createdAt: true,
          updatedAt: true,
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
    res.status(500).json({ success: false, message: error.message });
  }
};

// NEW: Get total count of universities
// @desc    Get total count of universities
// @route   GET /api/universities/count
// @access  Public
const getUniversitiesCount = async (req, res) => {
  try {
    const total = await prisma.university.count({
      where: { isTrashed: false }
    });
    
    console.log(`📊 Total universities count: ${total}`);
    
    res.json({
      success: true,
      total: total,
      message: `Total ${total} active universities in database`
    });
  } catch (error) {
    console.error('Get universities count error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all trashed universities (soft deleted)
// @route   GET /api/universities/trashed
// @access  Admin
const getTrashedUniversities = async (req, res) => {
  try {
    const { search, limit = 1000, page = 1 } = req.query; // Increased limit to 1000
    
    let where = {
      isTrashed: true  // Only get trashed universities
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
          location: true,
          city: true,
          state: true,
          rating: true,
          followers: true,
          walkScore: true,
          walkDescription: true,
          transit: true,
          transitDetail: true,
          acceptanceRate: true,
          medianSalary: true,
          financialAid: true,
          studentCount: true,
          description: true,
          imageUrl: true,
          images: true,
          ratings: true,
          tuitionFee: true,
          hostelFee: true,
          placementRate: true,
          accreditation: true,
          website: true,
          email: true,
          phone: true,
          category: true,
          type: true,
          isTrashed: true,
          trashedAt: true,
          createdAt: true,
          updatedAt: true,
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
    res.status(500).json({ success: false, message: error.message });
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
    res.status(500).json({ success: false, message: error.message });
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
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Permanently delete university
// @route   DELETE /api/universities/:id/permanent
// @access  Admin
const permanentDeleteUniversity = async (req, res) => {
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
    
    // Permanently delete the university
    await prisma.university.delete({
      where: { id }
    });
    
    res.json({
      success: true,
      message: 'University permanently deleted successfully'
    });
  } catch (error) {
    console.error('Permanent delete university error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get university by ID
// @route   GET /api/universities/:id
// @access  Public
const getUniversityById = async (req, res) => {
  try {
    const university = await prisma.university.findUnique({
      where: { id: req.params.id },
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
      return res.status(404).json({ 
        success: false, 
        message: 'University not found' 
      });
    }
    
    res.json({
      success: true,
      data: university
    });
  } catch (error) {
    console.error('Get university error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get trending universities
// @route   GET /api/universities/trending
// @access  Public
const getTrendingUniversities = async (req, res) => {
  try {
    const { limit = 1000 } = req.query; // Increased limit
    const universities = await prisma.university.findMany({
      where: { isTrashed: false },
      take: parseInt(limit),
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
    console.error('Get trending universities error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Search universities
// @route   GET /api/universities/search
// @access  Public
const searchUniversities = async (req, res) => {
  try {
    const { q, limit = 1000 } = req.query; // Increased limit
    
    if (!q) {
      return res.json({ success: true, data: [] });
    }
    
    const universities = await prisma.university.findMany({
      where: {
        ...buildSearchWhere(q),
        isTrashed: false
      },
      take: parseInt(limit),
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
    console.error('Search universities error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Advanced search universities
// @route   GET /api/universities/search/advanced
// @access  Public
const searchUniversitiesAdvanced = async (req, res) => {
  try {
    const { search, location, course, degree, limit = 1000 } = req.query; // Increased limit
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
      where: {
        AND: filters
      },
      take: parseInt(limit),
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
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { 
  getUniversities,
  getUniversitiesCount, // NEW: Added count function
  getUniversityById, 
  getTrendingUniversities,
  searchUniversities,
  searchUniversitiesAdvanced,
  getTrashedUniversities,
  softDeleteUniversity,
  restoreUniversity,
  permanentDeleteUniversity
};