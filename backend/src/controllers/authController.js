const { prisma } = require('../prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// Generate OTP (hardcoded to 1234 for development)
const generateOTP = () => {
  return '1234';
};

// Mock send OTP function (replace with actual SMS service)
const sendOTPToPhone = async (phone, otp) => {
  console.log(`\n========== SENDING OTP ==========`);
  console.log(`📱 Phone: ${phone}`);
  console.log(`🔐 OTP: ${otp}`);
  console.log(`⏰ Valid for 10 minutes`);
  console.log(`================================\n`);
  return true;
};

// ==================== OTP AUTHENTICATION ====================

// @desc    Send OTP for login/registration
// @route   POST /api/auth/send-otp
// @access  Public
const sendLoginOTP = async (req, res) => {
  try {
    const { phone, name } = req.body;

    if (!phone || phone.length !== 10) {
      return res.status(400).json({ 
        success: false, 
        message: 'Valid 10-digit phone number is required' 
      });
    }

    // Invalidate previous unused OTPs
    await prisma.oTP.updateMany({
      where: {
        phone,
        isUsed: false,
        expiresAt: { gt: new Date() }
      },
      data: { isUsed: true }
    });

    // Generate OTP
    const otp = generateOTP();
    
    // Save OTP to database
    await prisma.oTP.create({
      data: {
        phone,
        otp,
        purpose: 'login',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
      }
    });

    // Send OTP
    await sendOTPToPhone(phone, otp);

    res.status(200).json({ 
      success: true, 
      message: 'OTP sent successfully',
      debugOtp: otp  // Always show for development
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to send OTP' });
  }
};

// @desc    Verify OTP and login/register user
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
  try {
    const { phone, otp, name } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone and OTP are required' 
      });
    }

    // Find valid OTP
    const otpRecord = await prisma.oTP.findFirst({
      where: {
        phone,
        otp,
        isUsed: false,
        expiresAt: { gt: new Date() }
      }
    });

    if (!otpRecord) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired OTP' 
      });
    }

    // Mark OTP as used
    await prisma.oTP.update({
      where: { id: otpRecord.id },
      data: { isUsed: true }
    });

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { phone }
    });

    if (!user) {
      // Create new user with phone
      user = await prisma.user.create({
        data: {
          phone,
          name: name || `User_${phone.slice(-4)}`,
          role: 'STUDENT',
          credits: 50,
          isGuest: false,
          isVerified: true
        }
      });
    } else {
      // Update last login
      user = await prisma.user.update({
        where: { id: user.id },
        data: { 
          lastLogin: new Date(),
          name: name || user.name
        }
      });
    }

    // Generate JWT token
    const token = generateToken(user.id, user.role);

    // Remove sensitive data
    const userData = {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
      credits: user.credits,
      avatar: user.avatar
    };

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      token,
      user: userData
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to verify OTP' });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone number is required' 
      });
    }

    // Invalidate previous unused OTPs
    await prisma.oTP.updateMany({
      where: {
        phone,
        isUsed: false,
        expiresAt: { gt: new Date() }
      },
      data: { isUsed: true }
    });

    // Generate new OTP
    const otp = generateOTP();
    
    // Save new OTP
    await prisma.oTP.create({
      data: {
        phone,
        otp,
        purpose: 'login',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
      }
    });

    // Send OTP
    await sendOTPToPhone(phone, otp);

    res.status(200).json({ 
      success: true, 
      message: 'OTP resent successfully',
      debugOtp: otp
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to resend OTP' });
  }
};

// ==================== EMAIL/PASSWORD AUTHENTICATION ====================

// @desc    Register user with email/password
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email and password are required' 
      });
    }

    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { email }
    });

    if (userExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists with this email' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'STUDENT',
        credits: 0,
        isGuest: false
      }
    });

    const token = generateToken(user.id, user.role);

    res.status(201).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        credits: user.credits
      },
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error during registration'
    });
  }
};

// @desc    Login user with email/password
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username/email and password are required' 
      });
    }

    // Find user by email or name
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: username },
          { name: username }
        ]
      }
    });

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    const token = generateToken(user.id, user.role);

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        credits: user.credits,
        avatar: user.avatar
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error during login'
    });
  }
};

// ==================== PROFILE MANAGEMENT ====================

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        university: true,
        reviews: {
          take: 5,
          orderBy: { createdAt: 'desc' }
        },
        discussions: {
          take: 5,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { 
            reviews: true, 
            discussions: true, 
            comments: true 
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        credits: user.credits,
        avatar: user.avatar,
        bio: user.bio,
        university: user.university,
        graduationYear: user.graduationYear,
        major: user.major,
        reviews: user.reviews,
        discussions: user.discussions,
        _count: user._count
      }
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, avatar, universityId, graduationYear, major, bio } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name: name !== undefined ? name : undefined,
        avatar: avatar !== undefined ? avatar : undefined,
        universityId: universityId !== undefined ? universityId : undefined,
        graduationYear: graduationYear !== undefined ? parseInt(graduationYear) : undefined,
        major: major !== undefined ? major : undefined,
        bio: bio !== undefined ? bio : undefined
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
        bio: true,
        universityId: true,
        graduationYear: true,
        major: true,
        credits: true
      }
    });

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ==================== ADMIN USER MANAGEMENT ====================

// @desc    Get all users (Admin)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { isTrashed: false },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        credits: true,
        avatar: true,
        major: true,
        graduationYear: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { reviews: true, discussions: true, comments: true }
        }
      }
    });

    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user by ID (Admin)
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        university: true,
        reviews: { take: 10, orderBy: { createdAt: 'desc' } },
        discussions: { take: 5, orderBy: { createdAt: 'desc' } },
        _count: { select: { reviews: true, discussions: true, comments: true } }
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all trashed users
// @route   GET /api/admin/users/trashed
// @access  Private/Admin
const getTrashedUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { isTrashed: true },
      orderBy: { trashedAt: 'desc' }
    });

    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Get trashed users error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user (Admin)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, major, graduationYear, credits } = req.body;

    const userExists = await prisma.user.findUnique({ where: { id } });

    if (!userExists) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        email: email !== undefined ? email : undefined,
        role: role !== undefined ? role : undefined,
        major: major !== undefined ? major : undefined,
        graduationYear: graduationYear !== undefined ? parseInt(graduationYear) : undefined,
        credits: credits !== undefined ? parseInt(credits) : undefined
      }
    });

    res.json({ success: true, data: updatedUser, message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Soft delete user
// @route   PATCH /api/admin/users/:id/soft-delete
// @access  Private/Admin
const softDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.isTrashed) return res.status(400).json({ success: false, message: 'User already in trash' });
    if (user.role === 'ADMIN') return res.status(403).json({ success: false, message: 'Cannot delete admin users' });

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isTrashed: true, trashedAt: new Date() }
    });

    res.json({ success: true, message: 'User moved to trash', data: updatedUser });
  } catch (error) {
    console.error('Soft delete user error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Restore user
// @route   PATCH /api/admin/users/:id/restore
// @access  Private/Admin
const restoreUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (!user.isTrashed) return res.status(400).json({ success: false, message: 'User not in trash' });

    const restoredUser = await prisma.user.update({
      where: { id },
      data: { isTrashed: false, trashedAt: null }
    });

    res.json({ success: true, message: 'User restored', data: restoredUser });
  } catch (error) {
    console.error('Restore user error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Permanently delete user
// @route   DELETE /api/admin/users/:id/permanent
// @access  Private/Admin
const permanentDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'ADMIN') return res.status(403).json({ success: false, message: 'Cannot delete admin users' });

    // Delete related records
    await prisma.review.deleteMany({ where: { userId: id } });
    await prisma.discussion.deleteMany({ where: { authorId: id } });
    await prisma.comment.deleteMany({ where: { authorId: id } });
    await prisma.mentor.deleteMany({ where: { userId: id } });
    await prisma.discussionLike.deleteMany({ where: { userId: id } });
    await prisma.commentLike.deleteMany({ where: { userId: id } });
    await prisma.oTP.deleteMany({ where: { phone: user.phone || '' } });

    await prisma.user.delete({ where: { id } });

    res.json({ success: true, message: 'User permanently deleted' });
  } catch (error) {
    console.error('Permanent delete user error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user (hard delete)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'ADMIN') return res.status(403).json({ success: false, message: 'Cannot delete admin users' });

    await prisma.user.delete({ where: { id } });

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { 
  // OTP Auth
  sendLoginOTP,
  verifyOTP,
  resendOTP,
  // Email/Password Auth
  register,
  login,
  // Profile
  getMe,
  updateProfile,
  // Admin
  getAllUsers,
  getUserById,
  getTrashedUsers,
  updateUser,
  softDeleteUser,
  restoreUser,
  permanentDeleteUser,
  deleteUser
};