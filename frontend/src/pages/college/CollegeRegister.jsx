import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function CollegeRegister() {
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

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

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
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "https://samadhansetu3.onrender.com/api/auth/register",
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

            // Important
            role: "college",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "College registration failed."
        );
      }

      setSuccess(
        "College account created successfully! Redirecting to College Login..."
      );

      setFormData({
        name: "",
        email: "",
        mobile: "",
        address: "",
        district: "",
        villageCity: "",
        password: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        navigate("/college-login");
      }, 1500);
    } catch (err) {
      console.error(
        "College registration error:",
        err
      );

      setError(
        err.message ||
          "Unable to create college account."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="college-register-page indian-college-register-page">
      <div className="college-register-card indian-college-register-card">

        {/* Icon */}
        <div className="college-register-icon indian-college-register-icon">
          🏫
        </div>

        {/* Header */}
        <div className="college-register-header">
          <h1>College Registration</h1>

          <p>
            Register your college with SamadhanSetu
          </p>
        </div>

        {/* Indian Theme */}
        <div className="indian-theme-line college-register-theme-line">
          <span></span>
          <span></span>
          <span></span>
        </div>

        {/* Error */}
        {error && (
          <div className="college-register-error">
            ⚠️ {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="college-register-success">
            ✅ {success}
          </div>
        )}

        {/* Registration Form */}
        <form
          className="college-register-form"
          onSubmit={handleRegister}
        >
          {/* College Name */}
          <label>College Name</label>

          <input
            className="college-register-input"
            type="text"
            name="name"
            placeholder="Enter college name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          {/* Email */}
          <label>College Email</label>

          <input
            className="college-register-input"
            type="email"
            name="email"
            placeholder="Enter college email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          {/* Mobile */}
          <label>Mobile Number</label>

          <input
            className="college-register-input"
            type="tel"
            name="mobile"
            placeholder="Enter mobile number"
            value={formData.mobile}
            onChange={handleChange}
          />

          {/* Address */}
          <label>College Address</label>

          <input
            className="college-register-input"
            type="text"
            name="address"
            placeholder="Enter college address"
            value={formData.address}
            onChange={handleChange}
          />

          {/* District */}
          <label>District</label>

          <input
            className="college-register-input"
            type="text"
            name="district"
            placeholder="Enter district"
            value={formData.district}
            onChange={handleChange}
          />

          {/* City / Village */}
          <label>City / Village</label>

          <input
            className="college-register-input"
            type="text"
            name="villageCity"
            placeholder="Enter city or village"
            value={formData.villageCity}
            onChange={handleChange}
          />

          {/* Password */}
          <label>Password</label>

          <div className="password-input-wrapper college-register-password-wrapper">
            <input
              className="college-register-input"
              type={
                showPassword
                  ? "text"
                  : "password"
              }
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

          {/* Confirm Password */}
          <label>Confirm Password</label>

          <div className="password-input-wrapper college-register-password-wrapper">
            <input
              className="college-register-input"
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
                  ? "Hide password"
                  : "Show password"
              }
            >
              {showConfirmPassword
                ? "🙈"
                : "👁️"}
            </button>
          </div>

          {/* Register Button */}
          <button
            className="college-register-button indian-college-register-button"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Register College"}
          </button>
        </form>

        {/* College Login */}
        <div className="college-register-login-link">
          <span>
            Already have a college account?
          </span>

          <button
            type="button"
            onClick={() =>
              navigate("/college-login")
            }
          >
            College Login
          </button>
        </div>

        {/* Citizen Login */}
        <div className="college-register-citizen-link">
          <span>Are you a citizen?</span>

          <button
            type="button"
            onClick={() => navigate("/login")}
          >
            Citizen Login
          </button>
        </div>

        {/* Admin Login */}
        <div className="college-register-admin-link">
          <span>
            Are you an administrator?
          </span>

          <button
            type="button"
            onClick={() =>
              navigate("/admin-login")
            }
          >
            Admin Login
          </button>
        </div>

      </div>
    </div>
  );
}

export default CollegeRegister;
