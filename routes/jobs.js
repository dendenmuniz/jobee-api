const express = require("express");
const router = express.Router();

const {
  getJobs,
  newJob,
  getJobsInRadius,
  updateJob,
  deleteJob,
  getJob,
  jobStats,
} = require("../controllers/jobsController");

const { isAuthenticadedUser } = require("../middlewares/auth");

router.route("/jobs").get(getJobs);
router.route("/job/:id/:slug").get(getJob);
router.route("/jobs/:zipcode/:distance").get(getJobsInRadius);
router.route("/job/new").post(isAuthenticadedUser, newJob);
router.route("/job/:id").put(isAuthenticadedUser,updateJob).delete(isAuthenticadedUser,deleteJob);
router.route("/stats/:topic").get(jobStats);

module.exports = router;
