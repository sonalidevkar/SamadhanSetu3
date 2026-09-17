import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function IndustryLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.email || !formData.password) {
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
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed.");
      }

      if (data.user.role !== "industry") {
        setError(
          "This account is not registered as an Industry account."
        );
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/industry");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="role-login-page">
      <div className="role-login-card">

        <div className="role-login-icon">
          🏭
        </div>

        <h1>Industry Login</h1>

        <p className="role-login-subtitle">
          Collaborate with communities and help build solutions
        </p>

        {error && (
          <div className="role-login-error">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin}>

          <div className="role-login-field">
            <label>Industry Email</label>

            <input
              type="email"
              name="email"
              placeholder="Enter industry email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="role-login-field">
            <label>Password</label>

            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
              />

              <button
                type="button"
                className="password-toggle-btn"
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
            className="role-login-btn industry-login-btn"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login as Industry"}
          </button>
        </form>

        <div className="role-login-links">
          <Link to="/college-login">
            College Login
          </Link>

          <span>•</span>

          <Link to="/login">
            Citizen Login
          </Link>
        </div>

        <div className="role-login-register">
          Don't have an Industry account?{" "}
          <Link to="/industry-register">
            Register Here
          </Link>
        </div>

        <button
          type="button"
          className="role-login-back"
          onClick={() => navigate("/")}
        >
          ← Back to Home
        </button>

      </div>
    </div>
  );
}

export default IndustryLogin;
