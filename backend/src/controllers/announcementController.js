const pool = require("../config/db");
const path = require("path");
const fs = require("fs");
const { notifyUsers } = require("../services/notificationService");

const uploadDirectory = path.resolve(
  __dirname,
  "../../private_uploads/announcements"
);

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf"
];

async function attachAnnouncementAttachments(announcements) {
  if (!announcements.length) return announcements;

  const ids = announcements.map((item) => item.id);
  const placeholders = ids.map(() => "?").join(", ");

  const [rows] = await pool.execute(
    `SELECT id, announcement_id, original_filename, mime_type,
            file_size, uploaded_at
     FROM announcement_attachments
     WHERE announcement_id IN (${placeholders})
     ORDER BY id ASC`,
    ids
  );

  const grouped = {};

  for (const item of rows) {
    if (!grouped[item.announcement_id]) {
      grouped[item.announcement_id] = [];
    }

    grouped[item.announcement_id].push({
      id: item.id,
      original_filename: item.original_filename,
      mime_type: item.mime_type,
      file_size: item.file_size,
      uploaded_at: item.uploaded_at,
      url: `/api/announcements/attachments/${item.id}`
    });
  }

  return announcements.map((item) => ({
    ...item,
    attachments: grouped[item.id] || []
  }));
}

async function saveAttachments(connection, announcementId, files) {
  for (const file of files || []) {
    await connection.execute(
      `INSERT INTO announcement_attachments
       (announcement_id, original_filename, stored_filename, mime_type, file_size)
       VALUES (?, ?, ?, ?, ?)`,
      [
        announcementId,
        path.basename(file.originalname).slice(0, 255),
        file.filename,
        file.mimetype,
        file.size
      ]
    );
  }
}

async function removeStoredFiles(filenames) {
  await Promise.all(
    filenames.map(async (filename) => {
      if (
        typeof filename !== "string" ||
        path.basename(filename) !== filename
      ) return;

      const filePath = path.resolve(uploadDirectory, filename);

      if (!filePath.startsWith(uploadDirectory + path.sep)) return;

      try {
        await fs.promises.unlink(filePath);
      } catch (error) {
        if (error.code !== "ENOENT") {
          console.error("Announcement file cleanup error:", error.message);
        }
      }
    })
  );
}

// CREATE ANNOUNCEMENT - SHOP OWNER ONLY
async function createAnnouncement(req, res) {
  let connection;
  let committed = false;
  const files = req.files || [];

  try {
    const { title, body, is_published } = req.body || {};

    let isPublished = 1;

    if (is_published !== undefined) {
      if (![0, 1, true, false, "0", "1", "true", "false"].includes(is_published)) {
        await require("../middleware/announcementUpload").removeUploadedFiles(files);
        return res.status(400).json({
          success: false,
          message: "Invalid is_published value."
        });
      }

      isPublished =
        is_published === true || is_published === 1 ||
        is_published === "1" || is_published === "true" ? 1 : 0;
    }

    if (typeof title !== "string" || !title.trim() || title.trim().length > 150) {
      await require("../middleware/announcementUpload").removeUploadedFiles(files);
      return res.status(400).json({
        success: false,
        message: "Title must be between 1 and 150 characters."
      });
    }

    if (typeof body !== "string" || !body.trim()) {
      await require("../middleware/announcementUpload").removeUploadedFiles(files);
      return res.status(400).json({
        success: false,
        message: "Announcement body is required."
      });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [shops] = await connection.execute(
      `SELECT id FROM shops
       WHERE owner_id = ? AND is_active = 1 LIMIT 1`,
      [req.user.id]
    );

    if (!shops.length) {
      await connection.rollback();
      await require("../middleware/announcementUpload").removeUploadedFiles(files);
      return res.status(404).json({
        success: false,
        message: "You do not have an active shop."
      });
    }

    const shopId = shops[0].id;

    const [result] = await connection.execute(
      `INSERT INTO announcements (shop_id, title, body, is_published)
       VALUES (?, ?, ?, ?)`,
      [shopId, title.trim(), body.trim(), isPublished]
    );

    await saveAttachments(connection, result.insertId, files);
    await connection.commit();
    committed = true;

    const [announcements] = await pool.execute(
      `SELECT a.id, a.shop_id, s.name AS shop_name, s.logo_url AS shop_logo, a.title, a.body,
              a.is_published, a.created_at, a.updated_at
       FROM announcements a
       INNER JOIN shops s ON s.id = a.shop_id
       WHERE a.id = ?`,
      [result.insertId]
    );

    const [favorites] = await pool.execute(
      `SELECT fs.user_id
       FROM favorite_shops fs
       INNER JOIN users u ON u.id = fs.user_id
       WHERE fs.shop_id = ?
         AND u.role = 'student'
         AND u.status = 'active'
         AND ? = 1`,
      [shopId, isPublished]
    );

    try {
      await notifyUsers(
        favorites.map((item) => item.user_id),
        {
          type: "announcement",
          message: `New announcement from your favorite shop: ${title.trim()}`,
          relatedType: "announcement",
          relatedId: result.insertId
        }
      );
    } catch (error) {
      console.error("Announcement notification error:", error.message);
    }

    const [withAttachments] = await attachAnnouncementAttachments(announcements);

    return res.status(201).json({
      success: true,
      message: "Announcement created successfully.",
      announcement: withAttachments
    });
  } catch (error) {
    if (!committed && connection) {
      try { await connection.rollback(); } catch (_) {}
    }

    if (!committed) {
      await require("../middleware/announcementUpload").removeUploadedFiles(files);
    }
    console.error("Create announcement error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Announcement creation failed."
    });
  } finally {
    if (connection) connection.release();
  }
}

// GET ANNOUNCEMENTS BASED ON USER ROLE
async function getAllAnnouncements(req, res) {
  try {
    let accessCondition = "a.is_published = 1 AND s.is_active = 1";
    const values = [];

    if (req.user.role === "admin") {
      accessCondition = "1 = 1";
    } else if (req.user.role === "shop_owner") {
      accessCondition = "s.owner_id = ?";
      values.push(req.user.id);
    }

    const [announcements] = await pool.execute(
      `SELECT a.id, a.shop_id, s.name AS shop_name,
              s.logo_url AS shop_logo, a.title, a.body,
              a.is_published, a.created_at, a.updated_at
       FROM announcements a
       INNER JOIN shops s ON s.id = a.shop_id
       WHERE ${accessCondition}
       ORDER BY a.created_at DESC`,
      values
    );

    const result = await attachAnnouncementAttachments(announcements);

    return res.status(200).json({
      success: true,
      message: "Announcements retrieved successfully.",
      total: result.length,
      announcements: result
    });
  } catch (error) {
    console.error("Get announcements error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve announcements."
    });
  }
}
// GET SINGLE ANNOUNCEMENT BASED ON USER ROLE
async function getAnnouncementById(req, res) {
  try {
    const { id } = req.params;

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid announcement ID."
      });
    }

    let accessCondition = "a.is_published = 1 AND s.is_active = 1";
    const values = [id];

    if (req.user.role === "admin") {
      accessCondition = "1 = 1";
    } else if (req.user.role === "shop_owner") {
      accessCondition = "s.owner_id = ?";
      values.push(req.user.id);
    }

    const [announcements] = await pool.execute(
      `SELECT a.id, a.shop_id, s.name AS shop_name,
              s.logo_url AS shop_logo, a.title, a.body,
              a.is_published, a.created_at, a.updated_at
       FROM announcements a
       INNER JOIN shops s ON s.id = a.shop_id
       WHERE a.id = ? AND ${accessCondition}
       LIMIT 1`,
      values
    );

    if (!announcements.length) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found."
      });
    }

    const result = await attachAnnouncementAttachments(announcements);

    return res.status(200).json({
      success: true,
      message: "Announcement retrieved successfully.",
      announcement: result[0]
    });
  } catch (error) {
    console.error("Get announcement error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve announcement."
    });
  }
}
// GET OWNER'S ANNOUNCEMENTS
async function getMyAnnouncements(req, res) {
  try {
    const [shops] = await pool.execute(
      `SELECT id, name, logo_url FROM shops WHERE owner_id = ? LIMIT 1`,
      [req.user.id]
    );

    if (!shops.length) {
      return res.status(404).json({
        success: false,
        message: "You have not created a shop yet."
      });
    }

    const [announcements] = await pool.execute(
      `SELECT a.id, a.shop_id, s.name AS shop_name, s.logo_url AS shop_logo, a.title, a.body, a.is_published, a.created_at, a.updated_at
       FROM announcements a
       INNER JOIN shops s ON s.id = a.shop_id
       WHERE a.shop_id = ?
       ORDER BY created_at DESC`,
      [shops[0].id]
    );

    const result = await attachAnnouncementAttachments(announcements);

    return res.status(200).json({
      success: true,
      message: "Your announcements retrieved successfully.",
      shop: shops[0],
      total: result.length,
      announcements: result
    });
  } catch (error) {
    console.error("Get my announcements error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve your announcements."
    });
  }
}

// UPDATE OWNER'S ANNOUNCEMENT
async function updateAnnouncement(req, res) {
  let connection;
  let committed = false;
  const files = req.files || [];

  try {
    const { id } = req.params;
    const { title, body, is_published } = req.body || {};

    if (!/^[1-9]\d*$/.test(id)) {
      await require("../middleware/announcementUpload").removeUploadedFiles(files);
      return res.status(400).json({
        success: false,
        message: "Invalid announcement ID."
      });
    }

    const updates = [];
    const values = [];

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim() || title.trim().length > 150) {
        await require("../middleware/announcementUpload").removeUploadedFiles(files);
        return res.status(400).json({
          success: false,
          message: "Title must be between 1 and 150 characters."
        });
      }
      updates.push("title = ?");
      values.push(title.trim());
    }

    if (body !== undefined) {
      if (typeof body !== "string" || !body.trim()) {
        await require("../middleware/announcementUpload").removeUploadedFiles(files);
        return res.status(400).json({
          success: false,
          message: "Announcement body cannot be empty."
        });
      }
      updates.push("body = ?");
      values.push(body.trim());
    }

    if (is_published !== undefined) {
      if (![0, 1, true, false, "0", "1", "true", "false"].includes(is_published)) {
        await require("../middleware/announcementUpload").removeUploadedFiles(files);
        return res.status(400).json({
          success: false,
          message: "Invalid is_published value."
        });
      }
      updates.push("is_published = ?");
      values.push(
        is_published === true || is_published === 1 ||
        is_published === "1" || is_published === "true" ? 1 : 0
      );
    }

    if (!updates.length && !files.length) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field or attachment to update."
      });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [existing] = await connection.execute(
      `SELECT a.id FROM announcements a
       INNER JOIN shops s ON s.id = a.shop_id
       WHERE a.id = ? AND s.owner_id = ?
       LIMIT 1
       FOR UPDATE`,
      [id, req.user.id]
    );

    if (!existing.length) {
      await connection.rollback();
      await require("../middleware/announcementUpload").removeUploadedFiles(files);
      return res.status(404).json({
        success: false,
        message: "Announcement not found or you do not own it."
      });
    }

    // Enforce a maximum of 3 attachments per announcement.
    const [[attachmentCountResult]] = await connection.execute(
      `SELECT COUNT(*) AS total
       FROM announcement_attachments
       WHERE announcement_id = ?`,
      [id]
    );

    const currentAttachmentCount = Number(attachmentCountResult.total);

    if (currentAttachmentCount + files.length > 3) {
      await connection.rollback();

      await require("../middleware/announcementUpload").removeUploadedFiles(files);

      return res.status(400).json({
        success: false,
        message: `This announcement already has ${currentAttachmentCount} attachment(s). You can have a maximum of 3 attachments in total.`
      });
    }
    if (updates.length) {
      values.push(id);
      await connection.execute(
        `UPDATE announcements SET ${updates.join(", ")} WHERE id = ?`,
        values
      );
    }

    await saveAttachments(connection, id, files);
    await connection.commit();
    committed = true;

    const [updated] = await pool.execute(
      `SELECT a.id, a.shop_id, s.name AS shop_name, s.logo_url AS shop_logo, a.title, a.body,
              a.is_published, a.created_at, a.updated_at
       FROM announcements a
       INNER JOIN shops s ON s.id = a.shop_id
       WHERE a.id = ?`,
      [id]
    );

    const result = await attachAnnouncementAttachments(updated);

    return res.status(200).json({
      success: true,
      message: "Announcement updated successfully.",
      announcement: result[0]
    });
  } catch (error) {
    if (!committed && connection) {
      try { await connection.rollback(); } catch (_) {}
    }

    if (!committed) {
      await require("../middleware/announcementUpload").removeUploadedFiles(files);
    }
    console.error("Update announcement error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Announcement update failed."
    });
  } finally {
    if (connection) connection.release();
  }
}

// DELETE ANNOUNCEMENT - OWNER OR ADMIN
async function deleteAnnouncement(req, res) {
  let connection;

  try {
    const { id } = req.params;

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid announcement ID."
      });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    let query = `
      SELECT a.id
      FROM announcements a
      INNER JOIN shops s ON s.id = a.shop_id
      WHERE a.id = ?
    `;
    const params = [id];

    if (req.user.role !== "admin") {
      query += " AND s.owner_id = ?";
      params.push(req.user.id);
    }

    query += " LIMIT 1";

    const [existing] = await connection.execute(query, params);

    if (!existing.length) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "Announcement not found or you do not have permission."
      });
    }

    const [attachments] = await connection.execute(
      `SELECT stored_filename
       FROM announcement_attachments
       WHERE announcement_id = ?`,
      [id]
    );

    await connection.execute(
      "DELETE FROM announcements WHERE id = ?",
      [id]
    );

    await connection.commit();

    await removeStoredFiles(
      attachments.map((item) => item.stored_filename)
    );

    return res.status(200).json({
      success: true,
      message: "Announcement deleted successfully."
    });
  } catch (error) {
    if (connection) {
      try { await connection.rollback(); } catch (_) {}
    }

    console.error("Delete announcement error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Announcement deletion failed."
    });
  } finally {
    if (connection) connection.release();
  }
}

// AUTHENTICATED ATTACHMENT DOWNLOAD / PREVIEW
async function getAnnouncementAttachment(req, res) {
  try {
    const { attachmentId } = req.params;

    if (!/^[1-9]\d*$/.test(attachmentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attachment ID."
      });
    }

    const [rows] = await pool.execute(
      `SELECT aa.stored_filename, aa.original_filename,
              aa.mime_type, a.is_published, s.is_active,
              s.owner_id
       FROM announcement_attachments aa
       INNER JOIN announcements a ON a.id = aa.announcement_id
       INNER JOIN shops s ON s.id = a.shop_id
       WHERE aa.id = ?
       LIMIT 1`,
      [attachmentId]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Attachment not found."
      });
    }

    const attachment = rows[0];

    // Students can only access published attachments from active shops.
    if (
      req.user.role === "student" &&
      (Number(attachment.is_published) !== 1 ||
       Number(attachment.is_active) !== 1)
    ) {
      return res.status(404).json({
        success: false,
        message: "Attachment not found."
      });
    }

    // Shop owners can only access attachments belonging to their own shop.
    if (
      req.user.role === "shop_owner" &&
      Number(attachment.owner_id) !== Number(req.user.id)
    ) {
      return res.status(404).json({
        success: false,
        message: "Attachment not found."
      });
    }

    // Admin can access all announcement attachments.

    if (!allowedMimeTypes.includes(attachment.mime_type)) {
      return res.status(403).json({
        success: false,
        message: "Unsupported attachment type."
      });
    }

    const filename = attachment.stored_filename;

    if (
      typeof filename !== "string" ||
      path.basename(filename) !== filename
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid attachment file."
      });
    }

    const filePath = path.resolve(uploadDirectory, filename);

    if (!filePath.startsWith(uploadDirectory + path.sep)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attachment path."
      });
    }

    const stats = await fs.promises.stat(filePath);

    if (!stats.isFile()) {
      return res.status(404).json({
        success: false,
        message: "Attachment file not found."
      });
    }

    const safeName = path.basename(attachment.original_filename)
      .replace(/[\r\n"]/g, "_");

    res.setHeader("Content-Type", attachment.mime_type);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${safeName}"; filename*=UTF-8''${encodeURIComponent(safeName)}`
    );
    res.setHeader("X-Content-Type-Options", "nosniff");

    return res.sendFile(filePath, (error) => {
      if (error && !res.headersSent) {
        console.error("Announcement attachment send error:", error.message);
        res.status(500).json({
          success: false,
          message: "Failed to retrieve attachment."
        });
      }
    });
  } catch (error) {
    if (error.code === "ENOENT") {
      return res.status(404).json({
        success: false,
        message: "Attachment file not found."
      });
    }

    console.error("Get announcement attachment error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve attachment."
    });
  }
}
module.exports = {
  createAnnouncement,
  getAllAnnouncements,
  getAnnouncementById,
  getMyAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
  getAnnouncementAttachment
};

