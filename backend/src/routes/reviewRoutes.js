
const express = require("express");
const router = express.Router();

const reviewController = require("../controllers/reviewController");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// Public routes
router.get("/", reviewController.getAllReviews);
router.get("/:id", reviewController.getReviewById);

// Student-only routes
router.post(
  "/",
  authMiddleware,
  authorizeRoles("student"),
  reviewController.createReview
);

router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("student"),
  reviewController.updateReview
);

router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("student"),
  reviewController.deleteReview
);
router.get(
  "/:id/reaction",
  authMiddleware,
  authorizeRoles("student"),
  reviewController.getReviewReaction
);

// Instagram-style Like / Unlike toggle
router.post(
  "/:id/reaction",
  authMiddleware,
  authorizeRoles("student"),
  reviewController.toggleReviewReaction
);

module.exports = router;
