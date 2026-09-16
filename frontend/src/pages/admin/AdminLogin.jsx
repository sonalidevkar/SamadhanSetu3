
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
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
        "http://localhost:5000/api/auth/login",
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

      if (data.user.role !== "admin") {
        setError("This login is only for Admin.");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/admin");
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
          <div className="role-login-icon">🛡️</div>

          <h1>SamadhanSetu</h1>

          <p>Admin Login</p>

          <span>
            Manage and coordinate societal problems
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

          <div className="form-group">
            <label>Email Address</label>

            <input
              type="email"
              placeholder="Enter admin email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <div className="password-wrapper">

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
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

          <button
            type="submit"
            className="role-login-btn"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login as Admin"}
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
              onClick={() => navigate("/industry-login")}
            >
              🏭 Industry
            </button>

          </div>

        </div>

        {/* REGISTER */}
        <div className="role-login-footer">

          <p>
            Don't have an admin account?
          </p>

          <button
            type="button"
            onClick={() => navigate("/admin-register")}
          >
            Register as Admin
          </button>

        </div>

      </div>

    </div>
  );
}

export default AdminLogin;

