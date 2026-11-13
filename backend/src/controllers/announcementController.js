
const pool = require("../config/db");
const { notifyUsers } = require("../services/notificationService");

// CREATE ANNOUNCEMENT - SHOP OWNER ONLY
async function createAnnouncement(req, res) {
  try {
    const { title, body } = req.body || {};

    // Validate title
    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Announcement title is required."
      });
    }

    if (title.trim().length > 150) {
      return res.status(400).json({
        success: false,
        message: "Announcement title cannot exceed 150 characters."
      });
    }

    // Validate body
    if (typeof body !== "string" || !body.trim()) {
      return res.status(400).json({
        success: false,
        message: "Announcement body is required."
      });
    }

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
        message: "You do not have an active shop."
      });
    }

    const shopId = shops[0].id;

    // Create announcement
    const [result] = await pool.execute(
      `INSERT INTO announcements
       (shop_id, title, body, is_published)
       VALUES (?, ?, ?, 1)`,
      [shopId, title.trim(), body.trim()]
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
          type: "announcement",
          message: `New announcement from your favorite shop: ${title.trim()}`,
          relatedType: "announcement",
          relatedId: result.insertId
        }
      );
    } catch (notificationError) {
      console.error(
        "Announcement notification error:",
        notificationError.message
      );
    }
    // Retrieve created announcement
    const [announcements] = await pool.execute(
      `SELECT
        a.id,
        a.shop_id,
        s.name AS shop_name,
        a.title,
        a.body,
        a.is_published,
        a.created_at,
        a.updated_at
       FROM announcements a
       INNER JOIN shops s ON a.shop_id = s.id
       WHERE a.id = ?
       LIMIT 1`,
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: "Announcement created successfully.",
      announcement: announcements[0]
    });

  } catch (error) {
    console.error("Create announcement error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Announcement creation failed."
    });
  }
}


// GET ALL PUBLIC ANNOUNCEMENTS
async function getAllAnnouncements(req, res) {
  try {
    const [announcements] = await pool.execute(
      `SELECT
        a.id,
        a.shop_id,
        s.name AS shop_name,
        s.logo_url AS shop_logo,
        a.title,
        a.body,
        a.created_at,
        a.updated_at
       FROM announcements a
       INNER JOIN shops s ON a.shop_id = s.id
       WHERE a.is_published = 1
         AND s.is_active = 1
       ORDER BY a.created_at DESC`
    );

    return res.status(200).json({
      success: true,
      message: "Announcements retrieved successfully.",
      total: announcements.length,
      announcements
    });

  } catch (error) {
    console.error("Get announcements error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve announcements."
    });
  }
}


// GET SINGLE PUBLIC ANNOUNCEMENT
async function getAnnouncementById(req, res) {
  try {
    const announcementId = req.params.id;

    if (!/^[1-9]\d*$/.test(announcementId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid announcement ID."
      });
    }

    const [announcements] = await pool.execute(
      `SELECT
        a.id,
        a.shop_id,
        s.name AS shop_name,
        s.logo_url AS shop_logo,
        a.title,
        a.body,
        a.created_at,
        a.updated_at
       FROM announcements a
       INNER JOIN shops s ON a.shop_id = s.id
       WHERE a.id = ?
         AND a.is_published = 1
         AND s.is_active = 1
       LIMIT 1`,
      [announcementId]
    );

    if (announcements.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Published announcement not found."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Announcement retrieved successfully.",
      announcement: announcements[0]
    });

  } catch (error) {
    console.error("Get announcement error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve announcement."
    });
  }
}


// GET MY SHOP ANNOUNCEMENTS - SHOP OWNER ONLY
async function getMyAnnouncements(req, res) {
  try {
    const ownerId = req.user.id;

    const [shops] = await pool.execute(
      `SELECT id, name
       FROM shops
       WHERE owner_id = ?
       LIMIT 1`,
      [ownerId]
    );

    if (shops.length === 0) {
      return res.status(404).json({
        success: false,
        message: "You have not created a shop yet."
      });
    }

    const shopId = shops[0].id;

    const [announcements] = await pool.execute(
      `SELECT
        id,
        shop_id,
        title,
        body,
        is_published,
        created_at,
        updated_at
       FROM announcements
       WHERE shop_id = ?
       ORDER BY created_at DESC`,
      [shopId]
    );

    return res.status(200).json({
      success: true,
      message: "Your announcements retrieved successfully.",
      shop: shops[0],
      total: announcements.length,
      announcements
    });

  } catch (error) {
    console.error("Get my announcements error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve your announcements."
    });
  }
}


// UPDATE ANNOUNCEMENT - OWNER ONLY
async function updateAnnouncement(req, res) {
  try {
    const announcementId = req.params.id;
    const { title, body, is_published } = req.body || {};
    if (!/^[1-9]\d*$/.test(announcementId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid announcement ID."
      });
    }

    const ownerId = req.user.id;

    // Verify ownership
    const [existing] = await pool.execute(
      `SELECT a.id
       FROM announcements a
       INNER JOIN shops s ON a.shop_id = s.id
       WHERE a.id = ? AND s.owner_id = ?
       LIMIT 1`,
      [announcementId, ownerId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found or you do not own it."
      });
    }

    

    const updates = [];
    const values = [];

    // Update title
    if (title !== undefined) {
      if (
        typeof title !== "string" ||
        !title.trim() ||
        title.trim().length > 150
      ) {
        return res.status(400).json({
          success: false,
          message: "Title must be between 1 and 150 characters."
        });
      }

      updates.push("title = ?");
      values.push(title.trim());
    }

    // Update body
    if (body !== undefined) {
      if (typeof body !== "string" || !body.trim()) {
        return res.status(400).json({
          success: false,
          message: "Announcement body cannot be empty."
        });
      }

      updates.push("body = ?");
      values.push(body.trim());
    }

    // Publish / Unpublish
    if (is_published !== undefined) {
      if (![0, 1, true, false].includes(is_published)) {
        return res.status(400).json({
          success: false,
          message: "is_published must be true, false, 1 or 0."
        });
      }

      updates.push("is_published = ?");
      values.push(
        is_published === true || is_published === 1 ? 1 : 0
      );
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update."
      });
    }

    values.push(announcementId);

    await pool.execute(
      `UPDATE announcements
       SET ${updates.join(", ")}
       WHERE id = ?`,
      values
    );

    // Retrieve updated announcement
    const [updated] = await pool.execute(
      `SELECT
        a.id,
        a.shop_id,
        s.name AS shop_name,
        a.title,
        a.body,
        a.is_published,
        a.created_at,
        a.updated_at
       FROM announcements a
       INNER JOIN shops s ON a.shop_id = s.id
       WHERE a.id = ?
       LIMIT 1`,
      [announcementId]
    );

    return res.status(200).json({
      success: true,
      message: "Announcement updated successfully.",
      announcement: updated[0]
    });

  } catch (error) {
    console.error("Update announcement error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Announcement update failed."
    });
  }
}


// DELETE ANNOUNCEMENT - OWNER ONLY
async function deleteAnnouncement(req, res) {
  try {
    const announcementId = req.params.id;

    if (!/^[1-9]\d*$/.test(announcementId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid announcement ID."
      });
    }

    const ownerId = req.user.id;

    // Verify ownership
    const [existing] = await pool.execute(
      `SELECT a.id
       FROM announcements a
       INNER JOIN shops s ON a.shop_id = s.id
       WHERE a.id = ? AND s.owner_id = ?
       LIMIT 1`,
      [announcementId, ownerId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found or you do not own it."
      });
    }

    await pool.execute(
      "DELETE FROM announcements WHERE id = ?",
      [announcementId]
    );

    return res.status(200).json({
      success: true,
      message: "Announcement deleted successfully."
    });

  } catch (error) {
    console.error("Delete announcement error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Announcement deletion failed."
    });
  }
}


module.exports = {
  createAnnouncement,
  getAllAnnouncements,
  getAnnouncementById,
  getMyAnnouncements,
  updateAnnouncement,
  deleteAnnouncement
};
