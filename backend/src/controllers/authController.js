
const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");


// REGISTER
async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required."
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanName.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Name cannot exceed 100 characters."
      });
    }

    if (
      cleanEmail.length > 150 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address."
      });
    }

    if (password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
      return res.status(400).json({
        success: false,
        message: "Password must be 8 or more characters and no more than 72 bytes."
      });
    }

    const [existingUsers] = await pool.execute(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [cleanEmail]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists."
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const [result] = await pool.execute(
      `INSERT INTO users
       (name, email, password_hash, role, status)
       VALUES (?, ?, ?, 'student', 'active')`,
      [cleanName, cleanEmail, passwordHash]
    );

    return res.status(201).json({
      success: true,
      message: "Registration successful.",
      user: {
        id: result.insertId,
        name: cleanName,
        email: cleanEmail,
        role: "student",
        status: "active"
      }
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists."
      });
    }

    console.error("Registration error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Registration failed due to a server error."
    });
  }
}

// LOGIN
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required."
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const [users] = await pool.execute(
      `SELECT id, name, email, password_hash, role, status, avatar_url
       FROM users
       WHERE email = ?
       LIMIT 1`,
      [cleanEmail]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    const user = users[0];

    const passwordMatches = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "This account is not active. Please contact support."
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured.");
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        avatar_url: user.avatar_url
      }
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Login failed due to a server error."
    });
  }
}

module.exports = { register, login };

const logoutUser = async (req, res, next) => {
  try {
    const token = req.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is required."
      });
    }

    // Decode token expiry
    const decoded = jwt.decode(token);

    if (!decoded || !decoded.exp) {
      return res.status(401).json({
        success: false,
        message: "Invalid token."
      });
    }

    // Create SHA-256 hash
    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Convert expiry to MySQL datetime
    const expiresAt = new Date(decoded.exp * 1000)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    // Save token hash in database
    await pool.execute(
  `INSERT IGNORE INTO token_blacklist (token_hash, expires_at)
   VALUES (?, ?)`,
  [tokenHash, expiresAt]
);
    return res.status(200).json({
      success: true,
      message: "Logout successful."
    });

  } catch (error) {
    next(error);
  }
};

module.exports.logoutUser = logoutUser;

