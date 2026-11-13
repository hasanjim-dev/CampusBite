
const pool = require("../config/db");
const { notifyUsers } = require("../services/notificationService");

// ADD FOOD ITEM
async function createFoodItem(req, res) {
  try {
    const {
      name,
      description,
      image_url,
      price,
      discount_percent = 0
    } = req.body;

    // Validate required name
    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Food item name is required."
      });
    }

    const cleanName = name.trim();

    if (cleanName.length > 150) {
      return res.status(400).json({
        success: false,
        message: "Food item name cannot exceed 150 characters."
      });
    }

    // Validate optional description
    if (
      description !== undefined &&
      description !== null &&
      (typeof description !== "string" || description.length > 65535)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid food item description."
      });
    }

    // Validate optional image URL
    if (
      image_url !== undefined &&
      image_url !== null &&
      (typeof image_url !== "string" || image_url.length > 500)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid image URL."
      });
    }

    // Validate original price
    if (
      typeof price !== "number" ||
      !Number.isFinite(price) ||
      price <= 0 ||
      price > 99999999.99 ||
      Math.round(price * 100) !== price * 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Price must be a positive number with maximum 2 decimal places."
      });
    }

    // Validate discount percentage
    if (
      typeof discount_percent !== "number" ||
      !Number.isFinite(discount_percent) ||
      discount_percent < 0 ||
      discount_percent > 100 ||
      Math.round(discount_percent * 100) !== discount_percent * 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Discount must be between 0 and 100 with maximum 2 decimal places."
      });
    }

    // Get logged-in Shop Owner ID from JWT
    const ownerId = req.user.id;

    // Find the owner's active shop
    const [shops] = await pool.execute(
      `SELECT id
       FROM shops
       WHERE owner_id = ? AND is_active = 1
       LIMIT 1`,
      [ownerId]
    );

    if (shops.length === 0) {
      return res.status(404).json({
        success: false,
        message: "You do not have an active shop. Create or activate your shop first."
      });
    }

    const shopId = shops[0].id;

    // Insert food item
    // final_price is generated automatically by MySQL
    const [result] = await pool.execute(
      `INSERT INTO food_items
       (shop_id, name, description, image_url, price, discount_percent)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        shopId,
        cleanName,
        description?.trim() || null,
        image_url?.trim() || null,
        price,
        discount_percent
      ]
    );
    // Notify active students who favorited this shop
    try {
      const [favorites] = await pool.execute(
        `SELECT fs.user_id
         FROM favorite_shops fs
         INNER JOIN users u ON u.id = fs.user_id
         WHERE fs.shop_id = ?
           AND u.role = 'student'
           AND u.status = 'active'`,
        [shopId]
      );

      await notifyUsers(
        favorites.map((favorite) => favorite.user_id),
        {
          type: "menu_change",
          message: `New food item added to your favorite shop: ${cleanName}`,
          relatedType: "food_item",
          relatedId: result.insertId
        }
      );
    } catch (notificationError) {
      console.error(
        "Food creation notification error:",
        notificationError.message
      );
    }
    // Retrieve created food item
    const [foodItems] = await pool.execute(
      `SELECT
        id,
        shop_id,
        name,
        description,
        image_url,
        price,
        discount_percent,
        final_price,
        avg_rating,
        rating_count,
        is_available,
        created_at
       FROM food_items
       WHERE id = ?
       LIMIT 1`,
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: "Food item created successfully.",
      foodItem: foodItems[0]
    });

  } catch (error) {
    console.error("Create food item error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Food item creation failed due to a server error."
    });
  }
}

// GET ALL FOOD ITEMS WITH SEARCH, FILTER AND PAGINATION
async function getAllFoodItems(req, res) {
  try {
    const {
      search,
      shop_id,
      min_price,
      max_price,
      is_available,
      page = 1,
      limit = 12
    } = req.query;

    const conditions = ["s.is_active = 1"];
    const values = [];

    // Search by food item name
    if (search !== undefined) {
      if (typeof search !== "string" || search.trim().length > 150) {
        return res.status(400).json({
          success: false,
          message: "Invalid search keyword."
        });
      }

      if (search.trim()) {
        conditions.push("f.name LIKE ?");
        values.push(`%${search.trim()}%`);
      }
    }

    // Filter by shop ID
    if (shop_id !== undefined) {
      const shopId = Number(shop_id);

      if (!Number.isInteger(shopId) || shopId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid shop ID."
        });
      }

      conditions.push("f.shop_id = ?");
      values.push(shopId);
    }

    // Filter by minimum price
    if (min_price !== undefined) {
      const minPrice = Number(min_price);

      if (!Number.isFinite(minPrice) || minPrice < 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid minimum price."
        });
      }

      conditions.push("f.final_price >= ?");
      values.push(minPrice);
    }

    // Filter by maximum price
    if (max_price !== undefined) {
      const maxPrice = Number(max_price);

      if (!Number.isFinite(maxPrice) || maxPrice < 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid maximum price."
        });
      }

      conditions.push("f.final_price <= ?");
      values.push(maxPrice);
    }

    if (
      min_price !== undefined &&
      max_price !== undefined &&
      Number(min_price) > Number(max_price)
    ) {
      return res.status(400).json({
        success: false,
        message: "Minimum price cannot exceed maximum price."
      });
    }

    // Filter by availability
    if (is_available !== undefined) {
      if (!["0", "1"].includes(is_available)) {
        return res.status(400).json({
          success: false,
          message: "is_available must be 0 or 1."
        });
      }

      conditions.push("f.is_available = ?");
      values.push(Number(is_available));
    }

    // Pagination validation
    const currentPage = Number(page);
    const pageLimit = Number(limit);

    if (
      !Number.isInteger(currentPage) ||
      currentPage < 1 ||
      !Number.isInteger(pageLimit) ||
      pageLimit < 1 ||
      pageLimit > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination values. Page must be positive and limit must be between 1 and 100."
      });
    }

    const offset = (currentPage - 1) * pageLimit;
    const whereClause = conditions.join(" AND ");

    // Get total matching food items
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) AS total
       FROM food_items f
       INNER JOIN shops s ON f.shop_id = s.id
       WHERE ${whereClause}`,
      values
    );

    // Get food items
    const [foodItems] = await pool.execute(
      `SELECT
        f.id,
        f.shop_id,
        s.name AS shop_name,
        s.location AS shop_location,
        f.name,
        f.description,
        f.image_url,
        f.price,
        f.discount_percent,
        f.final_price,
        f.avg_rating,
        f.rating_count,
        f.is_available,
        f.created_at
       FROM food_items f
       INNER JOIN shops s ON f.shop_id = s.id
       WHERE ${whereClause}
       ORDER BY f.created_at DESC
       LIMIT ? OFFSET ?`,
      [...values, pageLimit, offset]
    );

    const totalItems = Number(countResult[0].total);

    return res.status(200).json({
      success: true,
      message: "Food items retrieved successfully.",
      pagination: {
        currentPage,
        limit: pageLimit,
        totalItems,
        totalPages: Math.ceil(totalItems / pageLimit)
      },
      foodItems
    });

  } catch (error) {
    console.error("Get all food items error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve food items due to a server error."
    });
  }
}

// GET SINGLE FOOD ITEM
async function getFoodItemById(req, res) {
  try {
    const foodId = Number(req.params.id);

    if (!Number.isInteger(foodId) || foodId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid food item ID."
      });
    }

    const [foodItems] = await pool.execute(
      `SELECT
        f.id,
        f.shop_id,
        s.name AS shop_name,
        s.location AS shop_location,
        f.name,
        f.description,
        f.image_url,
        f.price,
        f.discount_percent,
        f.final_price,
        f.avg_rating,
        f.rating_count,
        f.is_available,
        f.created_at,
        f.updated_at
       FROM food_items f
       INNER JOIN shops s ON f.shop_id = s.id
       WHERE f.id = ? AND s.is_active = 1
       LIMIT 1`,
      [foodId]
    );

    if (foodItems.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Food item not found."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Food item retrieved successfully.",
      foodItem: foodItems[0]
    });

  } catch (error) {
    console.error("Get food item error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve food item."
    });
  }
}


// UPDATE FOOD ITEM
async function updateFoodItem(req, res) {
  try {
    const foodId = Number(req.params.id);

    if (!Number.isInteger(foodId) || foodId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid food item ID."
      });
    }

    // Find food item and verify ownership
    const [items] = await pool.execute(
      `SELECT f.id, f.shop_id
       FROM food_items f
       INNER JOIN shops s ON f.shop_id = s.id
       WHERE f.id = ? AND s.owner_id = ?
       LIMIT 1`,
      [foodId, req.user.id]
    );

    if (items.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Food item not found or you do not own this item."
      });
    }

    const {
      name,
      description,
      image_url,
      price,
      discount_percent,
      is_available
    } = req.body;

    const updates = [];
    const values = [];

    // Update name
    if (name !== undefined) {
      if (
        typeof name !== "string" ||
        !name.trim() ||
        name.trim().length > 150
      ) {
        return res.status(400).json({
          success: false,
          message: "Food item name must be between 1 and 150 characters."
        });
      }

      updates.push("name = ?");
      values.push(name.trim());
    }

    // Update description
    if (description !== undefined) {
      if (
        description !== null &&
        (typeof description !== "string" || description.length > 65535)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid description."
        });
      }

      updates.push("description = ?");
      values.push(
        typeof description === "string" && description.trim()
          ? description.trim()
          : null
      );
    }

    // Update image URL
    if (image_url !== undefined) {
      if (
        image_url !== null &&
        (typeof image_url !== "string" || image_url.length > 500)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid image URL."
        });
      }

      updates.push("image_url = ?");
      values.push(
        typeof image_url === "string" && image_url.trim()
          ? image_url.trim()
          : null
      );
    }

    // Update original price
    if (price !== undefined) {
      if (
        typeof price !== "number" ||
        !Number.isFinite(price) ||
        price <= 0 ||
        price > 99999999.99 ||
        Math.round(price * 100) !== price * 100
      ) {
        return res.status(400).json({
          success: false,
          message: "Price must be positive with maximum 2 decimal places."
        });
      }

      updates.push("price = ?");
      values.push(price);
    }

    // Update discount percentage
    if (discount_percent !== undefined) {
      if (
        typeof discount_percent !== "number" ||
        !Number.isFinite(discount_percent) ||
        discount_percent < 0 ||
        discount_percent > 100 ||
        Math.round(discount_percent * 100) !== discount_percent * 100
      ) {
        return res.status(400).json({
          success: false,
          message: "Discount must be between 0 and 100 with maximum 2 decimal places."
        });
      }

      updates.push("discount_percent = ?");
      values.push(discount_percent);
    }

    // Update availability
    if (is_available !== undefined) {
      if (
        ![0, 1, true, false].includes(is_available)
      ) {
        return res.status(400).json({
          success: false,
          message: "Availability must be true, false, 1 or 0."
        });
      }

      updates.push("is_available = ?");
      values.push(
        is_available === true || is_available === 1 ? 1 : 0
      );
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update."
      });
    }

    // Execute update
    values.push(foodId);

    await pool.execute(
      `UPDATE food_items
       SET ${updates.join(", ")}
       WHERE id = ?`,
      values
    );
    // Notify students who favorited this shop or food item
    try {
      const [favorites] = await pool.execute(
        `SELECT user_id
         FROM favorite_shops
         WHERE shop_id = ?

         UNION

         SELECT user_id
         FROM favorite_food_items
         WHERE food_item_id = ?`,
        [items[0].shop_id, foodId]
      );

      const favoriteUserIds = favorites.map(
        (favorite) => favorite.user_id
      );

      if (favoriteUserIds.length > 0) {
        const [activeStudents] = await pool.execute(
          `SELECT id
           FROM users
           WHERE role = 'student'
             AND status = 'active'
             AND id IN (${favoriteUserIds.map(() => "?").join(",")})`,
          favoriteUserIds
        );

        await notifyUsers(
          activeStudents.map((student) => student.id),
          {
            type: "menu_change",
            message: "A food item in your favorite shop has been updated.",
            relatedType: "food_item",
            relatedId: foodId
          }
        );
      }
    } catch (notificationError) {
      console.error(
        "Food update notification error:",
        notificationError.message
      );
    }
    // Retrieve updated item
    const [updatedItems] = await pool.execute(
      `SELECT
        id,
        shop_id,
        name,
        description,
        image_url,
        price,
        discount_percent,
        final_price,
        avg_rating,
        rating_count,
        is_available,
        updated_at
       FROM food_items
       WHERE id = ?
       LIMIT 1`,
      [foodId]
    );

    return res.status(200).json({
      success: true,
      message: "Food item updated successfully.",
      foodItem: updatedItems[0]
    });

  } catch (error) {
    console.error("Update food item error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Food item update failed."
    });
  }
}


// DELETE FOOD ITEM
async function deleteFoodItem(req, res) {
  try {
    const foodId = Number(req.params.id);

    if (!Number.isInteger(foodId) || foodId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid food item ID."
      });
    }

    // Verify ownership
    const [items] = await pool.execute(
      `SELECT f.id, f.shop_id, f.name
       FROM food_items f
       INNER JOIN shops s ON f.shop_id = s.id
       WHERE f.id = ? AND s.owner_id = ?
       LIMIT 1`,
      [foodId, req.user.id]
    );

    if (items.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Food item not found or you do not own this item."
      });
    }

    // Collect notification recipients before deletion
    let notificationUserIds = [];

    try {
      const [favorites] = await pool.execute(
        `SELECT user_id
         FROM favorite_shops
         WHERE shop_id = ?

         UNION

         SELECT user_id
         FROM favorite_food_items
         WHERE food_item_id = ?`,
        [items[0].shop_id, foodId]
      );

      const favoriteUserIds = favorites.map(
        (favorite) => favorite.user_id
      );

      if (favoriteUserIds.length > 0) {
        const [activeStudents] = await pool.execute(
          `SELECT id
           FROM users
           WHERE role = 'student'
             AND status = 'active'
             AND id IN (${favoriteUserIds.map(() => "?").join(",")})`,
          favoriteUserIds
        );

        notificationUserIds = activeStudents.map(
          (student) => student.id
        );
      }
    } catch (notificationError) {
      console.error(
        "Food deletion recipient lookup error:",
        notificationError.message
      );
    }

    // Delete food item first
    await pool.execute(
      "DELETE FROM food_items WHERE id = ?",
      [foodId]
    );

    // Notify students only after successful deletion
    if (notificationUserIds.length > 0) {
      try {
        await notifyUsers(notificationUserIds, {
          type: "menu_change",
          message: `Food item "${items[0].name}" has been removed from the menu.`,
          relatedType: "food_item",
          relatedId: foodId
        });
      } catch (notificationError) {
        console.error(
          "Food deletion notification error:",
          notificationError.message
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: "Food item deleted successfully."
    });

  } catch (error) {
    console.error("Delete food item error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Food item deletion failed. It may be referenced by reviews, ratings or other records."
    });
  }
}



module.exports = {
  createFoodItem,
  getAllFoodItems,
  getFoodItemById,
  updateFoodItem,
  deleteFoodItem
};