/**
 * Global Error Handler Middleware
 * Handles all errors thrown in the application
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;
  let errorCode = err.code || null;

  // Log error in development
  if (process.env.NODE_ENV !== 'production') {
    console.error('❌ Error:', {
      message: err.message,
      stack: err.stack,
      code: err.code,
      status: statusCode
    });
  }

  // ==================== PRISMA DATABASE ERRORS ====================
  
  // Duplicate unique field (P2002)
  if (err.code === 'P2002') {
    statusCode = 400;
    const field = err.meta?.target?.[0] || 'field';
    message = `Duplicate ${field}. This ${field} already exists.`;
    errorCode = 'DUPLICATE_FIELD';
  }
  
  // Record not found (P2025)
  if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Record not found';
    errorCode = 'NOT_FOUND';
  }
  
  // Foreign key constraint failed (P2003)
  if (err.code === 'P2003') {
    statusCode = 400;
    message = 'Cannot delete or update because it is referenced by other records.';
    errorCode = 'FOREIGN_KEY_CONSTRAINT';
  }
  
  // Required field missing (P2011)
  if (err.code === 'P2011') {
    statusCode = 400;
    message = 'Required field is missing.';
    errorCode = 'MISSING_FIELD';
  }

  // ==================== JWT AUTHENTICATION ERRORS ====================
  
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please login again.';
    errorCode = 'INVALID_TOKEN';
  }
  
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired. Please login again.';
    errorCode = 'TOKEN_EXPIRED';
  }
  
  if (err.name === 'NotBeforeError') {
    statusCode = 401;
    message = 'Token not active yet.';
    errorCode = 'TOKEN_NOT_ACTIVE';
  }

  // ==================== VALIDATION ERRORS ====================
  
  // Express-validator errors
  if (err.name === 'ValidationError' && err.array) {
    statusCode = 400;
    message = err.array().map(e => e.msg).join(', ');
    errorCode = 'VALIDATION_ERROR';
  }
  
  // Zod validation errors
  if (err.name === 'ZodError') {
    statusCode = 400;
    message = err.errors?.map(e => `${e.path.join('.')}: ${e.message}`).join(', ') || 'Validation failed';
    errorCode = 'ZOD_VALIDATION_ERROR';
  }
  
  // Mongoose validation (if using MongoDB)
  if (err.name === 'ValidationError' && err.errors) {
    statusCode = 400;
    message = Object.values(err.errors).map(e => e.message).join(', ');
    errorCode = 'MONGOOSE_VALIDATION';
  }

  // ==================== RATE LIMIT ERRORS ====================
  
  if (err.name === 'RateLimitError' || err.message?.includes('too many requests')) {
    statusCode = 429;
    message = 'Too many requests. Please try again later.';
    errorCode = 'RATE_LIMIT_EXCEEDED';
  }

  // ==================== FILE UPLOAD ERRORS ====================
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'File too large. Maximum file size is 5MB.';
    errorCode = 'FILE_TOO_LARGE';
  }
  
  if (err.code === 'LIMIT_FILE_COUNT') {
    statusCode = 400;
    message = 'Too many files uploaded.';
    errorCode = 'TOO_MANY_FILES';
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    message = 'Unexpected file field.';
    errorCode = 'UNEXPECTED_FILE';
  }

  // ==================== CUSTOM APPLICATION ERRORS ====================
  
  // Unauthorized access
  if (message === 'Not authorized' || message.includes('unauthorized')) {
    statusCode = 401;
    errorCode = 'UNAUTHORIZED';
  }
  
  // Forbidden access
  if (message === 'Access denied' || message.includes('forbidden')) {
    statusCode = 403;
    errorCode = 'FORBIDDEN';
  }
  
  // Not found
  if (message === 'Not found' || message.includes('not found')) {
    statusCode = 404;
    errorCode = 'NOT_FOUND';
  }

  // ==================== DATABASE CONNECTION ERRORS ====================
  
  if (err.message?.includes('connect ECONNREFUSED')) {
    statusCode = 503;
    message = 'Database connection failed. Please try again later.';
    errorCode = 'DB_CONNECTION_FAILED';
  }

  // ==================== RESPONSE ====================
  
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && {
      stack: err.stack,
      error: err.message,
      code: errorCode
    }),
    // Only include error code in production (without stack)
    ...(process.env.NODE_ENV === 'production' && errorCode && { code: errorCode })
  });
};

module.exports = errorHandler;