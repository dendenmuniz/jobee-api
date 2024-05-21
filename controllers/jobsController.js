const Job = require("../models/jobs");
const geoCoder = require("../utils/geocoder");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const APIFilters = require("../utils/apiFilters");
const path = require("path");

// all jobs -> /api/v1/jobs
exports.getJobs = catchAsyncErrors(async (req, res, next) => {
  const apiFilters = new APIFilters(Job.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .searchByQuery()
    .pagination();
  const jobs = await apiFilters.query;
  res.status(200).json({
    success: true,
    results: jobs.length,
    data: jobs,
  });
});

//Create new job -> /api/v1/job/new
exports.newJob = catchAsyncErrors(async (req, res, next) => {
  //Adding user to body
  req.body.user = req.user.id;
  const job = await Job.create(req.body);

  res.status(200).json({
    success: true,
    message: "Job created successfully",
    data: job,
  });
});

// Update a Job -> /api/v1/job/:id
exports.updateJob = catchAsyncErrors(async (req, res, next) => {
  let job = await Job.findById(req.params.id);

  if (!job) {
    return next(new ErrorHandler("Job not found", 404));
  }

  job = await Job.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: "Job updated successfully",
    data: job,
  });
});

// Delete a Job -> /api/v1/job/:id
exports.deleteJob = catchAsyncErrors(async (req, res, next) => {
  let job = await Job.findById(req.params.id);

  if (!job) {
    return next(new ErrorHandler("Job not found", 404));
  }

  job = await Job.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Job deleted successfully",
  });
});

//Get a single job with ID and Slug -> /api/vq/job/:id/:slug
exports.getJob = catchAsyncErrors(async (req, res, next) => {
  const job = await Job.find({
    $and: [{ _id: req.params.id, slug: req.params.slug }],
  });

  if (!job || job.length === 0) {
    return next(new ErrorHandler("Job not found", 404));
  }

  res.status(200).json({ success: true, data: job });
});

//Search jobs with radios -> /api/v1/jobs/:zipcode/:distance
exports.getJobsInRadius = catchAsyncErrors(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  //Getting latitue & longitude from geocoder with zipcode
  const loc = await geoCoder.geocode(zipcode);
  const latitude = loc[0].latitude;
  const longitude = loc[0].longitude;

  const radius = distance / 6371; //distance in 3963 ml or  6371 for km
  const jobsList = await Job.find({
    location: {
      $geoWithin: { $centerSphere: [[longitude, latitude], radius] },
    },
  });

  res.status(200).json({
    success: true,
    results: jobsList.length,
    data: jobsList,
  });
});

//Get statitics about a topic(job) -> /api/vq/stats/:topic
exports.jobStats = catchAsyncErrors(async (req, res, next) => {
  const stats = await Job.aggregate([
    { $match: { $text: { $search: '"' + req.params.topic + '"' } } },
    {
      $group: {
        _id: { $toUpper: "$experience" },
        totalJobs: { $sum: 1 },
        avgPosition: { $avg: "$positions" },
        avgSalary: { $avg: "$salary" },
        minSalary: { $min: "$salary" },
        maxSalary: { $max: "$salary" },
      },
    },
  ]);

  if (stats.length === 0) {
    return next(
      new ErrorHandler(`No stats available for ${req.params.topic}`, 200)
    );
  }
  res.status(200).json({
    success: false,
    data: stats,
  });
});

//Apply for a job using resume -> /api/v1/job/:id/apply
exports.applyForAJob = catchAsyncErrors(async (req, res, next) => {
  let job = await Job.findById(req.params.id).select("+applicantsApplied");

  if (!job) {
    return next(new ErrorHandler("Job not found", 404));
  }

  //Check if the job is already closed (last date)
  if (job.lastDate < new Date(Date.now())) {
    return next(
      new ErrorHandler(
        "You can not apply for this job. Job is already closed.",
        400
      )
    );
  }

  //Check if user has applied before
  for (let i = 0; i < job.applicantsApplied.length; i++) {
    if (job.applicantsApplied[i].id === req.user.id) {
      return next(
        new ErrorHandler("You have applied for this job already.", 400)
      );
    }
  }

  //Check the files
  if (!req.files) {
    return next(
      new ErrorHandler("Please upload your resume or relevant file.", 400)
    );
  }

  const file = req.files.file;

  //Check file type - Only support PDF, DOC, DOCX
  const supportedFiles = /.doc|.docx|.pdf/;
  if (!supportedFiles.test(path.extname(file.name))) {
    return next(
      new ErrorHandler("Please upload file supported (PDF, DOC, DOCX)", 400)
    );
  }

  //Check document size
  if (file.size > process.env.MAX_FILE_SIZE) {
    const maxSizeMB = process.env.MAX_FILE_SIZE / 1_000_000; // Convert to MB
    return next(
      new ErrorHandler(
        `File maximum size ${maxSizeMB}Mb exceeded. Please try again.`,
        400
      )
    );
  }

  //Rename document
  file.name = `${req.user.name.replace("", "_")}_${job._id}${
    path.parse(file.name).ext
  }`;

  file.mv(`${process.env.UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.log(err);
      return next(new ErrorHandler("Resume upload failed.", 500));
    }

    await Job.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          applicantsApplied: {
            id: req.user.id,
            resume: file.name,
          },
        },
      },
      { new: true, runValidators: true }
    );
  });

  res.status(200).json({
    success: true,
    message: "Successfuly applied for the job.",
    data: file.name,
  });
});
