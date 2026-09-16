import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem("token");
  const userData = localStorage.getItem("user");

  // Not logged in
  if (!token || !userData) {
    switch (allowedRole) {
      case "admin":
        return <Navigate to="/admin-login" replace />;

      case "college":
        return <Navigate to="/college-login" replace />;

      case "industry":
        return <Navigate to="/industry-login" replace />;

      case "municipality":
        return <Navigate to="/municipality-login" replace />;

      case "citizen":
      default:
        return <Navigate to="/login" replace />;
    }
  }

  let user;

  try {
    user = JSON.parse(userData);
  } catch (error) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    return <Navigate to="/login" replace />;
  }

  const userRole = String(user.role || "").toLowerCase();

  // Wrong role
  if (allowedRole && userRole !== allowedRole.toLowerCase()) {
    switch (userRole) {
      case "admin":
        return <Navigate to="/admin" replace />;

      case "college":
        return <Navigate to="/college" replace />;

      case "industry":
        return <Navigate to="/industry" replace />;

      case "municipality":
        return <Navigate to="/municipality" replace />;

      case "citizen":
        return <Navigate to="/citizen" replace />;

      default:
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return <Navigate to="/login" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;