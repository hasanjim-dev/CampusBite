
const pool = require("../config/db");
  const bcrypt = require("bcryptjs");

// GET: Retrieve logged-in user's profile
async function getMyProfile(req, res) {
  try {
    const [users] = await pool.execute(
      `SELECT id, name, email, role, status, avatar_url,
              created_at, updated_at
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User account not found."
      });
    }

    const user = users[0];

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your account is not active."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile retrieved successfully.",
      user
    });

  } catch (error) {
    console.error("Get profile error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not retrieve profile."
    });
  }
}


// PUT: Update logged-in user's profile
async function updateMyProfile(req, res) {
  try {
    const { name, avatar_url } = req.body;

    // Check whether at least one allowed field was provided
    if (name === undefined && avatar_url === undefined) {
      return res.status(400).json({
        success: false,
        message: "Please provide a name or avatar URL to update."
      });
    }

    // Validate name
    if (
      name !== undefined &&
      (typeof name !== "string" ||
       name.trim().length === 0 ||
       name.trim().length > 100)
    ) {
      return res.status(400).json({
        success: false,
        message: "Name must be between 1 and 100 characters."
      });
    }

    // Validate avatar URL
    if (
      avatar_url !== undefined &&
      avatar_url !== null &&
      (typeof avatar_url !== "string" ||
       avatar_url.trim().length === 0 ||
       avatar_url.trim().length > 500)
    ) {
      return res.status(400).json({
        success: false,
        message: "Avatar URL must be a valid non-empty string up to 500 characters, or null."
      });
    }

    // Prepare only allowed fields
    const fields = [];
    const values = [];

    if (name !== undefined) {
      fields.push("name = ?");
      values.push(name.trim());
    }

    if (avatar_url !== undefined) {
      fields.push("avatar_url = ?");
      values.push(avatar_url === null ? null : avatar_url.trim());
    }

    // Update only the authenticated user's record
    values.push(req.user.id);

    const [result] = await pool.execute(
      `UPDATE users
       SET ${fields.join(", ")}
       WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "User account not found."
      });
    }

    // Retrieve updated profile
    const [users] = await pool.execute(
      `SELECT id, name, email, role, status, avatar_url,
              created_at, updated_at
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: users[0]
    });

  } catch (error) {
    console.error("Update profile error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not update profile."
    });
  }
}
async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // 1. Check required fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All password fields are required."
      });
    }

    // 2. Validate new password length
    if (typeof newPassword !== "string" || Buffer.byteLength(newPassword, "utf8") < 8 || Buffer.byteLength(newPassword, "utf8") > 72) {
      return res.status(400).json({
        success: false,
        message: "New password must be 8 to 72 bytes long."
      });
    }

    // 3. Check password confirmation
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password do not match."
      });
    }

    // 4. Get current password hash
    const [users] = await pool.execute(
      "SELECT password_hash FROM users WHERE id = ? LIMIT 1",
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User account not found."
      });
    }

    // 5. Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      users[0].password_hash
    );

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect."
      });
    }

    // 6. Prevent using the same password
    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password."
      });
    }

    // 7. Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    // 8. Update database
    await pool.execute(
      "UPDATE users SET password_hash = ? WHERE id = ?",
      [newPasswordHash, req.user.id]
    );

    return res.status(200).json({
      success: true,
      message: "Password changed successfully. Please log in again."
    });

  } catch (error) {
    console.error("Change password error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not change password."
    });
  }
}

module.exports = {
  getMyProfile,
  updateMyProfile,
  changePassword
};