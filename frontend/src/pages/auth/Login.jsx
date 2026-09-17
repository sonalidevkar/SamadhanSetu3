import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
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

    const loginEmail = email.trim();

    // Temporary debugging
    console.log("========== CITIZEN LOGIN ==========");
    console.log("Email:", loginEmail);
    console.log("Password length:", password.length);
    console.log("API URL:", "https://samadhansetu3.onrender.com/api/auth/login");

    try {
      const response = await fetch(
        "https://samadhansetu3.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: loginEmail,
            password: password,
          }),
        }
      );

      console.log("Response Status:", response.status);

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error("Invalid response from server.");
      }

      console.log("Login Response:", data);

      if (!response.ok) {
        throw new Error(data.message || "Login failed.");
      }

      if (!data.token || !data.user) {
        throw new Error("Invalid login response from server.");
      }

      const role = String(data.user.role || "").toLowerCase();

      console.log("User Role:", role);

      if (role !== "citizen") {
        setError(
          "This login is only for Citizen. Please use the correct role login."
        );
        return;
      }

      // Save login information
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      console.log("Citizen login successful.");
      console.log("Redirecting to /citizen");

      navigate("/citizen", { replace: true });
    } catch (err) {
      console.error("Citizen Login Error:", err);

      if (err instanceof TypeError) {
        setError(
          "Cannot connect to server. Please make sure backend is running on port 5000."
        );
      } else {
        setError(err.message || "Login failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        {/* Header */}
        <div className="login-header">
          <div className="login-logo">
            🤝
          </div>

          <h1>SamadhanSetu</h1>

          <p>Citizen Login</p>
        </div>

        {/* Error */}
        {error && (
          <div className="login-error">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin}>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password">
              Password
            </label>

            <div className="password-wrapper">

              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword((prev) => !prev)
                }
              >
                {showPassword ? "Hide" : "Show"}
              </button>

            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login as Citizen"}
          </button>

        </form>

        {/* Other Login Options */}
        <div className="login-options">

          <p>Login as:</p>

          <div className="role-login-buttons">

            <button
              type="button"
              onClick={() => navigate("/college-login")}
            >
              College
            </button>

            <button
              type="button"
              onClick={() => navigate("/admin-login")}
            >
              Admin
            </button>

            <button
              type="button"
              onClick={() => navigate("/industry-login")}
            >
              Industry
            </button>

            <button
              type="button"
              onClick={() => navigate("/municipality-login")}
            >
              Municipality
            </button>

          </div>

        </div>

        {/* Register */}
        <div className="login-footer">

          <p>
            Don't have an account?{" "}

            <button
              type="button"
              onClick={() => navigate("/register")}
            >
              Register as Citizen
            </button>
          </p>

        </div>

      </div>
    </div>
  );
}

export default Login;
