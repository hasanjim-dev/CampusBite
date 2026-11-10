
const express = require("express");
const router = express.Router();

const {
  getReviewComments,
  createComment,
  updateComment,
  deleteComment
} = require("../controllers/commentController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// Public: Get all comments and replies of a review
router.get("/review/:reviewId", getReviewComments);

// Student only: Create comment or reply
router.post(
  "/",
  authMiddleware,
  authorizeRoles("student"),
  createComment
);

// Student only: Update own comment
router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("student"),
  updateComment
);

// Student only: Delete own comment
router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("student"),
  deleteComment
);

module.exports = router;
