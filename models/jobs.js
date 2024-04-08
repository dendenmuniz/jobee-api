const mongoose = require("mongoose");
const validator = require("validator");
const slugify = require("slugify");
const geoCoder = require("../utils/geocoder");

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please enter Job title"],
    trim: true,
    maxLength: [100, "Job title can not exceed 100 characters"],
  },
  slug: String,
  description: {
    type: String,
    required: [true, "Please enter Job description"],
    maxlength: [1000, "Job description can not exceed 1000 characters"],
  },
  email: {
    type: String,
    validate: [validator.isEmail, "Please add a valid email address"],
  },
  address: {
    type: String,
    required: [true, "Please enter an address"],
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
    },
    coordinates: {
      type: [Number],
      index: "2dsphere",
    },
    formattedAddress: String,
    city: String,
    state: String,
    zipcode: {
      type: String,
      trim: true,
    },
    country: String,
  },
  company: {
    type: String,
    required: [true, "Please enter the company name"],
  },
  industry: {
    type: [String],
    required: [true, "Please enter the related industry"],
    enum: {
      values: ["Business", "IT", "Banking", "Education", "Telecom", "Other"],
      message: "Please select correct options for industry",
    },
  },
  jobType: {
    type: String,
    required: [true, "Please enter the job type"],
    enum: {
      values: ["Permanent", "Temporary", "Internship"],
      message: "Please select correct option for job type",
    },
  },
  minEducation: {
    type: String,
    required: [true, "Please enter the minimum education required"],
    enum: {
      values: ["Bachelors", "Masters", "Doctors", "PhD"],
      message: "Please select correct option for Education",
    },
  },
  positions: {
    type: Number,
    default: 1,
  },
  experience: {
    type: String,
    require: [true, "Please enter the required experience"],
    enum: {
      values: [
        "No experience",
        "1 year - 2 years",
        "2 years - 5 years",
        "5 years+",
      ],
      message: "Please sect correct option for Experience",
    },
  },
  salary: {
    type: Number,
    required: [true, "Please enter the expected salary for this position"],
  },
  postingDate: {
    type: Date,
    default: Date.now,
  },
  lastDate: {
    type: Date,
    default: new Date().setDate(new Date().getDate() + 7),
  },
  applicantsApplied: {
    type: [Object],
    select: false,
  },
});

// creating job slug before saving
jobSchema.pre("save", function (next) {
  this.slug = slugify(this.title, { lower: true });
  next();
});

// setting up Location
jobSchema.pre("save", async function (next) {
  const local = await geoCoder.geocode(this.address);

  this.location = {
    type: "Point",
    coordinates: [local[0].longitude, local[0].latitude],
    formattedAddress: local[0].formattedAddress,
    city: local[0].city,
    state: local[0].stateCode,
    zipcode: local[0].zipcode,
    country: local[0].countryCode,
  };

  next();
});

module.exports = mongoose.model("Job", jobSchema);
