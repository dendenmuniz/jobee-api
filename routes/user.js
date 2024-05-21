const express = require("express");
const router = express.Router();

const {
  getUserProfile,
  updatePassword,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const { isAuthenticadedUser } = require("../middlewares/auth");

router.route("/me").get(isAuthenticadedUser, getUserProfile);
router.route("/password/update").put(isAuthenticadedUser, updatePassword);
router.route("/me/update").put(isAuthenticadedUser, updateUser);
router.route("/me/delete").delete(isAuthenticadedUser, deleteUser);

module.exports = router;
