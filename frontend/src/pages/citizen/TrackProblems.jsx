import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const API_URL = "https://samadhansetu3.onrender.com/api";

function TrackProblems() {
  const { id } = useParams();

  const [problems, setProblems] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getToken = () => localStorage.getItem("token");

  const fetchProblems = async () => {
    try {
      const token = getToken();

      if (!token) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch(`${API_URL}/problems/my`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to load problems.");
      }

      const fetchedProblems = data.problems || [];

      setProblems(fetchedProblems);

      // If URL contains /track-problems/:id,
      // automatically open that problem.
      if (id) {
        const matchedProblem = fetchedProblems.find(
          (problem) =>
            String(problem._id || problem.id) === String(id)
        );

        if (matchedProblem) {
          setSelectedProblem(matchedProblem);
        }
      }

      setError("");
    } catch (err) {
      console.error("Track Problems Error:", err);
      setError(err.message || "Unable to load your problems.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();

    const interval = setInterval(() => {
      fetchProblems();
    }, 5000);

    return () => clearInterval(interval);
  }, [id]);

  const getStatusText = (problem) => {
    if (!problem) return "Submitted";

    if (
      problem.status === "Resolved" ||
      problem.assignmentStatus === "Completed" ||
      Number(problem.progress?.percentage || 0) >= 100
    ) {
      return "Resolved";
    }

    if (
      problem.status === "Rejected" ||
      problem.assignmentStatus === "Rejected"
    ) {
      return "Rejected";
    }

    if (
      problem.status === "In Progress" ||
      problem.assignmentStatus === "In Progress" ||
      Number(problem.progress?.percentage || 0) > 0
    ) {
      return "In Progress";
    }

    if (problem.status === "Accepted") {
      return "Accepted";
    }

    if (problem.status === "Assigned") {
      return "Assigned";
    }

    if (problem.status === "AI Analysis") {
      return "AI Analysis";
    }

    return "Submitted";
  };

  const getStatusClass = (problem) => {
    const status = getStatusText(problem);

    switch (status) {
      case "Resolved":
        return "resolved";

      case "Rejected":
        return "rejected";

      case "In Progress":
        return "progress";

      case "Accepted":
        return "accepted";

      case "Assigned":
        return "assigned";

      case "AI Analysis":
        return "ai";

      default:
        return "submitted";
    }
  };

  const getCurrentStage = (problem) => {
    if (!problem) return "Problem Submitted";

    if (problem.progress?.currentStage) {
      return problem.progress.currentStage;
    }

    const status = getStatusText(problem);

    if (status === "Resolved") return "Problem Resolved";
    if (status === "In Progress") return "Solution Development";
    if (status === "Accepted") return "Solution Development";
    if (status === "Assigned") return "Problem Assigned";
    if (status === "AI Analysis") return "AI Analysis";

    return "Problem Submitted";
  };

  const getProgressPercentage = (problem) => {
    if (!problem) return 0;

    if (
      problem.status === "Resolved" ||
      problem.assignmentStatus === "Completed"
    ) {
      return 100;
    }

    return Math.min(
      100,
      Math.max(0, Number(problem.progress?.percentage || 0))
    );
  };

  const getLocation = (problem) => {
    if (!problem?.location) return "Location not available";

    const parts = [
      problem.location.address,
      problem.location.villageCity,
      problem.location.district,
    ].filter(Boolean);

    return parts.length
      ? parts.join(", ")
      : "Location not available";
  };

  const formatDate = (date) => {
    if (!date) return "Date not available";

    try {
      return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Date not available";
    }
  };

  const getAssignedOrganization = (problem) => {
    if (!problem?.assignedTo?.organization) {
      return "Not assigned yet";
    }

    if (typeof problem.assignedTo.organization === "object") {
      return (
        problem.assignedTo.organization.name ||
        problem.assignedTo.organization.email ||
        "Assigned Organization"
      );
    }

    return "Assigned Organization";
  };

  const buildTimeline = (problem) => {
    if (!problem) return [];

    const timeline = [
      {
        title: "Problem Submitted",
        description: "Your problem has been successfully submitted.",
        completed: true,
      },
      {
        title: "AI Analysis",
        description:
          problem.aiStatus === "Completed"
            ? "AI has analyzed the problem."
            : problem.aiStatus === "Processing"
            ? "AI is currently analyzing the problem."
            : "Waiting for AI analysis.",
        completed:
          problem.aiStatus === "Completed" ||
          problem.status !== "Submitted",
      },
    ];

    if (problem.assignedTo?.organization) {
      const organizationName =
        problem.assignedTo?.type === "college"
          ? "College Assigned"
          : problem.assignedTo?.type === "municipality"
          ? "Municipality Assigned"
          : problem.assignedTo?.type === "industry"
          ? "Industry Assigned"
          : "Organization Assigned";

      timeline.push({
        title: organizationName,
        description: `Problem assigned to ${getAssignedOrganization(
          problem
        )}.`,
        completed: true,
      });
    }

    if (
      problem.assignmentStatus === "Accepted" ||
      problem.assignmentStatus === "In Progress" ||
      problem.assignmentStatus === "Completed"
    ) {
      timeline.push({
        title: "Solution Development",
        description: "Assigned team is working on the solution.",
        completed: true,
      });
    }

    if (
      problem.progress?.updates &&
      problem.progress.updates.length > 0
    ) {
      problem.progress.updates.forEach((update) => {
        timeline.push({
          title: update.stage || "Progress Update",
          description:
            update.message || "Progress has been updated.",
          completed: true,
          date: update.createdAt,
        });
      });
    }

    if (getProgressPercentage(problem) >= 100) {
      timeline.push({
        title: "Problem Resolved",
        description:
          "The problem has been marked as resolved.",
        completed: true,
      });
    }

    return timeline;
  };

  const handleSelectProblem = (problem) => {
    setSelectedProblem(problem);
  };

  if (loading) {
    return (
      <div className="track-problems-page">
        <div className="track-loading">
          <div className="loading-spinner"></div>
          <h3>Loading your problems...</h3>
          <p>Please wait while we fetch your submitted problems.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="track-problems-page">

      {/* HEADER */}
      <div className="track-header">
        <Link to="/citizen" className="back-link">
          ← Back to Dashboard
        </Link>

        <h1 className="page-title">
          Track Your Problems
        </h1>

        <p className="page-subtitle">
          Monitor the progress of problems submitted by you.
        </p>
      </div>

      {/* TOTAL COUNT */}
      <div className="all-problems-count-card">
        <div className="count-icon">
          📋
        </div>

        <div>
          <span>Total Problems Submitted</span>

          <strong>{problems.length}</strong>

          <small>
            Problems reported by you
          </small>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="track-error">
          <strong>Unable to load problems</strong>
          <p>{error}</p>

          <button
            className="primary-btn"
            onClick={fetchProblems}
          >
            Try Again
          </button>
        </div>
      )}

      {/* EMPTY */}
      {!error && problems.length === 0 && (
        <div className="empty-track-state">
          <div className="empty-track-icon">
            📭
          </div>

          <h2>No Problems Submitted Yet</h2>

          <p>
            You have not submitted any problem yet.
            Submit a problem and track its progress here.
          </p>

          <Link
            to="/citizen/submit-problem"
            className="primary-btn"
          >
            + Submit Problem
          </Link>
        </div>
      )}

      {/* SELECTED PROBLEM */}
      {selectedProblem && (
        <div className="selected-problem-section">

          <div className="section-heading">
            <h2>Problem Tracking</h2>

            <button
              className="secondary-btn"
              onClick={() => setSelectedProblem(null)}
            >
              View All
            </button>
          </div>

          <div className="problem-track-card selected-card">

            <div className="problem-card-top">
              <div>
                <span className="problem-category">
                  {selectedProblem.category || "Other"}
                </span>

                <h2>
                  {selectedProblem.title}
                </h2>
              </div>

              <span
                className={`status-badge ${getStatusClass(
                  selectedProblem
                )}`}
              >
                {getStatusText(selectedProblem)}
              </span>
            </div>

            <p className="problem-description">
              {selectedProblem.description}
            </p>

            <div className="problem-meta">

              <div>
                <span>📅 Submitted</span>
                <strong>
                  {formatDate(selectedProblem.createdAt)}
                </strong>
              </div>

              <div>
                <span>📍 Location</span>
                <strong>
                  {getLocation(selectedProblem)}
                </strong>
              </div>

              <div>
                <span>🏢 Assigned To</span>
                <strong>
                  {getAssignedOrganization(selectedProblem)}
                </strong>
              </div>

            </div>

            {/* CURRENT STAGE */}
            <div className="track-info-box">
              <span>Current Stage</span>

              <strong>
                {getCurrentStage(selectedProblem)}
              </strong>
            </div>

            {/* PROGRESS */}
            <div className="progress-container">

              <div className="progress-header">
                <span>Overall Progress</span>

                <strong>
                  {getProgressPercentage(selectedProblem)}%
                </strong>
              </div>

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${getProgressPercentage(
                      selectedProblem
                    )}%`,
                  }}
                ></div>
              </div>

            </div>

            {/* TIMELINE */}
            <div className="timeline-section">

              <h3 className="section-label">
                Problem Journey
              </h3>

              <div className="timeline">

                {buildTimeline(selectedProblem).map(
                  (item, index) => (
                    <div
                      className="timeline-item"
                      key={index}
                    >
                      <div className="timeline-icon">
                        {item.completed ? "✓" : "○"}
                      </div>

                      {index !==
                        buildTimeline(selectedProblem).length -
                          1 && (
                        <div className="timeline-line"></div>
                      )}

                      <div className="timeline-content">

                        <h4>{item.title}</h4>

                        <p>{item.description}</p>

                        {item.date && (
                          <small>
                            {formatDate(item.date)}
                          </small>
                        )}

                      </div>
                    </div>
                  )
                )}

              </div>
            </div>

          </div>
        </div>
      )}

      {/* ALL PROBLEMS */}
      {!selectedProblem && problems.length > 0 && (
        <div className="all-problems-section">

          <div className="section-heading">
            <div>
              <h2>All Your Submitted Problems</h2>

              <p>
                Select a problem to view its complete progress.
              </p>
            </div>
          </div>

          <div className="problem-list">

            {problems.map((problem) => (
              <div
                className="problem-track-card"
                key={problem._id}
                onClick={() => handleSelectProblem(problem)}
              >

                <div className="problem-card-top">

                  <div>
                    <span className="problem-category">
                      {problem.category || "Other"}
                    </span>

                    <h2>{problem.title}</h2>
                  </div>

                  <span
                    className={`status-badge ${getStatusClass(
                      problem
                    )}`}
                  >
                    {getStatusText(problem)}
                  </span>

                </div>

                <p className="problem-description">
                  {problem.description}
                </p>

                <div className="problem-meta">

                  <div>
                    <span>📅 Submitted</span>
                    <strong>
                      {formatDate(problem.createdAt)}
                    </strong>
                  </div>

                  <div>
                    <span>📍 Location</span>
                    <strong>
                      {getLocation(problem)}
                    </strong>
                  </div>

                  <div>
                    <span>📊 Progress</span>
                    <strong>
                      {getProgressPercentage(problem)}%
                    </strong>
                  </div>

                </div>

                <div className="problem-card-footer">

                  <span>
                    Stage:{" "}
                    <strong>
                      {getCurrentStage(problem)}
                    </strong>
                  </span>

                  <button
                    className="track-link"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleSelectProblem(problem);
                    }}
                  >
                    Track →
                  </button>

                </div>

              </div>
            ))}

          </div>

          <div className="auto-refresh">
            🔄 Problem status automatically refreshes every
            5 seconds.
          </div>

        </div>
      )}

    </div>
  );
}

export default TrackProblems;
