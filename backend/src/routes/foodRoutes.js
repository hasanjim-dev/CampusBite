
const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  createFoodItem,
  getAllFoodItems,
  getFoodItemById,
  updateFoodItem,
  deleteFoodItem
} = require("../controllers/foodController");

const router = express.Router();

// GET ALL FOOD ITEMS - Public
router.get("/", getAllFoodItems);

// GET SINGLE FOOD ITEM - Public
router.get("/:id", getFoodItemById);

// ADD FOOD ITEM - Shop Owner only
router.post(
  "/",
  authMiddleware,
  authorizeRoles("shop_owner"),
  createFoodItem
);

// UPDATE FOOD ITEM - Shop Owner only
router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("shop_owner"),
  updateFoodItem
);

// DELETE FOOD ITEM - Shop Owner only
router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("shop_owner"),
  deleteFoodItem
);

module.exports = router;
