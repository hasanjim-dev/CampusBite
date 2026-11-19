
const express = require("express");

const {
  getComplaintCategories,
  createComplaint,
  getPublicComplaints,
  getPublicComplaintAttachment,
  getMyComplaints,
  getMyShopComplaints,
  getAdminComplaints,
  deleteComplaint
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

// STUDENT: Get own complaints
router.get(
  "/my-complaints",
  authMiddleware,
  authorizeRoles("student"),
  getMyComplaints
);

// SHOP OWNER: Get complaints against own shop
router.get(
  "/my-shop",
  authMiddleware,
  authorizeRoles("shop_owner"),
  getMyShopComplaints
);

// ADMIN: Get all complaints with real complainant identities
router.get(
  "/admin",
  authMiddleware,
  authorizeRoles("admin"),
  getAdminComplaints
);

// PUBLIC: View complaint attachment
router.get(
  "/attachments/:attachmentId",
  getPublicComplaintAttachment
);

// STUDENT + SHOP OWNER: Get all public complaints
router.get(
  "/",
  authMiddleware,
  authorizeRoles("student", "shop_owner"),
  getPublicComplaints
);

// STUDENT: Submit complaint with optional attachments
router.post(
  "/",
  authMiddleware,
  authorizeRoles("student"),
  uploadComplaintAttachments,
  createComplaint
);

// ADMIN: Delete complaint
router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("admin"),
  deleteComplaint
);

module.exports = router;
