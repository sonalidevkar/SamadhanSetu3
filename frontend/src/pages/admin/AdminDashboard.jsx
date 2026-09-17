import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "https://samadhansetu3.onrender.com/api";

function AdminDashboard() {
  const navigate = useNavigate();

  // ================= ADMIN USER =================

  const [adminUser, setAdminUser] = useState({});

  useEffect(() => {
    try {
      setAdminUser(
        JSON.parse(localStorage.getItem("user") || "{}")
      );
    } catch {
      setAdminUser({});
    }
  }, []);

  const adminName = adminUser.name || "Admin";

  // ================= PROBLEMS =================

  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ================= FILTER =================

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // ================= ASSIGNMENT =================

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState(null);

  const [assignmentType, setAssignmentType] = useState("");
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrganization, setSelectedOrganization] =
    useState("");

  const [organizationLoading, setOrganizationLoading] =
    useState(false);

  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState("");

  // ================= DETAILS MODAL =================

  const [showDetailsModal, setShowDetailsModal] =
    useState(false);

  // ================= LOGOUT =================

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("samadhanSetuUser");

    navigate("/admin-login", { replace: true });
  };

  // ================= FETCH PROBLEMS =================

  const fetchProblems = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/admin-login", { replace: true });
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/problems`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch problems."
        );
      }

      setProblems(
        Array.isArray(data.problems)
          ? data.problems
          : Array.isArray(data.data)
          ? data.data
          : []
      );
    } catch (err) {
      console.error("Admin problems error:", err);

      if (
        err.message?.toLowerCase().includes("token") ||
        err.message?.toLowerCase().includes("login")
      ) {
        navigate("/admin-login", { replace: true });
        return;
      }

      setError(
        err.message || "Unable to load citizen problems."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  // ================= OPEN DETAILS =================

  const openDetailsModal = (problem) => {
    setSelectedProblem(problem);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedProblem(null);
  };

  // ================= OPEN ASSIGN =================

  const openAssignModal = (problem) => {
    setSelectedProblem(problem);
    setAssignmentType("");
    setOrganizations([]);
    setSelectedOrganization("");
    setAssignError("");
    setShowAssignModal(true);
  };

  // ================= CLOSE ASSIGN =================

  const closeAssignModal = () => {
    if (assigning) return;

    setShowAssignModal(false);
    setSelectedProblem(null);
    setAssignmentType("");
    setOrganizations([]);
    setSelectedOrganization("");
    setAssignError("");
  };

  // ================= FETCH ORGANIZATIONS =================

  const fetchOrganizations = async (role) => {
    try {
      setOrganizationLoading(true);
      setAssignError("");
      setOrganizations([]);
      setSelectedOrganization("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/users/organizations?role=${encodeURIComponent(
          role
        )}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch organizations."
        );
      }

      setOrganizations(
        Array.isArray(data.users) ? data.users : []
      );
    } catch (err) {
      console.error(
        "Organization fetch error:",
        err
      );

      setAssignError(
        err.message ||
          "Unable to load organizations."
      );
    } finally {
      setOrganizationLoading(false);
    }
  };

  // ================= ASSIGNMENT TYPE =================

  const handleAssignmentTypeChange = (event) => {
    const role = event.target.value;

    setAssignmentType(role);
    setSelectedOrganization("");
    setOrganizations([]);
    setAssignError("");

    if (role) {
      fetchOrganizations(role);
    }
  };

  // ================= ASSIGN PROBLEM =================

  const handleAssignProblem = async () => {
    if (!selectedProblem) {
      setAssignError("Problem not selected.");
      return;
    }

    if (!assignmentType) {
      setAssignError(
        "Please select an organization type."
      );
      return;
    }

    if (!selectedOrganization) {
      setAssignError(
        "Please select an organization."
      );
      return;
    }

    try {
      setAssigning(true);
      setAssignError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/problems/${selectedProblem._id}/assign`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            organizationId: selectedOrganization,
            type: assignmentType,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to assign problem."
        );
      }

      /*
       * Sometimes backend returns the updated problem.
       * If it doesn't, refresh the complete problem list.
       */
      if (data.problem) {
        setProblems((currentProblems) =>
          currentProblems.map((problem) =>
            problem._id === selectedProblem._id
              ? data.problem
              : problem
          )
        );
      } else {
        await fetchProblems();
      }

      alert(
        "✅ Problem assigned successfully!"
      );

      closeAssignModal();
    } catch (err) {
      console.error(
        "Assign problem error:",
        err
      );

      setAssignError(
        err.message ||
          "Failed to assign problem."
      );
    } finally {
      setAssigning(false);
    }
  };

  // ================= LABELS =================

  const getAssignmentLabel = (type) => {
    const labels = {
      college: "College",
      industry: "Industry",
      municipality: "Municipality",
      gramPanchayat: "Gram Panchayat",
      government: "Government",
    };

    return labels[type] || type || "Organization";
  };

  // ================= STATUS CLASS =================

  const getStatusClass = (status) => {
    const value = String(
      status || "Submitted"
    ).toLowerCase();

    if (
      value.includes("resolved") ||
      value.includes("implemented")
    ) {
      return "status-success";
    }

    if (
      value.includes("progress") ||
      value.includes("accepted")
    ) {
      return "status-progress";
    }

    if (
      value.includes("rejected")
    ) {
      return "status-danger";
    }

    if (
      value.includes("assigned")
    ) {
      return "status-assigned";
    }

    if (
      value.includes("analysis")
    ) {
      return "status-ai";
    }

    return "status-pending";
  };

  // ================= SEVERITY CLASS =================

  const getSeverityClass = (severity) => {
    const value = String(
      severity || "Medium"
    ).toLowerCase();

    if (value === "critical") {
      return "severity-critical";
    }

    if (value === "high") {
      return "severity-high";
    }

    if (value === "low") {
      return "severity-low";
    }

    return "severity-medium";
  };

  // ================= LOCATION =================

  const getLocation = (problem) => {
    const location = problem?.location || {};

    return (
      location.address ||
      location.villageCity ||
      problem?.villageCity ||
      problem?.district ||
      "Location not available"
    );
  };

  // ================= CITIZEN NAME =================

  const getCitizenName = (problem) => {
    return (
      problem?.citizen?.name ||
      problem?.user?.name ||
      problem?.createdBy?.name ||
      "Citizen"
    );
  };

  // ================= ASSIGNED ORGANIZATION =================

  const getAssignedOrganization = (problem) => {
    const assigned = problem?.assignedTo;

    if (!assigned) return null;

    /*
     * Handles populated organization object.
     */
    if (
      assigned.organization &&
      typeof assigned.organization === "object"
    ) {
      return assigned.organization;
    }

    return null;
  };

  // ================= STATISTICS =================

  const totalProblems = problems.length;

  const pendingProblems = problems.filter(
    (problem) => {
      const status = String(
        problem.status || "Submitted"
      ).toLowerCase();

      return (
        status === "submitted" ||
        status === "pending" ||
        status === "verified"
      );
    }
  ).length;

  const aiProblems = problems.filter(
    (problem) => {
      const aiStatus = String(
        problem.aiStatus || ""
      ).toLowerCase();

      const status = String(
        problem.status || ""
      ).toLowerCase();

      return (
        aiStatus === "processing" ||
        aiStatus === "pending ai analysis" ||
        status === "ai analysis"
      );
    }
  ).length;

  const assignedProblems = problems.filter(
    (problem) =>
      problem.assignmentStatus === "Assigned" ||
      problem.assignmentStatus === "Accepted" ||
      problem.assignmentStatus === "In Progress" ||
      problem.assignmentStatus === "Completed" ||
      problem.assignedTo?.organization
  ).length;

  const resolvedProblems = problems.filter(
    (problem) => {
      const status = String(
        problem.status || ""
      ).toLowerCase();

      return (
        status === "resolved" ||
        status === "implemented"
      );
    }
  ).length;

  // ================= CATEGORIES =================

  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(
        problems
          .map((problem) => problem.category)
          .filter(Boolean)
      ),
    ];

    return uniqueCategories.sort();
  }, [problems]);

  // ================= FILTERED PROBLEMS =================

  const filteredProblems = useMemo(() => {
    const search = searchText
      .trim()
      .toLowerCase();

    return problems.filter((problem) => {
      const title = String(
        problem.title ||
          problem.problemTitle ||
          ""
      ).toLowerCase();

      const description = String(
        problem.description ||
          problem.details ||
          ""
      ).toLowerCase();

      const category = String(
        problem.category || ""
      ).toLowerCase();

      const citizen = String(
        getCitizenName(problem)
      ).toLowerCase();

      const location = String(
        getLocation(problem)
      ).toLowerCase();

      const status = String(
        problem.status || "Submitted"
      );

      const matchesSearch =
        !search ||
        title.includes(search) ||
        description.includes(search) ||
        category.includes(search) ||
        citizen.includes(search) ||
        location.includes(search);

      const matchesStatus =
        statusFilter === "All" ||
        status.toLowerCase() ===
          statusFilter.toLowerCase();

      const matchesCategory =
        categoryFilter === "All" ||
        category ===
          categoryFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory
      );
    });
  }, [
    problems,
    searchText,
    statusFilter,
    categoryFilter,
  ]);

  // ================= UI =================

  return (
    <div className="admin-page">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <header className="admin-header">

        <div>
          <h1>SamadhanSetu</h1>

          <p>
            Admin Control & Problem Management
          </p>
        </div>

        <div className="admin-header-actions">

          <div className="admin-profile">

            <div className="admin-avatar">
              {adminName
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <strong>
                {adminName}
              </strong>

              <span>
                Administrator
              </span>
            </div>

          </div>

          <button
            className="refresh-btn"
            onClick={fetchProblems}
            disabled={loading}
          >
            🔄 Refresh
          </button>

          <button
            className="admin-logout-btn"
            onClick={logout}
          >
            🚪 Logout
          </button>

        </div>

      </header>

      {/* ================================================= */}
      {/* WELCOME */}
      {/* ================================================= */}

      <section className="welcome-card">

        <div>

          <span className="welcome-label">
            ADMIN CONTROL CENTER
          </span>

          <h2>
            Welcome, {adminName} 👋
          </h2>

          <p>
            Review citizen-reported problems,
            understand AI analysis and assign
            each problem to the appropriate
            organization for resolution.
          </p>

        </div>

        <div className="welcome-flow">

          <span>Citizen</span>
          <b>→</b>
          <span>AI Analysis</span>
          <b>→</b>
          <span>Admin</span>
          <b>→</b>
          <span>Organization</span>
          <b>→</b>
          <span>Resolution</span>

        </div>

      </section>

      {/* ================================================= */}
      {/* STATS */}
      {/* ================================================= */}

      <section className="stats-grid">

        <div className="stat-card">

          <div className="stat-icon">
            📋
          </div>

          <div>
            <p>Total Problems</p>
            <h2>{totalProblems}</h2>
          </div>

        </div>

        <div className="stat-card">

          <div className="stat-icon">
            ⏳
          </div>

          <div>
            <p>Pending</p>
            <h2>{pendingProblems}</h2>
          </div>

        </div>

        <div className="stat-card">

          <div className="stat-icon">
            🤖
          </div>

          <div>
            <p>AI Analysis</p>
            <h2>{aiProblems}</h2>
          </div>

        </div>

        <div className="stat-card">

          <div className="stat-icon">
            🤝
          </div>

          <div>
            <p>Assigned</p>
            <h2>{assignedProblems}</h2>
          </div>

        </div>

        <div className="stat-card">

          <div className="stat-icon">
            ✅
          </div>

          <div>
            <p>Resolved</p>
            <h2>{resolvedProblems}</h2>
          </div>

        </div>

      </section>

      {/* ================================================= */}
      {/* PROBLEM SECTION */}
      {/* ================================================= */}

      <section className="problems-section">

        <div className="section-heading">

          <div>

            <h2>
              Citizen Reported Problems
            </h2>

            <p>
              Review, analyze and assign
              community problems.
            </p>

          </div>

          <div className="problem-count">
            Showing{" "}
            <strong>
              {filteredProblems.length}
            </strong>{" "}
            of{" "}
            <strong>
              {problems.length}
            </strong>
          </div>

        </div>

        {/* ================================================= */}
        {/* FILTERS */}
        {/* ================================================= */}

        <div className="admin-filters">

          <div className="search-box">

            <span>🔍</span>

            <input
              type="text"
              placeholder="Search by title, citizen, category or location..."
              value={searchText}
              onChange={(event) =>
                setSearchText(
                  event.target.value
                )
              }
            />

          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
          >
            <option value="All">
              All Status
            </option>
            <option value="Submitted">
              Submitted
            </option>
            <option value="AI Analysis">
              AI Analysis
            </option>
            <option value="Assigned">
              Assigned
            </option>
            <option value="Accepted">
              Accepted
            </option>
            <option value="In Progress">
              In Progress
            </option>
            <option value="Resolved">
              Resolved
            </option>
            <option value="Rejected">
              Rejected
            </option>
          </select>

          <select
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(
                event.target.value
              )
            }
          >
            <option value="All">
              All Categories
            </option>

            {categories.map(
              (category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              )
            )}

          </select>

        </div>

        {/* ================================================= */}
        {/* LOADING */}
        {/* ================================================= */}

        {loading && (
          <div className="message-box">
            <div className="loading-spinner">
              ⏳
            </div>

            <p>
              Loading citizen problems...
            </p>
          </div>
        )}

        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

        {error && (
          <div className="error-box">

            <strong>
              ⚠️ Unable to load problems
            </strong>

            <p>{error}</p>

            <button
              onClick={fetchProblems}
              className="retry-btn"
            >
              Try Again
            </button>

          </div>
        )}

        {/* ================================================= */}
        {/* EMPTY */}
        {/* ================================================= */}

        {!loading &&
          !error &&
          filteredProblems.length === 0 && (

            <div className="empty-box">

              <div className="empty-icon">
                📭
              </div>

              <h3>
                No problems found
              </h3>

              <p>
                Try changing your search or
                filters.
              </p>

            </div>

          )}

        {/* ================================================= */}
        {/* PROBLEMS */}
        {/* ================================================= */}

        {!loading &&
          !error &&
          filteredProblems.length > 0 && (

            <div className="problem-list">

              {filteredProblems.map(
                (problem) => {

                  const status =
                    problem.status ||
                    "Submitted";

                  const assignmentStatus =
                    problem.assignmentStatus ||
                    "Pending";

                  const assignedOrganization =
                    getAssignedOrganization(
                      problem
                    );

                  const assignedName =
                    assignedOrganization?.name ||
                    "Not Assigned";

                  const assignedType =
                    problem.assignedTo?.type;

                  const progress =
                    Number(
                      problem.progress
                        ?.percentage || 0
                    );

                  const ai =
                    problem.aiAnalysis || {};

                  return (
                    <article
                      className="problem-card"
                      key={problem._id}
                    >

                      {/* ================= TOP ================= */}

                      <div className="problem-top">

                        <div className="problem-title-area">

                          <div className="problem-number">
                            Problem #
                            {String(
                              problem._id || ""
                            ).slice(-6)}
                          </div>

                          <h3>
                            {problem.title ||
                              problem.problemTitle ||
                              "Untitled Problem"}
                          </h3>

                          <p className="problem-description">
                            {problem.description ||
                              problem.details ||
                              "No description available."}
                          </p>

                        </div>

                        <div className="problem-status-area">

                          <span
                            className={`status-badge ${getStatusClass(
                              status
                            )}`}
                          >
                            {status}
                          </span>

                          <span
                            className={`severity-badge ${getSeverityClass(
                              problem.severity
                            )}`}
                          >
                            {problem.severity ||
                              "Medium"}
                          </span>

                        </div>

                      </div>

                      {/* ================= BASIC INFO ================= */}

                      <div className="problem-info">

                        <span>
                          📍{" "}
                          {getLocation(
                            problem
                          )}
                        </span>

                        <span>
                          🏷️{" "}
                          {problem.category ||
                            "General"}
                        </span>

                        <span>
                          👤{" "}
                          {getCitizenName(
                            problem
                          )}
                        </span>

                        {problem.peopleAffected >
                          0 && (
                          <span>
                            👥{" "}
                            {
                              problem.peopleAffected
                            }{" "}
                            affected
                          </span>
                        )}

                      </div>

                      {/* ================= AI ================= */}

                      {(problem.aiStatus ||
                        problem.aiAnalysis) && (

                        <div className="ai-analysis-box">

                          <div className="ai-heading">

                            <div>
                              <strong>
                                🤖 AI Analysis
                              </strong>

                              <span>
                                {problem.aiStatus ||
                                  "Available"}
                              </span>
                            </div>

                          </div>

                          <div className="ai-grid">

                            <div>
                              <small>
                                Category
                              </small>

                              <strong>
                                {ai.category ||
                                  problem.category ||
                                  "Pending"}
                              </strong>
                            </div>

                            <div>
                              <small>
                                Severity
                              </small>

                              <strong>
                                {ai.severity ||
                                  problem.severity ||
                                  "Pending"}
                              </strong>
                            </div>

                            <div>
                              <small>
                                Problem Type
                              </small>

                              <strong>
                                {ai.problemType ||
                                  problem.problemType ||
                                  "Pending"}
                              </strong>
                            </div>

                            <div>
                              <small>
                                Suggested Stakeholder
                              </small>

                              <strong>
                                {ai.suggestedStakeholder ||
                                  "Pending"}
                              </strong>
                            </div>

                          </div>

                          {ai.suggestedSolutionDomain && (
                            <p className="ai-solution">
                              💡{" "}
                              <strong>
                                Suggested Solution:
                              </strong>{" "}
                              {
                                ai.suggestedSolutionDomain
                              }
                            </p>
                          )}

                          {ai.duplicateDetected && (
                            <p className="duplicate-warning">
                              ⚠️ Similar/duplicate
                              problem detected.
                            </p>
                          )}

                        </div>
                      )}

                      {/* ================= ASSIGNMENT ================= */}

                      <div className="assignment-panel">

                        <div className="assignment-left">

                          <span className="assignment-title">
                            🤝 Assignment
                          </span>

                          <div className="assignment-details">

                            <span>
                              Status:
                            </span>

                            <strong>
                              {assignmentStatus}
                            </strong>

                            {assignedOrganization && (
                              <>
                                <span>
                                  Assigned to:
                                </span>

                                <strong>
                                  {assignedName}
                                </strong>

                                {assignedType && (
                                  <span>
                                    (
                                    {getAssignmentLabel(
                                      assignedType
                                    )}
                                    )
                                  </span>
                                )}
                              </>
                            )}

                          </div>

                        </div>

                        <button
                          className="assign-btn"
                          onClick={() =>
                            openAssignModal(
                              problem
                            )
                          }
                        >
                          🤝{" "}
                          {assignedOrganization
                            ? "Reassign"
                            : "Assign Problem"}
                        </button>

                      </div>

                      {/* ================= PROGRESS ================= */}

                      <div className="progress-section">

                        <div className="progress-header">

                          <span>
                            📈 Progress
                          </span>

                          <strong>
                            {progress}%
                          </strong>

                        </div>

                        <div className="progress-bar">

                          <div
                            className="progress-fill"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.max(
                                  0,
                                  progress
                                )
                              )}%`,
                            }}
                          />

                        </div>

                        <div className="progress-stage">

                          Current Stage:{" "}

                          <strong>
                            {problem.progress
                              ?.currentStage ||
                              "Problem Submitted"}
                          </strong>

                        </div>

                      </div>

                      {/* ================= ACTIONS ================= */}

                      <div className="problem-bottom">

                        <button
                          className="view-btn"
                          onClick={() =>
                            openDetailsModal(
                              problem
                            )
                          }
                        >
                          👁️ View Full Details
                        </button>

                        <span className="created-date">

                          Submitted:{" "}
                          {problem.createdAt
                            ? new Date(
                                problem.createdAt
                              ).toLocaleString(
                                "en-IN"
                              )
                            : "N/A"}

                        </span>

                      </div>

                    </article>
                  );
                }
              )}

            </div>
          )}

      </section>

      {/* ================================================= */}
      {/* ASSIGN MODAL */}
      {/* ================================================= */}

      {showAssignModal && (
        <div className="assign-modal-overlay">

          <div className="assign-modal">

            <div className="assign-modal-header">

              <div>

                <span className="modal-label">
                  ADMIN ASSIGNMENT
                </span>

                <h2>
                  Assign Problem
                </h2>

                <p>
                  Select the organization that
                  should work on this citizen
                  problem.
                </p>

              </div>

              <button
                className="modal-close-btn"
                onClick={closeAssignModal}
                disabled={assigning}
              >
                ✕
              </button>

            </div>

            {/* SELECTED PROBLEM */}

            {selectedProblem && (
              <div className="selected-problem-box">

                <span>
                  Selected Citizen Problem
                </span>

                <h3>
                  {selectedProblem.title ||
                    "Untitled Problem"}
                </h3>

                <p>
                  {selectedProblem.description ||
                    "No description available."}
                </p>

                <div className="selected-problem-meta">

                  <span>
                    🏷️{" "}
                    {selectedProblem.category ||
                      "General"}
                  </span>

                  <span>
                    📍{" "}
                    {getLocation(
                      selectedProblem
                    )}
                  </span>

                  <span>
                    ⚠️{" "}
                    {selectedProblem.severity ||
                      "Medium"}
                  </span>

                </div>

              </div>
            )}

            {/* ORGANIZATION TYPE */}

            <div className="assign-form-group">

              <label>
                Assign To
              </label>

              <select
                value={assignmentType}
                onChange={
                  handleAssignmentTypeChange
                }
                disabled={assigning}
              >

                <option value="">
                  Select organization type
                </option>

                <option value="college">
                  🏫 College
                </option>

                <option value="industry">
                  🏭 Industry
                </option>

                <option value="municipality">
                  🏛️ Municipality / Nagarpalika
                </option>

                <option value="gramPanchayat">
                  🌾 Gram Panchayat
                </option>

                <option value="government">
                  🏢 Government
                </option>

              </select>

            </div>

            {/* ORGANIZATION */}

            {assignmentType && (
              <div className="assign-form-group">

                <label>
                  Select Organization
                </label>

                {organizationLoading ? (

                  <div className="organization-loading">
                    ⏳ Loading{" "}
                    {getAssignmentLabel(
                      assignmentType
                    ).toLowerCase()}
                    s...
                  </div>

                ) : organizations.length ===
                  0 ? (

                  <div className="organization-empty">

                    No active{" "}
                    {getAssignmentLabel(
                      assignmentType
                    ).toLowerCase()}{" "}
                    users found.

                    <small>
                      Register an organization
                      account first with the
                      correct role.
                    </small>

                  </div>

                ) : (

                  <select
                    value={
                      selectedOrganization
                    }
                    onChange={(event) =>
                      setSelectedOrganization(
                        event.target.value
                      )
                    }
                    disabled={assigning}
                  >

                    <option value="">
                      Select organization
                    </option>

                    {organizations.map(
                      (organization) => (
                        <option
                          key={
                            organization._id
                          }
                          value={
                            organization._id
                          }
                        >
                          {organization.name}
                          {" — "}
                          {
                            organization.email
                          }
                          {organization.district
                            ? ` — ${organization.district}`
                            : ""}
                        </option>
                      )
                    )}

                  </select>

                )}

              </div>
            )}

            {/* ASSIGN ERROR */}

            {assignError && (
              <div className="assign-error">
                ⚠️ {assignError}
              </div>
            )}

            {/* ACTIONS */}

            <div className="assign-modal-actions">

              <button
                className="cancel-assign-btn"
                onClick={closeAssignModal}
                disabled={assigning}
              >
                Cancel
              </button>

              <button
                className="confirm-assign-btn"
                onClick={
                  handleAssignProblem
                }
                disabled={
                  assigning ||
                  !assignmentType ||
                  !selectedOrganization
                }
              >
                {assigning
                  ? "⏳ Assigning..."
                  : "✓ Assign Problem"}
              </button>

            </div>

          </div>

        </div>
      )}

      {/* ================================================= */}
      {/* FULL DETAILS MODAL */}
      {/* ================================================= */}

      {showDetailsModal &&
        selectedProblem && (

          <div className="details-modal-overlay">

            <div className="details-modal">

              <div className="details-modal-header">

                <div>

                  <span>
                    CITIZEN PROBLEM DETAILS
                  </span>

                  <h2>
                    {selectedProblem.title ||
                      "Untitled Problem"}
                  </h2>

                </div>

                <button
                  className="modal-close-btn"
                  onClick={
                    closeDetailsModal
                  }
                >
                  ✕
                </button>

              </div>

              {/* PROBLEM */}

              <div className="details-section">

                <h3>
                  📋 Problem Information
                </h3>

                <div className="details-grid">

                  <div>
                    <small>
                      Category
                    </small>

                    <strong>
                      {selectedProblem.category ||
                        "N/A"}
                    </strong>
                  </div>

                  <div>
                    <small>
                      Severity
                    </small>

                    <strong>
                      {selectedProblem.severity ||
                        "Medium"}
                    </strong>
                  </div>

                  <div>
                    <small>
                      Problem Type
                    </small>

                    <strong>
                      {selectedProblem.problemType ||
                        selectedProblem.aiAnalysis
                          ?.problemType ||
                        "N/A"}
                    </strong>
                  </div>

                  <div>
                    <small>
                      People Affected
                    </small>

                    <strong>
                      {selectedProblem.peopleAffected ||
                        0}
                    </strong>
                  </div>

                </div>

                <div className="detail-description">

                  <small>
                    Description
                  </small>

                  <p>
                    {selectedProblem.description ||
                      selectedProblem.details ||
                      "No description available."}
                  </p>

                </div>

                {selectedProblem.expectedSolution && (
                  <div className="detail-description">

                    <small>
                      Expected Solution
                    </small>

                    <p>
                      {
                        selectedProblem.expectedSolution
                      }
                    </p>

                  </div>
                )}

              </div>

              {/* CITIZEN */}

              <div className="details-section">

                <h3>
                  👤 Citizen Information
                </h3>

                <div className="details-grid">

                  <div>
                    <small>
                      Name
                    </small>

                    <strong>
                      {getCitizenName(
                        selectedProblem
                      )}
                    </strong>
                  </div>

                  <div>
                    <small>
                      Email
                    </small>

                    <strong>
                      {selectedProblem.citizen
                        ?.email ||
                        selectedProblem.user
                          ?.email ||
                        "Not available"}
                    </strong>
                  </div>

                  <div>
                    <small>
                      Mobile
                    </small>

                    <strong>
                      {selectedProblem.citizen
                        ?.mobile ||
                        selectedProblem.user
                          ?.mobile ||
                        "Not available"}
                    </strong>
                  </div>

                  <div>
                    <small>
                      District
                    </small>

                    <strong>
                      {selectedProblem.location
                        ?.district ||
                        selectedProblem.district ||
                        "Not available"}
                    </strong>
                  </div>

                </div>

              </div>

              {/* LOCATION */}

              <div className="details-section">

                <h3>
                  📍 Location
                </h3>

                <p>
                  {getLocation(
                    selectedProblem
                  )}
                </p>

                {selectedProblem.location
                  ?.latitude != null &&
                  selectedProblem.location
                    ?.longitude != null && (
                    <p>
                      Coordinates:{" "}
                      {
                        selectedProblem.location
                          .latitude
                      }
                      ,{" "}
                      {
                        selectedProblem.location
                          .longitude
                      }
                    </p>
                  )}

              </div>

              {/* AI */}

              <div className="details-section ai-detail-section">

                <h3>
                  🤖 AI Analysis
                </h3>

                <div className="details-grid">

                  <div>
                    <small>
                      AI Status
                    </small>

                    <strong>
                      {selectedProblem.aiStatus ||
                        "Pending"}
                    </strong>
                  </div>

                  <div>
                    <small>
                      AI Category
                    </small>

                    <strong>
                      {selectedProblem.aiAnalysis
                        ?.category ||
                        "Pending"}
                    </strong>
                  </div>

                  <div>
                    <small>
                      Priority Score
                    </small>

                    <strong>
                      {selectedProblem.aiAnalysis
                        ?.priorityScore ??
                        0}
                    </strong>
                  </div>

                  <div>
                    <small>
                      Suggested Stakeholder
                    </small>

                    <strong>
                      {selectedProblem.aiAnalysis
                        ?.suggestedStakeholder ||
                        "Pending"}
                    </strong>
                  </div>

                </div>

                {selectedProblem.aiAnalysis
                  ?.suggestedSolutionDomain && (
                  <p>
                    💡{" "}
                    {
                      selectedProblem.aiAnalysis
                        .suggestedSolutionDomain
                    }
                  </p>
                )}

              </div>

              {/* PROGRESS */}

              <div className="details-section">

                <h3>
                  📈 Resolution Progress
                </h3>

                <div className="progress-header">

                  <span>
                    {
                      selectedProblem.progress
                        ?.currentStage ||
                      "Problem Submitted"
                    }
                  </span>

                  <strong>
                    {
                      selectedProblem.progress
                        ?.percentage || 0
                    }
                    %
                  </strong>

                </div>

                <div className="progress-bar">

                  <div
                    className="progress-fill"
                    style={{
                      width: `${
                        selectedProblem
                          .progress
                          ?.percentage || 0
                      }%`,
                    }}
                  />

                </div>

              </div>

              {/* ASSIGNMENT */}

              <div className="details-section">

                <h3>
                  🤝 Assignment
                </h3>

                <p>
                  Status:{" "}
                  <strong>
                    {
                      selectedProblem.assignmentStatus ||
                      "Pending"
                    }
                  </strong>
                </p>

                {selectedProblem.assignedTo
                  ?.type && (
                  <p>
                    Organization Type:{" "}
                    <strong>
                      {getAssignmentLabel(
                        selectedProblem
                          .assignedTo
                          .type
                      )}
                    </strong>
                  </p>
                )}

                {getAssignedOrganization(
                  selectedProblem
                )?.name && (
                  <p>
                    Assigned Organization:{" "}
                    <strong>
                      {
                        getAssignedOrganization(
                          selectedProblem
                        ).name
                      }
                    </strong>
                  </p>
                )}

              </div>

              {/* CLOSE / ASSIGN */}

              <div className="details-actions">

                <button
                  className="cancel-assign-btn"
                  onClick={
                    closeDetailsModal
                  }
                >
                  Close
                </button>

                <button
                  className="confirm-assign-btn"
                  onClick={() => {
                    closeDetailsModal();
                    openAssignModal(
                      selectedProblem
                    );
                  }}
                >
                  🤝 Assign / Reassign
                </button>

              </div>

            </div>

          </div>
        )}

      {/* ================================================= */}
      {/* INLINE STYLES */}
      {/* ================================================= */}

      <style>{`

        .admin-page {
          min-height: 100vh;
          background: #f5f7fb;
          color: #172033;
          font-family: Arial, sans-serif;
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          padding: 20px 5%;
          background: #ffffff;
          border-bottom: 1px solid #e5e7eb;
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .admin-header h1 {
          margin: 0;
          font-size: 28px;
          color: #174a2f;
        }

        .admin-header p {
          margin: 5px 0 0;
          color: #687386;
          font-size: 14px;
        }

        .admin-header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .admin-profile {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-right: 8px;
        }

        .admin-profile strong,
        .admin-profile span {
          display: block;
        }

        .admin-profile strong {
          font-size: 14px;
        }

        .admin-profile span {
          color: #778195;
          font-size: 12px;
          margin-top: 3px;
        }

        .admin-avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #174a2f;
          color: white;
          font-weight: 700;
        }

        .refresh-btn,
        .admin-logout-btn,
        .assign-btn,
        .view-btn,
        .retry-btn,
        .cancel-assign-btn,
        .confirm-assign-btn {
          border: none;
          cursor: pointer;
          border-radius: 9px;
          font-weight: 600;
          transition: 0.2s ease;
        }

        .refresh-btn {
          padding: 10px 14px;
          background: #eef3ef;
          color: #174a2f;
        }

        .admin-logout-btn {
          padding: 10px 14px;
          background: #fee2e2;
          color: #b42318;
        }

        .refresh-btn:hover,
        .admin-logout-btn:hover,
        .assign-btn:hover,
        .view-btn:hover,
        .confirm-assign-btn:hover {
          transform: translateY(-1px);
        }

        .welcome-card {
          margin: 28px 5% 22px;
          padding: 28px;
          border-radius: 18px;
          background: linear-gradient(
            135deg,
            #174a2f,
            #236b43
          );
          color: white;
          box-shadow: 0 12px 30px rgba(23, 74, 47, 0.15);
        }

        .welcome-label {
          font-size: 11px;
          letter-spacing: 1.2px;
          opacity: 0.8;
        }

        .welcome-card h2 {
          margin: 8px 0;
          font-size: 28px;
        }

        .welcome-card p {
          max-width: 750px;
          line-height: 1.6;
          opacity: 0.9;
          margin: 0;
        }

        .welcome-flow {
          margin-top: 22px;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
          font-size: 13px;
        }

        .welcome-flow span {
          padding: 7px 11px;
          border-radius: 20px;
          background: rgba(255,255,255,0.14);
        }

        .welcome-flow b {
          opacity: 0.7;
        }

        .stats-grid {
          margin: 0 5% 25px;
          display: grid;
          grid-template-columns: repeat(
            5,
            minmax(0, 1fr)
          );
          gap: 14px;
        }

        .stat-card {
          background: white;
          border: 1px solid #e8ebef;
          border-radius: 15px;
          padding: 18px;
          display: flex;
          align-items: center;
          gap: 14px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.03);
        }

        .stat-icon {
          width: 46px;
          height: 46px;
          border-radius: 12px;
          background: #eef3ef;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 21px;
        }

        .stat-card p {
          margin: 0;
          color: #758093;
          font-size: 12px;
        }

        .stat-card h2 {
          margin: 4px 0 0;
          font-size: 25px;
        }

        .problems-section {
          margin: 0 5% 50px;
        }

        .section-heading {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 15px;
          margin-bottom: 15px;
        }

        .section-heading h2 {
          margin: 0;
          font-size: 23px;
        }

        .section-heading p {
          margin: 6px 0 0;
          color: #758093;
        }

        .problem-count {
          font-size: 13px;
          color: #6b7280;
        }

        .admin-filters {
          display: grid;
          grid-template-columns: 1fr 190px 190px;
          gap: 12px;
          margin-bottom: 20px;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 13px;
          background: white;
          border: 1px solid #dfe4ea;
          border-radius: 10px;
        }

        .search-box input {
          width: 100%;
          border: none;
          outline: none;
          padding: 12px 5px;
          font-size: 14px;
        }

        .admin-filters select,
        .assign-form-group select {
          width: 100%;
          padding: 12px;
          border: 1px solid #dfe4ea;
          border-radius: 10px;
          background: white;
          outline: none;
          font-size: 14px;
        }

        .message-box,
        .empty-box,
        .error-box {
          background: white;
          border-radius: 15px;
          padding: 35px;
          text-align: center;
          border: 1px solid #e5e7eb;
        }

        .loading-spinner {
          font-size: 25px;
        }

        .error-box {
          border-color: #fecaca;
          color: #991b1b;
        }

        .error-box p {
          margin: 8px 0 15px;
        }

        .retry-btn {
          background: #174a2f;
          color: white;
          padding: 10px 16px;
        }

        .empty-icon {
          font-size: 45px;
        }

        .empty-box h3 {
          margin: 12px 0 5px;
        }

        .empty-box p {
          color: #758093;
        }

        .problem-list {
          display: grid;
          gap: 17px;
        }

        .problem-card {
          background: white;
          border: 1px solid #e3e7ec;
          border-radius: 17px;
          padding: 20px;
          box-shadow: 0 7px 22px rgba(0,0,0,0.035);
        }

        .problem-top {
          display: flex;
          justify-content: space-between;
          gap: 18px;
        }

        .problem-title-area {
          flex: 1;
        }

        .problem-number {
          font-size: 11px;
          color: #758093;
          margin-bottom: 5px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .problem-top h3 {
          margin: 0 0 7px;
          font-size: 19px;
          line-height: 1.35;
        }

        .problem-description {
          color: #687386;
          line-height: 1.55;
          margin: 0;
        }

        .problem-status-area {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 7px;
        }

        .status-badge,
        .severity-badge {
          display: inline-flex;
          padding: 6px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
        }

        .status-pending {
          background: #fff4d6;
          color: #8a5b00;
        }

        .status-ai {
          background: #ede9fe;
          color: #6d28d9;
        }

        .status-assigned {
          background: #e0f2fe;
          color: #0369a1;
        }

        .status-progress {
          background: #dcfce7;
          color: #166534;
        }

        .status-success {
          background: #d1fae5;
          color: #065f46;
        }

        .status-danger {
          background: #fee2e2;
          color: #991b1b;
        }

        .severity-critical {
          background: #fee2e2;
          color: #991b1b;
        }

        .severity-high {
          background: #ffedd5;
          color: #9a3412;
        }

        .severity-medium {
          background: #fef3c7;
          color: #92400e;
        }

        .severity-low {
          background: #dcfce7;
          color: #166534;
        }

        .problem-info {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin: 15px 0;
        }

        .problem-info span {
          background: #f6f8fa;
          padding: 7px 10px;
          border-radius: 8px;
          color: #596579;
          font-size: 12px;
        }

        .ai-analysis-box {
          margin: 15px 0;
          padding: 15px;
          border: 1px solid #ddd6fe;
          background: #faf9ff;
          border-radius: 12px;
        }

        .ai-heading > div {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
        }

        .ai-heading span {
          font-size: 11px;
          color: #6d28d9;
          font-weight: 700;
        }

        .ai-grid {
          margin-top: 12px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }

        .ai-grid div {
          padding: 10px;
          background: white;
          border-radius: 9px;
          border: 1px solid #eeeafa;
        }

        .ai-grid small,
        .details-grid small,
        .detail-description small {
          display: block;
          color: #7b8494;
          font-size: 10px;
          margin-bottom: 4px;
        }

        .ai-grid strong {
          font-size: 12px;
        }

        .ai-solution {
          margin: 12px 0 0;
          font-size: 12px;
          color: #4b5563;
        }

        .duplicate-warning {
          margin: 10px 0 0;
          font-size: 12px;
          color: #9a3412;
          font-weight: 600;
        }

        .assignment-panel {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin-top: 15px;
          padding: 14px;
          border-radius: 12px;
          background: #f8faf9;
          border: 1px solid #e2ebe5;
        }

        .assignment-title {
          display: block;
          font-size: 12px;
          font-weight: 700;
          color: #174a2f;
          margin-bottom: 6px;
        }

        .assignment-details {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          align-items: center;
          font-size: 12px;
          color: #687386;
        }

        .assignment-details strong {
          color: #172033;
        }

        .assign-btn {
          padding: 10px 14px;
          background: #174a2f;
          color: white;
          white-space: nowrap;
        }

        .progress-section {
          margin-top: 15px;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #687386;
          margin-bottom: 7px;
        }

        .progress-header strong {
          color: #174a2f;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          border-radius: 10px;
          background: #e7ebee;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: #174a2f;
          border-radius: 10px;
          transition: width 0.3s ease;
        }

        .progress-stage {
          margin-top: 6px;
          font-size: 11px;
          color: #758093;
        }

        .problem-bottom {
          margin-top: 16px;
          padding-top: 14px;
          border-top: 1px solid #edf0f2;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }

        .view-btn {
          padding: 9px 13px;
          background: #eef3ef;
          color: #174a2f;
        }

        .created-date {
          color: #8992a2;
          font-size: 11px;
        }

        /* ================= MODALS ================= */

        .assign-modal-overlay,
        .details-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 100;
        }

        .assign-modal,
        .details-modal {
          width: min(650px, 100%);
          max-height: 90vh;
          overflow-y: auto;
          background: white;
          border-radius: 18px;
          box-shadow: 0 25px 70px rgba(0,0,0,0.2);
        }

        .details-modal {
          width: min(850px, 100%);
        }

        .assign-modal-header,
        .details-modal-header {
          padding: 22px;
          display: flex;
          justify-content: space-between;
          gap: 15px;
          border-bottom: 1px solid #edf0f2;
        }

        .assign-modal-header h2,
        .details-modal-header h2 {
          margin: 5px 0;
        }

        .assign-modal-header p {
          margin: 0;
          color: #758093;
          font-size: 13px;
        }

        .modal-label,
        .details-modal-header span {
          font-size: 10px;
          color: #174a2f;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .modal-close-btn {
          width: 35px;
          height: 35px;
          border: none;
          border-radius: 50%;
          background: #f2f4f6;
          cursor: pointer;
          flex-shrink: 0;
        }

        .selected-problem-box {
          margin: 18px 22px;
          padding: 15px;
          background: #f7faf8;
          border: 1px solid #e0e9e3;
          border-radius: 12px;
        }

        .selected-problem-box > span {
          font-size: 10px;
          color: #687386;
          text-transform: uppercase;
          letter-spacing: 0.6px;
        }

        .selected-problem-box h3 {
          margin: 6px 0;
          font-size: 16px;
        }

        .selected-problem-box p {
          margin: 0;
          color: #687386;
          font-size: 12px;
          line-height: 1.5;
        }

        .selected-problem-meta {
          margin-top: 10px;
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
        }

        .selected-problem-meta span {
          padding: 5px 8px;
          background: white;
          border-radius: 7px;
          font-size: 11px;
        }

        .assign-form-group {
          padding: 0 22px 17px;
        }

        .assign-form-group label {
          display: block;
          margin-bottom: 7px;
          font-size: 13px;
          font-weight: 700;
        }

        .organization-loading,
        .organization-empty {
          padding: 13px;
          border-radius: 9px;
          background: #f7f8fa;
          color: #687386;
          font-size: 12px;
        }

        .organization-empty small {
          display: block;
          margin-top: 5px;
          color: #8992a2;
        }

        .assign-error {
          margin: 0 22px 15px;
          padding: 11px;
          border-radius: 9px;
          background: #fee2e2;
          color: #991b1b;
          font-size: 12px;
        }

        .assign-modal-actions,
        .details-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding: 18px 22px;
          border-top: 1px solid #edf0f2;
        }

        .cancel-assign-btn {
          padding: 10px 15px;
          background: #f0f2f4;
          color: #4b5563;
        }

        .confirm-assign-btn {
          padding: 10px 16px;
          background: #174a2f;
          color: white;
        }

        .details-section {
          padding: 20px 22px;
          border-bottom: 1px solid #edf0f2;
        }

        .details-section h3 {
          margin: 0 0 14px;
          font-size: 15px;
        }

        .details-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }

        .details-grid > div {
          background: #f8faf9;
          padding: 11px;
          border-radius: 9px;
        }

        .details-grid strong {
          font-size: 12px;
          word-break: break-word;
        }

        .detail-description {
          margin-top: 14px;
          padding: 12px;
          background: #fafafa;
          border-radius: 9px;
        }

        .detail-description p,
        .details-section > p {
          margin: 0;
          color: #596579;
          font-size: 13px;
          line-height: 1.6;
        }

        .ai-detail-section {
          background: #faf9ff;
        }

        /* ================= RESPONSIVE ================= */

        @media (max-width: 1100px) {
          .stats-grid {
            grid-template-columns: repeat(3, 1fr);
          }

          .ai-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .admin-filters {
            grid-template-columns: 1fr 170px 170px;
          }
        }

        @media (max-width: 800px) {
          .admin-header {
            position: static;
            flex-direction: column;
            align-items: flex-start;
          }

          .admin-header-actions {
            width: 100%;
            flex-wrap: wrap;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .admin-filters {
            grid-template-columns: 1fr;
          }

          .section-heading {
            align-items: flex-start;
            flex-direction: column;
          }

          .problem-top {
            flex-direction: column;
          }

          .problem-status-area {
            align-items: flex-start;
            flex-direction: row;
          }

          .assignment-panel,
          .problem-bottom {
            flex-direction: column;
            align-items: flex-start;
          }

          .details-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 520px) {
          .admin-header,
          .welcome-card,
          .problems-section,
          .stats-grid {
            margin-left: 3%;
            margin-right: 3%;
          }

          .admin-header {
            padding-left: 0;
            padding-right: 0;
          }

          .welcome-card {
            padding: 20px;
          }

          .welcome-card h2 {
            font-size: 22px;
          }

          .welcome-flow {
            display: none;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .problem-card {
            padding: 15px;
          }

          .ai-grid,
          .details-grid {
            grid-template-columns: 1fr;
          }

          .admin-profile {
            width: 100%;
          }

          .refresh-btn,
          .admin-logout-btn {
            flex: 1;
          }
        }

      `}</style>

    </div>
  );
}

export default AdminDashboard;
