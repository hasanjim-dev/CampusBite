
const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  getAllUsers,
  getUserById,
  updateUserStatus
} = require("../controllers/adminController");
// GET: View all users (Admin only)
router.get(
  "/users",
  authMiddleware,
  authorizeRoles("admin"),
  getAllUsers
);

// GET: View one user by ID (Admin only)
router.get(
  "/users/:id",
  authMiddleware,
  authorizeRoles("admin"),
  getUserById
);

// PATCH: Update user status (Admin only)
router.patch(
  "/users/:id/status",
  authMiddleware,
  authorizeRoles("admin"),
  updateUserStatus
);

module.exports = router;
