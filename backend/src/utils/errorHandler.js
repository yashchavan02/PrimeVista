const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  console.error('Error message:', err.message);
  console.error('Error code:', err.code);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message,
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or missing authentication',
    });
  }

  res.status(err.statusCode || 500).json({
    error: err.name || 'Internal Server Error',
    message: err.message || 'An unexpected error occurred',
    details: err.details || null,
  });
};

module.exports = { errorHandler };
