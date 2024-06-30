const express = require("express");
const router = express.Router();

const {
  getUserProfile,
  updatePassword,
  updateUser,
  deleteUser,
  getAppliedJobs,
  getPublishedJobs,
  getUsers,
  deletUserAdmin,
} = require("../controllers/userController");
const { isAuthenticadedUser, authorizedRoles } = require("../middlewares/auth");

router.use(isAuthenticadedUser);

router.route("/me").get(getUserProfile);
router.route("/jobs/applied").get(authorizedRoles("user"), getAppliedJobs);

router
  .route("/jobs/published")
  .get(authorizedRoles("employer", "admin"), getPublishedJobs);

router.route("/password/update").put(updatePassword);
router.route("/me/update").put(updateUser);
router.route("/me/delete").delete(deleteUser);

//Admin only routes

router.route("/users").get(authorizedRoles("admin"), getUsers);

router.route("/user/:id").get(authorizedRoles("admin"), deletUserAdmin);

module.exports = router;
