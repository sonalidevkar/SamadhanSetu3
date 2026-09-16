import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function CollegeDashboard() {
  const navigate = useNavigate();

  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // =========================
  // FETCH ASSIGNED PROBLEMS
  // =========================
  const fetchProblems = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/problems/college-assigned",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch assigned problems."
        );
      }

      setProblems(data.problems || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  // =========================
  // LOGOUT
  // =========================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/college-login");
  };

  // =========================
  // STATISTICS
  // =========================
  const assignedCount = problems.length;

  const pendingCount = problems.filter(
    (problem) =>
      problem.assignmentStatus === "Assigned" ||
      problem.assignmentStatus === "Pending"
  ).length;

  const inProgressCount = problems.filter(
    (problem) =>
      problem.assignmentStatus === "In Progress" ||
      problem.status === "Team/Planning" ||
      problem.status === "Prototype/Testing"
  ).length;

  const resolvedCount = problems.filter(
    (problem) =>
      problem.status === "Resolved" ||
      problem.status === "Implemented"
  ).length;

  // =========================
  // STATUS CLASS
  // =========================
  const getStatusClass = (status) => {
    switch (status) {
      case "Accepted":
        return "status-accepted";

      case "Rejected":
        return "status-rejected";

      case "Completed":
      case "Resolved":
        return "status-completed";

      case "In Progress":
      case "Assigned":
        return "status-progress";

      default:
        return "status-pending";
    }
  };

  return (
    <div className="college-page">

      {/* =========================
          HEADER
      ========================= */}
      <header className="college-header">

        <div className="college-header-left">
          <div className="college-logo">
            🎓
          </div>

          <div>
            <h1>College Dashboard</h1>

            <p>
              Welcome,{" "}
              <strong>
                {user?.name || "College"}
              </strong>
            </p>
          </div>
        </div>

        <button
          type="button"
          className="logout-btn"
          onClick={handleLogout}
        >
          🚪 Logout
        </button>

      </header>

      {/* =========================
          MAIN CONTENT
      ========================= */}
      <main className="college-content">

        {/* ERROR */}
        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {/* =========================
            WELCOME SECTION
        ========================= */}
        <section className="college-welcome">

          <div>
            <h2>
              Welcome to SamadhanSetu 🎓
            </h2>

            <p>
              Collaborate with citizens, students,
              universities and industries to solve
              real-world community problems.
            </p>
          </div>

          <div className="welcome-icon">
            🤝
          </div>

        </section>

        {/* =========================
            STAT CARDS
        ========================= */}
        <section className="college-stats">

          <div className="stat-card">
            <div className="stat-icon">
              📋
            </div>

            <div>
              <h3>{assignedCount}</h3>
              <p>Assigned Problems</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              ⏳
            </div>

            <div>
              <h3>{pendingCount}</h3>
              <p>Pending Requests</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              🔄
            </div>

            <div>
              <h3>{inProgressCount}</h3>
              <p>In Progress</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              ✅
            </div>

            <div>
              <h3>{resolvedCount}</h3>
              <p>Resolved</p>
            </div>
          </div>

        </section>

        {/* =========================
            QUICK ACTIONS
        ========================= */}
        <section className="college-section">

          <div className="section-heading">
            <div>
              <h2>Quick Actions</h2>

              <p>
                Manage assigned problems and
                collaborate with teams.
              </p>
            </div>
          </div>

          <div className="quick-actions-grid">

            {/* ASSIGNED PROBLEMS */}
            <button
              type="button"
              className="quick-action-btn"
              onClick={fetchProblems}
            >
              <span className="quick-action-icon">
                📋
              </span>

              <span>
                <strong>
                  Assigned Problems
                </strong>

                <small>
                  Refresh assigned problems
                </small>
              </span>
            </button>

            {/* REQUESTS */}
            <button
              type="button"
              className="quick-action-btn"
              onClick={() =>
                navigate("/college/requests")
              }
            >
              <span className="quick-action-icon">
                📩
              </span>

              <span>
                <strong>
                  Requests
                </strong>

                <small>
                  Accept or reject problems
                </small>
              </span>
            </button>

            {/* =========================
                PROGRESS BUTTON
            ========================= */}
            <button
              type="button"
              className="quick-action-btn"
              onClick={() =>
                navigate("/college/progress")
              }
            >
              <span className="quick-action-icon">
                📈
              </span>

              <span>
                <strong>
                  Progress
                </strong>

                <small>
                  Update problem progress
                </small>
              </span>
            </button>

            {/* STUDENT TEAMS */}
            <button
              type="button"
              className="quick-action-btn"
              onClick={() =>
                alert(
                  "Student Teams feature will be added soon."
                )
              }
            >
              <span className="quick-action-icon">
                👥
              </span>

              <span>
                <strong>
                  Student Teams
                </strong>

                <small>
                  Manage student teams
                </small>
              </span>
            </button>

          </div>

        </section>

        {/* =========================
            RECENT ASSIGNED PROBLEMS
        ========================= */}
        <section className="college-section">

          <div className="section-heading">

            <div>
              <h2>
                Recent Assigned Problems
              </h2>

              <p>
                Problems assigned to your college
                by the administration.
              </p>
            </div>

            <button
              type="button"
              className="refresh-btn"
              onClick={fetchProblems}
            >
              🔄 Refresh
            </button>

          </div>

          {/* LOADING */}
          {loading ? (
            <div className="empty-state">

              <div className="loading-spinner"></div>

              <p>
                Loading assigned problems...
              </p>

            </div>
          ) : problems.length === 0 ? (

            /* EMPTY */
            <div className="empty-state">

              <div className="empty-icon">
                📭
              </div>

              <h3>
                No Assigned Problems
              </h3>

              <p>
                Your college has no assigned
                problems at the moment.
              </p>

            </div>

          ) : (

            /* PROBLEM LIST */
            <div className="college-problem-grid">

              {problems.map((problem) => (

                <div
                  className="college-problem-card"
                  key={problem._id}
                >

                  {/* TOP */}
                  <div className="problem-card-top">

                    <span className="category-badge">
                      {problem.category}
                    </span>

                    <span
                      className={`status-badge ${getStatusClass(
                        problem.assignmentStatus
                      )}`}
                    >
                      {problem.assignmentStatus ||
                        problem.status ||
                        "Pending"}
                    </span>

                  </div>

                  {/* TITLE */}
                  <h3>
                    {problem.title}
                  </h3>

                  {/* DESCRIPTION */}
                  <p className="problem-description">
                    {problem.description}
                  </p>

                  {/* META */}
                  <div className="problem-meta">

                    <span>
                      👤{" "}
                      {problem.citizen?.name ||
                        "Citizen"}
                    </span>

                    <span>
                      📍{" "}
                      {problem.location?.villageCity ||
                        problem.location?.district ||
                        "Location not available"}
                    </span>

                  </div>

                  {/* SEVERITY */}
                  <div className="problem-details">

                    <span>
                      ⚠️ Severity:{" "}
                      <strong>
                        {problem.severity ||
                          "Medium"}
                      </strong>
                    </span>

                    <span>
                      👥 Affected:{" "}
                      <strong>
                        {problem.peopleAffected ||
                          0}
                      </strong>
                    </span>

                  </div>

                  {/* PROGRESS */}
                  <div className="progress-mini">

                    <div className="progress-mini-header">

                      <span>
                        {problem.progress
                          ?.currentStage ||
                          "Problem Submitted"}
                      </span>

                      <strong>
                        {problem.progress
                          ?.percentage || 0}
                        %
                      </strong>

                    </div>

                    <div className="progress-bar">

                      <div
                        className="progress-fill"
                        style={{
                          width: `${
                            problem.progress
                              ?.percentage || 0
                          }%`,
                        }}
                      ></div>

                    </div>

                  </div>

                  {/* ASSIGNMENT */}
                  <div className="assignment-info">

                    <span>
                      Assignment:
                    </span>

                    <strong>
                      {problem.assignmentStatus ||
                        "Pending"}
                    </strong>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

        {/* =========================
            WORKFLOW
        ========================= */}
        <section className="college-section">

          <div className="section-heading">

            <div>
              <h2>
                SamadhanSetu Workflow
              </h2>

              <p>
                Follow the complete problem-solving
                journey.
              </p>
            </div>

          </div>

          <div className="college-workflow">

            <div className="workflow-step active">
              <div className="workflow-icon">
                📝
              </div>

              <h4>
                Problem Submitted
              </h4>
            </div>

            <div className="workflow-line"></div>

            <div className="workflow-step">
              <div className="workflow-icon">
                🤖
              </div>

              <h4>
                AI Analysis
              </h4>
            </div>

            <div className="workflow-line"></div>

            <div className="workflow-step">
              <div className="workflow-icon">
                🎓
              </div>

              <h4>
                College Assigned
              </h4>
            </div>

            <div className="workflow-line"></div>

            <div className="workflow-step">
              <div className="workflow-icon">
                💻
              </div>

              <h4>
                Solution Development
              </h4>
            </div>

            <div className="workflow-line"></div>

            <div className="workflow-step">
              <div className="workflow-icon">
                🧪
              </div>

              <h4>
                Testing
              </h4>
            </div>

            <div className="workflow-line"></div>

            <div className="workflow-step">
              <div className="workflow-icon">
                ✅
              </div>

              <h4>
                Problem Resolved
              </h4>
            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default CollegeDashboard;