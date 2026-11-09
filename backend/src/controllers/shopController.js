const pool = require("../config/db");

// CREATE SHOP
async function createShop(req, res) {
  try {
    const {
      name,
      description,
      logo_url,
      location,
      contact_phone,
      contact_email,
      opening_hours
    } = req.body;

    // Required field validation
    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Shop name is required."
      });
    }

    const cleanName = name.trim();

    if (cleanName.length > 150) {
      return res.status(400).json({
        success: false,
        message: "Shop name cannot exceed 150 characters."
      });
    }

    // Optional field validation
    const optionalFields = [
      { value: description, max: 65535, name: "Description" },
      { value: logo_url, max: 500, name: "Logo URL" },
      { value: location, max: 255, name: "Location" },
      { value: contact_phone, max: 30, name: "Contact phone" },
      { value: contact_email, max: 150, name: "Contact email" },
      { value: opening_hours, max: 255, name: "Opening hours" }
    ];

    for (const field of optionalFields) {
      if (field.value !== undefined && field.value !== null) {
        if (
          typeof field.value !== "string" ||
          field.value.length > field.max
        ) {
          return res.status(400).json({
            success: false,
            message: `${field.name} is invalid or too long.`
          });
        }
      }
    }

    if (
      contact_email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact_email.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid contact email."
      });
    }

    // Get owner ID from authenticated user
    const ownerId = req.user.id;

    // Check whether this owner already has a shop
    const [existingShop] = await pool.execute(
      "SELECT id FROM shops WHERE owner_id = ? LIMIT 1",
      [ownerId]
    );

    if (existingShop.length > 0) {
      return res.status(409).json({
        success: false,
        message: "You have already created a shop."
      });
    }

    // Insert shop into database
    const [result] = await pool.execute(
      `INSERT INTO shops
       (owner_id, name, description, logo_url, location,
        contact_phone, contact_email, opening_hours)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ownerId,
        cleanName,
        description?.trim() || null,
        logo_url?.trim() || null,
        location?.trim() || null,
        contact_phone?.trim() || null,
        contact_email?.trim().toLowerCase() || null,
        opening_hours?.trim() || null
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Shop created successfully.",
      shop: {
        id: result.insertId,
        owner_id: ownerId,
        name: cleanName,
        description: description?.trim() || null,
        logo_url: logo_url?.trim() || null,
        location: location?.trim() || null,
        contact_phone: contact_phone?.trim() || null,
        contact_email: contact_email?.trim().toLowerCase() || null,
        opening_hours: opening_hours?.trim() || null,
        is_active: 1
      }
    });

  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "You have already created a shop."
      });
    }

    console.error("Create shop error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Shop creation failed due to a server error."
    });
  }
}
// GET MY SHOP
async function getMyShop(req, res) {
  try {
    // Get logged-in Shop Owner ID from JWT
    const ownerId = req.user.id;

    // Find shop belonging to this owner
    const [shops] = await pool.execute(
      `SELECT
        id,
        owner_id,
        name,
        description,
        logo_url,
        location,
        contact_phone,
        contact_email,
        opening_hours,
        is_active,
        created_at,
        updated_at
       FROM shops
       WHERE owner_id = ?
       LIMIT 1`,
      [ownerId]
    );

    // Check whether the owner has created a shop
    if (shops.length === 0) {
      return res.status(404).json({
        success: false,
        message: "You have not created any shop yet."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Your shop retrieved successfully.",
      shop: shops[0]
    });

  } catch (error) {
    console.error("Get my shop error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve your shop."
    });
  }
}
// GET PUBLIC SHOP DETAILS
async function getShopById(req, res) {
  try {
    const shopId = req.params.id;

    // Validate shop ID
    if (!/^[1-9]\d*$/.test(shopId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid shop ID."
      });
    }

    // Find active public shop
    const [shops] = await pool.execute(
      `SELECT
        id,
        name,
        description,
        logo_url,
        location,
        contact_phone,
        contact_email,
        opening_hours,
        created_at
       FROM shops
       WHERE id = ? AND is_active = 1
       LIMIT 1`,
      [shopId]
    );

    // Check shop existence
    if (shops.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Shop not found."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Shop details retrieved successfully.",
      shop: shops[0]
    });

  } catch (error) {
    console.error("Get public shop details error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve shop details."
    });
  }
}
// GET ALL PUBLIC SHOPS
async function getAllShops(req, res) {
  try {
    const [shops] = await pool.execute(
      `SELECT
        id,
        name,
        description,
        logo_url,
        location,
        contact_phone,
        contact_email,
        opening_hours,
        created_at
       FROM shops
       WHERE is_active = 1
       ORDER BY created_at DESC`
    );

    return res.status(200).json({
      success: true,
      message: "All shops retrieved successfully.",
      total: shops.length,
      shops
    });

  } catch (error) {
    console.error("Get all shops error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve shops."
    });
  }
}
// UPDATE OWN SHOP
async function updateMyShop(req, res) {
  try {
    const ownerId = req.user.id;

    const {
      name,
      description,
      logo_url,
      location,
      contact_phone,
      contact_email,
      opening_hours
    } = req.body;

    // Check whether shop exists
    const [existingShops] = await pool.execute(
      "SELECT id FROM shops WHERE owner_id = ? LIMIT 1",
      [ownerId]
    );

    if (existingShops.length === 0) {
      return res.status(404).json({
        success: false,
        message: "You have not created any shop yet."
      });
    }

    // At least one field must be provided
    const fields = {
      name,
      description,
      logo_url,
      location,
      contact_phone,
      contact_email,
      opening_hours
    };

    const updates = [];
    const values = [];

    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        updates.push(`${key} = ?`);
        values.push(value === "" ? null : value);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one field to update."
      });
    }

    // Validate shop name if provided
    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Shop name cannot be empty."
        });
      }

      if (name.trim().length > 150) {
        return res.status(400).json({
          success: false,
          message: "Shop name cannot exceed 150 characters."
        });
      }

      
      const updateIndex = updates.findIndex((item) => item === "name = ?");

      if (updateIndex !== -1) {
        values[updateIndex] = name.trim();
      }
    }

    // Validate contact email if provided
    if (
      contact_email !== undefined &&
      contact_email !== null &&
      contact_email !== "" &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact_email)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid contact email."
      });
    }

    values.push(ownerId);

    const query = `
      UPDATE shops
      SET ${updates.join(", ")},
          updated_at = CURRENT_TIMESTAMP
      WHERE owner_id = ?
    `;

    await pool.execute(query, values);

    const [updatedShops] = await pool.execute(
      `SELECT
        id,
        owner_id,
        name,
        description,
        logo_url,
        location,
        contact_phone,
        contact_email,
        opening_hours,
        is_active,
        created_at,
        updated_at
       FROM shops
       WHERE owner_id = ?
       LIMIT 1`,
      [ownerId]
    );

    return res.status(200).json({
      success: true,
      message: "Your shop updated successfully.",
      shop: updatedShops[0]
    });

  } catch (error) {
    console.error("Update my shop error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update your shop."
    });
  }
}

module.exports = {
  createShop,
  getMyShop,
  getShopById,
  getAllShops,
  updateMyShop
};