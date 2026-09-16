
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function MunicipalityRegister() {
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
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
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

    const {
      name,
      email,
      mobile,
      address,
      district,
      villageCity,
      password,
      confirmPassword,
    } = formData;

    if (
      !name ||
      !email ||
      !mobile ||
      !address ||
      !district ||
      !villageCity ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            mobile,
            address,
            district,
            villageCity,
            password,
            role: "municipality",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed.");
      }

      alert("Municipality account created successfully!");

      navigate("/municipality-login");
    } catch (error) {
      setError(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">

        <div className="register-header">
          <div className="register-icon">🏛️</div>

          <h1>Municipality Registration</h1>

          <p>
            Create an official Municipality account
          </p>
        </div>

        <form onSubmit={handleRegister}>

          <div className="form-group">
            <label>Municipality Name</label>

            <input
              type="text"
              name="name"
              placeholder="Enter municipality name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>

            <input
              type="email"
              name="email"
              placeholder="Enter municipality email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Mobile Number</label>

            <input
              type="tel"
              name="mobile"
              placeholder="Enter mobile number"
              value={formData.mobile}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Office Address</label>

            <input
              type="text"
              name="address"
              placeholder="Enter municipality office address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>District</label>

            <input
              type="text"
              name="district"
              placeholder="Enter district"
              value={formData.district}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>City / Area</label>

            <input
              type="text"
              name="villageCity"
              placeholder="Enter city or area"
              value={formData.villageCity}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Create password"
                value={formData.password}
                onChange={handleChange}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Confirm Password</label>

            <div className="password-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
              >
                {showConfirmPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {error && (
            <div className="register-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="register-btn"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Register Municipality"}
          </button>
        </form>

        <div className="register-footer">
          Already have an account?

          <button
            type="button"
            onClick={() => navigate("/municipality-login")}
          >
            Login as Municipality
          </button>
        </div>

        <div className="other-login-section">
          <p>Register / Login as</p>

          <div className="other-login-buttons">

            <button
              type="button"
              onClick={() => navigate("/register")}
            >
              👤 Citizen
            </button>

            <button
              type="button"
              onClick={() => navigate("/college-register")}
            >
              🏫 College
            </button>

            <button
              type="button"
              onClick={() => navigate("/industry-register")}
            >
              🏭 Industry
            </button>

            <button
              type="button"
              onClick={() => navigate("/admin-register")}
            >
              🛡️ Admin
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}

export default MunicipalityRegister;

