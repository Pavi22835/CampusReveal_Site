const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const { prisma } = require('./prisma');

// Use shared Prisma client from prisma.js


// Test database connection on startup
async function testDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Please check your DATABASE_URL in .env file');
    process.exit(1);
  }
}

const app = express();

// ==================== CORS CONFIGURATION ====================
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  process.env.CORS_ORIGIN
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Blocked origin:', origin);
      callback(null, true); // Allow all for development - remove in production
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ==================== HEALTH CHECK ====================
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: 'OK', 
      message: 'Server is running!',
      database: 'Connected to PostgreSQL',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Database connection failed',
      error: error.message 
    });
  }
});

// ==================== ROUTES ====================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/universities', require('./routes/universities'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/community', require('./routes/community'));
app.use('/api/admin', require('./routes/admin'));

// ==================== ERROR HANDLING ====================

// Error handling middleware
app.use(require('./middleware/errorHandler'));

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: `Route not found: ${req.method} ${req.url}` 
  });
});

// ==================== START SERVER ====================

const PORT = process.env.PORT || 3001;

// Test database connection before starting server
testDatabaseConnection().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`\n🚀 ========================================`);
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🚀 ========================================`);
    console.log(`\n📡 API URL: http://localhost:${PORT}/api`);
    console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`\n📊 CORS Allowed Origins:`);
    allowedOrigins.forEach(origin => console.log(`   ${origin}`));
    console.log(`\n📊 Database: PostgreSQL`);
    console.log(`📊 Prisma Studio: npx prisma studio`);
    console.log(`\n========================================\n`);
  });

  // ==================== GRACEFUL SHUTDOWN ====================
  const gracefulShutdown = async (signal) => {
    console.log(`\n⚠️  ${signal} received. Shutting down gracefully...`);
    
    server.close(async () => {
      console.log('📡 HTTP server closed');
      
      try {
        await prisma.$disconnect();
        console.log('❌ Disconnected from database');
        process.exit(0);
      } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
      }
    });
    
    // Force close after 10 seconds if not finished
    setTimeout(() => {
      console.error('⚠️ Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

  // Handle uncaught exceptions
  process.on('uncaughtException', async (error) => {
    console.error('Uncaught Exception:', error);
    await gracefulShutdown('uncaughtException');
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', async (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    await gracefulShutdown('unhandledRejection');
  });
});

// Export prisma for use in other files
module.exports = { prisma };