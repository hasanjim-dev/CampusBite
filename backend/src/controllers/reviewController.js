
const pool = require("../config/db");

// ==========================================
// HELPER: GET REVIEW WITH LIKE INFORMATION
// ==========================================
async function getReviewDetails(reviewId) {
  const [rows] = await pool.execute(
    `SELECT
        r.id,
        CASE
  WHEN r.is_anonymous = 1 THEN NULL
  ELSE r.user_id
END AS user_id,
        r.shop_id,
        r.food_item_id,
        r.rating,
        r.body,
        r.image_url,
        r.is_anonymous,
        r.is_edited,
        r.created_at,
        r.updated_at,
        CASE
          WHEN r.is_anonymous = 1 THEN 'Anonymous'
          ELSE u.name
        END AS reviewer_name,
        f.name AS food_item_name,
        s.name AS shop_name,
        (
          SELECT COUNT(*)
          FROM review_reactions rr
          WHERE rr.review_id = r.id
        ) AS like_count
     FROM reviews r
     JOIN users u ON u.id = r.user_id
     JOIN food_items f ON f.id = r.food_item_id
     JOIN shops s ON s.id = r.shop_id
     WHERE r.id = ?
       AND r.status = 'published'`,
    [reviewId]
  );

  return rows[0] || null;
}

// ==========================================
// CREATE REVIEW
// POST /api/reviews
// ==========================================
async function createReview(req, res) {
  try {
    const { food_item_id, rating, body, image_url, is_anonymous } = req.body;

    if (!food_item_id || !Number.isInteger(Number(food_item_id)) ||
        Number(food_item_id) <= 0) {
      return res.status(400).json({
        success: false,
        message: "A valid food_item_id is required."
      });
    }

    const numericRating = Number(rating);

    if (!Number.isInteger(numericRating) ||
        numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be an integer between 1 and 5."
      });
    }

    if (typeof body !== "string" || !body.trim()) {
      return res.status(400).json({
        success: false,
        message: "Review body is required."
      });
    }

    if (body.trim().length > 5000) {
      return res.status(400).json({
        success: false,
        message: "Review cannot exceed 5000 characters."
      });
    }

    if (image_url !== undefined && image_url !== null &&
        (typeof image_url !== "string" || image_url.length > 500)) {
      return res.status(400).json({
        success: false,
        message: "Image URL must be a string of maximum 500 characters."
      });
    }

    if (is_anonymous !== undefined &&
        ![true, false, 0, 1].includes(is_anonymous)) {
      return res.status(400).json({
        success: false,
        message: "is_anonymous must be true or false."
      });
    }

    // Get the shop ID from the actual food item.
    // Never trust shop_id sent by the client.
    const [foodItems] = await pool.execute(
      `SELECT id, shop_id
       FROM food_items
       WHERE id = ?`,
      [Number(food_item_id)]
    );

    if (foodItems.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Food item not found."
      });
    }

    const shopId = foodItems[0].shop_id;
    const anonymous = is_anonymous === true || is_anonymous === 1 ? 1 : 0;

    const [result] = await pool.execute(
      `INSERT INTO reviews
       (user_id, shop_id, food_item_id, rating, body, image_url, is_anonymous)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        shopId,
        Number(food_item_id),
        numericRating,
        body.trim(),
        image_url || null,
        anonymous
      ]
    );

    const review = await getReviewDetails(result.insertId);

    return res.status(201).json({
      success: true,
      message: "Review created successfully.",
      review
    });
  } catch (error) {
    console.error("Create review error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create review."
    });
  }
}

// ==========================================
// GET ALL REVIEWS
// GET /api/reviews
// ==========================================
async function getAllReviews(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const offset = (page - 1) * limit;

    const conditions = ["r.status = 'published'"];
    const params = [];

    if (req.query.shop_id !== undefined) {
      const shopId = Number(req.query.shop_id);

      if (!Number.isInteger(shopId) || shopId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid shop_id."
        });
      }

      conditions.push("r.shop_id = ?");
      params.push(shopId);
    }

    if (req.query.food_item_id !== undefined) {
      const foodItemId = Number(req.query.food_item_id);

      if (!Number.isInteger(foodItemId) || foodItemId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid food_item_id."
        });
      }

      conditions.push("r.food_item_id = ?");
      params.push(foodItemId);
    }

    if (req.query.user_id !== undefined) {
      const userId = Number(req.query.user_id);

      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid user_id."
        });
      }

      // Anonymous reviews should not expose the author's identity.
      conditions.push("r.user_id = ?");
      params.push(userId);
    }

    if (req.query.search) {
      conditions.push("(r.body LIKE ? OR f.name LIKE ? OR s.name LIKE ?)");
      const search = `%${req.query.search}%`;
      params.push(search, search, search);
    }

    const whereClause = conditions.join(" AND ");

    const [reviews] = await pool.execute(
      `SELECT
          r.id,
          CASE
  WHEN r.is_anonymous = 1 THEN NULL
  ELSE r.user_id
END AS user_id,
          r.shop_id,
          r.food_item_id,
          r.rating,
          r.body,
          r.image_url,
          r.is_anonymous,
          r.is_edited,
          r.created_at,
          r.updated_at,
          CASE
            WHEN r.is_anonymous = 1 THEN 'Anonymous'
            ELSE u.name
          END AS reviewer_name,
          f.name AS food_item_name,
          s.name AS shop_name,
          (
            SELECT COUNT(*)
            FROM review_reactions rr
            WHERE rr.review_id = r.id
          ) AS like_count
       FROM reviews r
       JOIN users u ON u.id = r.user_id
       JOIN food_items f ON f.id = r.food_item_id
       JOIN shops s ON s.id = r.shop_id
       WHERE ${whereClause}
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [countRows] = await pool.execute(
      `SELECT COUNT(*) AS total
       FROM reviews r
       JOIN food_items f ON f.id = r.food_item_id
       JOIN shops s ON s.id = r.shop_id
       WHERE ${whereClause}`,
      params
    );

    const total = countRows[0].total;

    return res.status(200).json({
      success: true,
      message: "Reviews retrieved successfully.",
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      reviews
    });
  } catch (error) {
    console.error("Get reviews error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve reviews."
    });
  }
}

// ==========================================
// GET SINGLE REVIEW
// GET /api/reviews/:id
// ==========================================
async function getReviewById(req, res) {
  try {
    const reviewId = Number(req.params.id);

    if (!Number.isInteger(reviewId) || reviewId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID."
      });
    }

    const review = await getReviewDetails(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Review retrieved successfully.",
      review
    });
  } catch (error) {
    console.error("Get review error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve review."
    });
  }
}

// ==========================================
// UPDATE OWN REVIEW
// PUT /api/reviews/:id
// ==========================================
async function updateReview(req, res) {
  try {
    const reviewId = Number(req.params.id);

    if (!Number.isInteger(reviewId) || reviewId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID."
      });
    }

    const { rating, body, image_url, is_anonymous } = req.body;

    if (
      rating === undefined &&
      body === undefined &&
      image_url === undefined &&
      is_anonymous === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update."
      });
    }

    const [existing] = await pool.execute(
      `SELECT id
       FROM reviews
       WHERE id = ? AND user_id = ? AND status = 'published'`,
      [reviewId, req.user.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Review not found or you are not allowed to edit it."
      });
    }

    const updates = [];
    const params = [];

    if (rating !== undefined) {
      const numericRating = Number(rating);

      if (!Number.isInteger(numericRating) ||
          numericRating < 1 || numericRating > 5) {
        return res.status(400).json({
          success: false,
          message: "Rating must be an integer between 1 and 5."
        });
      }

      updates.push("rating = ?");
      params.push(numericRating);
    }

    if (body !== undefined) {
      if (typeof body !== "string" || !body.trim() ||
          body.trim().length > 5000) {
        return res.status(400).json({
          success: false,
          message: "Review body must contain 1 to 5000 characters."
        });
      }

      updates.push("body = ?");
      params.push(body.trim());
    }

    if (image_url !== undefined) {
      if (image_url !== null &&
          (typeof image_url !== "string" || image_url.length > 500)) {
        return res.status(400).json({
          success: false,
          message: "Image URL must be null or a string of maximum 500 characters."
        });
      }

      updates.push("image_url = ?");
      params.push(image_url || null);
    }

    if (is_anonymous !== undefined) {
      if (![true, false, 0, 1].includes(is_anonymous)) {
        return res.status(400).json({
          success: false,
          message: "is_anonymous must be true or false."
        });
      }

      updates.push("is_anonymous = ?");
      params.push(is_anonymous === true || is_anonymous === 1 ? 1 : 0);
    }

    updates.push("is_edited = 1");

    await pool.execute(
      `UPDATE reviews
       SET ${updates.join(", ")}
       WHERE id = ? AND user_id = ?`,
      [...params, reviewId, req.user.id]
    );

    const review = await getReviewDetails(reviewId);

    return res.status(200).json({
      success: true,
      message: "Review updated successfully.",
      review
    });
  } catch (error) {
    console.error("Update review error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update review."
    });
  }
}

// ==========================================
// DELETE OWN REVIEW
// DELETE /api/reviews/:id
// ==========================================
async function deleteReview(req, res) {
  try {
    const reviewId = Number(req.params.id);

    if (!Number.isInteger(reviewId) || reviewId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID."
      });
    }

    const [result] = await pool.execute(
      `DELETE FROM reviews
       WHERE id = ? AND user_id = ?`,
      [reviewId, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Review not found or you are not allowed to delete it."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully."
    });
  } catch (error) {
    console.error("Delete review error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete review."
    });
  }
}

// ==========================================
// TOGGLE LIKE / UNLIKE
// POST /api/reviews/:id/reaction
// ==========================================

// ==========================================
// GET CURRENT USER'S REACTION STATUS
// GET /api/reviews/:id/reaction
// ==========================================
async function getReviewReaction(req, res) {
  try {
    const reviewId = Number(req.params.id);

    if (!Number.isInteger(reviewId) || reviewId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID."
      });
    }

    const [reviews] = await pool.execute(
      `SELECT id
       FROM reviews
       WHERE id = ? AND status = 'published'`,
      [reviewId]
    );

    if (reviews.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Review not found."
      });
    }

    const [reactions] = await pool.execute(
      `SELECT user_id
       FROM review_reactions
       WHERE user_id = ? AND review_id = ?`,
      [req.user.id, reviewId]
    );

    const [counts] = await pool.execute(
      `SELECT COUNT(*) AS like_count
       FROM review_reactions
       WHERE review_id = ?`,
      [reviewId]
    );

    return res.status(200).json({
      success: true,
      is_liked: reactions.length > 0,
      like_count: counts[0].like_count
    });
  } catch (error) {
    console.error("Get reaction status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve reaction status."
    });
  }
}

async function toggleReviewReaction(req, res) {
  let connection;

  try {
    const reviewId = Number(req.params.id);

    if (!Number.isInteger(reviewId) || reviewId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID."
      });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Lock the review row so simultaneous toggle requests
    // for this review are processed safely.
    const [reviews] = await connection.execute(
      `SELECT id
       FROM reviews
       WHERE id = ? AND status = 'published'
       FOR UPDATE`,
      [reviewId]
    );

    if (reviews.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Review not found."
      });
    }

    const [existingReaction] = await connection.execute(
      `SELECT user_id
       FROM review_reactions
       WHERE user_id = ? AND review_id = ?`,
      [req.user.id, reviewId]
    );

    let action;

    if (existingReaction.length > 0) {
      await connection.execute(
        `DELETE FROM review_reactions
         WHERE user_id = ? AND review_id = ?`,
        [req.user.id, reviewId]
      );

      action = "unliked";
    } else {
      await connection.execute(
        `INSERT INTO review_reactions (user_id, review_id)
         VALUES (?, ?)`,
        [req.user.id, reviewId]
      );

      action = "liked";
    }

    const [countRows] = await connection.execute(
      `SELECT COUNT(*) AS like_count
       FROM review_reactions
       WHERE review_id = ?`,
      [reviewId]
    );

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: action === "liked"
        ? "Review liked successfully."
        : "Review unliked successfully.",
      action,
      is_liked: action === "liked",
      like_count: countRows[0].like_count
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error("Toggle review reaction error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update reaction."
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// ==========================================
// EXPORT CONTROLLERS
// ==========================================
module.exports = {
  createReview,
  getAllReviews,
  getReviewById,
  updateReview,
  deleteReview,
  toggleReviewReaction,
  getReviewReaction
};