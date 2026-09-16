const User = require("../models/User");
const Reward = require("../models/Reward");

// Reward points
const SUBMISSION_POINTS = 10;
const RESOLUTION_POINTS = 50;

// Calculate reward level
const getRewardLevel = (points) => {
  if (points >= 300) return "Community Champion";
  if (points >= 150) return "Community Helper";
  if (points >= 50) return "Contributor";
  return "Beginner";
};

// Get logged-in user's reward information
const getMyRewards = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "name rewardPoints problemsSubmitted problemsResolved rewardLevel"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const rewards = await Reward.find({
      user: req.user.userId,
    })
      .populate("problem", "title status")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      reward: {
        points: user.rewardPoints,
        problemsSubmitted: user.problemsSubmitted,
        problemsResolved: user.problemsResolved,
        level: user.rewardLevel,
      },
      rewards,
    });
  } catch (error) {
    console.error("Get rewards error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch rewards.",
      error: error.message,
    });
  }
};

// Add reward for submitting a problem
const addSubmissionReward = async (userId, problemId) => {
  try {
    // Prevent duplicate submission reward
    const alreadyRewarded = await Reward.findOne({
      user: userId,
      problem: problemId,
      type: "problem_submitted",
    });

    if (alreadyRewarded) {
      return alreadyRewarded;
    }

    const reward = await Reward.create({
      user: userId,
      problem: problemId,
      type: "problem_submitted",
      points: SUBMISSION_POINTS,
      title: "Problem Submitted",
      description: `You earned ${SUBMISSION_POINTS} points for submitting a community problem.`,
    });

    const user = await User.findById(userId);

    if (user) {
      user.rewardPoints += SUBMISSION_POINTS;
      user.problemsSubmitted += 1;
      user.rewardLevel = getRewardLevel(user.rewardPoints);

      await user.save();
    }

    return reward;
  } catch (error) {
    console.error("Submission reward error:", error);
    return null;
  }
};

// Add reward when problem is successfully resolved
const addResolutionReward = async (userId, problemId) => {
  try {
    // Prevent duplicate resolution reward
    const alreadyRewarded = await Reward.findOne({
      user: userId,
      problem: problemId,
      type: "problem_resolved",
    });

    if (alreadyRewarded) {
      return alreadyRewarded;
    }

    const reward = await Reward.create({
      user: userId,
      problem: problemId,
      type: "problem_resolved",
      points: RESOLUTION_POINTS,
      title: "Problem Resolved",
      description: `You earned ${RESOLUTION_POINTS} points because your reported problem was successfully resolved.`,
    });

    const user = await User.findById(userId);

    if (user) {
      user.rewardPoints += RESOLUTION_POINTS;
      user.problemsResolved += 1;
      user.rewardLevel = getRewardLevel(user.rewardPoints);

      await user.save();
    }

    return reward;
  } catch (error) {
    console.error("Resolution reward error:", error);
    return null;
  }
};

module.exports = {
  getMyRewards,
  addSubmissionReward,
  addResolutionReward,
  getRewardLevel,
  SUBMISSION_POINTS,
  RESOLUTION_POINTS,
};