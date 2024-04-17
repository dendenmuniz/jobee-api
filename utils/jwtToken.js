// Create, send and save token in cookie

const sendToken = (user, statusCode, res) => {
  //create JWT token
  const token = user.getJwtToken();

  //Options for cookie
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV !== "development") {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({ sucess: true, token });
};

module.exports = sendToken;
