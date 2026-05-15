const path = require('path');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

// Load environment variables from parent directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

let databaseUrl = process.env.DATABASE_URL;

// ==================== CONNECTION POOL CONFIGURATION ====================
try {
  const parsedUrl = new URL(databaseUrl);
  
  // Set connection limit based on environment
  const connectionLimit = process.env.NODE_ENV === 'production' ? '10' : '2';
  
  if (!parsedUrl.searchParams.has('connection_limit')) {
    parsedUrl.searchParams.set('connection_limit', connectionLimit);
  }
  
  // Connection timeout settings
  if (!parsedUrl.searchParams.has('connect_timeout')) {
    parsedUrl.searchParams.set('connect_timeout', '10');
  }
  
  // Idle timeout
  if (!parsedUrl.searchParams.has('idle_in_transaction_session_timeout')) {
    parsedUrl.searchParams.set('idle_in_transaction_session_timeout', '60000');
  }
  
  databaseUrl = parsedUrl.toString();
  process.env.DATABASE_URL = databaseUrl;
  
  console.log(`✅ Database connection pool limit: ${connectionLimit}`);
} catch (error) {
  console.warn('⚠️ Warning: invalid DATABASE_URL format, using default settings');
}

// ==================== PRISMA CLIENT OPTIONS ====================
const prismaOptions = {
  log: process.env.NODE_ENV === 'development' 
    ? ['error', 'warn', 'info']  // Removed 'query' to avoid too much noise
    : ['error', 'warn'],
  errorFormat: process.env.NODE_ENV === 'production' ? 'minimal' : 'pretty',
  datasources: {
    db: {
      url: databaseUrl
    }
  }
};

// ==================== SINGLETON PATTERN ====================
let prisma;

if (process.env.NODE_ENV === 'production') {
  // Create new instance for production
  prisma = new PrismaClient(prismaOptions);
} else {
  // Development: Use global singleton to prevent too many connections
  if (!global.prisma) {
    global.prisma = new PrismaClient(prismaOptions);
    
    // ✅ REMOVED: beforeExit event (not supported in Prisma 5+)
    // Just log when connected
    global.prisma.$connect()
      .then(() => {
        console.log('✅ Prisma connected to database');
      })
      .catch((error) => {
        console.error('❌ Prisma connection error:', error);
      });
  }
  prisma = global.prisma;
}

// ==================== HEALTH CHECK FUNCTION ====================
const checkDatabaseConnection = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { success: true, message: 'Database connected' };
  } catch (error) {
    console.error('Database health check failed:', error.message);
    return { success: false, message: error.message };
  }
};

// ==================== GRACEFUL SHUTDOWN ====================
const disconnectPrisma = async () => {
  try {
    await prisma.$disconnect();
    console.log('✅ Prisma disconnected successfully');
  } catch (error) {
    console.error('❌ Error disconnecting Prisma:', error);
  }
};

// Handle process termination
process.on('SIGINT', async () => {
  await disconnectPrisma();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectPrisma();
  process.exit(0);
});

// ==================== EXPORTS ====================
module.exports = { 
  prisma,
  checkDatabaseConnection,
  disconnectPrisma
};