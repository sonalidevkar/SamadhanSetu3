const mongoose = require("mongoose");

const problemSchema = new mongoose.Schema(
  {
    // =====================================================
    // CITIZEN
    // =====================================================

    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // =====================================================
    // BASIC PROBLEM DETAILS
    // =====================================================

    title: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "Education",
        "Health",
        "Agriculture",
        "Water",
        "Sanitation",
        "Environment",
        "Employment",
        "Transport",
        "Government Services",
        "Other",
      ],
    },

    subCategory: {
      type: String,
      default: "",
      trim: true,
    },

    problemType: {
      type: String,
      default: "",
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    severity: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },

    peopleAffected: {
      type: Number,
      default: 0,
      min: 0,
    },

    duration: {
      type: String,
      default: "",
    },

    expectedSolution: {
      type: String,
      default: "",
      trim: true,
    },

    additionalDetails: {
      type: String,
      default: "",
      trim: true,
    },

    // =====================================================
    // LOCATION
    // =====================================================

    location: {
      latitude: {
        type: Number,
        default: null,
      },

      longitude: {
        type: Number,
        default: null,
      },

      address: {
        type: String,
        default: "",
      },

      district: {
        type: String,
        default: "",
      },

      villageCity: {
        type: String,
        default: "",
      },
    },

    // =====================================================
    // MEDIA / EVIDENCE
    // =====================================================

    media: {
      photos: [
        {
          type: String,
        },
      ],

      videos: [
        {
          type: String,
        },
      ],

      documents: [
        {
          type: String,
        },
      ],
    },

    // =====================================================
    // MAIN PROBLEM STATUS
    // =====================================================

    status: {
      type: String,

      enum: [
        "Submitted",
        "Verified",
        "AI Analysis",
        "Assigned",
        "Accepted",

        // Added for progress tracking
        "In Progress",

        "Rejected",
        "Team/Planning",
        "Prototype/Testing",
        "Approved",
        "Implemented",
        "Resolved",
      ],

      default: "Submitted",
    },

    // =====================================================
    // AI ANALYSIS
    // =====================================================

    aiStatus: {
      type: String,

      enum: [
        "Pending AI Analysis",
        "Processing",
        "Completed",
        "Failed",
      ],

      default: "Pending AI Analysis",
    },

    aiAnalysis: {
      category: {
        type: String,
        default: "",
      },

      severity: {
        type: String,
        default: "",
      },

      priorityScore: {
        type: Number,
        default: 0,
      },

      problemType: {
        type: String,
        default: "",
      },

      suggestedSolutionDomain: {
        type: String,
        default: "",
      },

      suggestedStakeholder: {
        type: String,
        default: "",
      },

      duplicateDetected: {
        type: Boolean,
        default: false,
      },

      duplicateProblemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Problem",
        default: null,
      },
    },

    // =====================================================
    // ASSIGNMENT
    // =====================================================

    assignmentStatus: {
      type: String,

      enum: [
        "Pending",
        "Assigned",
        "Accepted",
        "Rejected",
        "In Progress",
        "Completed",
      ],

      default: "Pending",
    },

    assignedTo: {
      organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },

      type: {
        type: String,

        enum: [
          "college",
          "industry",
          "municipality",
          "gramPanchayat",
          "government",
          "",
        ],

        default: "",
      },
    },

    // =====================================================
    // PROGRESS TRACKING
    // =====================================================

    progress: {
      percentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },

      currentStage: {
        type: String,
        default: "Problem Submitted",
      },

      updates: [
        {
          stage: {
            type: String,
            default: "",
          },

          message: {
            type: String,
            default: "",
          },

          updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
          },

          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Problem", problemSchema);