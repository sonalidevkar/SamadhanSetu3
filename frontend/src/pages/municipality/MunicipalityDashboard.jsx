import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function MunicipalityDashboard() {
  const navigate = useNavigate();

  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Progress form state
  const [progressForms, setProgressForms] = useState({});
  const [savingProgress, setSavingProgress] = useState(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // =========================
  // PROGRESS STAGES
  // =========================

  const progressStages = [
    "Problem Assigned",
    "Verification",
    "Action Taken",
    "Planning",
    "Implementation",
    "Testing",
    "Approved",
    "Implemented",
    "Resolved",
  ];

  // =========================
  // FETCH MUNICIPALITY PROBLEMS
  // =========================

  const fetchProblems = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        "https://samadhansetu3.onrender.com/api/problems/municipality-assigned",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load municipality problems."
        );
      }

      setProblems(data.problems || data.data || []);
    } catch (err) {
      console.error("Fetch municipality problems error:", err);

      setError(
        err.message || "Unable to load municipality problems."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // INITIAL LOAD
  // =========================

  useEffect(() => {
    fetchProblems();
  }, []);

  // =========================
  // ACCEPT / REJECT PROBLEM
  // =========================

  const handleMunicipalityAction = async (
    problemId,
    action
  ) => {
    const isAccept = action === "accept";

    const confirmed = window.confirm(
      isAccept
        ? "Are you sure you want to accept this problem?"
        : "Are you sure you want to reject this problem?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `https://samadhansetu3.onrender.com/api/problems/${problemId}/municipality-${action}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `Failed to ${action} problem.`
        );
      }

      alert(
        isAccept
          ? "✅ Problem accepted successfully."
          : "❌ Problem rejected successfully."
      );

      await fetchProblems();
    } catch (err) {
      console.error(
        `Municipality ${action} error:`,
        err
      );

      alert(
        err.message ||
          `Unable to ${action} problem.`
      );
    }
  };

  // =========================
  // ACCEPT
  // =========================

  const handleAcceptProblem = (problemId) => {
    handleMunicipalityAction(
      problemId,
      "accept"
    );
  };

  // =========================
  // REJECT
  // =========================

  const handleRejectProblem = (problemId) => {
    handleMunicipalityAction(
      problemId,
      "reject"
    );
  };

  // =========================
  // INITIALIZE PROGRESS FORM
  // =========================

  const initializeProgressForm = (problem) => {
    const currentPercentage =
      problem.progress?.percentage || 0;

    const currentStage =
      problem.progress?.currentStage ||
      "Problem Assigned";

    setProgressForms((previous) => ({
      ...previous,
      [problem._id]: {
        stage: currentStage,
        percentage: currentPercentage,
        message: "",
      },
    }));
  };

  // =========================
  // PROGRESS FORM CHANGE
  // =========================

  const handleProgressChange = (
    problemId,
    field,
    value
  ) => {
    setProgressForms((previous) => ({
      ...previous,
      [problemId]: {
        ...(previous[problemId] || {
          stage: "Problem Assigned",
          percentage: 0,
          message: "",
        }),
        [field]: value,
      },
    }));
  };

  // =========================
  // SAVE PROGRESS
  // =========================

  const handleSaveProgress = async (
    problem
  ) => {
    const problemId = problem._id;

    const form =
      progressForms[problemId] || {
        stage:
          problem.progress?.currentStage ||
          "Problem Assigned",
        percentage:
          problem.progress?.percentage || 0,
        message: "",
      };

    if (!form.stage) {
      alert("Please select a progress stage.");
      return;
    }

    const percentage = Number(form.percentage);

    if (
      Number.isNaN(percentage) ||
      percentage < 0 ||
      percentage > 100
    ) {
      alert(
        "Progress percentage must be between 0 and 100."
      );
      return;
    }

    if (
      percentage > 0 &&
      !form.message.trim()
    ) {
      const continueWithoutMessage =
        window.confirm(
          "You have not entered a progress message. Do you want to continue?"
        );

      if (!continueWithoutMessage) {
        return;
      }
    }

    try {
      setSavingProgress(problemId);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `https://samadhansetu3.onrender.com/api/problems/${problemId}/progress`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            stage: form.stage,
            percentage,
            message: form.message.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update problem progress."
        );
      }

      alert(
        percentage >= 100
          ? "🎉 Problem marked as resolved successfully."
          : "✅ Problem progress updated successfully."
      );

      setProgressForms((previous) => ({
        ...previous,
        [problemId]: {
          ...form,
          percentage,
          message: "",
        },
      }));

      await fetchProblems();
    } catch (err) {
      console.error(
        "Municipality progress update error:",
        err
      );

      alert(
        err.message ||
          "Unable to update problem progress."
      );
    } finally {
      setSavingProgress(null);
    }
  };

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/municipality-login");
  };

  // =========================
  // ASSIGNED PROBLEMS
  // =========================

  const assignedProblems = problems;

  // =========================
  // STATISTICS
  // =========================

  const pendingProblems =
    assignedProblems.filter(
      (problem) =>
        problem.assignmentStatus === "Pending" ||
        problem.assignmentStatus === "Assigned"
    );

  const inProgressProblems =
    assignedProblems.filter(
      (problem) =>
        problem.assignmentStatus === "Accepted" ||
        problem.assignmentStatus === "In Progress"
    );

  const completedProblems =
    assignedProblems.filter(
      (problem) =>
        problem.assignmentStatus === "Completed" ||
        problem.status === "Resolved"
    );

  // =========================
  // UI
  // =========================

  return (
    <div className="municipality-dashboard">

      {/* ================= HEADER ================= */}

      <header className="municipality-dashboard-header">

        <div className="municipality-brand">

          <div className="municipality-brand-icon">
            🏛️
          </div>

          <div>
            <h1>SamadhanSetu</h1>
            <p>Municipality Portal</p>
          </div>

        </div>

        <div className="municipality-user-area">

          <div className="municipality-user-info">

            <strong>
              {user.name || "Municipality"}
            </strong>

            <span>
              Municipality
            </span>

          </div>

          <button
            type="button"
            className="municipality-logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </header>


      {/* ================= MAIN ================= */}

      <main className="municipality-dashboard-main">

        {/* ================= WELCOME ================= */}

        <section className="municipality-welcome">

          <div>

            <span className="municipality-welcome-label">
              🏛️ Municipality Administration
            </span>

            <h2>
              Welcome, {user.name || "Municipality"}!
            </h2>

            <p>
              Monitor and manage civic problems assigned
              to your municipality through SamadhanSetu.
            </p>

          </div>

          <div className="municipality-welcome-icon">
            🏙️
          </div>

        </section>


        {/* ================= STATS ================= */}

        <section className="municipality-stats-grid">

          <div className="municipality-stat-card">

            <div className="municipality-stat-icon">
              📋
            </div>

            <div>
              <span>Total Assigned</span>

              <strong>
                {assignedProblems.length}
              </strong>
            </div>

          </div>


          <div className="municipality-stat-card">

            <div className="municipality-stat-icon">
              ⏳
            </div>

            <div>
              <span>Pending</span>

              <strong>
                {pendingProblems.length}
              </strong>
            </div>

          </div>


          <div className="municipality-stat-card">

            <div className="municipality-stat-icon">
              🔄
            </div>

            <div>
              <span>In Progress</span>

              <strong>
                {inProgressProblems.length}
              </strong>
            </div>

          </div>


          <div className="municipality-stat-card">

            <div className="municipality-stat-icon">
              ✅
            </div>

            <div>
              <span>Resolved</span>

              <strong>
                {completedProblems.length}
              </strong>
            </div>

          </div>

        </section>


        {/* ================= QUICK ACTIONS ================= */}

        <section className="municipality-section">

          <div className="municipality-section-heading">

            <div>

              <h2>
                Quick Actions
              </h2>

              <p>
                Manage municipal problem-solving activities
              </p>

            </div>

          </div>


          <div className="municipality-actions-grid">

            <button
              type="button"
              className="municipality-action-card"
              onClick={fetchProblems}
            >

              <span>🔄</span>

              <div>

                <strong>
                  Refresh Problems
                </strong>

                <small>
                  Get latest problem updates
                </small>

              </div>

            </button>


            <button
              type="button"
              className="municipality-action-card"
              onClick={() => {
                document
                  .getElementById(
                    "municipality-problems"
                  )
                  ?.scrollIntoView({
                    behavior: "smooth",
                  });
              }}
            >

              <span>📋</span>

              <div>

                <strong>
                  View Assigned Problems
                </strong>

                <small>
                  Check civic issues assigned to you
                </small>

              </div>

            </button>

          </div>

        </section>


        {/* ================= PROBLEMS ================= */}

        <section
          className="municipality-section"
          id="municipality-problems"
        >

          <div className="municipality-section-heading">

            <div>

              <h2>
                Assigned Civic Problems
              </h2>

              <p>
                Problems requiring municipal attention
              </p>

            </div>

            <span className="municipality-problem-count">
              {assignedProblems.length} Problems
            </span>

          </div>


          {/* ================= LOADING ================= */}

          {loading && (

            <div className="municipality-empty-state">

              <div className="municipality-loading-icon">
                ⏳
              </div>

              <h3>
                Loading problems...
              </h3>

              <p>
                Please wait while we fetch the latest data.
              </p>

            </div>

          )}


          {/* ================= ERROR ================= */}

          {!loading && error && (

            <div className="municipality-error-state">

              <div>
                ⚠️
              </div>

              <h3>
                Unable to load problems
              </h3>

              <p>
                {error}
              </p>

              <button
                type="button"
                onClick={fetchProblems}
              >
                Try Again
              </button>

            </div>

          )}


          {/* ================= EMPTY ================= */}

          {!loading &&
            !error &&
            assignedProblems.length === 0 && (

              <div className="municipality-empty-state">

                <div className="municipality-empty-icon">
                  🎉
                </div>

                <h3>
                  No Problems Assigned
                </h3>

                <p>
                  There are currently no civic problems
                  assigned to your municipality.
                </p>

              </div>

            )}


          {/* ================= PROBLEM LIST ================= */}

          {!loading &&
            !error &&
            assignedProblems.length > 0 && (

              <div className="municipality-problems-list">

                {assignedProblems.map(
                  (problem) => {

                    const currentPercentage =
                      problem.progress?.percentage || 0;

                    const currentStage =
                      problem.progress?.currentStage ||
                      "Problem Assigned";

                    const progressForm =
                      progressForms[problem._id] || {
                        stage: currentStage,
                        percentage:
                          currentPercentage,
                        message: "",
                      };

                    const canUpdateProgress =
                      problem.assignmentStatus ===
                        "Accepted" ||
                      problem.assignmentStatus ===
                        "In Progress";

                    return (
                      <div
                        className="municipality-problem-card"
                        key={problem._id}
                      >

                        {/* ================= TOP ================= */}

                        <div className="municipality-problem-top">

                          <div>

                            <span className="municipality-category">
                              {problem.category ||
                                "Civic Issue"}
                            </span>

                            <h3>
                              {problem.title ||
                                "Untitled Problem"}
                            </h3>

                          </div>


                          <span
                            className={`municipality-status status-${(
                              problem.assignmentStatus ||
                              problem.status ||
                              "Pending"
                            )
                              .toLowerCase()
                              .replace(
                                /\s+/g,
                                "-"
                              )}`}
                          >
                            {problem.assignmentStatus ||
                              problem.status ||
                              "Pending"}
                          </span>

                        </div>


                        {/* ================= DESCRIPTION ================= */}

                        <p className="municipality-problem-description">

                          {problem.description ||
                            "No description available."}

                        </p>


                        {/* ================= DETAILS ================= */}

                        <div className="municipality-problem-details">

                          <span>
                            📍{" "}
                            {problem.location?.district ||
                              problem.location?.address ||
                              problem.location?.villageCity ||
                              "Location not available"}
                          </span>

                          <span>
                            ⚠️{" "}
                            {problem.severity ||
                              "Normal"}
                          </span>

                          <span>
                            👥{" "}
                            {problem.peopleAffected ||
                              0} people affected
                          </span>

                        </div>


                        {/* ================= PROGRESS ================= */}

                        <div className="municipality-progress-area">

                          <div className="municipality-progress-header">

                            <span>
                              Progress
                            </span>

                            <strong>
                              {currentPercentage}%
                            </strong>

                          </div>


                          <div className="municipality-progress-bar">

                            <div
                              className="municipality-progress-fill"
                              style={{
                                width: `${currentPercentage}%`,
                              }}
                            />

                          </div>

                          <div className="municipality-current-stage">

                            Current Stage:{" "}
                            <strong>
                              {currentStage}
                            </strong>

                          </div>

                        </div>


                        {/* ================= FOOTER ================= */}

                        <div className="municipality-problem-footer">

                          <span>
                            Status:{" "}
                            {problem.status ||
                              "Submitted"}
                          </span>

                          {problem.createdAt && (

                            <span>
                              📅{" "}
                              {new Date(
                                problem.createdAt
                              ).toLocaleDateString()}
                            </span>

                          )}

                        </div>


                        {/* ================= ACCEPT / REJECT ================= */}

                        {(problem.assignmentStatus ===
                          "Pending" ||
                          problem.assignmentStatus ===
                            "Assigned") && (

                          <div className="municipality-problem-actions">

                            <button
                              type="button"
                              className="municipality-accept-btn"
                              onClick={() =>
                                handleAcceptProblem(
                                  problem._id
                                )
                              }
                            >
                              ✅ Accept Problem
                            </button>


                            <button
                              type="button"
                              className="municipality-reject-btn"
                              onClick={() =>
                                handleRejectProblem(
                                  problem._id
                                )
                              }
                            >
                              ❌ Reject Problem
                            </button>

                          </div>

                        )}


                        {/* ================= ACCEPTED MESSAGE ================= */}

                        {problem.assignmentStatus ===
                          "Accepted" && (

                          <div className="municipality-action-confirmed">

                            ✅ Problem accepted —
                            municipal action can now begin.

                          </div>

                        )}


                        {/* ================= REJECTED MESSAGE ================= */}

                        {problem.assignmentStatus ===
                          "Rejected" && (

                          <div className="municipality-action-rejected">

                            ❌ Problem assignment rejected.

                          </div>

                        )}


                        {/* ================= PROGRESS UPDATE ================= */}

                        {canUpdateProgress && (
                          <div className="municipality-progress-update">

                            <div className="municipality-progress-update-header">

                              <div>

                                <h4>
                                  🛠️ Update Problem Progress
                                </h4>

                                <p>
                                  Update the current stage
                                  and municipal action progress.
                                </p>

                              </div>

                            </div>


                            {/* STAGE */}

                            <div className="municipality-progress-field">

                              <label>
                                Current Stage
                              </label>

                              <select
                                value={
                                  progressForm.stage
                                }
                                onChange={(e) =>
                                  handleProgressChange(
                                    problem._id,
                                    "stage",
                                    e.target.value
                                  )
                                }
                              >

                                {progressStages.map(
                                  (stage) => (
                                    <option
                                      key={stage}
                                      value={stage}
                                    >
                                      {stage}
                                    </option>
                                  )
                                )}

                              </select>

                            </div>


                            {/* PERCENTAGE */}

                            <div className="municipality-progress-field">

                              <div className="municipality-percentage-label">

                                <label>
                                  Progress Percentage
                                </label>

                                <strong>
                                  {
                                    progressForm.percentage
                                  }
                                  %
                                </strong>

                              </div>

                              <input
                                type="range"
                                min="0"
                                max="100"
                                step="5"
                                value={
                                  progressForm.percentage
                                }
                                onChange={(e) =>
                                  handleProgressChange(
                                    problem._id,
                                    "percentage",
                                    Number(
                                      e.target.value
                                    )
                                  )
                                }
                              />

                              <div className="municipality-range-labels">

                                <span>0%</span>
                                <span>50%</span>
                                <span>100%</span>

                              </div>

                            </div>


                            {/* MESSAGE */}

                            <div className="municipality-progress-field">

                              <label>
                                Progress Update Message
                              </label>

                              <textarea
                                rows="4"
                                placeholder="Example: Municipal team inspected the location and started corrective action..."
                                value={
                                  progressForm.message
                                }
                                onChange={(e) =>
                                  handleProgressChange(
                                    problem._id,
                                    "message",
                                    e.target.value
                                  )
                                }
                              />

                            </div>


                            {/* SAVE BUTTON */}

                            <button
                              type="button"
                              className="municipality-save-progress-btn"
                              disabled={
                                savingProgress ===
                                problem._id
                              }
                              onClick={() =>
                                handleSaveProgress(
                                  problem
                                )
                              }
                            >

                              {savingProgress ===
                              problem._id
                                ? "⏳ Saving..."
                                : "💾 Save Progress"}

                            </button>


                            {/* PROGRESS HISTORY */}

                            {problem.progress?.updates
                              ?.length > 0 && (

                              <div className="municipality-progress-history">

                                <h4>
                                  📜 Progress History
                                </h4>

                                <div className="municipality-history-list">

                                  {[
                                    ...problem.progress
                                      .updates,
                                  ]
                                    .reverse()
                                    .map(
                                      (
                                        update,
                                        index
                                      ) => (

                                        <div
                                          className="municipality-history-item"
                                          key={`${problem._id}-${index}`}
                                        >

                                          <div className="municipality-history-dot">
                                            ✓
                                          </div>

                                          <div className="municipality-history-content">

                                            <div className="municipality-history-top">

                                              <strong>
                                                {
                                                  update.stage
                                                }
                                              </strong>

                                              {update.createdAt && (

                                                <span>
                                                  {new Date(
                                                    update.createdAt
                                                  ).toLocaleString()}
                                                </span>

                                              )}

                                            </div>

                                            {update.message && (

                                              <p>
                                                {
                                                  update.message
                                                }
                                              </p>

                                            )}

                                          </div>

                                        </div>

                                      )
                                    )}

                                </div>

                              </div>

                            )}

                          </div>
                        )}

                      </div>
                    );
                  }
                )}

              </div>

            )}

        </section>


        {/* ================= WORKFLOW ================= */}

        <section className="municipality-section">

          <div className="municipality-section-heading">

            <div>

              <h2>
                Problem Resolution Workflow
              </h2>

              <p>
                How municipal problems are handled
              </p>

            </div>

          </div>


          <div className="municipality-workflow">

            <div className="municipality-workflow-step">

              <span>
                1
              </span>

              <strong>
                Problem Assigned
              </strong>

              <small>
                Municipality receives civic issue
              </small>

            </div>


            <div className="municipality-workflow-line" />


            <div className="municipality-workflow-step">

              <span>
                2
              </span>

              <strong>
                Verification
              </strong>

              <small>
                Check problem details
              </small>

            </div>


            <div className="municipality-workflow-line" />


            <div className="municipality-workflow-step">

              <span>
                3
              </span>

              <strong>
                Action Taken
              </strong>

              <small>
                Coordinate ground-level solution
              </small>

            </div>


            <div className="municipality-workflow-line" />


            <div className="municipality-workflow-step">

              <span>
                4
              </span>

              <strong>
                Problem Resolved
              </strong>

              <small>
                Confirm successful implementation
              </small>

            </div>

          </div>

        </section>

      </main>


      {/* ================= FOOTER ================= */}

      <footer className="municipality-dashboard-footer">

        <p>
          © 2026 SamadhanSetu | Connecting Citizens,
          Institutions & Government for Better Solutions 🇮🇳
        </p>

      </footer>

    </div>
  );
}

export default MunicipalityDashboard;
