import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function IndustryRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    address: "",
    district: "",
    villageCity: "",
    password: "",
    confirmPassword: "",
  });

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
      setError("Password must be at least 6 characters.");
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
            address: formData.address,
            district: formData.district,
            villageCity: formData.villageCity,
            password: formData.password,
            role: "industry",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setSuccess(
        "Industry registration successful! Redirecting to login..."
      );

      setTimeout(() => {
        navigate("/industry-login");
      }, 1500);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="role-login-page">

      <div className="role-login-card">

        {/* HEADER */}
        <div className="role-login-header">

          <div className="role-login-icon">
            🏭
          </div>

          <h1>SamadhanSetu</h1>

          <p>Industry Registration</p>

          <span>
            Partner • Innovate • Solve
          </span>

        </div>

        {/* ERROR */}
        {error && (
          <div className="login-error">
            ⚠️ {error}
          </div>
        )}

        {/* SUCCESS */}
        {success && (
          <div className="login-success">
            ✅ {success}
          </div>
        )}

        <form onSubmit={handleRegister}>

          {/* INDUSTRY NAME */}
          <div className="form-group">
            <label>Industry / Organization Name</label>

            <input
              type="text"
              name="name"
              placeholder="Enter industry name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* EMAIL */}
          <div className="form-group">
            <label>Email Address</label>

            <input
              type="email"
              name="email"
              placeholder="Enter industry email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* MOBILE */}
          <div className="form-group">
            <label>Mobile Number</label>

            <input
              type="tel"
              name="mobile"
              placeholder="Enter mobile number"
              value={formData.mobile}
              onChange={handleChange}
              required
            />
          </div>

          {/* ADDRESS */}
          <div className="form-group">
            <label>Address</label>

            <input
              type="text"
              name="address"
              placeholder="Enter industry address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>

          {/* DISTRICT */}
          <div className="form-group">
            <label>District</label>

            <input
              type="text"
              name="district"
              placeholder="Enter district"
              value={formData.district}
              onChange={handleChange}
              required
            />
          </div>

          {/* CITY / VILLAGE */}
          <div className="form-group">
            <label>City / Village</label>

            <input
              type="text"
              name="villageCity"
              placeholder="Enter city or village"
              value={formData.villageCity}
              onChange={handleChange}
              required
            />
          </div>

          {/* PASSWORD */}
          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              name="password"
              placeholder="Create password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="form-group">
            <label>Confirm Password</label>

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          {/* REGISTER BUTTON */}
          <button
            type="submit"
            className="role-login-btn"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Register as Industry"}
          </button>

        </form>

        {/* OTHER LOGIN OPTIONS */}
        <div className="other-login-section">

          <p>Login as</p>

          <div className="other-login-buttons">

            <button
              type="button"
              onClick={() => navigate("/login")}
            >
              👤 Citizen
            </button>

            <button
              type="button"
              onClick={() => navigate("/college-login")}
            >
              🏫 College
            </button>

            <button
              type="button"
              onClick={() => navigate("/admin-login")}
            >
              🛡️ Admin
            </button>

          </div>

        </div>

        {/* FOOTER */}
        <div className="role-login-footer">

          <p>
            Already have an industry account?
          </p>

          <button
            type="button"
            onClick={() => navigate("/industry-login")}
          >
            Login as Industry
          </button>

        </div>

      </div>

    </div>
  );
}

export default IndustryRegister;