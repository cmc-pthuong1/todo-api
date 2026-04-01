// Wrapper xử lý lỗi chung (catchAsync)
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Global Error Handler
const globalErrorHandler = (err, req, res, next) => {
  console.error("🔴 Lỗi Server:", err.message);
  res.status(500).json({ 
    message: 'Internal Server Error', 
    error: err.message 
  });
};

module.exports = { catchAsync, globalErrorHandler };
