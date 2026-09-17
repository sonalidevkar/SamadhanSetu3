import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
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
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
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
        "https://samadhansetu3.onrender.com/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name.trim(),
            email: formData.email.trim(),
            mobile: formData.mobile.trim(),
            address: formData.address.trim(),
            district: formData.district.trim(),
            villageCity: formData.villageCity.trim(),
            password: formData.password,
            role: "citizen",
          }),
        }
      );

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error("Invalid response from server.");
      }

      if (!response.ok) {
        throw new Error(data.message || "Registration failed.");
      }

      setSuccess(
        "Account created successfully! Redirecting to Citizen Login..."
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
        navigate("/login");
      }, 1500);
    } catch (err) {
      console.error("Registration Error:", err);

      if (err instanceof TypeError) {
        setError(
          "Cannot connect to server. Please make sure backend is running on port 5000."
        );
      } else {
        setError(err.message || "Unable to create account.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page indian-register-page">
      <div className="register-card indian-register-card">

        <div className="register-icon indian-register-icon">
          Citizen
        </div>

        <div className="register-header">
          <h1>Create Citizen Account</h1>

          <p>
            Join SamadhanSetu and help build a better community
          </p>
        </div>

        <div className="indian-theme-line">
          <span></span>
          <span></span>
          <span></span>
        </div>

        {error && (
          <div className="register-error">
            {error}
          </div>
        )}

        {success && (
          <div className="register-success">
            {success}
          </div>
        )}

        <form
          className="register-form"
          onSubmit={handleRegister}
        >

          <label htmlFor="name">Full Name</label>

          <input
            id="name"
            type="text"
            name="name"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <label htmlFor="email">Email Address</label>

          <input
            id="email"
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label htmlFor="mobile">Mobile Number</label>

          <input
            id="mobile"
            type="tel"
            name="mobile"
            placeholder="Enter mobile number"
            value={formData.mobile}
            onChange={handleChange}
          />

          <label htmlFor="address">Address</label>

          <input
            id="address"
            type="text"
            name="address"
            placeholder="Enter your address"
            value={formData.address}
            onChange={handleChange}
          />

          <label htmlFor="district">District</label>

          <input
            id="district"
            type="text"
            name="district"
            placeholder="Enter your district"
            value={formData.district}
            onChange={handleChange}
          />

          <label htmlFor="villageCity">Village / City</label>

          <input
            id="villageCity"
            type="text"
            name="villageCity"
            placeholder="Enter village or city"
            value={formData.villageCity}
            onChange={handleChange}
          />

          <label htmlFor="password">Password</label>

          <div className="password-input-wrapper register-password-wrapper">
            <input
              id="password"
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
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <label htmlFor="confirmPassword">Confirm Password</label>

          <div className="password-input-wrapper register-password-wrapper">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
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
                setShowConfirmPassword((prev) => !prev)
              }
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </button>
          </div>

          <button
            type="submit"
            className="register-button indian-register-button"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Create Citizen Account"}
          </button>

        </form>

        <div className="register-login-link">
          <span>Already have an account?</span>

          <button
            type="button"
            onClick={() => navigate("/login")}
          >
            Citizen Login
          </button>
        </div>

        <div className="register-admin-link">
          <span>Are you an administrator?</span>

          <button
            type="button"
            onClick={() => navigate("/admin-login")}
          >
            Admin Login
          </button>
        </div>

      </div>
    </div>
  );
}

export default Register;
