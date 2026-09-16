const express = require("express");

const User = require("../models/User");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

// =========================================
// GET PROFILE
// =========================================

router.get("/profile", protect, (req, res) => {
  res.json({
    success: true,
    message: "Protected profile route accessed successfully.",
    user: req.user,
  });
});

// =========================================
// ADMIN - GET ORGANIZATIONS BY ROLE
// =========================================

router.get(
  "/organizations",
  protect,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { role } = req.query;

      const allowedRoles = [
        "college",
        "industry",
        "municipality",
        "gramPanchayat",
        "government",
      ];

      if (!role) {
        return res.status(400).json({
          success: false,
          message: "Role is required.",
        });
      }

      if (!allowedRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Invalid organization role.",
        });
      }

      const users = await User.find({
        role,
        isActive: true,
      }).select(
        "name email mobile district villageCity role"
      );

      res.status(200).json({
        success: true,
        count: users.length,
        users,
      });
    } catch (error) {
      console.error(
        "Get organizations error:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Failed to fetch organizations.",
        error: error.message,
      });
    }
  }
);

module.exports = router;