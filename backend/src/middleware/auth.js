const jwt = require('jsonwebtoken');
const { prisma } = require('../prisma');

const protect = async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authorized, no token' 
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        credits: true,
        avatar: true
      }
    });
    
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Not authorized, token failed' 
    });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ 
      success: false, 
      message: 'Access denied. Admin only.' 
    });
  }
};

module.exports = { protect, adminOnly };