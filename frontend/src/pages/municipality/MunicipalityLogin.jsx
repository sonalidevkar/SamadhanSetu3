import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function MunicipalityLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

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
        throw new Error(data.message || "Login failed.");
      }

      if (data.user.role !== "municipality") {
        setError("This account is not registered as Municipality.");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/municipality");
    } catch (error) {
      setError(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="role-login-page">
      <div className="role-login-card">

        <div className="role-login-header">
          <div className="role-login-icon">🏛️</div>

          <h1>Municipality Login</h1>

          <p>
            Manage and coordinate local civic problems
          </p>
        </div>

        <form onSubmit={handleLogin}>

          <div className="form-group">
            <label>Email Address</label>

            <input
              type="email"
              placeholder="Enter municipality email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="role-login-btn"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login as Municipality"}
          </button>
        </form>

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

            <button
              type="button"
              onClick={() => navigate("/admin-login")}
            >
              🛡️ Admin
            </button>

          </div>
        </div>

        <div className="role-login-footer">
          Don't have a municipality account?
          <a href="/municipality-register">
            Register as Municipality
          </a>
        </div>

      </div>
    </div>
  );
}

export default MunicipalityLogin;
