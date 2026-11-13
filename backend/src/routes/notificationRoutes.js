const express = require("express");
const router = express.Router();

const notificationController = require("../controllers/notificationController");
const authMiddleware = require("../middleware/authMiddleware");

// All notification routes require authentication
router.use(authMiddleware);

// Get all notifications
router.get("/", notificationController.getAllNotifications);

// Get unread notification count
router.get("/unread-count", notificationController.getUnreadCount);

// Mark all notifications as read
router.patch("/read-all", notificationController.markAllAsRead);

// Mark one notification as read
router.patch("/:id/read", notificationController.markAsRead);

// Delete one notification
router.delete("/:id", notificationController.deleteNotification);

module.exports = router;
