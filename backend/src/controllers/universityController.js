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
      { offeredCourses: { has: term } },
      { shortName: { contains: term, mode: 'insensitive' } },
      { description: { contains: term, mode: 'insensitive' } },
      { academicStreams: { has: term } },
      { academicLevels: { has: term } },
      { departments: { has: term } }
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
    
    if (search) {
      const searchWhere = buildSearchWhere(search);
      if (searchWhere) where = { ...where, ...searchWhere };
    }
    
    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }
    
    if (state) {
      where.state = { contains: state, mode: 'insensitive' };
    }
    
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
          mapLink: true, // ✅ ADDED: Google Maps Embed URL
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
          mapLink: true, // ✅ ADDED: Google Maps Embed URL
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

// ==================== CREATE UNIVERSITY ====================
// @desc    Create a new university
// @route   POST /api/universities
// @access  Admin
const createUniversity = async (req, res) => {
  try {
    const {
      name,
      shortName,
      established,
      type,
      category,
      naacGrade,
      logoUrl,
      campusVideoUrl,
      images,
      academicStreams,
      academicLevels,
      departments,
      offeredCourses,
      specializations,
      affiliation,
      approvedBy,
      mission,
      vision,
      hostelAvailable,
      hostelType,
      transportAvailable,
      campusFacilities,
      country,
      state,
      city,
      pincode,
      location,
      googleMapsLink,
      mapLink, // ✅ ADDED: Google Maps Embed URL
      rating,
      studentCount,
      facultyCount,
      placementRate,
      highestPackage,
      averagePackage,
      topRecruiters,
      tuitionFee,
      hostelFee,
      scholarshipAvailable,
      website,
      phone,
      email,
      instagram,
      linkedin,
      facebook,
      youtube,
      description,
      keywords
    } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'University name is required' });
    }

    // Check for duplicate name
    const existingUniversity = await prisma.university.findFirst({
      where: { name: name.trim() }
    });

    if (existingUniversity) {
      return res.status(400).json({ success: false, message: 'University with this name already exists' });
    }

    const university = await prisma.university.create({
      data: {
        name: name.trim(),
        shortName: shortName || null,
        established: established || null,
        type: type || null,
        category: category || null,
        naacGrade: naacGrade || null,
        logoUrl: logoUrl || null,
        campusVideoUrl: campusVideoUrl || null,
        images: images || [],
        academicStreams: academicStreams || [],
        academicLevels: academicLevels || [],
        departments: departments || [],
        offeredCourses: offeredCourses || [],
        specializations: specializations || null,
        affiliation: affiliation || null,
        approvedBy: approvedBy || null,
        mission: mission || null,
        vision: vision || null,
        hostelAvailable: hostelAvailable || false,
        hostelType: hostelType || null,
        transportAvailable: transportAvailable || false,
        campusFacilities: campusFacilities || [],
        country: country || 'India',
        state: state || null,
        city: city || null,
        pincode: pincode || null,
        location: location || null,
        googleMapsLink: googleMapsLink || null,
        mapLink: mapLink || null, // ✅ ADDED: Save mapLink
        rating: rating ? parseFloat(rating) : 0,
        studentCount: studentCount ? parseInt(studentCount) : null,
        facultyCount: facultyCount ? parseInt(facultyCount) : null,
        placementRate: placementRate || null,
        highestPackage: highestPackage || null,
        averagePackage: averagePackage || null,
        topRecruiters: topRecruiters || null,
        tuitionFee: tuitionFee || null,
        hostelFee: hostelFee || null,
        scholarshipAvailable: scholarshipAvailable || false,
        website: website || null,
        phone: phone || null,
        email: email || null,
        instagram: instagram || null,
        linkedin: linkedin || null,
        facebook: facebook || null,
        youtube: youtube || null,
        description: description || null,
        keywords: keywords || null
      }
    });

    res.status(201).json({
      success: true,
      message: 'University created successfully',
      data: university
    });
  } catch (error) {
    console.error('Create university error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== UPDATE UNIVERSITY ====================
// @desc    Update a university
// @route   PUT /api/universities/:id
// @access  Admin
const updateUniversity = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      shortName,
      established,
      type,
      category,
      naacGrade,
      logoUrl,
      campusVideoUrl,
      images,
      academicStreams,
      academicLevels,
      departments,
      offeredCourses,
      specializations,
      affiliation,
      approvedBy,
      mission,
      vision,
      hostelAvailable,
      hostelType,
      transportAvailable,
      campusFacilities,
      country,
      state,
      city,
      pincode,
      location,
      googleMapsLink,
      mapLink, // ✅ ADDED: Google Maps Embed URL
      rating,
      studentCount,
      facultyCount,
      placementRate,
      highestPackage,
      averagePackage,
      topRecruiters,
      tuitionFee,
      hostelFee,
      scholarshipAvailable,
      website,
      phone,
      email,
      instagram,
      linkedin,
      facebook,
      youtube,
      description,
      keywords
    } = req.body;

    const existingUniversity = await prisma.university.findUnique({
      where: { id }
    });

    if (!existingUniversity) {
      return res.status(404).json({ success: false, message: 'University not found' });
    }

    // Check for duplicate name (excluding current university)
    if (name && name !== existingUniversity.name) {
      const duplicate = await prisma.university.findFirst({
        where: { name: name.trim(), id: { not: id } }
      });
      if (duplicate) {
        return res.status(400).json({ success: false, message: 'University with this name already exists' });
      }
    }

    const updatedUniversity = await prisma.university.update({
      where: { id },
      data: {
        name: name !== undefined ? name.trim() : existingUniversity.name,
        shortName: shortName !== undefined ? shortName : existingUniversity.shortName,
        established: established !== undefined ? established : existingUniversity.established,
        type: type !== undefined ? type : existingUniversity.type,
        category: category !== undefined ? category : existingUniversity.category,
        naacGrade: naacGrade !== undefined ? naacGrade : existingUniversity.naacGrade,
        logoUrl: logoUrl !== undefined ? logoUrl : existingUniversity.logoUrl,
        campusVideoUrl: campusVideoUrl !== undefined ? campusVideoUrl : existingUniversity.campusVideoUrl,
        images: images !== undefined ? images : existingUniversity.images,
        academicStreams: academicStreams !== undefined ? academicStreams : existingUniversity.academicStreams,
        academicLevels: academicLevels !== undefined ? academicLevels : existingUniversity.academicLevels,
        departments: departments !== undefined ? departments : existingUniversity.departments,
        offeredCourses: offeredCourses !== undefined ? offeredCourses : existingUniversity.offeredCourses,
        specializations: specializations !== undefined ? specializations : existingUniversity.specializations,
        affiliation: affiliation !== undefined ? affiliation : existingUniversity.affiliation,
        approvedBy: approvedBy !== undefined ? approvedBy : existingUniversity.approvedBy,
        mission: mission !== undefined ? mission : existingUniversity.mission,
        vision: vision !== undefined ? vision : existingUniversity.vision,
        hostelAvailable: hostelAvailable !== undefined ? hostelAvailable : existingUniversity.hostelAvailable,
        hostelType: hostelType !== undefined ? hostelType : existingUniversity.hostelType,
        transportAvailable: transportAvailable !== undefined ? transportAvailable : existingUniversity.transportAvailable,
        campusFacilities: campusFacilities !== undefined ? campusFacilities : existingUniversity.campusFacilities,
        country: country !== undefined ? country : existingUniversity.country,
        state: state !== undefined ? state : existingUniversity.state,
        city: city !== undefined ? city : existingUniversity.city,
        pincode: pincode !== undefined ? pincode : existingUniversity.pincode,
        location: location !== undefined ? location : existingUniversity.location,
        googleMapsLink: googleMapsLink !== undefined ? googleMapsLink : existingUniversity.googleMapsLink,
        mapLink: mapLink !== undefined ? mapLink : existingUniversity.mapLink, // ✅ ADDED: Update mapLink
        rating: rating !== undefined ? parseFloat(rating) : existingUniversity.rating,
        studentCount: studentCount !== undefined ? (studentCount ? parseInt(studentCount) : null) : existingUniversity.studentCount,
        facultyCount: facultyCount !== undefined ? (facultyCount ? parseInt(facultyCount) : null) : existingUniversity.facultyCount,
        placementRate: placementRate !== undefined ? placementRate : existingUniversity.placementRate,
        highestPackage: highestPackage !== undefined ? highestPackage : existingUniversity.highestPackage,
        averagePackage: averagePackage !== undefined ? averagePackage : existingUniversity.averagePackage,
        topRecruiters: topRecruiters !== undefined ? topRecruiters : existingUniversity.topRecruiters,
        tuitionFee: tuitionFee !== undefined ? tuitionFee : existingUniversity.tuitionFee,
        hostelFee: hostelFee !== undefined ? hostelFee : existingUniversity.hostelFee,
        scholarshipAvailable: scholarshipAvailable !== undefined ? scholarshipAvailable : existingUniversity.scholarshipAvailable,
        website: website !== undefined ? website : existingUniversity.website,
        phone: phone !== undefined ? phone : existingUniversity.phone,
        email: email !== undefined ? email : existingUniversity.email,
        instagram: instagram !== undefined ? instagram : existingUniversity.instagram,
        linkedin: linkedin !== undefined ? linkedin : existingUniversity.linkedin,
        facebook: facebook !== undefined ? facebook : existingUniversity.facebook,
        youtube: youtube !== undefined ? youtube : existingUniversity.youtube,
        description: description !== undefined ? description : existingUniversity.description,
        keywords: keywords !== undefined ? keywords : existingUniversity.keywords
      }
    });

    res.json({
      success: true,
      message: 'University updated successfully',
      data: updatedUniversity
    });
  } catch (error) {
    console.error('Update university error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== DELETE UNIVERSITY (Hard Delete) ====================
// @desc    Hard delete a university
// @route   DELETE /api/universities/:id
// @access  Admin
const deleteUniversity = async (req, res) => {
  try {
    const { id } = req.params;
    
    const university = await prisma.university.findUnique({
      where: { id }
    });
    
    if (!university) {
      return res.status(404).json({ success: false, message: 'University not found' });
    }
    
    await prisma.review.deleteMany({ where: { universityId: id } });
    await prisma.universityCourse.deleteMany({ where: { universityId: id } });
    await prisma.university.delete({ where: { id } });
    
    res.json({
      success: true,
      message: 'University deleted successfully'
    });
  } catch (error) {
    console.error('Delete university error:', error);
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
        mapLink: true, // ✅ ADDED: Google Maps Embed URL
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
        mapLink: true, // ✅ ADDED: Google Maps Embed URL
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
        mapLink: true, // ✅ ADDED: Google Maps Embed URL
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
  searchUniversitiesAdvanced,
  getTrashedUniversities,
  softDeleteUniversity,
  restoreUniversity,
  permanentDeleteUniversity,
  createUniversity,
  updateUniversity,
  deleteUniversity,
  getFilterOptions
};