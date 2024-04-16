const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    require: [true, "Please enter your name"],
  },
  email: {
    type: String,
    required: [true, "Please enter your email address"],
    unique: true,
    validate: [validator.isEmail, "Please enter a valid email address"],
  },
  role: {
    type: String,
    enum: {
      values: ["user", "employer"],
      message: "Please select correct role",
    },
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Please enter the password for your account"],
    minlength: [8, "Your password must be at least 8 characters long"],
    select: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  resetPassrowdToken: String,
  resetPasswordExpire: Date,
});

//Encrypting password
userSchema.pre("save", async function (next) {
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Return Json web token
userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_TIME,
  });
};

module.exports = mongoose.model("User", userSchema);
