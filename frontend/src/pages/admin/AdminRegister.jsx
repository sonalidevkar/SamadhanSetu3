
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            mobile: formData.mobile,
            password: formData.password,
            role: "admin",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Registration failed"
        );
      }

      setSuccess(
        "Admin account created successfully! Redirecting to Admin Login..."
      );

      setFormData({
        name: "",
        email: "",
        mobile: "",
        password: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        navigate("/admin-login");
      }, 1500);
    } catch (err) {
      console.error("Admin registration error:", err);

      setError(
        err.message || "Unable to create admin account."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page indian-admin-register-page">

      <div className="admin-login-card indian-admin-register-card">

        {/* Icon */}
        <div className="admin-login-icon indian-admin-register-icon">
          🛡️
        </div>

        {/* Header */}
        <div className="admin-login-header">
          <h1>Admin Registration</h1>

          <p>
            Create SamadhanSetu Administrator Account
          </p>
        </div>

        {/* Indian Theme Line */}
        <div className="indian-theme-line admin-register-theme-line">
          <span></span>
          <span></span>
          <span></span>
        </div>

        {/* Error */}
        {error && (
          <div className="admin-login-error">
            ⚠️ {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="admin-register-success">
            ✅ {success}
          </div>
        )}

        {/* Form */}
        <form
          className="admin-login-form"
          onSubmit={handleRegister}
        >

          <label>Admin Name</label>

          <input
            className="admin-login-input"
            type="text"
            name="name"
            placeholder="Enter admin name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <label>Admin Email</label>

          <input
            className="admin-login-input"
            type="email"
            name="email"
            placeholder="Enter admin email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label>Mobile Number</label>

          <input
            className="admin-login-input"
            type="tel"
            name="mobile"
            placeholder="Enter mobile number"
            value={formData.mobile}
            onChange={handleChange}
          />

          <label>Password</label>

          <div className="password-input-wrapper admin-register-password-wrapper">
            <input
              className="admin-login-input"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Create password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <button
              type="button"
              className="password-toggle-btn"
              onClick={() =>
                setShowPassword(!showPassword)
              }
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          <label>Confirm Password</label>

          <div className="password-input-wrapper admin-register-password-wrapper">
            <input
              className="admin-login-input"
              type={
                showConfirmPassword
                  ? "text"
                  : "password"
              }
              name="confirmPassword"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />

            <button
              type="button"
              className="password-toggle-btn"
              onClick={() =>
                setShowConfirmPassword(
                  !showConfirmPassword
                )
              }
              aria-label={
                showConfirmPassword
                  ? "Hide confirm password"
                  : "Show confirm password"
              }
            >
              {showConfirmPassword ? "🙈" : "👁️"}
            </button>
          </div>

          <button
            className="admin-login-button indian-admin-register-button"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Create Admin Account"}
          </button>

        </form>

        {/* Admin Login */}
        <button
          className="admin-back-button indian-admin-back-button"
          onClick={() => navigate("/admin-login")}
        >
          Already have an Admin account? Login
        </button>

        {/* Citizen Login */}
        <button
          className="admin-back-button indian-admin-citizen-button"
          onClick={() => navigate("/login")}
        >
          ← Back to Citizen Login
        </button>

      </div>
    </div>
  );
}

export default AdminRegister;

