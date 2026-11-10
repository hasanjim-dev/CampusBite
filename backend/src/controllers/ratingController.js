
const pool = require("../config/db");

// Recalculate Food Item rating and Shop overall rating
async function updateRatingAggregates(connection, foodItemId, shopId) {
  // Calculate average and count for this food item
  await connection.execute(
    `UPDATE food_items
     SET
       avg_rating = (
         SELECT COALESCE(AVG(rating), 0)
         FROM food_ratings
         WHERE food_item_id = ?
       ),
       rating_count = (
         SELECT COUNT(*)
         FROM food_ratings
         WHERE food_item_id = ?
       )
     WHERE id = ?`,
    [foodItemId, foodItemId, foodItemId]
  );

  // Calculate weighted average across all ratings in this shop
  await connection.execute(
    `UPDATE shops
     SET
       overall_rating = (
         SELECT COALESCE(AVG(fr.rating), 0)
         FROM food_ratings fr
         INNER JOIN food_items fi ON fi.id = fr.food_item_id
         WHERE fi.shop_id = ?
       ),
       rating_count = (
         SELECT COUNT(*)
         FROM food_ratings fr
         INNER JOIN food_items fi ON fi.id = fr.food_item_id
         WHERE fi.shop_id = ?
       )
     WHERE id = ?`,
    [shopId, shopId, shopId]
  );
}

// GET PUBLIC FOOD ITEM RATING SUMMARY
async function getFoodItemRating(req, res) {
  try {
    const foodItemId = Number(req.params.foodItemId);

    if (!Number.isInteger(foodItemId) || foodItemId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid food item ID."
      });
    }

    const [rows] = await pool.execute(
      `SELECT
         f.id AS food_item_id,
         f.name AS food_item_name,
         f.avg_rating,
         f.rating_count,
         s.id AS shop_id,
         s.name AS shop_name,
         s.overall_rating AS shop_overall_rating,
         s.rating_count AS shop_rating_count
       FROM food_items f
       INNER JOIN shops s ON s.id = f.shop_id
       WHERE f.id = ? AND s.is_active = 1
       LIMIT 1`,
      [foodItemId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Food item not found."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Food item rating retrieved successfully.",
      rating: rows[0]
    });

  } catch (error) {
    console.error("Get food item rating error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve food item rating."
    });
  }
}

// STUDENT: CREATE OR UPDATE OWN FOOD ITEM RATING
async function submitFoodItemRating(req, res) {
  let connection;

  try {
    const foodItemId = Number(req.params.foodItemId);
    const { rating } = req.body;

    if (!Number.isInteger(foodItemId) || foodItemId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid food item ID."
      });
    }

    if (
      typeof rating !== "number" ||
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be a whole number between 1 and 5."
      });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Confirm that the food item belongs to an active shop
    const [items] = await connection.execute(
      `SELECT f.id, f.shop_id
       FROM food_items f
       INNER JOIN shops s ON s.id = f.shop_id
       WHERE f.id = ? AND s.is_active = 1
       LIMIT 1`,
      [foodItemId]
    );

    if (items.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Food item not found."
      });
    }

    const shopId = items[0].shop_id;

    // UNIQUE(user_id, food_item_id) prevents duplicate ratings.
    // If the student already rated this item, update that rating.
    const [result] = await connection.execute(
      `INSERT INTO food_ratings (user_id, food_item_id, rating)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE
         rating = VALUES(rating),
         updated_at = CURRENT_TIMESTAMP`,
      [req.user.id, foodItemId, rating]
    );

    await updateRatingAggregates(connection, foodItemId, shopId);

    const [userRatings] = await connection.execute(
      `SELECT rating
       FROM food_ratings
       WHERE user_id = ? AND food_item_id = ?
       LIMIT 1`,
      [req.user.id, foodItemId]
    );

    const [foodSummary] = await connection.execute(
      `SELECT avg_rating, rating_count
       FROM food_items
       WHERE id = ?
       LIMIT 1`,
      [foodItemId]
    );

    const [shopSummary] = await connection.execute(
      `SELECT overall_rating, rating_count
       FROM shops
       WHERE id = ?
       LIMIT 1`,
      [shopId]
    );

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: "Food item rating submitted successfully.",
      your_rating: userRatings[0].rating,
      food_item: {
        avg_rating: foodSummary[0].avg_rating,
        rating_count: foodSummary[0].rating_count
      },
      shop: {
        overall_rating: shopSummary[0].overall_rating,
        rating_count: shopSummary[0].rating_count
      }
    });

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error("Submit food item rating error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to submit food item rating."
    });

  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// STUDENT: DELETE OWN FOOD ITEM RATING
async function deleteFoodItemRating(req, res) {
  let connection;

  try {
    const foodItemId = Number(req.params.foodItemId);

    if (!Number.isInteger(foodItemId) || foodItemId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid food item ID."
      });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [items] = await connection.execute(
      `SELECT f.id, f.shop_id
       FROM food_items f
       INNER JOIN shops s ON s.id = f.shop_id
       WHERE f.id = ? AND s.is_active = 1
       LIMIT 1`,
      [foodItemId]
    );

    if (items.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Food item not found."
      });
    }

    const shopId = items[0].shop_id;

    const [result] = await connection.execute(
      `DELETE FROM food_ratings
       WHERE user_id = ? AND food_item_id = ?`,
      [req.user.id, foodItemId]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "You have not rated this food item yet."
      });
    }

    await updateRatingAggregates(connection, foodItemId, shopId);

    const [foodSummary] = await connection.execute(
      `SELECT avg_rating, rating_count
       FROM food_items
       WHERE id = ?
       LIMIT 1`,
      [foodItemId]
    );

    const [shopSummary] = await connection.execute(
      `SELECT overall_rating, rating_count
       FROM shops
       WHERE id = ?
       LIMIT 1`,
      [shopId]
    );

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: "Your food item rating has been removed.",
      food_item: {
        avg_rating: foodSummary[0].avg_rating,
        rating_count: foodSummary[0].rating_count
      },
      shop: {
        overall_rating: shopSummary[0].overall_rating,
        rating_count: shopSummary[0].rating_count
      }
    });

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error("Delete food item rating error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to delete food item rating."
    });

  } finally {
    if (connection) {
      connection.release();
    }
  }
}

module.exports = {
  getFoodItemRating,
  submitFoodItemRating,
  deleteFoodItemRating
};
