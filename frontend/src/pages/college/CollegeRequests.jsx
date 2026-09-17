import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function CollegeRequests() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "https://samadhansetu3.onrender.com/api/problems/college-assigned",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch requests."
        );
      }

      setRequests(data.problems || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (problemId, action) => {
    try {
      setActionLoading(problemId);
      setError("");

      const response = await fetch(
        `https://samadhansetu3.onrender.com/api/problems/${problemId}/${action}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `Failed to ${action} problem.`
        );
      }

      // Update the request immediately in UI
      setRequests((previousRequests) =>
        previousRequests.map((request) =>
          request._id === problemId
            ? data.problem
            : request
        )
      );
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusClass = (status) => {
    if (status === "Accepted") {
      return "status-badge status-accepted";
    }

    if (status === "Rejected") {
      return "status-badge status-rejected";
    }

    return "status-badge status-pending";
  };

  return (
    <div className="college-page">
      {/* Header */}
      <header className="college-header">
        <div>
          <h1>College Requests</h1>
          <p>
            Review citizen problems assigned to your college
          </p>
        </div>

        <button
          className="college-back-btn"
          onClick={() => navigate("/college")}
        >
          ← Dashboard
        </button>
      </header>

      {/* Main Content */}
      <main className="college-content">

        {/* Error */}
        {error && (
          <div className="college-error">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="college-empty-state">
            <div className="college-loader"></div>
            <h3>Loading requests...</h3>
            <p>Please wait while we fetch assigned problems.</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="college-empty-state">
            <div className="college-empty-icon">📭</div>
            <h2>No Requests Found</h2>
            <p>
              There are currently no citizen problems assigned
              to your college.
            </p>

            <button
              className="college-primary-btn"
              onClick={fetchRequests}
            >
              🔄 Refresh
            </button>
          </div>
        ) : (
          <div className="college-requests-grid">
            {requests.map((problem) => (
              <div
                className="college-request-card"
                key={problem._id}
              >
                {/* Card Top */}
                <div className="college-request-top">
                  <div>
                    <span className="college-request-category">
                      {problem.category}
                    </span>

                    <h2>{problem.title}</h2>
                  </div>

                  <span
                    className={getStatusClass(
                      problem.assignmentStatus
                    )}
                  >
                    {problem.assignmentStatus || "Pending"}
                  </span>
                </div>

                {/* Description */}
                <p className="college-request-description">
                  {problem.description}
                </p>

                {/* Details */}
                <div className="college-request-details">

                  <div className="college-detail-item">
                    <span>👤 Citizen</span>
                    <strong>
                      {problem.citizen?.name || "Unknown"}
                    </strong>
                  </div>

                  <div className="college-detail-item">
                    <span>📍 Location</span>
                    <strong>
                      {problem.location?.villageCity ||
                        problem.location?.district ||
                        problem.location?.address ||
                        "Not provided"}
                    </strong>
                  </div>

                  <div className="college-detail-item">
                    <span>⚠️ Severity</span>
                    <strong>
                      {problem.severity || "Medium"}
                    </strong>
                  </div>

                  <div className="college-detail-item">
                    <span>👥 People Affected</span>
                    <strong>
                      {problem.peopleAffected || 0}
                    </strong>
                  </div>
                </div>

                {/* Progress */}
                <div className="college-request-progress">
                  <div className="college-progress-header">
                    <span>Progress</span>
                    <strong>
                      {problem.progress?.percentage || 0}%
                    </strong>
                  </div>

                  <div className="college-progress-bar">
                    <div
                      className="college-progress-fill"
                      style={{
                        width: `${
                          problem.progress?.percentage || 0
                        }%`,
                      }}
                    ></div>
                  </div>

                  <small>
                    {problem.progress?.currentStage ||
                      "Problem Submitted"}
                  </small>
                </div>

                {/* Actions */}
                {problem.assignmentStatus === "Assigned" ||
                problem.assignmentStatus === "Pending" ? (
                  <div className="college-request-actions">

                    <button
                      className="college-accept-btn"
                      disabled={actionLoading === problem._id}
                      onClick={() =>
                        handleAction(
                          problem._id,
                          "accept"
                        )
                      }
                    >
                      {actionLoading === problem._id
                        ? "Processing..."
                        : "✓ Accept"}
                    </button>

                    <button
                      className="college-reject-btn"
                      disabled={actionLoading === problem._id}
                      onClick={() =>
                        handleAction(
                          problem._id,
                          "reject"
                        )
                      }
                    >
                      {actionLoading === problem._id
                        ? "Processing..."
                        : "✕ Reject"}
                    </button>

                  </div>
                ) : (
                  <div className="college-request-completed">
                    {problem.assignmentStatus === "Accepted"
                      ? "✓ This problem has been accepted"
                      : "✕ This problem has been rejected"}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default CollegeRequests;
