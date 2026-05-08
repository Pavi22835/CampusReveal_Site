const path = require('path');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

let databaseUrl = process.env.DATABASE_URL;

try {
  const parsedUrl = new URL(databaseUrl);
  if (!parsedUrl.searchParams.has('connection_limit')) {
    parsedUrl.searchParams.set('connection_limit', '2');
  }
  databaseUrl = parsedUrl.toString();
  process.env.DATABASE_URL = databaseUrl;
} catch (error) {
  console.warn('Warning: invalid DATABASE_URL format, connection_limit not applied');
}

const prismaOptions = {
  log: ['error', 'warn'],
  datasources: {
    db: {
      url: databaseUrl
    }
  }
};

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient(prismaOptions);
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient(prismaOptions);
  }
  prisma = global.prisma;
}

module.exports = { prisma };