const express = require("express");

const {
  createAnnouncement,
  getAllAnnouncements,
  getAnnouncementById,
  getMyAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
  getAnnouncementAttachment
} = require("../controllers/announcementController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  uploadAnnouncementAttachments
} = require("../middleware/announcementUpload");

const router = express.Router();

const announcementViewAccess = [
  authMiddleware,
  authorizeRoles("student", "shop_owner", "admin")
];

// Shop owner: View own announcements
router.get(
  "/my-announcements",
  authMiddleware,
  authorizeRoles("shop_owner"),
  getMyAnnouncements
);

// Authenticated users: View attachments
router.get(
  "/attachments/:attachmentId",
  ...announcementViewAccess,
  getAnnouncementAttachment
);

// Authenticated users: View published announcements
router.get(
  "/",
  ...announcementViewAccess,
  getAllAnnouncements
);

router.get(
  "/:id",
  ...announcementViewAccess,
  getAnnouncementById
);

// Shop owner: Create announcement
router.post(
  "/",
  authMiddleware,
  authorizeRoles("shop_owner"),
  uploadAnnouncementAttachments,
  createAnnouncement
);

// Shop owner: Update own announcement
router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("shop_owner"),
  uploadAnnouncementAttachments,
  updateAnnouncement
);

// Shop owner or Admin: Delete announcement
router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("shop_owner", "admin"),
  deleteAnnouncement
);

module.exports = router;
