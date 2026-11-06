require("dotenv").config();

const pool = require("./src/config/db");

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await pool.query("SELECT 1");

    console.log("MySQL connected successfully!");

    const app = require("./src/app");

    app.listen(PORT, () => {
      console.log(`CampusBite backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
}

startServer();