const jwt = require('jsonwebtoken');
const { prisma } = require('../prisma');

/**
 * Protect middleware - Authenticates user via JWT token
 * @route   Used on any protected route
 * @access  Private (Authenticated users only)
 */
const protect = async (req, res, next) => {
  let token;
  
  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  // Also check for token in cookies (optional)
  if (!token && req.cookies?.token) {
    token = req.cookies.token;
  }
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authorized. Please login.' 
    });
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        credits: true,
        avatar: true,
        isTrashed: true,
        isVerified: true,
        lastLogin: true
      }
    });
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found.' 
      });
    }
    
    if (user.isTrashed) {
      return res.status(401).json({ 
        success: false, 
        message: 'Account has been deactivated.' 
      });
    }
    
    // Attach user to request object
    req.user = user;
    
    // Update last login time (async - don't await to not block)
    prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    }).catch(err => console.error('Failed to update last login:', err));
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token.' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired.' 
      });
    }
    
    res.status(401).json({ 
      success: false, 
      message: 'Authentication failed.' 
    });
  }
};

/**
 * Admin only middleware - Restricts access to admin users only
 * @route   Used on admin-only routes
 * @access  Private (Admin only)
 */
const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
  }
  
  if (req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ 
      success: false, 
      message: 'Access denied.' 
    });
  }
};

/**
 * Mentor only middleware
 * @route   Used on mentor-only routes
 * @access  Private (Mentor or Admin only)
 */
const mentorOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
  }
  
  if (req.user.role === 'MENTOR' || req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ 
      success: false, 
      message: 'Access denied.' 
    });
  }
};

/**
 * Student only middleware
 * @route   Used on student-only routes
 * @access  Private (Student only)
 */
const studentOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
  }
  
  if (req.user.role === 'STUDENT') {
    next();
  } else {
    res.status(403).json({ 
      success: false, 
      message: 'Access denied.' 
    });
  }
};

/**
 * Optional auth - doesn't fail if no token, just sets req.user if exists
 * @route   Used on routes that work both with and without auth
 * @access  Public (but provides user context if authenticated)
 */
const optionalAuth = async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (!token && req.cookies?.token) {
    token = req.cookies.token;
  }
  
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.id, isTrashed: false },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          credits: true,
          avatar: true
        }
      });
      if (user) req.user = user;
    } catch (error) {
      // Silently fail - optional auth doesn't block on invalid token
    }
  }
  
  next();
};

module.exports = { 
  protect, 
  adminOnly, 
  mentorOnly,
  studentOnly,
  optionalAuth
};