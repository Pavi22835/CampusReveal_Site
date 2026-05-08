const { prisma } = require('../prisma');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
const getProjects = async (req, res) => {
  try {
    const { domain, universityId } = req.query;
    
    let where = {};
    
    if (domain && domain !== 'All Domains') {
      where.domain = domain;
    }
    
    if (universityId) {
      where.universityId = universityId;
    }
    
    const projects = await prisma.project.findMany({
      where,
      include: {
        university: {
          select: { name: true, location: true }
        },
        author: {
          select: { name: true, major: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Public
const getProjectById = async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        university: true,
        author: true
      }
    });
    
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: 'Project not found' 
      });
    }
    
    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
  try {
    const project = await prisma.project.create({
      data: {
        ...req.body,
        authorId: req.user.id
      },
      include: {
        author: {
          select: { name: true, major: true }
        }
      }
    });
    
    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getProjects, getProjectById, createProject };