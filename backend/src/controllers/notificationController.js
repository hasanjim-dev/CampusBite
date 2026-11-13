const pool = require("../config/db");

// GET /api/notifications
// Get logged-in user's notifications
exports.getAllNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, Number.parseInt(req.query.limit, 10) || 20)
    );
    const offset = (page - 1) * limit;

    const [notifications] = await pool.execute(
      `SELECT id, user_id, type, message, related_type,
              related_id, is_read, created_at
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC, id DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );

    const [countResult] = await pool.execute(
      `SELECT COUNT(*) AS total
       FROM notifications
       WHERE user_id = ?`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      message: "Notifications retrieved successfully.",
      pagination: {
        page,
        limit,
        total: countResult[0].total
      },
      data: notifications
    });
  } catch (error) {
    console.error("Get notifications error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve notifications."
    });
  }
};

// GET /api/notifications/unread-count
// Get unread notification count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const [result] = await pool.execute(
      `SELECT COUNT(*) AS unread_count
       FROM notifications
       WHERE user_id = ? AND is_read = 0`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      message: "Unread notification count retrieved successfully.",
      data: {
        unread_count: result[0].unread_count
      }
    });
  } catch (error) {
    console.error("Get unread count error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve unread notification count."
    });
  }
};

// PATCH /api/notifications/:id/read
// Mark one notification as read
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = Number(req.params.id);

    if (!Number.isSafeInteger(notificationId) || notificationId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID."
      });
    }

    const [result] = await pool.execute(
      `UPDATE notifications
       SET is_read = 1
       WHERE id = ? AND user_id = ?`,
      [notificationId, userId]
    );

    if (result.affectedRows === 0) {
      const [rows] = await pool.execute(
        `SELECT id FROM notifications
         WHERE id = ? AND user_id = ?
         LIMIT 1`,
        [notificationId, userId]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Notification not found."
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read."
    });
  } catch (error) {
    console.error("Mark notification as read error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to mark notification as read."
    });
  }
};

// PATCH /api/notifications/read-all
// Mark all user's notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    const [result] = await pool.execute(
      `UPDATE notifications
       SET is_read = 1
       WHERE user_id = ? AND is_read = 0`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read.",
      data: {
        updated_count: result.affectedRows
      }
    });
  } catch (error) {
    console.error("Mark all notifications as read error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to mark all notifications as read."
    });
  }
};

// DELETE /api/notifications/:id
// Delete one notification owned by logged-in user
exports.deleteNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = Number(req.params.id);

    if (!Number.isSafeInteger(notificationId) || notificationId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID."
      });
    }

    const [result] = await pool.execute(
      `DELETE FROM notifications
       WHERE id = ? AND user_id = ?`,
      [notificationId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Notification not found."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully."
    });
  } catch (error) {
    console.error("Delete notification error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to delete notification."
    });
  }
};
