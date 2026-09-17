import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function CollegeProgress() {
  const navigate = useNavigate();

  const [problems, setProblems] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);

  const [stage, setStage] = useState("Solution Development");
  const [percentage, setPercentage] = useState(40);
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");

  const fetchProblems = async () => {
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
        throw new Error(data.message || "Failed to fetch problems.");
      }

      setProblems(data.problems || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const handleSelectProblem = (problem) => {
    setSelectedProblem(problem);

    setStage(
      problem.progress?.currentStage === "Problem Submitted" ||
        problem.progress?.currentStage === "University Assigned"
        ? "Solution Development"
        : problem.progress?.currentStage || "Solution Development"
    );

    setPercentage(problem.progress?.percentage || 40);
    setMessage("");
    setSuccess("");
    setError("");
  };

  const handleUpdateProgress = async (e) => {
    e.preventDefault();

    if (!selectedProblem) {
      setError("Please select a problem.");
      return;
    }

    try {
      setUpdating(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `https://samadhansetu3.onrender.com/api/problems/${selectedProblem._id}/progress`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            stage,
            percentage: Number(percentage),
            message,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update progress."
        );
      }

      setSuccess("Problem progress updated successfully.");

      setSelectedProblem(data.problem);

      setProblems((prev) =>
        prev.map((problem) =>
          problem._id === data.problem._id
            ? data.problem
            : problem
        )
      );

      setMessage("");
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusClass = (status) => {
    if (status === "Accepted") return "status-accepted";
    if (status === "Rejected") return "status-rejected";
    if (status === "Completed") return "status-completed";
    return "status-pending";
  };

  return (
    <div className="college-page">
      {/* HEADER */}
      <header className="college-header">
        <div>
          <h1>📈 Problem Progress</h1>
          <p>
            Track and update the progress of problems assigned
            to your college.
          </p>
        </div>

        <button
          className="secondary-btn"
          onClick={() => navigate("/college")}
        >
          ← Back to Dashboard
        </button>
      </header>

      <div className="college-content">
        {/* ERROR */}
        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {/* SUCCESS */}
        {success && (
          <div className="success-message">
            ✅ {success}
          </div>
        )}

        <div className="progress-layout">
          {/* LEFT SIDE */}
          <section className="progress-problems-section">
            <div className="section-heading">
              <h2>Assigned Problems</h2>

              <button
                className="refresh-btn"
                onClick={fetchProblems}
              >
                🔄 Refresh
              </button>
            </div>

            {loading ? (
              <div className="empty-state">
                <div className="loading-spinner"></div>
                <p>Loading assigned problems...</p>
              </div>
            ) : problems.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <h3>No Assigned Problems</h3>
                <p>
                  No problems have been assigned to your college
                  yet.
                </p>
              </div>
            ) : (
              <div className="progress-problem-list">
                {problems.map((problem) => (
                  <div
                    key={problem._id}
                    className={`progress-problem-card ${
                      selectedProblem?._id === problem._id
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      handleSelectProblem(problem)
                    }
                  >
                    <div className="problem-card-top">
                      <span className="category-badge">
                        {problem.category}
                      </span>

                      <span
                        className={`status-badge ${getStatusClass(
                          problem.assignmentStatus
                        )}`}
                      >
                        {problem.assignmentStatus}
                      </span>
                    </div>

                    <h3>{problem.title}</h3>

                    <p className="problem-description">
                      {problem.description}
                    </p>

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

                    <div className="progress-mini">
                      <div className="progress-mini-header">
                        <span>
                          {problem.progress?.currentStage ||
                            "Problem Submitted"}
                        </span>

                        <strong>
                          {problem.progress?.percentage || 0}%
                        </strong>
                      </div>

                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${
                              problem.progress?.percentage ||
                              0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* RIGHT SIDE */}
          <section className="progress-update-section">
            {!selectedProblem ? (
              <div className="select-problem-box">
                <div className="select-icon">👈</div>
                <h2>Select a Problem</h2>
                <p>
                  Select an accepted problem from the left side
                  to update its progress.
                </p>
              </div>
            ) : (
              <div className="progress-form-card">
                <div className="form-card-header">
                  <span className="category-badge">
                    {selectedProblem.category}
                  </span>

                  <h2>{selectedProblem.title}</h2>

                  <p>
                    Citizen:{" "}
                    <strong>
                      {selectedProblem.citizen?.name ||
                        "Citizen"}
                    </strong>
                  </p>
                </div>

                {selectedProblem.assignmentStatus !==
                "Accepted" ? (
                  <div className="warning-box">
                    ⚠️ Progress can be updated only after
                    accepting the problem.
                  </div>
                ) : (
                  <form onSubmit={handleUpdateProgress}>
                    {/* STAGE */}
                    <div className="form-group">
                      <label>
                        Progress Stage
                      </label>

                      <select
                        value={stage}
                        onChange={(e) =>
                          setStage(e.target.value)
                        }
                      >
                        <option value="Solution Development">
                          Solution Development
                        </option>

                        <option value="Prototype/Testing">
                          Prototype / Testing
                        </option>

                        <option value="Approved">
                          Approved
                        </option>

                        <option value="Implemented">
                          Implemented
                        </option>

                        <option value="Resolved">
                          Resolved
                        </option>
                      </select>
                    </div>

                    {/* PERCENTAGE */}
                    <div className="form-group">
                      <label>
                        Progress Percentage:{" "}
                        <strong>{percentage}%</strong>
                      </label>

                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={percentage}
                        onChange={(e) =>
                          setPercentage(e.target.value)
                        }
                      />

                      <div className="percentage-labels">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                      </div>
                    </div>

                    {/* MESSAGE */}
                    <div className="form-group">
                      <label>
                        Progress Update Message
                      </label>

                      <textarea
                        rows="5"
                        placeholder="Example: Student team has started developing the proposed solution..."
                        value={message}
                        onChange={(e) =>
                          setMessage(e.target.value)
                        }
                      ></textarea>
                    </div>

                    {/* CURRENT PROGRESS */}
                    <div className="current-progress-box">
                      <div className="current-progress-header">
                        <span>Current Progress</span>
                        <strong>
                          {percentage}%
                        </strong>
                      </div>

                      <div className="progress-bar large">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${percentage}%`,
                          }}
                        ></div>
                      </div>

                      <p>{stage}</p>
                    </div>

                    <button
                      type="submit"
                      className="primary-btn full-width"
                      disabled={updating}
                    >
                      {updating
                        ? "Updating..."
                        : "📤 Update Progress"}
                    </button>
                  </form>
                )}

                {/* HISTORY */}
                <div className="progress-history">
                  <h3>Progress History</h3>

                  {selectedProblem.progress?.updates
                    ?.length > 0 ? (
                    <div className="timeline">
                      {[
                        ...selectedProblem.progress.updates,
                      ]
                        .reverse()
                        .map((update, index) => (
                          <div
                            className="timeline-item"
                            key={index}
                          >
                            <div className="timeline-dot"></div>

                            <div className="timeline-content">
                              <h4>
                                {update.stage}
                              </h4>

                              <p>
                                {update.message}
                              </p>

                              {update.createdAt && (
                                <small>
                                  {new Date(
                                    update.createdAt
                                  ).toLocaleString()}
                                </small>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="no-history">
                      No progress updates yet.
                    </p>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default CollegeProgress;
