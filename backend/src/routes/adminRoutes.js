const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  deactivateShop,
  activateShop
} = require("../controllers/adminController");

const router = express.Router();

// Admin: Deactivate any shop
router.patch(
  "/shops/:id/deactivate",
  authMiddleware,
  authorizeRoles("admin"),
  deactivateShop
);

// Admin: Activate any shop
router.patch(
  "/shops/:id/activate",
  authMiddleware,
  authorizeRoles("admin"),
  activateShop
);

module.exports = router;