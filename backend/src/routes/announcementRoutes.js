
const express = require("express");

const {
  createAnnouncement,
  getAllAnnouncements,
  getAnnouncementById,
  getMyAnnouncements,
  updateAnnouncement,
  deleteAnnouncement
} = require("../controllers/announcementController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// SHOP OWNER: Get own announcements
// Keep this route before /:id
router.get(
  "/my-announcements",
  authMiddleware,
  authorizeRoles("shop_owner"),
  getMyAnnouncements
);

// PUBLIC: Get all published announcements
router.get("/", getAllAnnouncements);

// PUBLIC: Get one published announcement
router.get("/:id", getAnnouncementById);

// SHOP OWNER: Create announcement
router.post(
  "/",
  authMiddleware,
  authorizeRoles("shop_owner"),
  createAnnouncement
);

// SHOP OWNER: Update own announcement
router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("shop_owner"),
  updateAnnouncement
);

// SHOP OWNER: Delete own announcement
router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("shop_owner"),
  deleteAnnouncement
);

module.exports = router;
