const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const { uploadShopLogo } = require("../middleware/imageUpload");

const {
  createShop,
  getMyShop,
  getShopById,
  getAllShops,
  updateMyShop
} = require("../controllers/shopController");

const router = express.Router();

// GET MY SHOP - Shop Owner only
router.get(
  "/my-shop",
  authMiddleware,
  authorizeRoles("shop_owner"),
  getMyShop
);
// UPDATE OWN SHOP - Shop Owner only
router.put(
  "/my-shop",
  authMiddleware,
  authorizeRoles("shop_owner"),
 uploadShopLogo,
  updateMyShop
);
// GET ALL PUBLIC SHOPS - Everyone
router.get("/", getAllShops);

// GET PUBLIC SHOP DETAILS - Everyone
router.get(
  "/:id",
  getShopById
);

// CREATE SHOP - Shop Owner only
router.post(
  "/",
  authMiddleware,
  authorizeRoles("shop_owner"),
  uploadShopLogo,
  createShop
);

module.exports = router;

