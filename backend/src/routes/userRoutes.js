
const express = require("express");


const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const {
  getMyProfile,
  updateMyProfile,
  changePassword
} = require("../controllers/userController");
const router = express.Router();

// Protected route: login token is required
router.get("/me", authMiddleware, getMyProfile);
router.put("/me", authMiddleware, updateMyProfile);
router.put("/change-password", authMiddleware, changePassword);

router.get(
  "/admin-test",
  authMiddleware,
  authorizeRoles("admin"),
  (req, res) => {
    res.json({
      success: true,
      message: "Admin authorization successful."
    });
  }
);



module.exports = router;
