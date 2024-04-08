const ErrorHandler = require("../utils/errorHandler");

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === "development") {
    res.status(err.statusCode).json({
      success: false,
      error: err,
      errMessage: err.message,
      stack: err.stack,
    });
  }

  if (process.env.NODE_ENV !== "development") {
    let error = { ...err };
    error.message = err.message;

    //Wrong Mongoose Object ID Error
    if (err.name === "CastError") {
      const message = `Resorce not found. Invalid ${err.path}`;
      error = new ErrorHandler(message, 404);
    }

    //Handling Mongoose Validation Error
    if (err.name === "ValidationError") {
      const message = Object.values(err.errors).map((err) => err.message);
      error = new ErrorHandler(message, 400);
    }

    res.status(error.statusCode).json({
      success: false,
      errMessage: err.message || "Internal Server Error",
    });
  }
};
