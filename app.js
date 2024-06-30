const express = require("express");
const app = express();

const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const xssClean = require("xss-clean");
const hpp = require("hpp");
const cors = require("cors");

const errorMiddleware = require("./middlewares/errors");
const ErrorHandler = require("./utils/errorHandler");
const connectDatabase = require("./config/database");
const mongoSanitize = require("express-mongo-sanitize");

dotenv.config({ path: "./config/config.env" });

// Handling uncaught exception
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting down due to uncaught exception");
  process.exit(1);
});

// Connecting to database
connectDatabase();

//Setup security hearders
app.use(helmet());

//setup body parser
app.use(express.json());

//set cookie parses
app.use(cookieParser());

//handle file upload
app.use(fileUpload());

//Sanitize data
app.use(mongoSanitize());

//Prevent XSS attacks
app.use(xssClean());

//Prevent parameter pollution
app.use(
  hpp({
    whitelist: ["positions"],
  })
);

//Rate limiting
const limiter = rateLimit({
  windownsMs: 10 * 60 * 1000, //10 mins
  max: 100,
});

//Setup CORS - Accessible by other domains
app.use(cors());

app.use(limiter);

const jobs = require("./routes/jobs");
const auth = require("./routes/auth");
const user = require("./routes/user");

app.use("/api/v1", jobs);
app.use("/api/v1", auth);
app.use("/api/v1", user);

app.all("*", (req, res, next) => {
  next(new ErrorHandler(`${req.originalUrl} route not found`, 404));
});

app.use(errorMiddleware);

const PORT = process.env.PORT;
const server = app.listen(PORT, () => {
  console.log(`Server on port ${process.env.PORT} in ${process.env.NODE_ENV}`);
});

//Handling Unhandled Promise Rejection
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting down the server due to Unhandled promise rejection");
  server.close(() => {
    process.exit(1);
  });
});
