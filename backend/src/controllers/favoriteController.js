
const pool = require("../config/db");

// Validate route ID
function isValidId(id) {
  return /^\d+$/.test(String(id)) && Number(id) > 0;
}

// ========================================
// ADD FAVORITE SHOP
// POST /api/favorites/shops/:shopId
// ========================================
async function addFavoriteShop(req, res) {
  try {
    const userId = req.user.id;
    const shopId = req.params.shopId;

    if (!isValidId(shopId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid shop ID."
      });
    }

    const [shops] = await pool.execute(
      `SELECT id, name, is_active
       FROM shops
       WHERE id = ?
       LIMIT 1`,
      [Number(shopId)]
    );

    if (shops.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Shop not found."
      });
    }

    if (!shops[0].is_active) {
      return res.status(400).json({
        success: false,
        message: "Cannot favorite an inactive shop."
      });
    }

    // INSERT IGNORE prevents duplicate favorites
    const [result] = await pool.execute(
      `INSERT IGNORE INTO favorite_shops (user_id, shop_id)
       VALUES (?, ?)`,
      [userId, Number(shopId)]
    );

    if (result.affectedRows === 0) {
      return res.status(409).json({
        success: false,
        message: "This shop is already in your favorites."
      });
    }

    return res.status(201).json({
      success: true,
      message: "Shop added to favorites.",
      data: {
        shop_id: Number(shopId),
        shop_name: shops[0].name
      }
    });

  } catch (error) {
    console.error("Add favorite shop error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add shop to favorites."
    });
  }
}

// ========================================
// REMOVE FAVORITE SHOP
// DELETE /api/favorites/shops/:shopId
// ========================================
async function removeFavoriteShop(req, res) {
  try {
    const userId = req.user.id;
    const shopId = req.params.shopId;

    if (!isValidId(shopId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid shop ID."
      });
    }

    const [result] = await pool.execute(
      `DELETE FROM favorite_shops
       WHERE user_id = ? AND shop_id = ?`,
      [userId, Number(shopId)]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "This shop is not in your favorites."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Shop removed from favorites."
    });

  } catch (error) {
    console.error("Remove favorite shop error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to remove shop from favorites."
    });
  }
}

// ========================================
// GET MY FAVORITE SHOPS
// GET /api/favorites/shops
// ========================================
async function getFavoriteShops(req, res) {
  try {
    const userId = req.user.id;

    const [shops] = await pool.execute(
      `SELECT
         s.id,
         s.name,
         s.description,
         s.logo_url,
         s.location,
         s.overall_rating,
         s.rating_count,
         s.is_active,
         fs.created_at AS favorited_at
       FROM favorite_shops fs
       INNER JOIN shops s ON s.id = fs.shop_id
       WHERE fs.user_id = ?
       ORDER BY fs.created_at DESC`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      message: "Favorite shops retrieved successfully.",
      count: shops.length,
      data: shops
    });

  } catch (error) {
    console.error("Get favorite shops error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve favorite shops."
    });
  }
}

// ========================================
// ADD FAVORITE FOOD ITEM
// POST /api/favorites/food-items/:foodItemId
// ========================================
async function addFavoriteFoodItem(req, res) {
  try {
    const userId = req.user.id;
    const foodItemId = req.params.foodItemId;

    if (!isValidId(foodItemId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid food item ID."
      });
    }

    const [foodItems] = await pool.execute(
      `SELECT
         f.id,
         f.name,
         f.shop_id,
         f.is_available,
         s.is_active AS shop_is_active
       FROM food_items f
       INNER JOIN shops s ON s.id = f.shop_id
       WHERE f.id = ?
       LIMIT 1`,
      [Number(foodItemId)]
    );

    if (foodItems.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Food item not found."
      });
    }

    if (!foodItems[0].shop_is_active) {
      return res.status(400).json({
        success: false,
        message: "Cannot favorite food from an inactive shop."
      });
    }

    const [result] = await pool.execute(
      `INSERT IGNORE INTO favorite_food_items (user_id, food_item_id)
       VALUES (?, ?)`,
      [userId, Number(foodItemId)]
    );

    if (result.affectedRows === 0) {
      return res.status(409).json({
        success: false,
        message: "This food item is already in your favorites."
      });
    }

    return res.status(201).json({
      success: true,
      message: "Food item added to favorites.",
      data: {
        food_item_id: Number(foodItemId),
        food_item_name: foodItems[0].name,
        shop_id: foodItems[0].shop_id
      }
    });

  } catch (error) {
    console.error("Add favorite food item error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add food item to favorites."
    });
  }
}

// ========================================
// REMOVE FAVORITE FOOD ITEM
// DELETE /api/favorites/food-items/:foodItemId
// ========================================
async function removeFavoriteFoodItem(req, res) {
  try {
    const userId = req.user.id;
    const foodItemId = req.params.foodItemId;

    if (!isValidId(foodItemId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid food item ID."
      });
    }

    const [result] = await pool.execute(
      `DELETE FROM favorite_food_items
       WHERE user_id = ? AND food_item_id = ?`,
      [userId, Number(foodItemId)]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "This food item is not in your favorites."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Food item removed from favorites."
    });

  } catch (error) {
    console.error("Remove favorite food item error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to remove food item from favorites."
    });
  }
}

// ========================================
// GET MY FAVORITE FOOD ITEMS
// GET /api/favorites/food-items
// ========================================
async function getFavoriteFoodItems(req, res) {
  try {
    const userId = req.user.id;

    const [foodItems] = await pool.execute(
      `SELECT
         f.id,
         f.shop_id,
         f.name,
         f.description,
         f.image_url,
         f.price,
         f.discount_percent,
         f.final_price,
         f.avg_rating,
         f.rating_count,
         f.is_available,
         s.name AS shop_name,
         s.location AS shop_location,
         s.is_active AS shop_is_active,
         ffi.created_at AS favorited_at
       FROM favorite_food_items ffi
       INNER JOIN food_items f ON f.id = ffi.food_item_id
       INNER JOIN shops s ON s.id = f.shop_id
       WHERE ffi.user_id = ?
       ORDER BY ffi.created_at DESC`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      message: "Favorite food items retrieved successfully.",
      count: foodItems.length,
      data: foodItems
    });

  } catch (error) {
    console.error("Get favorite food items error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve favorite food items."
    });
  }
}

module.exports = {
  addFavoriteShop,
  removeFavoriteShop,
  getFavoriteShops,
  addFavoriteFoodItem,
  removeFavoriteFoodItem,
  getFavoriteFoodItems
};
