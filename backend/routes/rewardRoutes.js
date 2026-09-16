const express = require("express");

const {
  getMyRewards,
} = require("../controllers/rewardController");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Get logged-in citizen's rewards
router.get(
  "/my",
  protect,
  authorizeRoles("citizen"),
  getMyRewards
);

module.exports = router;