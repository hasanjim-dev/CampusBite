
const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const favoriteController = require("../controllers/favoriteController");

// All favorite routes require an authenticated Student
router.use(authMiddleware, authorizeRoles("student"));

// Shop favorites
router.post("/shops/:shopId", favoriteController.addFavoriteShop);
router.delete("/shops/:shopId", favoriteController.removeFavoriteShop);
router.get("/shops", favoriteController.getFavoriteShops);

// Food item favorites
router.post("/food-items/:foodItemId", favoriteController.addFavoriteFoodItem);
router.delete("/food-items/:foodItemId", favoriteController.removeFavoriteFoodItem);
router.get("/food-items", favoriteController.getFavoriteFoodItems);

module.exports = router;
