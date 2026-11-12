const db = require("../config/db");

// Validate positive integer IDs
function isValidId(id) {
  return Number.isInteger(Number(id)) && Number(id) > 0;
}

// Validate YYYY-MM-DD and ensure it is a real calendar date
function isValidDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

// Validate HH:MM or HH:MM:SS
function isValidTime(value) {
  if (typeof value !== "string") return false;

  return /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(value);
}

// PUBLIC: Get all events
async function getAllEvents(req, res) {
  try {
    const [events] = await db.execute(
      `SELECT
         e.id,
         e.name,
         e.event_date,
         e.start_time,
         e.end_time,
         e.location,
         e.description,
         e.image_url,
         e.created_at,
         e.updated_at,
         u.name AS created_by_name,
         (SELECT COUNT(*) FROM event_shops es
          WHERE es.event_id = e.id) AS shop_count,
         (SELECT COUNT(*) FROM event_food_items efi
          WHERE efi.event_id = e.id) AS food_item_count
       FROM events e
       JOIN users u ON e.created_by = u.id
       ORDER BY
         CASE WHEN e.event_date >= CURDATE() THEN 0 ELSE 1 END,
         e.event_date ASC,
         e.start_time ASC,
         e.id DESC`
    );

    return res.status(200).json({
      success: true,
      message: "Events retrieved successfully.",
      count: events.length,
      data: events
    });
  } catch (error) {
    console.error("Get all events error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve events."
    });
  }
}

// PUBLIC: Get one event with its shops and food items
async function getEventById(req, res) {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID."
      });
    }

    const [events] = await db.execute(
      `SELECT
         e.*,
         u.name AS created_by_name
       FROM events e
       JOIN users u ON e.created_by = u.id
       WHERE e.id = ?
       LIMIT 1`,
      [Number(id)]
    );

    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Event not found."
      });
    }

    const [shops] = await db.execute(
      `SELECT
         s.id,
         s.name,
         s.description,
         s.logo_url,
         s.location,
         s.contact_phone,
         s.is_active
       FROM event_shops es
       JOIN shops s ON es.shop_id = s.id
       WHERE es.event_id = ?
       ORDER BY s.name ASC`,
      [Number(id)]
    );

    const [foodItems] = await db.execute(
      `SELECT
         fi.id,
         fi.shop_id,
         fi.name,
         fi.description,
         fi.image_url,
         fi.price,
         fi.discount_percent,
         fi.final_price,
         fi.avg_rating,
         fi.is_available,
         s.name AS shop_name
       FROM event_food_items efi
       JOIN food_items fi
         ON efi.food_item_id = fi.id
        AND efi.shop_id = fi.shop_id
       JOIN shops s ON efi.shop_id = s.id
       WHERE efi.event_id = ?
       ORDER BY s.name ASC, fi.name ASC`,
      [Number(id)]
    );

    return res.status(200).json({
      success: true,
      message: "Event details retrieved successfully.",
      data: {
        ...events[0],
        shops,
        food_items: foodItems
      }
    });
  } catch (error) {
    console.error("Get event details error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve event details."
    });
  }
}

// ADMIN: Create event
async function createEvent(req, res) {
  try {
    const {
      name,
      event_date,
      start_time = null,
      end_time = null,
      location = null,
      description = null,
      image_url = null
    } = req.body;

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Event name is required."
      });
    }

    if (name.trim().length > 150) {
      return res.status(400).json({
        success: false,
        message: "Event name cannot exceed 150 characters."
      });
    }

    if (!isValidDate(event_date)) {
      return res.status(400).json({
        success: false,
        message: "A valid event date is required (YYYY-MM-DD)."
      });
    }

    if (start_time !== null && !isValidTime(start_time)) {
      return res.status(400).json({
        success: false,
        message: "Invalid start time. Use HH:MM or HH:MM:SS."
      });
    }

    if (end_time !== null && !isValidTime(end_time)) {
      return res.status(400).json({
        success: false,
        message: "Invalid end time. Use HH:MM or HH:MM:SS."
      });
    }

    if (start_time && end_time && end_time <= start_time) {
      return res.status(400).json({
        success: false,
        message: "End time must be later than start time."
      });
    }

    if (location !== null &&
        (typeof location !== "string" || location.length > 255)) {
      return res.status(400).json({
        success: false,
        message: "Location must be a string of at most 255 characters."
      });
    }

    if (image_url !== null &&
        (typeof image_url !== "string" || image_url.length > 500)) {
      return res.status(400).json({
        success: false,
        message: "Image URL must be a string of at most 500 characters."
      });
    }

    if (description !== null && typeof description !== "string") {
      return res.status(400).json({
        success: false,
        message: "Description must be a string."
      });
    }

    const [result] = await db.execute(
      `INSERT INTO events
       (created_by, name, event_date, start_time, end_time,
        location, description, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        name.trim(),
        event_date,
        start_time,
        end_time,
        location,
        description,
        image_url
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Event created successfully.",
      data: {
        id: result.insertId,
        created_by: req.user.id,
        name: name.trim(),
        event_date,
        start_time,
        end_time,
        location,
        description,
        image_url
      }
    });
  } catch (error) {
    console.error("Create event error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create event."
    });
  }
}

// ADMIN: Update event
async function updateEvent(req, res) {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID."
      });
    }

    const [existingEvents] = await db.execute(
      "SELECT * FROM events WHERE id = ? LIMIT 1",
      [Number(id)]
    );

    if (existingEvents.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Event not found."
      });
    }

    const existing = existingEvents[0];
    const body = req.body;

    const name = body.name === undefined ? existing.name : body.name;
    const event_date = body.event_date === undefined
      ? existing.event_date
      : body.event_date;
    const start_time = body.start_time === undefined
      ? existing.start_time
      : body.start_time;
    const end_time = body.end_time === undefined
      ? existing.end_time
      : body.end_time;
    const location = body.location === undefined
      ? existing.location
      : body.location;
    const description = body.description === undefined
      ? existing.description
      : body.description;
    const image_url = body.image_url === undefined
      ? existing.image_url
      : body.image_url;

    if (typeof name !== "string" || !name.trim() || name.trim().length > 150) {
      return res.status(400).json({
        success: false,
        message: "Event name is required and cannot exceed 150 characters."
      });
    }

    const dateString = event_date instanceof Date
      ? event_date.toISOString().slice(0, 10)
      : event_date;

    if (!isValidDate(dateString)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event date. Use YYYY-MM-DD."
      });
    }

    if (start_time !== null && !isValidTime(start_time)) {
      return res.status(400).json({
        success: false,
        message: "Invalid start time."
      });
    }

    if (end_time !== null && !isValidTime(end_time)) {
      return res.status(400).json({
        success: false,
        message: "Invalid end time."
      });
    }

    if (start_time && end_time && end_time <= start_time) {
      return res.status(400).json({
        success: false,
        message: "End time must be later than start time."
      });
    }

    if (location !== null &&
        (typeof location !== "string" || location.length > 255)) {
      return res.status(400).json({
        success: false,
        message: "Location cannot exceed 255 characters."
      });
    }

    if (description !== null && typeof description !== "string") {
      return res.status(400).json({
        success: false,
        message: "Description must be a string."
      });
    }

    if (image_url !== null &&
        (typeof image_url !== "string" || image_url.length > 500)) {
      return res.status(400).json({
        success: false,
        message: "Image URL cannot exceed 500 characters."
      });
    }

    await db.execute(
      `UPDATE events
       SET name = ?, event_date = ?, start_time = ?, end_time = ?,
           location = ?, description = ?, image_url = ?
       WHERE id = ?`,
      [
        name.trim(),
        dateString,
        start_time,
        end_time,
        location,
        description,
        image_url,
        Number(id)
      ]
    );

    return res.status(200).json({
      success: true,
      message: "Event updated successfully."
    });
  } catch (error) {
    console.error("Update event error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update event."
    });
  }
}

// ADMIN: Delete event
async function deleteEvent(req, res) {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID."
      });
    }

    const [result] = await db.execute(
      "DELETE FROM events WHERE id = ?",
      [Number(id)]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Event not found."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Event deleted successfully."
    });
  } catch (error) {
    console.error("Delete event error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete event."
    });
  }
}

// ADMIN: Add a shop to an event
async function addShopToEvent(req, res) {
  try {
    const { id } = req.params;
    const { shop_id } = req.body;

    if (!isValidId(id) || !isValidId(shop_id)) {
      return res.status(400).json({
        success: false,
        message: "Valid event ID and shop_id are required."
      });
    }

    const [events] = await db.execute(
      "SELECT id FROM events WHERE id = ? LIMIT 1",
      [Number(id)]
    );

    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Event not found."
      });
    }

    const [shops] = await db.execute(
      "SELECT id FROM shops WHERE id = ? AND is_active = 1 LIMIT 1",
      [Number(shop_id)]
    );

    if (shops.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Active shop not found."
      });
    }

    const [existing] = await db.execute(
      "SELECT event_id FROM event_shops WHERE event_id = ? AND shop_id = ?",
      [Number(id), Number(shop_id)]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "This shop is already linked to the event."
      });
    }

    await db.execute(
      "INSERT INTO event_shops (event_id, shop_id) VALUES (?, ?)",
      [Number(id), Number(shop_id)]
    );

    return res.status(201).json({
      success: true,
      message: "Shop added to event successfully."
    });
  } catch (error) {
    console.error("Add shop to event error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add shop to event."
    });
  }
}

// ADMIN: Add a food item to an event
async function addFoodItemToEvent(req, res) {
  try {
    const { id } = req.params;
    const { food_item_id } = req.body;

    if (!isValidId(id) || !isValidId(food_item_id)) {
      return res.status(400).json({
        success: false,
        message: "Valid event ID and food_item_id are required."
      });
    }

    const [events] = await db.execute(
      "SELECT id FROM events WHERE id = ? LIMIT 1",
      [Number(id)]
    );

    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Event not found."
      });
    }

    const [foodItems] = await db.execute(
      `SELECT fi.id, fi.shop_id
       FROM food_items fi
       JOIN shops s ON fi.shop_id = s.id
       WHERE fi.id = ?
         AND fi.is_available = 1
         AND s.is_active = 1
       LIMIT 1`,
      [Number(food_item_id)]
    );

    if (foodItems.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Available food item from an active shop not found."
      });
    }

    const shopId = foodItems[0].shop_id;

    const [linkedShops] = await db.execute(
      `SELECT event_id
       FROM event_shops
       WHERE event_id = ? AND shop_id = ?
       LIMIT 1`,
      [Number(id), shopId]
    );

    if (linkedShops.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Add this food item's shop to the event before adding the food item."
      });
    }

    const [existing] = await db.execute(
      `SELECT event_id
       FROM event_food_items
       WHERE event_id = ? AND food_item_id = ?
       LIMIT 1`,
      [Number(id), Number(food_item_id)]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "This food item is already linked to the event."
      });
    }

    await db.execute(
      `INSERT INTO event_food_items (event_id, shop_id, food_item_id)
       VALUES (?, ?, ?)`,
      [Number(id), shopId, Number(food_item_id)]
    );

    return res.status(201).json({
      success: true,
      message: "Food item added to event successfully."
    });
  } catch (error) {
    console.error("Add food item to event error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add food item to event."
    });
  }
}

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  addShopToEvent,
  addFoodItemToEvent
};
