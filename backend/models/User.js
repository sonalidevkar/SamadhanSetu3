const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    mobile: {
      type: String,
      trim: true,
    },

    address: {
      type: String,
      trim: true,
    },

    district: {
      type: String,
      trim: true,
    },

    villageCity: {
      type: String,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: [
        "citizen",
        "admin",
        "college",
        "industry",
        "municipality",
        "gramPanchayat",
        "government",
      ],
      default: "citizen",
    },

    profilePhoto: {
      type: String,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // =========================
    // REWARD SYSTEM
    // =========================

    rewardPoints: {
      type: Number,
      default: 0,
      min: 0,
    },

    problemsSubmitted: {
      type: Number,
      default: 0,
      min: 0,
    },

    problemsResolved: {
      type: Number,
      default: 0,
      min: 0,
    },

    rewardLevel: {
      type: String,
      enum: [
        "Beginner",
        "Contributor",
        "Community Helper",
        "Community Champion",
      ],
      default: "Beginner",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);