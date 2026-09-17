import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Dashboard() {
  const navigate = useNavigate();

  // ================= USER DATA =================

  let user = {};

  try {
    user = JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    user = {};
  }

  const userName = user.name || "Citizen";

  // ================= PROBLEMS FROM BACKEND =================

  const [problems, setProblems] = useState([]);
  const [loadingProblems, setLoadingProblems] = useState(true);
  const [fetchError, setFetchError] = useState("");

  // ================= FETCH CITIZEN PROBLEMS =================

  const fetchMyProblems = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      const response = await fetch(
        "https://samadhansetu3.onrender.com/api/problems/my",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Problems fetch failed:", data);

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login", { replace: true });
          return;
        }

        setFetchError(
          data.message || "Unable to load your problems."
        );
        return;
      }

      setProblems(
        Array.isArray(data.problems)
          ? data.problems
          : []
      );

      setFetchError("");
    } catch (error) {
      console.error("Error fetching problems:", error);
      setFetchError(
        "Unable to connect to server. Please make sure backend is running."
      );
    } finally {
      setLoadingProblems(false);
    }
  };

  // ================= AUTO REFRESH =================

  useEffect(() => {
    fetchMyProblems();

    const interval = setInterval(() => {
      fetchMyProblems();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // ================= LOGOUT =================

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("samadhanSetuUser");

    navigate("/login", { replace: true });
  };

  // ================= STATUS =================

  const getStatusClass = (status) => {
    const value = (status || "Submitted").toLowerCase();

    if (value.includes("resolved")) {
      return "status-resolved";
    }

    if (
      value.includes("progress") ||
      value.includes("planning") ||
      value.includes("testing")
    ) {
      return "status-progress";
    }

    if (
      value.includes("assigned") ||
      value.includes("accepted") ||
      value.includes("approved")
    ) {
      return "status-assigned";
    }

    if (value.includes("rejected")) {
      return "status-submitted";
    }

    return "status-submitted";
  };

  // ================= LOCATION =================

  const getLocationText = (location) => {
    if (!location) {
      return "Location submitted";
    }

    if (typeof location === "string") {
      return location;
    }

    if (typeof location === "object") {
      if (location.address) {
        return String(location.address);
      }

      if (
        location.villageCity &&
        location.district
      ) {
        return `${location.villageCity}, ${location.district}`;
      }

      if (location.district) {
        return String(location.district);
      }

      if (
        location.latitude !== undefined &&
        location.longitude !== undefined
      ) {
        return `${location.latitude}, ${location.longitude}`;
      }
    }

    return "Location submitted";
  };

  // ================= DATE =================

  const getDateText = (problem) => {
    if (problem.createdAt) {
      return new Date(problem.createdAt).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );
    }

    if (problem.date) {
      return problem.date;
    }

    return "Recently";
  };

  // ================= STATUS COUNTS =================

  const totalProblems = problems.length;

  const submittedProblems = problems.filter((problem) => {
    const status = (problem.status || "").toLowerCase();

    return (
      status === "submitted" ||
      status === "verified" ||
      status.includes("ai analysis")
    );
  }).length;

  const inProgressProblems = problems.filter((problem) => {
    const status = (problem.status || "").toLowerCase();

    return (
      status.includes("progress") ||
      status.includes("assigned") ||
      status.includes("accepted") ||
      status.includes("planning") ||
      status.includes("testing") ||
      status.includes("approved") ||
      status.includes("implemented")
    );
  }).length;

  const resolvedProblems = problems.filter((problem) => {
    const status = (problem.status || "").toLowerCase();

    return status === "resolved";
  }).length;

  return (
    <div className="citizen-dashboard">

      {/* ================= SIDEBAR ================= */}

      <aside className="dashboard-sidebar">

        <div className="sidebar-brand">

          <div className="sidebar-logo">
            🇮🇳
          </div>

          <div>
            <h2>SamadhanSetu</h2>
            <span>Citizen Portal</span>
          </div>

        </div>

        {/* USER */}

        <div className="sidebar-user">

          <div className="sidebar-user-avatar">
            {userName.charAt(0).toUpperCase()}
          </div>

          <div>
            <strong>{userName}</strong>
            <span>Citizen</span>
          </div>

        </div>

        {/* MENU */}

        <nav className="sidebar-menu">

          <p className="menu-title">
            MAIN
          </p>

          <Link
            to="/dashboard"
            className="sidebar-link active"
          >
            <span>🏠</span>
            <span>Dashboard</span>
          </Link>

          <Link
            to="/submit-problem"
            className="sidebar-link"
          >
            <span>📝</span>
            <span>Submit Problem</span>
          </Link>

          <Link
            to="/track-problems"
            className="sidebar-link"
          >
            <span>📍</span>
            <span>Track Problems</span>
          </Link>

          <Link
            to="/all-problems"
            className="sidebar-link"
          >
            <span>🔎</span>
            <span>See All Problems</span>
          </Link>

          <p className="menu-title">
            CONNECT
          </p>

          <Link
            to="/notifications"
            className="sidebar-link"
          >
            <span>🔔</span>
            <span>Notifications</span>

            <span className="notification-badge">
              3
            </span>
          </Link>

          <Link
            to="/ai-assistant"
            className="sidebar-link"
          >
            <span>🤖</span>
            <span>AI Assistant</span>
          </Link>

          <Link
            to="/feedback"
            className="sidebar-link"
          >
            <span>💬</span>
            <span>Feedback</span>
          </Link>

          <p className="menu-title">
            ACCOUNT
          </p>

          <Link
            to="/rewards"
            className="sidebar-link reward-link"
          >
            <span>🏆</span>
            <span>My Rewards</span>
          </Link>

          <Link
            to="/profile"
            className="sidebar-link"
          >
            <span>👤</span>
            <span>My Profile</span>
          </Link>

          <Link
            to="/help-support"
            className="sidebar-link"
          >
            <span>🆘</span>
            <span>Help & Support</span>
          </Link>

        </nav>

        {/* LOGOUT */}

        <button
          className="sidebar-logout"
          onClick={logout}
        >
          <span>🚪</span>
          Logout
        </button>

      </aside>

      {/* ================= MAIN CONTENT ================= */}

      <main className="dashboard-main">

        {/* TOP HEADER */}

        <header className="portal-header">

          <div className="portal-title">

            <h1>
              SamadhanSetu
            </h1>

            <p>
              Connect. Collaborate. Solve.
            </p>

          </div>

          <div className="header-profile">

            <div className="header-avatar">
              {userName.charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{userName}</strong>
              <span>Citizen</span>
            </div>

          </div>

        </header>

        {/* ================= WELCOME ================= */}

        <section className="welcome-section">

          <div>

            <span className="welcome-tag">
              👋 Welcome back
            </span>

            <h2>
              Hello, {userName}!
            </h2>

            <p>
              Report local problems, track solutions and
              collaborate with people and organizations
              working to make communities better.
            </p>

          </div>

          <Link
            to="/submit-problem"
            className="primary-action"
          >
            📝 Report a Problem
          </Link>

        </section>

        {/* ================= STATS ================= */}

        <section className="dashboard-stats">

          {/* TOTAL */}

          <div className="stat-card">

            <div className="stat-icon blue">
              📝
            </div>

            <div>
              <span>Total Problems</span>

              <strong>
                {loadingProblems ? "..." : totalProblems}
              </strong>
            </div>

          </div>

          {/* IN PROGRESS */}

          <div className="stat-card">

            <div className="stat-icon orange">
              ⏳
            </div>

            <div>
              <span>In Progress</span>

              <strong>
                {loadingProblems
                  ? "..."
                  : inProgressProblems}
              </strong>
            </div>

          </div>

          {/* RESOLVED */}

          <div className="stat-card">

            <div className="stat-icon green">
              ✅
            </div>

            <div>

              <span>
                Resolved
              </span>

              <strong>
                {loadingProblems
                  ? "..."
                  : resolvedProblems}
              </strong>

            </div>

          </div>

          {/* REWARD */}

          <div className="stat-card reward-stat">

            <div className="stat-icon purple">
              🏆
            </div>

            <div>

              <span>
                Reward Points
              </span>

              <strong>
                {user.rewardPoints || 120}
              </strong>

            </div>

          </div>

        </section>

        {/* ================= ERROR ================= */}

        {fetchError && (

          <div
            style={{
              margin: "15px 0",
              padding: "12px 16px",
              borderRadius: "10px",
              background: "#fff3cd",
              color: "#856404",
              border: "1px solid #ffeeba",
            }}
          >
            ⚠️ {fetchError}
          </div>

        )}

        {/* ================= USER PROBLEMS ================= */}

        <section className="problems-section">

          <div className="section-heading">

            <div>

              <span className="section-label">
                YOUR ACTIVITY
              </span>

              <h2>
                Your Reported Problems
              </h2>

              <p>
                Track the problems you have reported
                and see their progress.
              </p>

            </div>

            <Link
              to="/track-problems"
              className="view-all-link"
            >
              View All →
            </Link>

          </div>

          {/* LOADING */}

          {loadingProblems ? (

            <div className="empty-problems">

              <div className="empty-icon">
                ⏳
              </div>

              <h3>
                Loading your problems...
              </h3>

              <p>
                Fetching your latest reports from
                SamadhanSetu server.
              </p>

            </div>

          ) : problems.length === 0 ? (

            /* EMPTY */

            <div className="empty-problems">

              <div className="empty-icon">
                📋
              </div>

              <h3>
                No problems reported yet
              </h3>

              <p>
                Have you noticed a problem in your
                community? Report it and help create
                a better place.
              </p>

              <Link
                to="/submit-problem"
                className="empty-button"
              >
                📝 Submit Your First Problem
              </Link>

            </div>

          ) : (

            /* PROBLEM LIST */

            <div className="problem-list">

              {problems
                .slice(0, 4)
                .map((problem, index) => {

                  const problemId =
                    problem._id ||
                    problem.id ||
                    index;

                  return (

                    <div
                      className="problem-card"
                      key={problemId}
                    >

                      <div className="problem-card-top">

                        <div className="problem-category">
                          {problem.category ||
                            "Community"}
                        </div>

                        <span
                          className={`problem-status ${getStatusClass(
                            problem.status
                          )}`}
                        >
                          {problem.status ||
                            "Submitted"}
                        </span>

                      </div>

                      <h3>
                        {problem.title ||
                          problem.problemTitle ||
                          "Community Problem"}
                      </h3>

                      <p>
                        {problem.description ||
                          "Problem submitted through SamadhanSetu portal."}
                      </p>

                      <div className="problem-meta">

                        <span>
                          📍{" "}
                          {getLocationText(
                            problem.location
                          )}
                        </span>

                        <span>
                          📅{" "}
                          {getDateText(problem)}
                        </span>

                      </div>

                      <div className="problem-card-actions">

                        <Link
                          to={`/track-problems/${problemId}`}
                          className="problem-track-button"
                        >
                          Track Problem
                        </Link>

                        <Link
                          to={`/problem/${problemId}`}
                          className="problem-view-button"
                        >
                          View →
                        </Link>

                      </div>

                    </div>

                  );
                })}

            </div>

          )}

        </section>

        {/* ================= QUICK ACTIONS ================= */}

        <section className="quick-section">

          <div className="section-heading">

            <div>

              <span className="section-label">
                QUICK ACCESS
              </span>

              <h2>
                What would you like to do?
              </h2>

            </div>

          </div>

          <div className="quick-grid">

            <Link
              to="/submit-problem"
              className="quick-card"
            >

              <div className="quick-icon">
                📝
              </div>

              <div>

                <h3>
                  Submit Problem
                </h3>

                <p>
                  Report a local issue with
                  details and location.
                </p>

              </div>

              <span>→</span>

            </Link>

            <Link
              to="/track-problems"
              className="quick-card"
            >

              <div className="quick-icon">
                📍
              </div>

              <div>

                <h3>
                  Track Problems
                </h3>

                <p>
                  Check the current progress
                  of your reports.
                </p>

              </div>

              <span>→</span>

            </Link>

            <Link
              to="/ai-assistant"
              className="quick-card ai-quick-card"
            >

              <div className="quick-icon">
                🤖
              </div>

              <div>

                <h3>
                  AI Assistant
                </h3>

                <p>
                  Get AI-powered guidance
                  and solution suggestions.
                </p>

              </div>

              <span>→</span>

            </Link>

            <Link
              to="/rewards"
              className="quick-card reward-quick-card"
            >

              <div className="quick-icon">
                🏆
              </div>

              <div>

                <h3>
                  My Rewards
                </h3>

                <p>
                  View your points, achievements
                  and contributions.
                </p>

              </div>

              <span>→</span>

            </Link>

          </div>

        </section>

        {/* ================= ABOUT PORTAL ================= */}

        <section className="about-portal">

          <div className="about-content">

            <span className="section-label">
              ABOUT SAMADHANSETU
            </span>

            <h2>
              From Problems to Real Solutions
            </h2>

            <p>
              SamadhanSetu is not just a complaint
              reporting platform. It connects citizens
              with colleges, students, faculty,
              industries, startups and government
              organizations to turn real community
              problems into practical solutions.
            </p>

            <p>
              Every reported problem can be analyzed,
              categorized and matched with the right
              people or organization based on expertise,
              location and problem requirements.
            </p>

            <div className="about-points">

              <div>
                <span>🤖</span>

                <strong>
                  AI Analysis
                </strong>

                <p>
                  Smart categorization and
                  priority detection.
                </p>
              </div>

              <div>
                <span>🤝</span>

                <strong>
                  Collaboration
                </strong>

                <p>
                  Connect citizens with suitable
                  solution providers.
                </p>
              </div>

              <div>
                <span>📊</span>

                <strong>
                  Transparent Tracking
                </strong>

                <p>
                  Follow every stage until
                  implementation.
                </p>
              </div>

              <div>
                <span>🏆</span>

                <strong>
                  Citizen Recognition
                </strong>

                <p>
                  Earn rewards for meaningful
                  participation.
                </p>
              </div>

            </div>

          </div>

          <div className="about-visual">

            <div className="portal-circle">
              <span>🇮🇳</span>
            </div>

            <h3>
              Connect
            </h3>

            <span>↓</span>

            <h3>
              Collaborate
            </h3>

            <span>↓</span>

            <h3>
              Solve
            </h3>

          </div>

        </section>

        {/* ================= WORKFLOW ================= */}

        <section className="workflow-section">

          <div className="section-heading centered">

            <span className="section-label">
              HOW IT WORKS
            </span>

            <h2>
              From Your Report to Resolution
            </h2>

            <p>
              SamadhanSetu creates a transparent path
              from identifying a problem to implementing
              its solution.
            </p>

          </div>

          <div className="workflow">

            <div className="workflow-step">

              <span>1</span>

              <strong>
                Report
              </strong>

              <p>
                Citizen reports the problem.
              </p>

            </div>

            <div className="workflow-line"></div>

            <div className="workflow-step">

              <span>2</span>

              <strong>
                AI Analysis
              </strong>

              <p>
                Problem is categorized and prioritized.
              </p>

            </div>

            <div className="workflow-line"></div>

            <div className="workflow-step">

              <span>3</span>

              <strong>
                Match
              </strong>

              <p>
                Suitable organization is identified.
              </p>

            </div>

            <div className="workflow-line"></div>

            <div className="workflow-step">

              <span>4</span>

              <strong>
                Implement
              </strong>

              <p>
                Solution is developed and implemented.
              </p>

            </div>

            <div className="workflow-line"></div>

            <div className="workflow-step">

              <span>5</span>

              <strong>
                Resolve
              </strong>

              <p>
                Citizen sees the final outcome.
              </p>

            </div>

          </div>

        </section>

        {/* ================= FOOTER ================= */}

        <footer className="portal-footer">

          <div>

            <strong>
              🇮🇳 SamadhanSetu
            </strong>

            <p>
              Building stronger communities
              through collaboration.
            </p>

          </div>

          <div className="footer-links">

            <Link to="/help-support">
              Help
            </Link>

            <Link to="/feedback">
              Feedback
            </Link>

            <Link to="/profile">
              Profile
            </Link>

          </div>

          <span>
            © 2026 SamadhanSetu
          </span>

        </footer>

      </main>

    </div>
  );
}

export default Dashboard;
