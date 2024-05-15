const User = require("../models/users");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");

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
  sendToken(user, 200, res);
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

  //Create JWT token
  sendToken(user, 200, res);
});

//Forgot Password -> /api/v1/forgot
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  //Check user email is in the DB
  if (!user) {
    return next(new ErrorHandler("Invalid credentials - User not found", 404));
  }

  //Get reset token
  const resetToken = user.getResetPasswordToken();
  console.log(resetToken);
  await user.save({ validateBeforeSave: false });


  //Create reset password url
  const resetUrl = `/api/v1/password/reset/${resetToken}`;
  console.log(resetUrl);
  const message = `Your password reset link is as follow:\n\n${resetUrl}
\n\n If you have not required this, then please ignore this message.`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Jobee API - Password Recovery",
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent successfully to: ${user.email}`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler("Email not sent"), 500);
  }
});
