const express = require('express');
const router = express.Router();
const { prisma } = require('../prisma');

const normalizeStringFilter = (value) => {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  if (trimmed === '' || trimmed.toLowerCase() === 'all') return null;
  return trimmed;
};

const parseBooleanFilter = (value) => {
  if (value === undefined || value === null) return null;
  const normalized = String(value).trim().toLowerCase();
  if (['true', '1', 'yes', 'available'].includes(normalized)) return true;
  if (['false', '0', 'no', 'not available'].includes(normalized)) return false;
  return null;
};

const parseFloatFilter = (value) => {
  if (value === undefined || value === null) return null;
  const parsed = parseFloat(String(value).trim());
  return Number.isNaN(parsed) ? null : parsed;
};

const buildCollegeFilters = (query) => {
  const whereClauses = [{ isTrashed: false }];

  const academicStream = normalizeStringFilter(query.academicStream);
  const academicLevel = normalizeStringFilter(query.academicLevel);
  const department = normalizeStringFilter(query.department);
  const course = normalizeStringFilter(query.course);
  const location = normalizeStringFilter(query.location);
  const collegeName = normalizeStringFilter(query.collegeName);
  const transport = parseBooleanFilter(query.transport);
  const minRating = parseFloatFilter(query.minRating);
  const maxRating = parseFloatFilter(query.maxRating);

  if (academicStream) {
    whereClauses.push({ academicStreams: { has: academicStream } });
  }
  if (academicLevel) {
    whereClauses.push({ academicLevels: { has: academicLevel } });
  }
  if (department) {
    whereClauses.push({ departments: { has: department } });
  }
  if (course) {
    whereClauses.push({ offeredCourses: { has: course } });
  }

  if (location) {
    whereClauses.push({
      OR: [
        { location: { contains: location, mode: 'insensitive' } },
        { city: { contains: location, mode: 'insensitive' } },
        { state: { contains: location, mode: 'insensitive' } }
      ]
    });
  }

  if (collegeName) {
    whereClauses.push({
      OR: [
        { name: { contains: collegeName, mode: 'insensitive' } },
        { shortName: { contains: collegeName, mode: 'insensitive' } }
      ]
    });
  }

  if (transport !== null) {
    whereClauses.push({ transportAvailable: transport });
  }

  if (minRating !== null || maxRating !== null) {
    const ratingFilter = {};
    if (minRating !== null) ratingFilter.gte = minRating;
    if (maxRating !== null) ratingFilter.lte = maxRating;
    whereClauses.push({ rating: ratingFilter });
  }

  return whereClauses.length === 1 ? { isTrashed: false } : { AND: whereClauses };
};

// @desc    Get filtered colleges
// @route   GET /api/colleges
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, parseInt(req.query.limit, 10) || 50);
    const offset = (page - 1) * limit;
    const where = buildCollegeFilters(req.query);

    const [colleges, total] = await Promise.all([
      prisma.university.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { rating: 'desc' },
        select: {
          id: true,
          name: true,
          shortName: true,
          location: true,
          city: true,
          state: true,
          academicStreams: true,
          academicLevels: true,
          departments: true,
          offeredCourses: true,
          transportAvailable: true,
          rating: true,
          tuitionFee: true,
          hostelAvailable: true,
          logoUrl: true,
          imageUrl: true,
          description: true,
          website: true,
          email: true,
          phone: true,
          studentCount: true,
          isActive: true
        }
      }),
      prisma.university.count({ where })
    ]);

    return res.json({
      success: true,
      total,
      data: colleges,
      pagination: {
        page,
        limit,
        pages: total > 0 ? Math.ceil(total / limit) : 0
      }
    });
  } catch (error) {
    console.error('Get colleges error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to fetch colleges. Please try again later.'
    });
  }
});

// @desc    Get dynamic filter options from existing college data
// @route   GET /api/colleges/options
// @access  Public
router.get('/options', async (req, res) => {
  try {
    const colleges = await prisma.university.findMany({
      where: { isTrashed: false },
      select: {
        academicStreams: true,
        academicLevels: true,
        departments: true,
        offeredCourses: true,
        location: true,
        city: true,
        state: true,
        name: true,
        shortName: true,
        transportAvailable: true
      }
    });

    const optionSet = {
      academicStreams: new Set(),
      academicLevels: new Set(),
      departments: new Set(),
      offeredCourses: new Set(),
      locations: new Set(),
      collegeNames: new Set()
    };

    colleges.forEach((college) => {
      college.academicStreams.forEach((value) => optionSet.academicStreams.add(value));
      college.academicLevels.forEach((value) => optionSet.academicLevels.add(value));
      college.departments.forEach((value) => optionSet.departments.add(value));
      college.offeredCourses.forEach((value) => optionSet.offeredCourses.add(value));
      if (college.location) optionSet.locations.add(college.location);
      if (college.city) optionSet.locations.add(college.city);
      if (college.state) optionSet.locations.add(college.state);
      if (college.name) optionSet.collegeNames.add(college.name);
      if (college.shortName) optionSet.collegeNames.add(college.shortName);
    });

    return res.json({
      success: true,
      data: {
        academicStreams: Array.from(optionSet.academicStreams).sort(),
        academicLevels: Array.from(optionSet.academicLevels).sort(),
        departments: Array.from(optionSet.departments).sort(),
        courses: Array.from(optionSet.offeredCourses).sort(),
        locations: Array.from(optionSet.locations).sort(),
        collegeNames: Array.from(optionSet.collegeNames).sort(),
        transportOptions: ['Available', 'Not Available']
      }
    });
  } catch (error) {
    console.error('Get college options error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to load college filter options.'
    });
  }
});

module.exports = router;
