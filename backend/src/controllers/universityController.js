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
      { description: { contains: term, mode: 'insensitive' } },
      { academicStream: { contains: term, mode: 'insensitive' } },
      { academicLevel: { contains: term, mode: 'insensitive' } },
      { department: { contains: term, mode: 'insensitive' } }
    ]
  };
};

const buildFilterWhere = (filters) => {
  const where = { isTrashed: false };
  
  if (filters.academicStream) {
    where.academicStream = filters.academicStream;
  }
  
  if (filters.academicLevel) {
    where.academicLevel = filters.academicLevel;
  }
  
  if (filters.department) {
    where.department = filters.department;
  }
  
  if (filters.genderType) {
    where.genderType = filters.genderType;
  }
  
  if (filters.scholarship !== undefined) {
    where.scholarship = filters.scholarship === 'true';
  }
  
  if (filters.hostelAvailable !== undefined) {
    where.hostelAvailable = filters.hostelAvailable === 'true';
  }
  
  if (filters.minRating) {
    where.rating = { gte: parseFloat(filters.minRating) };
  }
  
  if (filters.minTransportScore) {
    where.transportScore = { gte: parseInt(filters.minTransportScore) };
  }
  
  if (filters.minPlacementPercent) {
    where.placementPercent = { gte: parseFloat(filters.minPlacementPercent) };
  }
  
  return where;
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
      // Filter parameters
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
    
    // Apply advanced filters
    if (academicStream) where.academicStream = academicStream;
    if (academicLevel) where.academicLevel = academicLevel;
    if (department) where.department = department;
    if (genderType) where.genderType = genderType;
    if (scholarship === 'true') where.scholarship = true;
    if (hostelAvailable === 'true') where.hostelAvailable = true;
    if (minRating) where.rating = { gte: parseFloat(minRating) };
    if (minTransportScore) where.transportScore = { gte: parseInt(minTransportScore) };
    if (minPlacementPercent) where.placementPercent = { gte: parseFloat(minPlacementPercent) };
    
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
          logoUrl: true,
          images: true,
          ratings: true,
          tuitionFee: true,
          hostelFee: true,
          placementRate: true,
          placementPercent: true,
          highestPackage: true,
          averagePackage: true,
          accreditation: true,
          website: true,
          email: true,
          phone: true,
          category: true,
          type: true,
          shortName: true,
          established: true,
          academicStream: true,
          academicLevel: true,
          department: true,
          offeredCourses: true,
          entranceExam: true,
          transportScore: true,
          scholarship: true,
          hostelAvailable: true,
          genderType: true,
          religiousAffiliation: true,
          campusArea: true,
          libraryBooks: true,
          sportsRating: true,
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

// NEW: Get universities with advanced filters
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
      minTransportScore,
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
    
    if (academicStream) where.academicStream = academicStream;
    if (academicLevel) where.academicLevel = academicLevel;
    if (department) where.department = department;
    if (genderType) where.genderType = genderType;
    if (scholarship) where.scholarship = true;
    if (hostelAvailable) where.hostelAvailable = true;
    if (minRating) where.rating = { gte: minRating };
    if (minTransportScore) where.transportScore = { gte: minTransportScore };
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
          logoUrl: true,
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
    res.status(500).json({ success: false, message: error.message });
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
    res.status(500).json({ success: false, message: error.message });
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
    const { limit = 1000 } = req.query;
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
    const { q, limit = 1000 } = req.query;
    
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

// @desc    Get filter options for dropdowns
// @route   GET /api/universities/filters/options
// @access  Public
const getFilterOptions = async (req, res) => {
  try {
    const [academicStreams, academicLevels, departments, genderTypes] = await Promise.all([
      prisma.university.findMany({
        where: { isTrashed: false },
        distinct: ['academicStream'],
        select: { academicStream: true }
      }),
      prisma.university.findMany({
        where: { isTrashed: false },
        distinct: ['academicLevel'],
        select: { academicLevel: true }
      }),
      prisma.university.findMany({
        where: { isTrashed: false },
        distinct: ['department'],
        select: { department: true }
      }),
      prisma.university.findMany({
        where: { isTrashed: false },
        distinct: ['genderType'],
        select: { genderType: true }
      })
    ]);
    
    res.json({
      success: true,
      data: {
        academicStreams: academicStreams.map(s => s.academicStream).filter(Boolean),
        academicLevels: academicLevels.map(l => l.academicLevel).filter(Boolean),
        departments: departments.map(d => d.department).filter(Boolean),
        genderTypes: genderTypes.map(g => g.genderType).filter(Boolean)
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
  searchUniversitiesAdvanced,
  getTrashedUniversities,
  softDeleteUniversity,
  restoreUniversity,
  permanentDeleteUniversity,
  getFilterOptions
};