
const pool = require("../config/db");
const path = require("path");
const fs = require("fs");

const {
  removeUploadedFiles
} = require("../middleware/complaintUpload");
// GET ALL COMPLAINT CATEGORIES
async function getComplaintCategories(req, res) {
  try {
    const [categories] = await pool.execute(
      `SELECT id, name
       FROM complaint_categories
       ORDER BY id ASC`
    );

    return res.status(200).json({
      success: true,
      message: "Complaint categories retrieved successfully.",
      total: categories.length,
      categories
    });

  } catch (error) {
    console.error("Get complaint categories error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve complaint categories."
    });
  }
}

// CREATE STUDENT COMPLAINT
async function createComplaint(req, res) {
  let connection;

  try {
  const {
  shop_id,
  food_item_id,
  category_id,
  description,
  is_anonymous
} = req.body;

    const userId = req.user.id;
    const files = req.files || [];

    // Validate Shop ID
    if (!/^[1-9]\d*$/.test(String(shop_id || ""))) {
      await removeUploadedFiles(files);

      return res.status(400).json({
        success: false,
        message: "A valid shop ID is required."
      });
    }

    // Validate Category ID
    if (!/^[1-9]\d*$/.test(String(category_id || ""))) {
      await removeUploadedFiles(files);

      return res.status(400).json({
        success: false,
        message: "A valid complaint category is required."
      });
    }

    // Validate optional Food Item ID
    if (
      food_item_id !== undefined &&
      food_item_id !== null &&
      food_item_id !== "" &&
      !/^[1-9]\d*$/.test(String(food_item_id))
    ) {
      await removeUploadedFiles(files);

      return res.status(400).json({
        success: false,
        message: "Invalid food item ID."
      });
    }

    // Validate description
    if (
      typeof description !== "string" ||
      !description.trim()
    ) {
      await removeUploadedFiles(files);

      return res.status(400).json({
        success: false,
        message: "Complaint description is required."
      });
    }

    const cleanDescription = description.trim();

    if (cleanDescription.length > 65535) {
      await removeUploadedFiles(files);

      return res.status(400).json({
        success: false,
        message: "Complaint description is too long."
      });
    }

    // Validate public visibility
   // Validate anonymous option
if (
  is_anonymous !== undefined &&
  is_anonymous !== 0 &&
  is_anonymous !== 1 &&
  is_anonymous !== false &&
  is_anonymous !== true &&
  is_anonymous !== "0" &&
  is_anonymous !== "1"
) {
  await removeUploadedFiles(files);

  return res.status(400).json({
    success: false,
    message: "Invalid anonymous complaint value."
  });
}

// Normal complaint is the default
const anonymousValue =
  is_anonymous === true ||
  is_anonymous === 1 ||
  is_anonymous === "1"
    ? 1
    : 0;

// All complaints are always public
const publicValue = 1;
    const shopId = Number(shop_id);
    const categoryId = Number(category_id);

    const foodItemId =
      food_item_id === undefined ||
      food_item_id === null ||
      food_item_id === ""
        ? null
        : Number(food_item_id);

    // Get database connection
    connection = await pool.getConnection();

    await connection.beginTransaction();

    // Verify that the Shop exists and is active
    const [shops] = await connection.execute(
      `SELECT id
       FROM shops
       WHERE id = ? AND is_active = 1
       LIMIT 1`,
      [shopId]
    );

    if (shops.length === 0) {
      await connection.rollback();
      await removeUploadedFiles(files);

      return res.status(404).json({
        success: false,
        message: "Shop not found or currently inactive."
      });
    }

    // Verify complaint category
    const [categories] = await connection.execute(
      `SELECT id
       FROM complaint_categories
       WHERE id = ?
       LIMIT 1`,
      [categoryId]
    );

    if (categories.length === 0) {
      await connection.rollback();
      await removeUploadedFiles(files);

      return res.status(400).json({
        success: false,
        message: "Selected complaint category does not exist."
      });
    }

    // Verify Food Item belongs to the selected Shop
    if (foodItemId !== null) {
      const [foodItems] = await connection.execute(
        `SELECT id
         FROM food_items
         WHERE id = ? AND shop_id = ?
         LIMIT 1`,
        [foodItemId, shopId]
      );

      if (foodItems.length === 0) {
        await connection.rollback();
        await removeUploadedFiles(files);

        return res.status(400).json({
          success: false,
          message: "Selected food item does not belong to this shop."
        });
      }
    }

    // Insert complaint
   // Insert complaint
const [complaintResult] = await connection.execute(
  `INSERT INTO complaints
   (
     user_id,
     shop_id,
     food_item_id,
     category_id,
     description,
     evidence_url,
     status,
     is_public,
     is_anonymous
   )
   VALUES (?, ?, ?, ?, ?, NULL, 'pending', ?, ?)`,
  [
    userId,
    shopId,
    foodItemId,
    categoryId,
    cleanDescription,
    publicValue,
    anonymousValue
  ]
);

    const complaintId = complaintResult.insertId;

    // Insert attachment metadata
    for (const file of files) {
      const relativeStoragePath =
        `private_uploads/complaints/${file.filename}`;

      await connection.execute(
        `INSERT INTO complaint_attachments
         (
           complaint_id,
           original_filename,
           stored_filename,
           storage_path,
           mime_type,
           file_size
         )
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          complaintId,
          file.originalname,
          file.filename,
          relativeStoragePath,
          file.mimetype,
          file.size
        ]
      );
    }

    // Commit transaction
    await connection.commit();

    return res.status(201).json({
      success: true,
      message: "Complaint submitted successfully.",
      complaint: {
        id: complaintId,
        user_id: userId,
        shop_id: shopId,
        food_item_id: foodItemId,
        category_id: categoryId,
        description: cleanDescription,
        status: "pending",
        is_public: publicValue,
        is_anonymous: anonymousValue,
        attachments: files.map((file) => ({
          original_filename: file.originalname,
          mime_type: file.mimetype,
          file_size: file.size
        }))
      }
    });

  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error(
          "Complaint rollback error:",
          rollbackError.message
        );
      }
    }

    await removeUploadedFiles(req.files || []);

    console.error("Create complaint error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to submit complaint."
    });

  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// GET ALL PUBLIC COMPLAINTS
async function getPublicComplaints(req, res) {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = 20;
    const offset = (page - 1) * limit;

    // Retrieve public complaints without exposing anonymous identities
    const [complaints] = await pool.execute(
      `SELECT
         c.id,
         CASE
           WHEN c.is_anonymous = 1 THEN 'Anonymous'
           ELSE u.name
         END AS complainant_name,

         CASE
           WHEN c.is_anonymous = 1 THEN NULL
           ELSE u.avatar_url
         END AS complainant_avatar,

         c.shop_id,
         s.name AS shop_name,
         c.food_item_id,
         f.name AS food_item_name,
         c.category_id,
         cc.name AS category_name,
         c.description,
         c.status,
         c.is_anonymous,
         c.created_at

       FROM complaints c

       INNER JOIN users u ON c.user_id = u.id
       INNER JOIN shops s ON c.shop_id = s.id
       INNER JOIN complaint_categories cc ON c.category_id = cc.id
       LEFT JOIN food_items f ON c.food_item_id = f.id

       WHERE c.is_public = 1

       ORDER BY c.created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const [countResult] = await pool.execute(
      `SELECT COUNT(*) AS total
       FROM complaints
       WHERE is_public = 1`
    );

    const total = countResult[0].total;
    // Retrieve attachments for the public complaints
const complaintIds = complaints.map(
  (complaint) => complaint.id
);

const attachmentsByComplaint = {};

if (complaintIds.length > 0) {
  const placeholders = complaintIds.map(() => "?").join(", ");

  const [attachmentRows] = await pool.execute(
    `SELECT
       id,
       complaint_id,
       original_filename,
       mime_type,
       file_size
     FROM complaint_attachments
     WHERE complaint_id IN (${placeholders})
     ORDER BY id ASC`,
    complaintIds
  );

  for (const attachment of attachmentRows) {
    if (!attachmentsByComplaint[attachment.complaint_id]) {
      attachmentsByComplaint[attachment.complaint_id] = [];
    }

    attachmentsByComplaint[attachment.complaint_id].push({
      id: attachment.id,
      original_filename: attachment.original_filename,
      mime_type: attachment.mime_type,
      file_size: attachment.file_size,
      url: `/api/complaints/attachments/${attachment.id}`
    });
  }
}

// Attachments to each complaint
const complaintsWithAttachments = complaints.map(
  (complaint) => ({
    ...complaint,
    attachments: attachmentsByComplaint[complaint.id] || []
  })
);

    return res.status(200).json({
      success: true,
      message: "Public complaints retrieved successfully.",
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
        complaints: complaintsWithAttachments
    });

  } catch (error) {
    console.error("Get public complaints error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve public complaints."
    });
  }
}
// VIEW PUBLIC COMPLAINT ATTACHMENT
async function getPublicComplaintAttachment(req, res) {
  try {
    const { attachmentId } = req.params;

    // Validate attachment ID
    if (!/^[1-9]\d*$/.test(attachmentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attachment ID."
      });
    }

    // Find attachment belonging to a public complaint
    const [attachments] = await pool.execute(
      `SELECT
         ca.stored_filename,
         ca.original_filename,
         ca.mime_type
       FROM complaint_attachments ca
       INNER JOIN complaints c
         ON ca.complaint_id = c.id
       WHERE ca.id = ?
         AND c.is_public = 1
       LIMIT 1`,
      [Number(attachmentId)]
    );

    if (attachments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Attachment not found."
      });
    }

    const attachment = attachments[0];

    // Allow only supported MIME types
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf"
    ];

    if (!allowedMimeTypes.includes(attachment.mime_type)) {
      return res.status(403).json({
        success: false,
        message: "Unsupported attachment type."
      });
    }

    // Build a safe file path
    const uploadDirectory = path.resolve(
      __dirname,
      "../../private_uploads/complaints"
    );

    const storedFilename = attachment.stored_filename;

    // Prevent path traversal
    if (
      typeof storedFilename !== "string" ||
      path.basename(storedFilename) !== storedFilename
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid attachment file."
      });
    }

    const filePath = path.resolve(
      uploadDirectory,
      storedFilename
    );

    if (!filePath.startsWith(uploadDirectory + path.sep)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attachment path."
      });
    }

    // Verify file exists
    const fileStats = await fs.promises.stat(filePath);

    if (!fileStats.isFile()) {
      return res.status(404).json({
        success: false,
        message: "Attachment file not found."
      });
    }

    // Sanitize original filename for response headers
    const originalFilename = path
      .basename(attachment.original_filename)
      .replace(/[\r\n"]/g, "_");

    const fallbackFilename = originalFilename.replace(
      /[^\x20-\x7E]/g,
      "_"
    );

    res.setHeader("Content-Type", attachment.mime_type);

    res.setHeader(
      "Content-Disposition",
      `inline; filename="${fallbackFilename}"; filename*=UTF-8''${encodeURIComponent(originalFilename)}`
    );

    res.setHeader("X-Content-Type-Options", "nosniff");

    // Send file to browser
    return res.sendFile(filePath, (error) => {
      if (error && !res.headersSent) {
        console.error("Attachment viewing error:", error.message);

        res.status(500).json({
          success: false,
          message: "Failed to display attachment."
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

    console.error(
      "Get public complaint attachment error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve attachment."
    });
  }
}


module.exports = {
  getComplaintCategories,
  createComplaint,
  getPublicComplaints,
  getPublicComplaintAttachment
};