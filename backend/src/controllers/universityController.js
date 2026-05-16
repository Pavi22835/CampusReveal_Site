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
      { offeredCourses: { has: term } },  // ✅ FIXED: changed from 'courses' to 'offeredCourses'
      { shortName: { contains: term, mode: 'insensitive' } },
      { description: { contains: term, mode: 'insensitive' } },
      { academicStreams: { has: term } },  // ✅ FIXED: changed from 'academicStream' to 'academicStreams'
      { academicLevels: { has: term } },   // ✅ FIXED: changed from 'academicLevel' to 'academicLevels'
      { departments: { has: term } }       // ✅ FIXED: changed from 'department' to 'departments'
    ]
  };
};

// @desc    Get all universities (excluding trashed) with filters
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
      genderType,
      scholarship,
      hostelAvailable,
      minRating,
      minTransportScore,
      minPlacementPercent,
      city,
      state
    } = req.query;
    
    let where = { isTrashed: false };
    
    // Apply search filter
    if (search) {
      const searchWhere = buildSearchWhere(search);
      if (searchWhere) where = { ...where, ...searchWhere };
    }
    
    // Apply location filters
    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }
    
    if (state) {
      where.state = { contains: state, mode: 'insensitive' };
    }
    
    // Apply advanced filters - ✅ FIXED: use plural field names
    if (academicStream) where.academicStreams = { has: academicStream };
    if (academicLevel) where.academicLevels = { has: academicLevel };
    if (department) where.departments = { has: department };
    if (genderType) where.genderType = genderType;
    if (scholarship === 'true') where.scholarshipAvailable = true;
    if (hostelAvailable === 'true') where.hostelAvailable = true;
    if (minRating) where.rating = { gte: parseFloat(minRating) };
    
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
          location: true,
          city: true,
          state: true,
          rating: true,
          studentCount: true,
          description: true,
          imageUrl: true,
          logoUrl: true,
          images: true,
          tuitionFee: true,
          hostelFee: true,
          placementRate: true,
          highestPackage: true,
          averagePackage: true,
          website: true,
          email: true,
          phone: true,
          category: true,
          type: true,
          established: true,
          academicStreams: true,
          academicLevels: true,
          departments: true,
          offeredCourses: true,
          hostelAvailable: true,
          transportAvailable: true,
          scholarshipAvailable: true,
          campusFacilities: true,
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

// @desc    Filter universities (POST version)
// @route   POST /api/universities/filter
// @access  Public
const filterUniversities = async (req, res) => {
  try {
    const { 
      search,
      academicStream,
      academicLevel,
      department,
      genderType,
      scholarship,
      hostelAvailable,
      minRating,
      city,
      state,
      limit = 50,
      page = 1
    } = req.body;
    
    let where = { isTrashed: false };
    
    if (search) {
      const searchWhere = buildSearchWhere(search);
      if (searchWhere) where = { ...where, ...searchWhere };
    }
    
    // ✅ FIXED: use plural field names
    if (academicStream) where.academicStreams = { has: academicStream };
    if (academicLevel) where.academicLevels = { has: academicLevel };
    if (department) where.departments = { has: department };
    if (genderType) where.genderType = genderType;
    if (scholarship) where.scholarshipAvailable = true;
    if (hostelAvailable) where.hostelAvailable = true;
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
        include: {
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
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Filter universities error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get total count of universities
// @route   GET /api/universities/count
// @access  Public
const getUniversitiesCount = async (req, res) => {
  try {
    const total = await prisma.university.count({
      where: { isTrashed: false }
    });
    
    res.json({
      success: true,
      total: total
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
    const { search, limit = 1000, page = 1 } = req.query;
    
    let where = { isTrashed: true };
    
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
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Soft delete university (move to trash)
// @route   PATCH /api/universities/:id/soft-delete
// @access  Admin
const softDeleteUniversity = async (req, res) => {
  try {
    const { id } = req.params;
    
    const university = await prisma.university.findUnique({ where: { id } });
    
    if (!university) {
      return res.status(404).json({ success: false, message: 'University not found' });
    }
    
    if (university.isTrashed) {
      return res.status(400).json({ success: false, message: 'University is already in trash' });
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
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Restore university from trash
// @route   PATCH /api/universities/:id/restore
// @access  Admin
const restoreUniversity = async (req, res) => {
  try {
    const { id } = req.params;
    
    const university = await prisma.university.findUnique({ where: { id } });
    
    if (!university) {
      return res.status(404).json({ success: false, message: 'University not found' });
    }
    
    if (!university.isTrashed) {
      return res.status(400).json({ success: false, message: 'University is not in trash' });
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
      message: 'University restored successfully',
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
    
    const university = await prisma.university.findUnique({ where: { id } });
    
    if (!university) {
      return res.status(404).json({ success: false, message: 'University not found' });
    }
    
    // Delete related records first
    await prisma.review.deleteMany({ where: { universityId: id } });
    await prisma.universityCourse.deleteMany({ where: { universityId: id } });
    
    await prisma.university.delete({ where: { id } });
    
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
      where: { id: req.params.id, isTrashed: false },
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
      return res.status(404).json({ success: false, message: 'University not found' });
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
    const { limit = 6 } = req.query;
    const universities = await prisma.university.findMany({
      where: { isTrashed: false },
      take: parseInt(limit),
      orderBy: { rating: 'desc' },
      select: {
        id: true,
        name: true,
        location: true,
        city: true,
        rating: true,
        imageUrl: true,
        images: true,
        logoUrl: true,
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
    console.error('Get trending universities error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Search universities
// @route   GET /api/universities/search
// @access  Public
const searchUniversities = async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ success: true, data: [] });
    }
    
    const universities = await prisma.university.findMany({
      where: {
        ...buildSearchWhere(q),
        isTrashed: false
      },
      take: parseInt(limit),
      select: {
        id: true,
        name: true,
        location: true,
        city: true,
        rating: true,
        imageUrl: true,
        images: true,
        logoUrl: true,
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

// ✅ ADDED: Advanced search universities
// @desc    Advanced search with multiple filters
// @route   GET /api/universities/search/advanced
// @access  Public
const searchUniversitiesAdvanced = async (req, res) => {
  try {
    const { 
      q, 
      city, 
      state, 
      minRating, 
      academicStream, 
      academicLevel,
      hostelAvailable,
      limit = 50 
    } = req.query;
    
    let where = { isTrashed: false };
    
    if (q && q.length >= 2) {
      const searchWhere = buildSearchWhere(q);
      if (searchWhere) where = { ...where, ...searchWhere };
    }
    
    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (state) where.state = { contains: state, mode: 'insensitive' };
    if (minRating) where.rating = { gte: parseFloat(minRating) };
    if (academicStream) where.academicStreams = { has: academicStream };
    if (academicLevel) where.academicLevels = { has: academicLevel };
    if (hostelAvailable === 'true') where.hostelAvailable = true;
    
    const universities = await prisma.university.findMany({
      where,
      take: parseInt(limit),
      orderBy: { rating: 'desc' },
      select: {
        id: true,
        name: true,
        location: true,
        city: true,
        state: true,
        rating: true,
        imageUrl: true,
        images: true,
        logoUrl: true,
        studentCount: true,
        tuitionFee: true,
        academicStreams: true,
        academicLevels: true,
        hostelAvailable: true,
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
    console.error('Advanced search error:', error);
    res.status(500).json({ success: false, message: error.message });
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
    
    // Extract unique values from arrays
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
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { 
  getUniversities,
  filterUniversities,
  getUniversitiesCount,
  getUniversityById, 
  getTrendingUniversities,
  searchUniversities,
  searchUniversitiesAdvanced,  // ✅ ADDED: Now defined
  getTrashedUniversities,
  softDeleteUniversity,
  restoreUniversity,
  permanentDeleteUniversity,
  getFilterOptions
};