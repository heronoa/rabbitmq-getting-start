class ErrorHandler {
  static handleError(err, req, res, next) {
    if (err.status) {
      return res.status(err.status).json({
        message: err.message || "An unexpected error occurred.",
        details: err.details || null,
      });
    }

    if (err.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        details: err.errors || null,
      });
    }

    console.error(err);

    return res.status(500).json({
      message: "Internal Server Error",
      details: err.message || null,
    });
  }

  static createCustomError(message, status, details = null) {
    const error = new Error(message);
    error.status = status;
    error.details = details;
    return error;
  }
}

module.exports = ErrorHandler;
