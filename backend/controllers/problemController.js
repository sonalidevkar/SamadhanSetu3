const Problem = require("../models/Problem");
const Notification = require("../models/Notification");
const User = require("../models/User");

const {
  addSubmissionReward,
  addResolutionReward,
} = require("../controllers/rewardController");

// =====================================================
// CREATE PROBLEM + AUTOMATIC AI ANALYSIS + REWARD
// =====================================================

const createProblem = async (req, res) => {
  try {
    const {
      title,
      category,
      subCategory,
      problemType,
      description,
      severity,
      peopleAffected,
      duration,
      expectedSolution,
      additionalDetails,
      location,
    } = req.body;

    // -------------------------------------------------
    // VALIDATION
    // -------------------------------------------------

    if (!title || !category || !description) {
      return res.status(400).json({
        success: false,
        message: "Title, category and description are required.",
      });
    }

    // -------------------------------------------------
    // PARSE LOCATION
    // -------------------------------------------------

    let parsedLocation = {};

    if (location) {
      try {
        parsedLocation =
          typeof location === "string"
            ? JSON.parse(location)
            : location;
      } catch (error) {
        parsedLocation = {
          address: location,
        };
      }
    }

    // -------------------------------------------------
    // CREATE PROBLEM
    // -------------------------------------------------

    const problem = await Problem.create({
      citizen: req.user.userId,

      title,
      category,
      subCategory,
      problemType,
      description,
      severity,
      peopleAffected,
      duration,
      expectedSolution,
      additionalDetails,

      location: parsedLocation,

      status: "Submitted",
      aiStatus: "Pending AI Analysis",
      assignmentStatus: "Pending",

      aiAnalysis: {
        category: "",
        severity: "",
        priorityScore: 0,
        problemType: "",
        suggestedSolutionDomain: "",
        suggestedStakeholder: "",
        duplicateDetected: false,
        duplicateProblemId: null,
      },
    });

    console.log(
      `Problem created successfully: ${problem._id}`
    );

    // =================================================
    // REWARD - PROBLEM SUBMITTED
    // =================================================

    try {
      await addSubmissionReward(
        problem.citizen,
        problem._id
      );

      console.log(
        `Submission reward added successfully: ${problem._id}`
      );
    } catch (rewardError) {
      console.error(
        "Submission reward error:",
        rewardError.message
      );
    }

    // =================================================
    // NOTIFICATION 1 - PROBLEM SUBMITTED
    // =================================================

    try {
      await Notification.create({
        user: problem.citizen,

        type: "problem",

        title: "Problem Submitted Successfully",

        message:
          `Your problem "${problem.title}" has been submitted successfully. You earned 10 reward points. The problem-solving process will now begin.`,

        relatedProblem: problem._id,

        isRead: false,
      });

      console.log(
        `Problem submission notification created: ${problem._id}`
      );
    } catch (notificationError) {
      console.error(
        "Problem submission notification error:",
        notificationError.message
      );
    }

    // =================================================
    // AUTOMATIC AI ANALYSIS
    // =================================================

    try {
      console.log(
        `Starting AI analysis for problem: ${problem._id}`
      );

      problem.aiStatus = "Processing";
      problem.status = "AI Analysis";

      await problem.save();

      // =================================================
      // NOTIFICATION 2 - AI ANALYSIS STARTED
      // =================================================

      try {
        await Notification.create({
          user: problem.citizen,

          type: "ai",

          title: "AI Analysis Started",

          message:
            `AI analysis has started for your problem "${problem.title}". The system is analysing the problem and identifying the appropriate solution path.`,

          relatedProblem: problem._id,

          isRead: false,
        });

        console.log(
          `AI start notification created: ${problem._id}`
        );
      } catch (notificationError) {
        console.error(
          "AI start notification error:",
          notificationError.message
        );
      }

      // -------------------------------------------------
      // CALL FASTAPI AI ENGINE
      // -------------------------------------------------

      const aiResponse = await fetch(
        "http://127.0.0.1:8000/analyze",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            title: problem.title,

            description: problem.description,

            category: problem.category,

            severity: problem.severity,

            peopleAffected:
              Number(problem.peopleAffected) || 0,

            district:
              problem.location?.district || "",

            villageCity:
              problem.location?.villageCity || "",
          }),
        }
      );

      if (!aiResponse.ok) {
        throw new Error(
          `AI Engine returned status ${aiResponse.status}`
        );
      }

      const aiData = await aiResponse.json();

      console.log("AI Response:", aiData);

      // -------------------------------------------------
      // SAVE AI RESULT
      // -------------------------------------------------

      if (
        aiData &&
        aiData.success &&
        aiData.analysis
      ) {
        const analysis = aiData.analysis;

        problem.aiAnalysis = {
          category:
            analysis.category ||
            problem.category ||
            "",

          severity:
            analysis.severity ||
            problem.severity ||
            "",

          priorityScore:
            Number(
              analysis.priorityScore
            ) || 0,

          problemType:
            analysis.problemType ||
            problemType ||
            "",

          suggestedSolutionDomain:
            analysis.suggestedSolutionDomain ||
            "",

          suggestedStakeholder:
            analysis.suggestedStakeholder ||
            "",

          duplicateDetected:
            Boolean(
              analysis.duplicateDetected
            ),

          duplicateProblemId:
            analysis.duplicateProblemId ||
            null,
        };

        problem.aiStatus = "Completed";

        // Admin will review and assign
        problem.status = "AI Analysis";

        await problem.save();

        console.log(
          `AI analysis completed successfully: ${problem._id}`
        );

        // =================================================
        // NOTIFICATION 3 - AI ANALYSIS COMPLETED
        // =================================================

        try {
          await Notification.create({
            user: problem.citizen,

            type: "ai",

            title: "AI Analysis Completed",

            message:
              `AI analysis for your problem "${problem.title}" has been completed. The problem is now ready for review and assignment.`,

            relatedProblem: problem._id,

            isRead: false,
          });

          console.log(
            `AI completion notification created: ${problem._id}`
          );
        } catch (notificationError) {
          console.error(
            "AI completion notification error:",
            notificationError.message
          );
        }
      } else {
        throw new Error(
          "Invalid response received from AI Engine."
        );
      }
    } catch (aiError) {
      console.error(
        "AI analysis failed:",
        aiError.message
      );

      problem.aiStatus = "Failed";

      // Problem should still reach Admin
      problem.status = "Submitted";

      await problem.save();

      // =================================================
      // NOTIFICATION - AI ANALYSIS FAILED
      // =================================================

      try {
        await Notification.create({
          user: problem.citizen,

          type: "ai",

          title: "AI Analysis Delayed",

          message:
            `AI analysis for your problem "${problem.title}" could not be completed right now. Your problem has still been submitted and will continue to the Admin review process.`,

          relatedProblem: problem._id,

          isRead: false,
        });
      } catch (notificationError) {
        console.error(
          "AI failure notification error:",
          notificationError.message
        );
      }
    }

    // -------------------------------------------------
    // RETURN FINAL PROBLEM
    // -------------------------------------------------

    const finalProblem =
      await Problem.findById(problem._id)

        .populate(
          "citizen",
          "name email mobile district villageCity"
        )

        .populate(
          "assignedTo.organization",
          "name email mobile role district villageCity"
        );

    return res.status(201).json({
      success: true,

      message:
        problem.aiStatus === "Completed"
          ? "Problem submitted and analysed successfully."
          : "Problem submitted successfully. AI analysis is currently unavailable.",

      problem: finalProblem,
    });
  } catch (error) {
    console.error(
      "Create problem error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to submit problem.",

      error:
        error.message,
    });
  }
};


// =====================================================
// GET ALL PROBLEMS - ADMIN
// =====================================================

const getAllProblems = async (req, res) => {
  try {
    const problems = await Problem.find()

      .populate(
        "citizen",
        "name email mobile district villageCity"
      )

      .populate(
        "assignedTo.organization",
        "name email mobile district villageCity role"
      )

      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,

      count:
        problems.length,

      problems,
    });
  } catch (error) {
    console.error(
      "Get all problems error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to fetch problems.",

      error:
        error.message,
    });
  }
};


// =====================================================
// GET MY PROBLEMS - CITIZEN
// =====================================================

const getMyProblems = async (req, res) => {
  try {
    const problems =
      await Problem.find({
        citizen:
          req.user.userId,
      })

        .populate(
          "assignedTo.organization",
          "name email mobile district villageCity role"
        )

        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,

      count:
        problems.length,

      problems,
    });
  } catch (error) {
    console.error(
      "Get my problems error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to fetch your problems.",

      error:
        error.message,
    });
  }
};


// =====================================================
// GET COLLEGE ASSIGNED PROBLEMS
// =====================================================

const getCollegeAssignedProblems = async (
  req,
  res
) => {
  try {
    const problems =
      await Problem.find({
        "assignedTo.organization":
          req.user.userId,

        "assignedTo.type":
          "college",
      })

        .populate(
          "citizen",
          "name email mobile district villageCity"
        )

        .populate(
          "assignedTo.organization",
          "name email mobile district villageCity role"
        )

        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,

      count:
        problems.length,

      problems,
    });
  } catch (error) {
    console.error(
      "Get college assigned problems error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to fetch college assigned problems.",

      error:
        error.message,
    });
  }
};


// =====================================================
// GET MUNICIPALITY ASSIGNED PROBLEMS
// =====================================================

const getMunicipalityAssignedProblems = async (
  req,
  res
) => {
  try {
    const problems =
      await Problem.find({
        "assignedTo.organization":
          req.user.userId,

        "assignedTo.type":
          "municipality",
      })

        .populate(
          "citizen",
          "name email mobile district villageCity"
        )

        .populate(
          "assignedTo.organization",
          "name email mobile district villageCity role"
        )

        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,

      count:
        problems.length,

      problems,
    });
  } catch (error) {
    console.error(
      "Get municipality assigned problems error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to fetch municipality assigned problems.",

      error:
        error.message,
    });
  }
};


// =====================================================
// GET SINGLE PROBLEM
// =====================================================

const getProblemById = async (
  req,
  res
) => {
  try {
    const {
      id,
    } = req.params;

    const problem =
      await Problem.findById(id)

        .populate(
          "citizen",
          "name email mobile address district villageCity"
        )

        .populate(
          "assignedTo.organization",
          "name email mobile address district villageCity role"
        )

        .populate(
          "progress.updates.updatedBy",
          "name email role"
        );

    if (!problem) {
      return res.status(404).json({
        success: false,

        message:
          "Problem not found.",
      });
    }

    return res.status(200).json({
      success: true,

      problem,
    });
  } catch (error) {
    console.error(
      "Get problem by ID error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to fetch problem.",

      error:
        error.message,
    });
  }
};


// =====================================================
// DELETE PROBLEM - CITIZEN
// =====================================================

const deleteProblem = async (
  req,
  res
) => {
  try {
    const {
      id,
    } = req.params;

    const problem =
      await Problem.findById(id);

    if (!problem) {
      return res.status(404).json({
        success: false,

        message:
          "Problem not found.",
      });
    }

    // Citizen can delete only own problem
    if (
      problem.citizen.toString() !==
      req.user.userId
    ) {
      return res.status(403).json({
        success: false,

        message:
          "You are not authorized to delete this problem.",
      });
    }

    await Problem.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,

      message:
        "Problem deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete problem error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to delete problem.",

      error:
        error.message,
    });
  }
};


// =====================================================
// ASSIGN PROBLEM - ADMIN
// =====================================================

const assignProblem = async (
  req,
  res
) => {
  try {
    const {
      id,
    } = req.params;

    const {
      organizationId,
      type,
    } = req.body;

    if (
      !organizationId ||
      !type
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Organization ID and organization type are required.",
      });
    }

    const allowedTypes = [
      "college",
      "industry",
      "municipality",
      "gramPanchayat",
      "government",
    ];

    if (
      !allowedTypes.includes(type)
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Invalid organization type.",
      });
    }

    const organization =
      await User.findById(
        organizationId
      );

    if (!organization) {
      return res.status(404).json({
        success: false,

        message:
          "Selected organization not found.",
      });
    }

    if (
      organization.role !==
      type
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Selected organization role does not match assignment type.",
      });
    }

    const problem =
      await Problem.findById(id);

    if (!problem) {
      return res.status(404).json({
        success: false,

        message:
          "Problem not found.",
      });
    }

    // -------------------------------------------------
    // ASSIGN
    // -------------------------------------------------

    problem.assignedTo = {
      organization:
        organizationId,

      type,
    };

    problem.assignmentStatus =
      "Assigned";

    problem.status =
      "Assigned";

    problem.progress.currentStage =
      "Problem Assigned";

    await problem.save();

    // =================================================
    // NOTIFY ORGANIZATION
    // =================================================

    try {
      await Notification.create({
        user:
          organizationId,

        type:
          "assignment",

        title:
          "New Problem Assigned",

        message:
          `A new problem "${problem.title}" has been assigned to your organization.`,

        relatedProblem:
          problem._id,

        isRead:
          false,
      });

      console.log(
        `Assignment notification sent to ${organizationId}`
      );
    } catch (notificationError) {
      console.error(
        "Assignment organization notification error:",
        notificationError.message
      );
    }

    // =================================================
    // NOTIFY CITIZEN - ASSIGNMENT
    // =================================================

    try {
      const organizationName =
        organization.name ||
        type;

      await Notification.create({
        user:
          problem.citizen,

        type:
          "assignment",

        title:
          "Problem Assigned for Resolution",

        message:
          `Your problem "${problem.title}" has been assigned to ${organizationName}. The problem-solving process will now move forward.`,

        relatedProblem:
          problem._id,

        isRead:
          false,
      });

      console.log(
        `Assignment notification sent to citizen ${problem.citizen}`
      );
    } catch (notificationError) {
      console.error(
        "Assignment citizen notification error:",
        notificationError.message
      );
    }

    // -------------------------------------------------
    // RETURN UPDATED PROBLEM
    // -------------------------------------------------

    const updatedProblem =
      await Problem.findById(
        problem._id
      )

        .populate(
          "citizen",
          "name email mobile district villageCity"
        )

        .populate(
          "assignedTo.organization",
          "name email mobile district villageCity role"
        );

    return res.status(200).json({
      success: true,

      message:
        "Problem assigned successfully.",

      problem:
        updatedProblem,
    });
  } catch (error) {
    console.error(
      "Assign problem error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to assign problem.",

      error:
        error.message,
    });
  }
};


// =====================================================
// ACCEPT COLLEGE PROBLEM
// =====================================================

const acceptCollegeProblem = async (
  req,
  res
) => {
  try {
    const {
      id,
    } = req.params;

    const problem =
      await Problem.findById(id);

    if (!problem) {
      return res.status(404).json({
        success: false,

        message:
          "Problem not found.",
      });
    }

    if (
      !problem.assignedTo?.organization ||
      problem.assignedTo.organization.toString() !==
        req.user.userId
    ) {
      return res.status(403).json({
        success: false,

        message:
          "This problem is not assigned to your college.",
      });
    }

    if (
      problem.assignedTo.type !==
      "college"
    ) {
      return res.status(403).json({
        success: false,

        message:
          "This problem is not assigned to a college.",
      });
    }

    problem.assignmentStatus =
      "Accepted";

    problem.status =
      "Accepted";

    problem.progress.currentStage =
      "Problem Assigned";

    problem.progress.percentage =
      0;

    await problem.save();

    // =================================================
    // NOTIFY CITIZEN
    // =================================================

    try {
      await Notification.create({
        user:
          problem.citizen,

        type:
          "accepted",

        title:
          "Problem Accepted by College",

        message:
          `Your problem "${problem.title}" has been accepted by the assigned college. The problem-solving process has started.`,

        relatedProblem:
          problem._id,

        isRead:
          false,
      });
    } catch (notificationError) {
      console.error(
        "College accept notification error:",
        notificationError.message
      );
    }

    return res.status(200).json({
      success: true,

      message:
        "Problem accepted successfully.",

      problem,
    });
  } catch (error) {
    console.error(
      "Accept college problem error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to accept problem.",

      error:
        error.message,
    });
  }
};


// =====================================================
// REJECT COLLEGE PROBLEM
// =====================================================

const rejectCollegeProblem = async (
  req,
  res
) => {
  try {
    const {
      id,
    } = req.params;

    const problem =
      await Problem.findById(id);

    if (!problem) {
      return res.status(404).json({
        success: false,

        message:
          "Problem not found.",
      });
    }

    if (
      !problem.assignedTo?.organization ||
      problem.assignedTo.organization.toString() !==
        req.user.userId
    ) {
      return res.status(403).json({
        success: false,

        message:
          "This problem is not assigned to your college.",
      });
    }

    if (
      problem.assignedTo.type !==
      "college"
    ) {
      return res.status(403).json({
        success: false,

        message:
          "This problem is not assigned to a college.",
      });
    }

    problem.assignmentStatus =
      "Rejected";

    problem.status =
      "Rejected";

    await problem.save();

    // =================================================
    // NOTIFY CITIZEN
    // =================================================

    try {
      await Notification.create({
        user:
          problem.citizen,

        type:
          "rejected",

        title:
          "Problem Rejected by College",

        message:
          `Your problem "${problem.title}" was rejected by the assigned college.`,

        relatedProblem:
          problem._id,

        isRead:
          false,
      });
    } catch (notificationError) {
      console.error(
        "College reject notification error:",
        notificationError.message
      );
    }

    return res.status(200).json({
      success: true,

      message:
        "Problem rejected successfully.",

      problem,
    });
  } catch (error) {
    console.error(
      "Reject college problem error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to reject problem.",

      error:
        error.message,
    });
  }
};


// =====================================================
// ACCEPT MUNICIPALITY PROBLEM
// =====================================================

const acceptMunicipalityProblem = async (
  req,
  res
) => {
  try {
    const {
      id,
    } = req.params;

    const problem =
      await Problem.findById(id);

    if (!problem) {
      return res.status(404).json({
        success: false,

        message:
          "Problem not found.",
      });
    }

    if (
      !problem.assignedTo?.organization ||
      problem.assignedTo.organization.toString() !==
        req.user.userId
    ) {
      return res.status(403).json({
        success: false,

        message:
          "This problem is not assigned to your municipality.",
      });
    }

    if (
      problem.assignedTo.type !==
      "municipality"
    ) {
      return res.status(403).json({
        success: false,

        message:
          "This problem is not assigned to a municipality.",
      });
    }

    problem.assignmentStatus =
      "Accepted";

    problem.status =
      "Accepted";

    problem.progress.currentStage =
      "Problem Assigned";

    problem.progress.percentage =
      0;

    await problem.save();

    // =================================================
    // NOTIFY CITIZEN
    // =================================================

    try {
      await Notification.create({
        user:
          problem.citizen,

        type:
          "accepted",

        title:
          "Problem Accepted by Municipality",

        message:
          `Your problem "${problem.title}" has been accepted by the municipality. The problem-solving process has started.`,

        relatedProblem:
          problem._id,

        isRead:
          false,
      });
    } catch (notificationError) {
      console.error(
        "Municipality accept notification error:",
        notificationError.message
      );
    }

    return res.status(200).json({
      success: true,

      message:
        "Problem accepted successfully.",

      problem,
    });
  } catch (error) {
    console.error(
      "Accept municipality problem error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to accept problem.",

      error:
        error.message,
    });
  }
};


// =====================================================
// REJECT MUNICIPALITY PROBLEM
// =====================================================

const rejectMunicipalityProblem = async (
  req,
  res
) => {
  try {
    const {
      id,
    } = req.params;

    const problem =
      await Problem.findById(id);

    if (!problem) {
      return res.status(404).json({
        success: false,

        message:
          "Problem not found.",
      });
    }

    if (
      !problem.assignedTo?.organization ||
      problem.assignedTo.organization.toString() !==
        req.user.userId
    ) {
      return res.status(403).json({
        success: false,

        message:
          "This problem is not assigned to your municipality.",
      });
    }

    if (
      problem.assignedTo.type !==
      "municipality"
    ) {
      return res.status(403).json({
        success: false,

        message:
          "This problem is not assigned to a municipality.",
      });
    }

    problem.assignmentStatus =
      "Rejected";

    problem.status =
      "Rejected";

    await problem.save();

    // =================================================
    // NOTIFY CITIZEN
    // =================================================

    try {
      await Notification.create({
        user:
          problem.citizen,

        type:
          "rejected",

        title:
          "Problem Rejected by Municipality",

        message:
          `Your problem "${problem.title}" was rejected by the municipality.`,

        relatedProblem:
          problem._id,

        isRead:
          false,
      });
    } catch (notificationError) {
      console.error(
        "Municipality reject notification error:",
        notificationError.message
      );
    }

    return res.status(200).json({
      success: true,

      message:
        "Problem rejected successfully.",

      problem,
    });
  } catch (error) {
    console.error(
      "Reject municipality problem error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to reject problem.",

      error:
        error.message,
    });
  }
};


// =====================================================
// UPDATE PROBLEM PROGRESS + AUTOMATIC RESOLUTION REWARD
// =====================================================

const updateProblemProgress = async (
  req,
  res
) => {
  try {
    const {
      id,
    } = req.params;

    const {
      stage,
      percentage,
      message,
    } = req.body;

    if (!stage) {
      return res.status(400).json({
        success: false,

        message:
          "Progress stage is required.",
      });
    }

    const problem =
      await Problem.findById(id);

    if (!problem) {
      return res.status(404).json({
        success: false,

        message:
          "Problem not found.",
      });
    }

    // -------------------------------------------------
    // CHECK ASSIGNED ORGANIZATION
    // -------------------------------------------------

    if (
      !problem.assignedTo?.organization ||
      problem.assignedTo.organization.toString() !==
        req.user.userId
    ) {
      return res.status(403).json({
        success: false,

        message:
          "You are not assigned to this problem.",
      });
    }

    // -------------------------------------------------
    // CHECK ROLE
    // -------------------------------------------------

    if (
      problem.assignedTo.type !==
      req.user.role
    ) {
      return res.status(403).json({
        success: false,

        message:
          "Your role does not match the assigned organization.",
      });
    }

    // -------------------------------------------------
    // MUST ACCEPT FIRST
    // -------------------------------------------------

    if (
      problem.assignmentStatus !==
      "Accepted"
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Accept the problem before updating progress.",
      });
    }

    // -------------------------------------------------
    // PERCENTAGE
    // -------------------------------------------------

    let progressPercentage =
      Number(percentage);

    if (
      Number.isNaN(
        progressPercentage
      )
    ) {
      progressPercentage = 0;
    }

    progressPercentage =
      Math.max(
        0,
        Math.min(
          100,
          progressPercentage
        )
      );

    // -------------------------------------------------
    // UPDATE PROGRESS
    // -------------------------------------------------

    problem.progress.percentage =
      progressPercentage;

    problem.progress.currentStage =
      stage;

    problem.progress.updates.push({
      stage,

      message:
        message || "",

      updatedBy:
        req.user.userId,
    });

    // -------------------------------------------------
    // STATUS
    // -------------------------------------------------

    if (
      progressPercentage >=
      100
    ) {
      problem.status =
        "Resolved";

      problem.assignmentStatus =
        "Completed";

      problem.progress.currentStage =
        "Resolved";
    } else if (
      progressPercentage > 0
    ) {
      problem.status =
        "In Progress";

      problem.assignmentStatus =
        "In Progress";
    }

    await problem.save();

    // =================================================
    // AUTOMATIC RESOLUTION REWARD
    // =================================================

    if (
      progressPercentage >= 100
    ) {
      try {
        await addResolutionReward(
          problem.citizen,
          problem._id
        );

        console.log(
          `Resolution reward added successfully: ${problem._id}`
        );
      } catch (rewardError) {
        console.error(
          "Resolution reward error:",
          rewardError.message
        );
      }
    }

    // =================================================
    // NOTIFY CITIZEN - PROGRESS / RESOLUTION
    // =================================================

    try {
      await Notification.create({
        user:
          problem.citizen,

        type:
          progressPercentage >= 100
            ? "accepted"
            : "progress",

        title:
          progressPercentage >= 100
            ? "Problem Resolved"
            : "Problem Solving Progress Updated",

        message:
          progressPercentage >= 100
            ? `Your problem "${problem.title}" has been resolved successfully. You earned 50 reward points.`
            : `The solving process for your problem "${problem.title}" is now ${progressPercentage}% complete. Current stage: ${stage}.`,

        relatedProblem:
          problem._id,

        isRead:
          false,
      });

      console.log(
        `Progress notification created: ${problem._id}`
      );
    } catch (notificationError) {
      console.error(
        "Progress notification error:",
        notificationError.message
      );
    }

    // -------------------------------------------------
    // RETURN UPDATED PROBLEM
    // -------------------------------------------------

    const updatedProblem =
      await Problem.findById(
        problem._id
      )

        .populate(
          "citizen",
          "name email mobile district villageCity"
        )

        .populate(
          "assignedTo.organization",
          "name email mobile district villageCity role"
        );

    return res.status(200).json({
      success: true,

      message:
        progressPercentage >= 100
          ? "Problem resolved successfully. Citizen reward updated."
          : "Problem progress updated successfully.",

      problem:
        updatedProblem,
    });
  } catch (error) {
    console.error(
      "Update problem progress error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to update problem progress.",

      error:
        error.message,
    });
  }
};


// =====================================================
// EXPORT ALL CONTROLLERS
// =====================================================

module.exports = {
  createProblem,

  getAllProblems,

  getMyProblems,

  getCollegeAssignedProblems,

  getMunicipalityAssignedProblems,

  getProblemById,

  deleteProblem,

  assignProblem,

  acceptCollegeProblem,

  rejectCollegeProblem,

  acceptMunicipalityProblem,

  rejectMunicipalityProblem,

  updateProblemProgress,
};