import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function CollegeLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "https://samadhansetu3.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Check college role
      if (data.user.role !== "college") {
        setError("This login is only for College.");
        setLoading(false);
        return;
      }

      // Save login details
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Go to College Dashboard
      navigate("/college");
    } catch (err) {
      setError(err.message || "Something went wrong");
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
            🏫
          </div>

          <h1>SamadhanSetu</h1>

          <p>College Login</p>

          <span>
            Collaborate • Innovate • Solve
          </span>

        </div>

        {/* ERROR */}
        {error && (
          <div className="login-error">
            ⚠️ {error}
          </div>
        )}

        {/* LOGIN FORM */}
        <form onSubmit={handleLogin}>

          {/* EMAIL */}
          <div className="form-group">

            <label>Email Address</label>

            <input
              type="email"
              placeholder="Enter college email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

          </div>

          {/* PASSWORD */}
          <div className="form-group">

            <label>Password</label>

            <div className="password-wrapper">

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            className="role-login-btn"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login as College"}
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
              onClick={() => navigate("/admin-login")}
            >
              🛡️ Admin
            </button>

            <button
              type="button"
              onClick={() => navigate("/industry-login")}
            >
              🏭 Industry
            </button>

          </div>

        </div>

        {/* FOOTER */}
        <div className="role-login-footer">

          <p>
            Don't have a college account?
          </p>

          <button
            type="button"
            onClick={() => navigate("/college-register")}
          >
            Register as College
          </button>

        </div>

      </div>

    </div>
  );
}

export default CollegeLogin;
