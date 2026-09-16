const express = require("express");

const {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
} = require("../controllers/notificationController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Get logged-in user's notifications
router.get("/", protect, getMyNotifications);

// Mark one notification as read
router.put("/:id/read", protect, markNotificationAsRead);

// Mark all notifications as read
router.put("/read-all", protect, markAllNotificationsAsRead);

// Delete one notification
router.delete("/:id", protect, deleteNotification);

// Clear all notifications
router.delete("/", protect, clearAllNotifications);

module.exports = router;