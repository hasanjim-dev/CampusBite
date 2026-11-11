
const express = require("express");

const {
  getComplaintCategories,
  createComplaint,
  getPublicComplaints,
  getPublicComplaintAttachment
} = require("../controllers/complaintController");
const authMiddleware = require("../middleware/authMiddleware");

const authorizeRoles = require("../middleware/roleMiddleware");
const {
  uploadComplaintAttachments
} = require("../middleware/complaintUpload");

const router = express.Router();

// PUBLIC: Get complaint categories
router.get(
  "/categories",
  getComplaintCategories
);

// PUBLIC: Get all public complaints
router.get(
  "/",
  getPublicComplaints
);
// PUBLIC: View complaint attachment
router.get(
  "/attachments/:attachmentId",
  getPublicComplaintAttachment
);
// STUDENT: Submit complaint with optional attachments
router.post(
  "/",
  authMiddleware,
  authorizeRoles("student"),
  uploadComplaintAttachments,
  createComplaint
);

module.exports = router;
