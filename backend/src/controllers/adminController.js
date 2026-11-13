
const db = require("../config/db");
const { notifyUsers } = require("../services/notificationService");

// ==========================================
// ADMIN: DEACTIVATE ANY SHOP
// ==========================================

const deactivateShop = async (req, res) => {
  try {
    const shopId = Number(req.params.id);

    if (!Number.isInteger(shopId) || shopId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid shop ID."
      });
    }

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

    if (Number(shops[0].is_active) === 0) {
      return res.status(400).json({
        success: false,
        message: "Shop is already deactivated."
      });
    }

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


// ==========================================
// ADMIN: ACTIVATE ANY SHOP
// ==========================================

const activateShop = async (req, res) => {
  try {
    const shopId = Number(req.params.id);

    if (!Number.isInteger(shopId) || shopId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid shop ID."
      });
    }

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

    if (Number(shops[0].is_active) === 1) {
      return res.status(400).json({
        success: false,
        message: "Shop is already active."
      });
    }

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


// ==========================================
// ADMIN: VIEW ALL USERS
// ==========================================

async function getAllUsers(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);

    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit, 10) || 10)
    );

    const offset = (page - 1) * limit;

    const [countResult] = await db.execute(
      "SELECT COUNT(*) AS total FROM users"
    );

    const totalUsers = countResult[0].total;

    const [users] = await db.execute(
      `SELECT
        id,
        name,
        email,
        role,
        status,
        avatar_url,
        created_at,
        updated_at
       FROM users
       ORDER BY id DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully.",
      pagination: {
        totalUsers,
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        limit
      },
      users
    });

  } catch (error) {
    console.error("Get all users error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not retrieve users."
    });
  }
}


// ==========================================
// ADMIN: VIEW ONE USER
// ==========================================

async function getUserById(req, res) {
  try {
    const userId = Number(req.params.id);

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID."
      });
    }

    const [users] = await db.execute(
      `SELECT
        id,
        name,
        email,
        role,
        status,
        avatar_url,
        created_at,
        updated_at
       FROM users
       WHERE id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    return res.status(200).json({
      success: true,
      message: "User details retrieved successfully.",
      user: users[0]
    });

  } catch (error) {
    console.error("Get user details error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not retrieve user details."
    });
  }
}


// ==========================================
// ADMIN: UPDATE USER STATUS
// ==========================================

async function updateUserStatus(req, res) {
  try {
    const userId = Number(req.params.id);
    const { status } = req.body;

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID."
      });
    }

    const allowedStatuses = [
      "active",
      "restricted",
      "deactivated"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Allowed values: active, restricted, deactivated."
      });
    }

    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own account status."
      });
    }

    const [users] = await db.execute(
      "SELECT id, name, email, role, status FROM users WHERE id = ?",
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    await db.execute(
      "UPDATE users SET status = ? WHERE id = ?",
      [status, userId]
    );

    return res.status(200).json({
      success: true,
      message: "User status updated successfully.",
      user: {
        ...users[0],
        status
      }
    });

  } catch (error) {
    console.error("Update user status error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not update user status."
    });
  }
}
// ==========================================
// ADMIN: UPDATE COMPLAINT STATUS
// ==========================================

async function updateComplaintStatus(req, res) {
  try {
    const complaintId = Number(req.params.id);
    const { status, admin_note } = req.body;

    if (!Number.isInteger(complaintId) || complaintId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid complaint ID."
      });
    }

    const allowedStatuses = [
      "pending",
      "under_review",
      "verified",
      "rejected",
      "resolved"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid complaint status."
      });
    }

    if (
      admin_note !== undefined &&
      admin_note !== null &&
      (typeof admin_note !== "string" || admin_note.length > 65535)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid admin note."
      });
    }

    // Find complaint
    const [complaints] = await db.execute(
      `SELECT id, user_id, status, admin_note
       FROM complaints
       WHERE id = ?
       LIMIT 1`,
      [complaintId]
    );

    if (complaints.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found."
      });
    }

    const complaint = complaints[0];
    const statusChanged = complaint.status !== status;

    const finalAdminNote =
      admin_note === undefined
        ? complaint.admin_note
        : admin_note;

    // Update complaint
    await db.execute(
      `UPDATE complaints
       SET status = ?,
           admin_note = ?,
           handled_by = ?
       WHERE id = ?`,
      [
        status,
        finalAdminNote,
        req.user.id,
        complaintId
      ]
    );

    // Notify complaint owner only when status changes
    if (statusChanged) {
      try {
        await notifyUsers(
          [complaint.user_id],
          {
            type: "complaint_update",
            message: `Your complaint status has been updated to: ${status}.`,
            relatedType: "complaint",
            relatedId: complaintId
          }
        );
      } catch (notificationError) {
        console.error(
          "Complaint status notification error:",
          notificationError.message
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: "Complaint status updated successfully.",
      complaint: {
        id: complaintId,
        user_id: complaint.user_id,
        status,
        admin_note: finalAdminNote,
        handled_by: req.user.id
      }
    });

  } catch (error) {
    console.error("Update complaint status error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not update complaint status."
    });
  }
}

// ==========================================
// EXPORT ALL ADMIN CONTROLLERS
// ==========================================

module.exports = {
  deactivateShop,
  activateShop,
  getAllUsers,
  getUserById,
  updateUserStatus,
  updateComplaintStatus
};