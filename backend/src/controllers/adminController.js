const db = require("../config/db");

// Admin: Deactivate any shop
const deactivateShop = async (req, res) => {
  try {
    const shopId = Number(req.params.id);

    // Validate shop ID
    if (!Number.isInteger(shopId) || shopId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid shop ID."
      });
    }

    // Check whether shop exists
    const [shops] = await db.query(
      "SELECT id, name, is_active FROM shops WHERE id = ?",
      [shopId]
    );

    if (shops.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Shop not found."
      });
    }

    // Check whether shop is already inactive
    if (shops[0].is_active === 0) {
      return res.status(400).json({
        success: false,
        message: "Shop is already deactivated."
      });
    }

    // Deactivate shop
    await db.query(
      "UPDATE shops SET is_active = 0 WHERE id = ?",
      [shopId]
    );

    return res.status(200).json({
      success: true,
      message: "Shop deactivated successfully."
    });

  } catch (error) {
    console.error("Deactivate Shop Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error."
    });
  }
};
// Admin: Activate any shop
const activateShop = async (req, res) => {
  try {
    const shopId = Number(req.params.id);

    // Validate shop ID
    if (!Number.isInteger(shopId) || shopId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid shop ID."
      });
    }

    // Check whether shop exists
    const [shops] = await db.query(
      "SELECT id, name, is_active FROM shops WHERE id = ?",
      [shopId]
    );

    if (shops.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Shop not found."
      });
    }

    // Check whether shop is already active
    if (Number(shops[0].is_active) === 1) {
      return res.status(400).json({
        success: false,
        message: "Shop is already active."
      });
    }

    // Activate shop
    await db.query(
      "UPDATE shops SET is_active = 1 WHERE id = ?",
      [shopId]
    );

    return res.status(200).json({
      success: true,
      message: "Shop activated successfully."
    });

  } catch (error) {
    console.error("Activate Shop Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error."
    });
  }
};

module.exports = {
  deactivateShop,
  activateShop
};