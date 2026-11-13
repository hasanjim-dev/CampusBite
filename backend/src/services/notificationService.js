
const pool = require("../config/db");

/**
 * Send the same notification to multiple users.
 * Notification failures are logged but do not interrupt
 * the main operation (review, announcement, event, etc.).
 */
async function notifyUsers(
  userIds,
  { type, message, relatedType = null, relatedId = null }
) {
  try {
    const uniqueUserIds = [
      ...new Set(
        (Array.isArray(userIds) ? userIds : [])
          .map(Number)
          .filter((id) => Number.isInteger(id) && id > 0)
      )
    ];

    if (uniqueUserIds.length === 0) {
      return { success: true, inserted: 0 };
    }

    const validTypes = [
      "announcement",
      "reply",
      "complaint_update",
      "new_event",
      "new_review",
      "new_complaint",
      "reported_post",
      "menu_change"
    ];

    if (!validTypes.includes(type)) {
      throw new Error(`Invalid notification type: ${type}`);
    }

    if (typeof message !== "string" || !message.trim()) {
      throw new Error("Notification message is required.");
    }

    const placeholders = uniqueUserIds.map(() => "(?, ?, ?, ?, ?)").join(", ");
    const values = [];

    for (const userId of uniqueUserIds) {
      values.push(
        userId,
        type,
        message.trim().slice(0, 255),
        relatedType,
        relatedId
      );
    }

    const [result] = await pool.execute(
      `INSERT INTO notifications
       (user_id, type, message, related_type, related_id)
       VALUES ${placeholders}`,
      values
    );

    return {
      success: true,
      inserted: result.affectedRows
    };
  } catch (error) {
    console.error("Notification service error:", error.message);

    return {
      success: false,
      inserted: 0
    };
  }
}

module.exports = {
  notifyUsers
};
