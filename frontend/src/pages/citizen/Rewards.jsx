import React, { useEffect, useState } from "react";

const API_BASE_URL = "http://localhost:5000/api";

function Rewards() {
  const [rewardData, setRewardData] = useState({
    points: 0,
    problemsSubmitted: 0,
    problemsResolved: 0,
    level: "Beginner",
  });

  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRewards = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login to view your rewards.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/rewards/my`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch rewards.");
      }

      setRewardData({
        points: data.reward?.points || 0,
        problemsSubmitted: data.reward?.problemsSubmitted || 0,
        problemsResolved: data.reward?.problemsResolved || 0,
        level: data.reward?.level || "Beginner",
      });

      setRewards(Array.isArray(data.rewards) ? data.rewards : []);
    } catch (err) {
      console.error("Rewards fetch error:", err);
      setError(err.message || "Unable to load rewards.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRewards();
  }, []);

  const getLevelProgress = () => {
    const points = rewardData.points;

    if (points >= 300) {
      return {
        percentage: 100,
        next: "Maximum level reached",
      };
    }

    if (points >= 150) {
      return {
        percentage: Math.min(((points - 150) / 150) * 100, 100),
        next: `${300 - points} points to Community Champion`,
      };
    }

    if (points >= 50) {
      return {
        percentage: Math.min(((points - 50) / 100) * 100, 100),
        next: `${150 - points} points to Community Helper`,
      };
    }

    return {
      percentage: Math.min((points / 50) * 100, 100),
      next: `${50 - points} points to Contributor`,
    };
  };

  const levelProgress = getLevelProgress();

  const getRewardIcon = (type) => {
    switch (type) {
      case "problem_submitted":
        return "📝";

      case "problem_resolved":
        return "✅";

      case "feedback":
        return "💬";

      default:
        return "🏆";
    }
  };

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingContainer}>
          <div style={styles.loader}>🏆</div>
          <h2>Loading your rewards...</h2>
          <p>Please wait while we fetch your reward information.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* HEADER */}
        <div style={styles.header}>
          <div>
            <p style={styles.smallTitle}>SAMADHANSETU</p>
            <h1 style={styles.title}>My Rewards 🏆</h1>
            <p style={styles.subtitle}>
              Your contribution to solving community problems matters.
            </p>
          </div>

          <button onClick={fetchRewards} style={styles.refreshButton}>
            🔄 Refresh
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div style={styles.errorBox}>
            ❌ {error}
          </div>
        )}

        {/* MAIN POINT CARD */}
        <div style={styles.mainCard}>
          <div>
            <p style={styles.cardLabel}>TOTAL REWARD POINTS</p>

            <div style={styles.points}>
              {rewardData.points}
            </div>

            <p style={styles.level}>
              ⭐ {rewardData.level}
            </p>
          </div>

          <div style={styles.trophy}>
            🏆
          </div>
        </div>

        {/* PROGRESS */}
        <div style={styles.progressCard}>
          <div style={styles.progressHeader}>
            <div>
              <h3 style={styles.sectionTitle}>
                Reward Level Progress
              </h3>

              <p style={styles.progressText}>
                {levelProgress.next}
              </p>
            </div>

            <strong>{Math.round(levelProgress.percentage)}%</strong>
          </div>

          <div style={styles.progressBackground}>
            <div
              style={{
                ...styles.progressFill,
                width: `${levelProgress.percentage}%`,
              }}
            />
          </div>
        </div>

        {/* STAT CARDS */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>📝</div>
            <div>
              <h2>{rewardData.problemsSubmitted}</h2>
              <p>Problems Submitted</p>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>✅</div>
            <div>
              <h2>{rewardData.problemsResolved}</h2>
              <p>Problems Resolved</p>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>⭐</div>
            <div>
              <h2>{rewardData.points}</h2>
              <p>Points Earned</p>
            </div>
          </div>
        </div>

        {/* HOW POINTS ARE EARNED */}
        <div style={styles.infoCard}>
          <h2 style={styles.sectionHeading}>
            How You Earn Points
          </h2>

          <div style={styles.rewardRules}>
            <div style={styles.rule}>
              <span style={styles.ruleIcon}>📝</span>
              <div>
                <strong>Submit a Problem</strong>
                <p>
                  Earn <b>10 points</b> when you submit a valid community
                  problem.
                </p>
              </div>
            </div>

            <div style={styles.rule}>
              <span style={styles.ruleIcon}>✅</span>
              <div>
                <strong>Problem Resolved</strong>
                <p>
                  Earn <b>50 points</b> when your reported problem is
                  successfully resolved.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* REWARD HISTORY */}
        <div style={styles.historyCard}>
          <div style={styles.historyHeader}>
            <div>
              <h2 style={styles.sectionHeading}>
                Reward History
              </h2>
              <p style={styles.historySubtitle}>
                Your automatically recorded reward activities.
              </p>
            </div>

            <span style={styles.historyCount}>
              {rewards.length} Records
            </span>
          </div>

          {rewards.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>🏆</div>

              <h3>No rewards yet</h3>

              <p>
                Submit your first community problem to earn your first
                10 reward points.
              </p>
            </div>
          ) : (
            <div style={styles.historyList}>
              {rewards.map((reward) => (
                <div
                  key={reward._id}
                  style={styles.historyItem}
                >
                  <div style={styles.historyIcon}>
                    {getRewardIcon(reward.type)}
                  </div>

                  <div style={styles.historyContent}>
                    <h3>{reward.title}</h3>

                    <p>
                      {reward.description ||
                        "Reward earned for contributing to SamadhanSetu."}
                    </p>

                    {reward.problem?.title && (
                      <small>
                        Problem: {reward.problem.title}
                      </small>
                    )}

                    <span style={styles.date}>
                      {formatDate(reward.createdAt)}
                    </span>
                  </div>

                  <div style={styles.rewardPoints}>
                    +{reward.points}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* LEVEL INFORMATION */}
        <div style={styles.levelCard}>
          <h2 style={styles.sectionHeading}>
            Reward Levels
          </h2>

          <div style={styles.levelGrid}>
            <div
              style={{
                ...styles.levelItem,
                ...(rewardData.level === "Beginner"
                  ? styles.activeLevel
                  : {}),
              }}
            >
              <span>🌱</span>
              <strong>Beginner</strong>
              <small>0–49 points</small>
            </div>

            <div
              style={{
                ...styles.levelItem,
                ...(rewardData.level === "Contributor"
                  ? styles.activeLevel
                  : {}),
              }}
            >
              <span>⭐</span>
              <strong>Contributor</strong>
              <small>50–149 points</small>
            </div>

            <div
              style={{
                ...styles.levelItem,
                ...(rewardData.level === "Community Helper"
                  ? styles.activeLevel
                  : {}),
              }}
            >
              <span>🤝</span>
              <strong>Community Helper</strong>
              <small>150–299 points</small>
            </div>

            <div
              style={{
                ...styles.levelItem,
                ...(rewardData.level === "Community Champion"
                  ? styles.activeLevel
                  : {}),
              }}
            >
              <span>🏆</span>
              <strong>Community Champion</strong>
              <small>300+ points</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f4f7fb",
    padding: "30px 20px 60px",
    boxSizing: "border-box",
  },

  container: {
    maxWidth: "1100px",
    margin: "0 auto",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "25px",
  },

  smallTitle: {
    margin: 0,
    fontSize: "12px",
    fontWeight: "800",
    letterSpacing: "2px",
    color: "#2563eb",
  },

  title: {
    margin: "5px 0",
    fontSize: "34px",
    color: "#172033",
  },

  subtitle: {
    margin: 0,
    color: "#64748b",
    fontSize: "15px",
  },

  refreshButton: {
    border: "none",
    background: "#2563eb",
    color: "#fff",
    padding: "11px 18px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "14px",
  },

  errorBox: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: "14px 18px",
    borderRadius: "10px",
    marginBottom: "20px",
    fontWeight: "600",
  },

  mainCard: {
    background: "linear-gradient(135deg, #2563eb, #4f46e5)",
    color: "#fff",
    borderRadius: "20px",
    padding: "32px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 12px 30px rgba(37, 99, 235, 0.20)",
    marginBottom: "20px",
  },

  cardLabel: {
    margin: 0,
    fontSize: "13px",
    fontWeight: "700",
    opacity: 0.85,
    letterSpacing: "1px",
  },

  points: {
    fontSize: "52px",
    fontWeight: "900",
    lineHeight: 1.1,
    margin: "7px 0",
  },

  level: {
    margin: 0,
    fontSize: "17px",
    fontWeight: "700",
  },

  trophy: {
    fontSize: "75px",
  },

  progressCard: {
    background: "#fff",
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "20px",
    boxShadow: "0 5px 20px rgba(15, 23, 42, 0.06)",
  },

  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    marginBottom: "15px",
  },

  sectionTitle: {
    margin: 0,
    color: "#172033",
  },

  progressText: {
    margin: "5px 0 0",
    color: "#64748b",
    fontSize: "14px",
  },

  progressBackground: {
    height: "12px",
    background: "#e5e7eb",
    borderRadius: "20px",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    background: "#2563eb",
    borderRadius: "20px",
    transition: "width 0.5s ease",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "18px",
    marginBottom: "20px",
  },

  statCard: {
    background: "#fff",
    borderRadius: "16px",
    padding: "22px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    boxShadow: "0 5px 20px rgba(15, 23, 42, 0.06)",
  },

  statIcon: {
    fontSize: "32px",
  },

  statCardH2: {
    margin: 0,
  },

  infoCard: {
    background: "#fff",
    borderRadius: "16px",
    padding: "25px",
    marginBottom: "20px",
    boxShadow: "0 5px 20px rgba(15, 23, 42, 0.06)",
  },

  sectionHeading: {
    margin: "0 0 18px",
    color: "#172033",
  },

  rewardRules: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "18px",
  },

  rule: {
    display: "flex",
    gap: "14px",
    padding: "18px",
    borderRadius: "12px",
    background: "#f8fafc",
  },

  ruleIcon: {
    fontSize: "30px",
  },

  historyCard: {
    background: "#fff",
    borderRadius: "16px",
    padding: "25px",
    marginBottom: "20px",
    boxShadow: "0 5px 20px rgba(15, 23, 42, 0.06)",
  },

  historyHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },

  historySubtitle: {
    margin: 0,
    color: "#64748b",
    fontSize: "14px",
  },

  historyCount: {
    background: "#eff6ff",
    color: "#2563eb",
    padding: "7px 12px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "700",
  },

  historyList: {
    marginTop: "15px",
  },

  historyItem: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "17px 0",
    borderBottom: "1px solid #e5e7eb",
  },

  historyIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    background: "#eff6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    flexShrink: 0,
  },

  historyContent: {
    flex: 1,
  },

  rewardPoints: {
    fontSize: "18px",
    fontWeight: "800",
    color: "#16a34a",
  },

  date: {
    display: "block",
    marginTop: "5px",
    fontSize: "12px",
    color: "#94a3b8",
  },

  emptyState: {
    textAlign: "center",
    padding: "45px 20px",
    color: "#64748b",
  },

  emptyIcon: {
    fontSize: "50px",
    marginBottom: "10px",
  },

  levelCard: {
    background: "#fff",
    borderRadius: "16px",
    padding: "25px",
    boxShadow: "0 5px 20px rgba(15, 23, 42, 0.06)",
  },

  levelGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "14px",
  },

  levelItem: {
    padding: "18px 10px",
    borderRadius: "12px",
    background: "#f8fafc",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  activeLevel: {
    background: "#eff6ff",
    outline: "2px solid #2563eb",
  },

  loadingContainer: {
    minHeight: "70vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    color: "#475569",
  },

  loader: {
    fontSize: "55px",
    marginBottom: "10px",
  },
};

export default Rewards;