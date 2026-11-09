
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174"
    ],
    credentials: true
  })
);

// Body parser
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "CampusBite backend is running"
  });
});

// Authentication routes
app.use("/api/auth", authRoutes);

// User routes
app.use("/api/users", userRoutes);

// Admin routes
app.use("/api/admin", adminRoutes);

module.exports = app;
