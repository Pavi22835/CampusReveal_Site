const express = require('express');
const router = express.Router();
const { 
  getProjects, 
  getProjectById, 
  createProject 
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');

router.get('/', getProjects);
router.get('/:id', getProjectById);
router.post('/', protect, createProject);

module.exports = router;