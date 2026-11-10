
const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  getFoodItemRating,
  submitFoodItemRating,
  deleteFoodItemRating
} = require("../controllers/ratingController");

const router = express.Router();

// Public: Get food item rating summary
router.get(
  "/food-items/:foodItemId",
  getFoodItemRating
);

// Student only: Submit or update rating
router.post(
  "/food-items/:foodItemId",
  authMiddleware,
  authorizeRoles("student"),
  submitFoodItemRating
);

// Student only: Delete own rating
router.delete(
  "/food-items/:foodItemId",
  authMiddleware,
  authorizeRoles("student"),
  deleteFoodItemRating
);

module.exports = router;
