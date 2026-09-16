const express = require("express");

const {
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
} = require("../controllers/problemController");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================================
// CITIZEN
// =====================================================

router.post(
  "/",
  protect,
  authorizeRoles("citizen"),
  createProblem
);

router.get(
  "/my",
  protect,
  authorizeRoles("citizen"),
  getMyProblems
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("citizen"),
  deleteProblem
);

// =====================================================
// ADMIN
// =====================================================

router.get(
  "/",
  protect,
  authorizeRoles("admin"),
  getAllProblems
);

router.put(
  "/:id/assign",
  protect,
  authorizeRoles("admin"),
  assignProblem
);

// =====================================================
// COLLEGE
// =====================================================

router.get(
  "/college-assigned",
  protect,
  authorizeRoles("college"),
  getCollegeAssignedProblems
);

router.put(
  "/:id/accept",
  protect,
  authorizeRoles("college"),
  acceptCollegeProblem
);

router.put(
  "/:id/reject",
  protect,
  authorizeRoles("college"),
  rejectCollegeProblem
);

// =====================================================
// MUNICIPALITY
// =====================================================

router.get(
  "/municipality-assigned",
  protect,
  authorizeRoles("municipality"),
  getMunicipalityAssignedProblems
);

router.put(
  "/:id/municipality-accept",
  protect,
  authorizeRoles("municipality"),
  acceptMunicipalityProblem
);

router.put(
  "/:id/municipality-reject",
  protect,
  authorizeRoles("municipality"),
  rejectMunicipalityProblem
);

// =====================================================
// UPDATE PROBLEM PROGRESS
// COLLEGE / MUNICIPALITY
// =====================================================

router.put(
  "/:id/progress",
  protect,
  authorizeRoles("college", "municipality"),
  updateProblemProgress
);

// =====================================================
// SINGLE PROBLEM
// =====================================================

router.get(
  "/:id",
  protect,
  getProblemById
);

module.exports = router;