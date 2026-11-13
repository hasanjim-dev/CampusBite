
const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  getAllUsers,
  getUserById,
  updateUserStatus,
  deactivateShop,
  activateShop,
  updateComplaintStatus
} = require("../controllers/adminController");

const router = express.Router();

// ==========================================
// ADMIN: USER MANAGEMENT
// ==========================================

// GET: View all users
router.get(
  "/users",
  authMiddleware,
  authorizeRoles("admin"),
  getAllUsers
);

// GET: View one user by ID
router.get(
  "/users/:id",
  authMiddleware,
  authorizeRoles("admin"),
  getUserById
);

// PATCH: Update user status
router.patch(
  "/users/:id/status",
  authMiddleware,
  authorizeRoles("admin"),
  updateUserStatus
);

// ==========================================
// ADMIN: COMPLAINT MANAGEMENT
// ==========================================

router.patch(
  "/complaints/:id/status",
  authMiddleware,
  authorizeRoles("admin"),
  updateComplaintStatus
);
// ==========================================
// ADMIN: SHOP MANAGEMENT
// ==========================================

// PATCH: Deactivate any shop
router.patch(
  "/shops/:id/deactivate",
  authMiddleware,
  authorizeRoles("admin"),
  deactivateShop
);

// PATCH: Activate any shop
router.patch(
  "/shops/:id/activate",
  authMiddleware,
  authorizeRoles("admin"),
  activateShop
);

module.exports = router;
