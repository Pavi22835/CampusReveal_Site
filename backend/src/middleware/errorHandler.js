const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;
  
  // Prisma specific errors
  if (err.code === 'P2002') {
    statusCode = 400;
    message = 'Duplicate field value';
  }
  
  if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Record not found';
  }
  
  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    code: err.code
  });
};

module.exports = errorHandler;