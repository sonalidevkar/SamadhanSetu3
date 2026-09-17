import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  CheckCircle,
  Clock,
  MessageSquare,
  Send,
  Sparkles,
  UserCheck,
  AlertCircle,
  Trash2,
  ArrowLeft,
  Building2,
  FileText,
  Star,
} from "lucide-react";

const API_URL = "https://samadhansetu3.onrender.com/api/notifications";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD NOTIFICATIONS FROM BACKEND
  // =====================================================

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login again.");
        setNotifications([]);
        return;
      }

      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load notifications."
        );
      }

      const formattedNotifications = (data.notifications || []).map(
        (notification) => ({
          id: notification._id,
          title: notification.title,
          message: notification.message,
          type: notification.type || "general",
          read: notification.isRead,
          time: formatTime(notification.createdAt),
          problemTitle:
            notification.relatedProblem?.title || "",
          status:
            notification.relatedProblem?.status || "",
        })
      );

      setNotifications(formattedNotifications);
    } catch (err) {
      console.error("Notification loading error:", err);
      setError(err.message || "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FORMAT TIME
  // =====================================================

  const formatTime = (dateString) => {
    if (!dateString) {
      return "Just now";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "Just now";
    }

    const now = new Date();
    const difference = Math.floor(
      (now.getTime() - date.getTime()) / 1000
    );

    if (difference < 60) {
      return "Just now";
    }

    if (difference < 3600) {
      const minutes = Math.floor(difference / 60);
      return `${minutes} min ago`;
    }

    if (difference < 86400) {
      const hours = Math.floor(difference / 3600);
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    }

    if (difference < 604800) {
      const days = Math.floor(difference / 86400);
      return `${days} day${days > 1 ? "s" : ""} ago`;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadNotifications();

    // Refresh notifications every 30 seconds
    const interval = setInterval(() => {
      loadNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // =====================================================
  // MARK ONE AS READ
  // =====================================================

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/${id}/read`,
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
          data.message || "Failed to mark notification as read."
        );
      }

      setNotifications((previous) =>
        previous.map((notification) =>
          notification.id === id
            ? {
                ...notification,
                read: true,
              }
            : notification
        )
      );
    } catch (err) {
      console.error("Mark notification error:", err);
    }
  };

  // =====================================================
  // MARK ALL AS READ
  // =====================================================

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/read-all`,
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
          data.message ||
            "Failed to mark all notifications as read."
        );
      }

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          read: true,
        }))
      );
    } catch (err) {
      console.error("Mark all notifications error:", err);
    }
  };

  // =====================================================
  // DELETE ONE NOTIFICATION
  // =====================================================

  const deleteNotification = async (id) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete notification."
        );
      }

      setNotifications((previous) =>
        previous.filter(
          (notification) => notification.id !== id
        )
      );
    } catch (err) {
      console.error("Delete notification error:", err);
    }
  };

  // =====================================================
  // CLEAR ALL NOTIFICATIONS
  // =====================================================

  const clearAll = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(API_URL, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to clear notifications."
        );
      }

      setNotifications([]);
    } catch (err) {
      console.error("Clear notifications error:", err);
    }
  };

  // =====================================================
  // ICON
  // =====================================================

  const getIcon = (type) => {
    switch (type) {
      case "problem":
        return <Send size={19} />;

      case "ai":
        return <Sparkles size={19} />;

      case "assignment":
        return <UserCheck size={19} />;

      case "accepted":
        return <CheckCircle size={19} />;

      case "rejected":
        return <AlertCircle size={19} />;

      case "progress":
        return <Clock size={19} />;

      case "message":
        return <MessageSquare size={19} />;

      case "feedback":
        return <Star size={19} />;

      case "admin":
        return <Building2 size={19} />;

      default:
        return <Bell size={19} />;
    }
  };

  // =====================================================
  // ICON CLASS
  // =====================================================

  const getTypeClass = (type) => {
    switch (type) {
      case "problem":
        return "notification-icon-orange";

      case "ai":
        return "notification-icon-purple";

      case "assignment":
        return "notification-icon-blue";

      case "accepted":
        return "notification-icon-green";

      case "rejected":
        return "notification-icon-red";

      case "progress":
        return "notification-icon-blue";

      case "message":
        return "notification-icon-teal";

      case "feedback":
        return "notification-icon-yellow";

      case "admin":
        return "notification-icon-indigo";

      default:
        return "notification-icon-blue";
    }
  };

  // =====================================================
  // CATEGORY
  // =====================================================

  const getCategory = (type) => {
    switch (type) {
      case "problem":
        return "Problem";

      case "ai":
        return "AI Analysis";

      case "assignment":
        return "Assignment";

      case "accepted":
        return "Accepted";

      case "rejected":
        return "Rejected";

      case "progress":
        return "Progress";

      case "message":
        return "Message";

      case "feedback":
        return "Feedback";

      case "admin":
        return "Admin";

      default:
        return "General";
    }
  };

  // =====================================================
  // FILTER
  // =====================================================

  const filteredNotifications =
    filter === "All"
      ? notifications
      : notifications.filter(
          (notification) =>
            getCategory(notification.type) === filter
        );

  // =====================================================
  // UNREAD COUNT
  // =====================================================

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  // =====================================================
  // UPDATES COUNT
  // =====================================================

  const updatesCount = notifications.filter(
    (notification) =>
      notification.type === "progress" ||
      notification.type === "accepted"
  ).length;

  return (
    <div className="notification-page">
      <div className="notification-container">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="notification-header">

          <div className="notification-header-left">

            <Link
              to="/dashboard"
              className="notification-back"
            >
              <ArrowLeft size={18} />
            </Link>

            <div className="notification-title-icon">
              <Bell size={25} />

              {unreadCount > 0 && (
                <span className="notification-count">
                  {unreadCount}
                </span>
              )}
            </div>

            <div>
              <h1>Notifications</h1>

              <p>
                Stay updated about your problems and solving
                process
              </p>
            </div>

          </div>

          <div className="notification-header-actions">

            {unreadCount > 0 && (
              <button
                className="notification-mark-btn"
                onClick={markAllAsRead}
              >
                <CheckCircle size={16} />
                Mark all as read
              </button>
            )}

            {notifications.length > 0 && (
              <button
                className="notification-clear-btn"
                onClick={clearAll}
              >
                <Trash2 size={16} />
                Clear all
              </button>
            )}

          </div>

        </div>

        {/* =================================================
            SUMMARY
        ================================================= */}

        <div className="notification-summary">

          <div className="notification-summary-card">

            <div className="notification-summary-icon blue">
              <Bell size={20} />
            </div>

            <div>
              <span>Total Notifications</span>
              <strong>{notifications.length}</strong>
            </div>

          </div>

          <div className="notification-summary-card">

            <div className="notification-summary-icon orange">
              <AlertCircle size={20} />
            </div>

            <div>
              <span>Unread</span>
              <strong>{unreadCount}</strong>
            </div>

          </div>

          <div className="notification-summary-card">

            <div className="notification-summary-icon green">
              <CheckCircle size={20} />
            </div>

            <div>
              <span>Updates</span>
              <strong>{updatesCount}</strong>
            </div>

          </div>

        </div>

        {/* =================================================
            FILTER
        ================================================= */}

        <div className="notification-filter-bar">

          <div className="notification-filter-title">
            <FileText size={17} />
            <span>Notification Center</span>
          </div>

          <div className="notification-filters">

            {[
              "All",
              "Problem",
              "AI Analysis",
              "Assignment",
              "Progress",
              "Message",
              "Feedback",
            ].map((item) => (
              <button
                key={item}
                className={
                  filter === item
                    ? "notification-filter active"
                    : "notification-filter"
                }
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}

          </div>

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div
            style={{
              padding: "15px",
              marginBottom: "15px",
              borderRadius: "10px",
              background: "#fff3f3",
              color: "#b42318",
            }}
          >
            {error}
          </div>
        )}

        {/* =================================================
            LOADING
        ================================================= */}

        {loading ? (
          <div className="notification-empty">

            <div className="notification-empty-icon">
              <Bell size={35} />
            </div>

            <h2>Loading notifications...</h2>

            <p>
              Please wait while we fetch your latest updates.
            </p>

          </div>
        ) : (

          /* =================================================
             NOTIFICATION LIST
          ================================================= */

          <div className="notification-list">

            {filteredNotifications.length === 0 ? (

              <div className="notification-empty">

                <div className="notification-empty-icon">
                  <Bell size={35} />
                </div>

                <h2>No notifications yet</h2>

                <p>
                  When you submit a problem or receive updates,
                  they will appear here.
                </p>

                <Link
                  to="/submit-problem"
                  className="notification-submit-btn"
                >
                  <Send size={16} />
                  Submit a Problem
                </Link>

              </div>

            ) : (

              filteredNotifications.map(
                (notification) => (

                  <div
                    key={notification.id}
                    className={
                      notification.read
                        ? "notification-card"
                        : "notification-card unread"
                    }
                    onClick={() =>
                      !notification.read &&
                      markAsRead(notification.id)
                    }
                  >

                    {!notification.read && (
                      <span className="notification-unread-dot"></span>
                    )}

                    <div
                      className={`notification-card-icon ${getTypeClass(
                        notification.type
                      )}`}
                    >
                      {getIcon(notification.type)}
                    </div>

                    <div className="notification-card-content">

                      <div className="notification-card-top">

                        <div>

                          <span className="notification-category">
                            {getCategory(notification.type)}
                          </span>

                          <h3>
                            {notification.title}
                          </h3>

                        </div>

                        <span className="notification-time">
                          {notification.time}
                        </span>

                      </div>

                      <p>
                        {notification.message}
                      </p>

                      {notification.problemTitle && (
                        <div className="notification-problem">

                          <FileText size={14} />

                          <span>
                            {notification.problemTitle}
                          </span>

                        </div>
                      )}

                      {notification.status && (
                        <div className="notification-status">

                          <span>Status</span>

                          <strong>
                            {notification.status}
                          </strong>

                        </div>
                      )}

                      <div className="notification-card-bottom">

                        <span className="notification-from">
                          From:{" "}
                          <strong>SamadhanSetu</strong>
                        </span>

                        <button
                          className="notification-delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(
                              notification.id
                            );
                          }}
                          title="Delete notification"
                        >
                          <Trash2 size={15} />
                        </button>

                      </div>

                    </div>

                  </div>

                )
              )

            )}

          </div>
        )}

      </div>
    </div>
  );
}

export default Notifications;
