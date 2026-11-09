const pool = require("../config/db");

// GET: Admin can view all users
async function getAllUsers(req, res) {
  try {
    // Pagination values
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit, 10) || 10)
    );

    const offset = (page - 1) * limit;

    // Get total number of users
    const [countResult] = await pool.execute(
      "SELECT COUNT(*) AS total FROM users"
    );

    const totalUsers = countResult[0].total;

    // Retrieve users without password hashes
    const [users] = await pool.execute(
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




// GET: Admin can view all users
async function getAllUsers(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);

    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit, 10) || 10)
    );

    const offset = (page - 1) * limit;

    const [countResult] = await pool.execute(
      "SELECT COUNT(*) AS total FROM users"
    );

    const totalUsers = countResult[0].total;

    const [users] = await pool.execute(
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


// GET: Admin can view one user's details
async function getUserById(req, res) {
  try {
    // Get user ID from URL
    const userId = Number(req.params.id);

    // Validate user ID
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID."
      });
    }

    // Find user without password hash
    const [users] = await pool.execute(
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

    // User not found
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    // Return user details
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

// PATCH: Admin can update a user's account status
async function updateUserStatus(req, res) {
  try {
    const userId = Number(req.params.id);
    const { status } = req.body;

    // Validate user ID
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID."
      });
    }

    // Validate status
    const allowedStatuses = ["active", "restricted", "deactivated"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Allowed values: active, restricted, deactivated."
      });
    }

    // Prevent admin from changing their own status
    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own account status."
      });
    }

    // Check whether user exists
    const [users] = await pool.execute(
      "SELECT id, name, email, role, status FROM users WHERE id = ?",
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    // Update user status
    await pool.execute(
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



module.exports = {
  getAllUsers,
  getUserById,
  updateUserStatus
};