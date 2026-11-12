const express = require("express");

const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  addShopToEvent,
  addFoodItemToEvent
} = require("../controllers/eventController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// PUBLIC: Get all events
router.get("/", getAllEvents);

// PUBLIC: Get event details
router.get("/:id", getEventById);

// ADMIN: Create event
router.post(
  "/",
  authMiddleware,
  authorizeRoles("admin"),
  createEvent
);

// ADMIN: Update event
router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("admin"),
  updateEvent
);

// ADMIN: Delete event
router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("admin"),
  deleteEvent
);

// ADMIN: Add shop to event
router.post(
  "/:id/shops",
  authMiddleware,
  authorizeRoles("admin"),
  addShopToEvent
);

// ADMIN: Add food item to event
router.post(
  "/:id/food-items",
  authMiddleware,
  authorizeRoles("admin"),
  addFoodItemToEvent
);

module.exports = router;
