
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const crypto = require("crypto");

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    // 1. Check if token was provided
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in."
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is missing."
      });
    }

    // 2. Check JWT secret
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured.");

      return res.status(500).json({
        success: false,
        message: "Server configuration error."
      });
    }

    // 3. Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    
const tokenHash = crypto
  .createHash("sha256")
  .update(token)
  .digest("hex");

const [blacklistedTokens] = await pool.execute(
  `SELECT id
   FROM token_blacklist
   WHERE token_hash = ?
   LIMIT 1`,
  [tokenHash]
);

if (blacklistedTokens.length > 0) {
  return res.status(401).json({
    success: false,
    message: "You have logged out. Please log in again."
  });
}
if (blacklistedTokens.length > 0) {
  return res.status(401).json({
    success: false,
    message: "You have logged out. Please log in again."
  });
}
req.token = token;


    // 4. Get current user from database
    const [users] = await pool.execute(
      `SELECT id, role, status
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [decoded.id]
    );

    // 5. Check if user exists
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "User account not found. Please log in again."
      });
    }

    const user = users[0];

    // 6. Check current account status
    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your account is not active."
      });
    }

    // 7. Attach current database information
    req.user = {
      id: user.id,
      role: user.role,
      status: user.status
    };

    // 8. Continue to next middleware
    next();

  } catch (error) {
    // Invalid or expired JWT
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError" ||
      error.name === "NotBeforeError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token. Please log in again."
      });
    }

    console.error("Authentication error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Authentication failed due to a server error."
    });
  }
}

module.exports = authMiddleware;
