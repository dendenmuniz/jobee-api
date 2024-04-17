const User = require("../models/users");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");

//Register a new user -> /api/v1/register
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password, role } = req.body;
  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  //Create JWT token
  const token = user.getJwtToken();

  res.status(200).json({
    success: true,
    message: "User registered successfully",
    token,
  });
});

//login user -> /api/v1/login
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  //checks if email and password are informed
  if (!email || !password) {
    return next(new ErrorHandler("Please enter your credencials"), 400);
  }

  //Finding user
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid credentials", 401));
  }

  //Check password
  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid credentials", 401));
  }

  //Creat Json web token
  const token = user.getJwtToken();
  res.status(200).json({ sucess: true, token: token });
});
