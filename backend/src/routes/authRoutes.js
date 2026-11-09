
const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const {
  register,
  registerShopOwner,
  login,
  logoutUser
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/register-shop-owner", registerShopOwner);
router.post("/login", login);
router.post("/logout", authMiddleware, logoutUser);

module.exports = router;