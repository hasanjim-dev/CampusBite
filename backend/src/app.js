
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const userRoutes = require("./routes/userRoutes");

const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(helmet());

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173"
}));

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
app.use("/api/users", userRoutes);

module.exports = app;
