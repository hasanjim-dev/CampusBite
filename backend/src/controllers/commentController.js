
const pool = require("../config/db");
const { notifyUsers } = require("../services/notificationService");

// Helper: Build nested comment/reply structure
function buildCommentTree(rows) {
  const commentMap = new Map();
  const rootComments = [];

  for (const row of rows) {
    const comment = {
      id: row.id,
      review_id: row.review_id,
      user_id: row.user_id,
      user_name: row.user_name,
      parent_comment_id: row.parent_comment_id,
      body:
        row.status === "removed"
          ? "This comment was deleted."
          : row.body,
      is_edited: row.is_edited,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
      replies: []
    };

    commentMap.set(comment.id, comment);
  }

  for (const comment of commentMap.values()) {
    if (comment.parent_comment_id !== null) {
      const parent = commentMap.get(comment.parent_comment_id);

      if (parent) {
        parent.replies.push(comment);
      } else {
        rootComments.push(comment);
      }
    } else {
      rootComments.push(comment);
    }
  }

  return rootComments;
}


// GET COMMENTS OF A REVIEW
async function getReviewComments(req, res) {
  try {
    const reviewId = Number(req.params.reviewId);

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

    const [rows] = await pool.execute(
      `SELECT
         c.id,
         c.review_id,
         c.user_id,
         u.name AS user_name,
         c.parent_comment_id,
         c.body,
         c.is_edited,
         c.status,
         c.created_at,
         c.updated_at
       FROM comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.review_id = ?
       ORDER BY c.created_at ASC, c.id ASC`,
      [reviewId]
    );

    const comments = buildCommentTree(rows);

    return res.status(200).json({
      success: true,
      message: "Comments retrieved successfully.",
      total: rows.filter(row => row.status === "published").length,
      comments
    });

  } catch (error) {
    console.error("Get review comments error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve comments."
    });
  }
}


// CREATE COMMENT OR REPLY
async function createComment(req, res) {
  try {
    const { review_id, parent_comment_id, body } = req.body;

    const reviewId = Number(review_id);

    if (!Number.isInteger(reviewId) || reviewId <= 0) {
      return res.status(400).json({
        success: false,
        message: "A valid review_id is required."
      });
    }

    if (typeof body !== "string" || !body.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment body is required."
      });
    }

    if (body.trim().length > 5000) {
      return res.status(400).json({
        success: false,
        message: "Comment cannot exceed 5000 characters."
      });
    }

    const [reviews] = await pool.execute(
      `SELECT id, user_id
FROM reviews
       WHERE id = ? AND status = 'published'`,
      [reviewId]
    );

    if (reviews.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Review not found or unavailable."
      });
    }

    let parentId = null;
    let parentOwnerId = null;

    if (
      parent_comment_id !== undefined &&
      parent_comment_id !== null &&
      parent_comment_id !== ""
    ) {
      parentId = Number(parent_comment_id);

      if (!Number.isInteger(parentId) || parentId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid parent_comment_id."
        });
      }

      const [parents] = await pool.execute(
        `SELECT id, user_id
FROM comments
         WHERE id = ?
           AND review_id = ?
           AND status = 'published'`,
        [parentId, reviewId]
      );

           if (parents.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Parent comment does not exist in this review."
        });
      }

      parentOwnerId = parents[0].user_id;
    }

    const [result] = await pool.execute(
      `INSERT INTO comments
       (review_id, user_id, parent_comment_id, body)
       VALUES (?, ?, ?, ?)`,
      [reviewId, req.user.id, parentId, body.trim()]
    );

    const [newComments] = await pool.execute(
      `SELECT
         c.id,
         c.review_id,
         c.user_id,
         u.name AS user_name,
         c.parent_comment_id,
         c.body,
         c.is_edited,
         c.status,
         c.created_at,
         c.updated_at
       FROM comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.id = ?`,
      [result.insertId]
    );
// Notify the review owner or parent comment owner
// Notify the review owner or parent comment owner
const recipientId = parentId
  ? parentOwnerId
  : reviews[0].user_id;

if (Number(recipientId) !== Number(req.user.id)) {
  try {
    await notifyUsers(
      [recipientId],
      {
        type: "reply",
        message: parentId
          ? "Someone replied to your comment."
          : "Someone commented on your review.",
        relatedType: "comment",
        relatedId: result.insertId
      }
    );
  } catch (notificationError) {
    console.error(
      "Comment notification error:",
      notificationError.message
    );
  }
}
    return res.status(201).json({
      success: true,
      message: parentId
        ? "Reply created successfully."
        : "Comment created successfully.",
      comment: newComments[0]
    });

  } catch (error) {
    console.error("Create comment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create comment."
    });
  }
}


// UPDATE OWN COMMENT
async function updateComment(req, res) {
  try {
    const commentId = Number(req.params.id);
    const { body } = req.body;

    if (!Number.isInteger(commentId) || commentId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid comment ID."
      });
    }

    if (typeof body !== "string" || !body.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment body is required."
      });
    }

    if (body.trim().length > 5000) {
      return res.status(400).json({
        success: false,
        message: "Comment cannot exceed 5000 characters."
      });
    }

    const [result] = await pool.execute(
      `UPDATE comments
       SET body = ?, is_edited = 1
       WHERE id = ?
         AND user_id = ?
         AND status = 'published'`,
      [body.trim(), commentId, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Comment not found or you are not allowed to edit it."
      });
    }

    const [updatedComments] = await pool.execute(
      `SELECT
         c.id,
         c.review_id,
         c.user_id,
         u.name AS user_name,
         c.parent_comment_id,
         c.body,
         c.is_edited,
         c.status,
         c.created_at,
         c.updated_at
       FROM comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.id = ?`,
      [commentId]
    );

    return res.status(200).json({
      success: true,
      message: "Comment updated successfully.",
      comment: updatedComments[0]
    });

  } catch (error) {
    console.error("Update comment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update comment."
    });
  }
}


// DELETE OWN COMMENT (SOFT DELETE)
async function deleteComment(req, res) {
  try {
    const commentId = Number(req.params.id);

    if (!Number.isInteger(commentId) || commentId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid comment ID."
      });
    }

    const [result] = await pool.execute(
      `UPDATE comments
       SET status = 'removed'
       WHERE id = ?
         AND user_id = ?
         AND status = 'published'`,
      [commentId, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Comment not found or you are not allowed to delete it."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully."
    });

  } catch (error) {
    console.error("Delete comment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete comment."
    });
  }
}


module.exports = {
  getReviewComments,
  createComment,
  updateComment,
  deleteComment
};
