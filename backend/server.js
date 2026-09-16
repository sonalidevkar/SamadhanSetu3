const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

// Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const problemRoutes = require("./routes/problemRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const rewardRoutes = require("./routes/rewardRoutes");

dotenv.config();

const app = express();

// =========================
// MIDDLEWARE
// =========================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Uploaded files
app.use("/uploads", express.static("uploads"));

// =========================
// BASIC ROUTES
// =========================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "SamadhanSetu Backend is running successfully 🚀",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is healthy",
    database:
      mongoose.connection.readyState === 1
        ? "Connected"
        : "Disconnected",
  });
});

// =========================
// API ROUTES
// =========================

// Authentication
app.use("/api/auth", authRoutes);

// Users
app.use("/api/users", userRoutes);

// Problems
app.use("/api/problems", problemRoutes);

// Notifications
app.use("/api/notifications", notificationRoutes);

// Rewards
app.use("/api/rewards", rewardRoutes);

// =========================
// PORT
// =========================

const PORT = process.env.PORT || 5000;

// =========================
// MONGODB CONNECTION
// =========================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error(
      "MongoDB connection failed:",
      error.message
    );

    process.exit(1);
  });