import { useState } from "react";
import { useNavigate } from "react-router-dom";
import './index.css';

function LoginPage() {
  const navigate = useNavigate();
  const [view, setView] = useState("main"); // "main" "login" "register"

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Full-page redirect into the backend's OAuth flow — it issues our own
  // JWT and sends the browser back to /main?token=... when done.
  const handleGoogleLogin = () => {
    window.location.href = "/auth/google";
  };

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please fill in all fields");
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Login failed");
        return;
      }
      localStorage.setItem("token", data.token);
      navigate("/main");
    } catch (err) {
      alert("Could not reach the server");
    }
  };

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      alert("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/auth/register", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Registration failed");
        return;
      }
      alert("Account created! Please sign in.");
      setView("login");
    } catch (err) {
      alert("Could not reach the server");
    }
  };

  if (view === "login") {
    return (
      <div className="login-container">
        <h2>Welcome Back</h2>
        <p>Sign in to your account</p>

        <div className="card-box" style={{ width: "100%", maxWidth: "360px" }}>
          <div className="input-row">
            <input
              className="input-field"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="input-row">
            <input
              className="input-field"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="primary-btn" onClick={handleLogin}>
            Sign In
          </button>
        </div>

        <button className="link-btn" onClick={() => setView("main")}>
          ← Back
        </button>
      </div>
    );
  }

  if (view === "register") {
    return (
      <div className="login-container">
        <h2>Create Account</h2>
        <p>Sign up to get started</p>

        <div className="card-box" style={{ width: "100%", maxWidth: "360px" }}>
          <div className="input-row">
            <input
              className="input-field"
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="input-row">
            <input
              className="input-field"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="input-row">
            <input
              className="input-field"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="input-row">
            <input
              className="input-field"
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button className="primary-btn" onClick={handleRegister}>
            Create Account
          </button>
        </div>

        <button className="link-btn" onClick={() => setView("main")}>
          ← Back
        </button>
      </div>
    );
  }

  // main view 
  return (
    <div className="login-container">
      <h2>Calendar Assistant</h2>
      <p>How would you like to sign in?</p>

      <div className="card-box" style={{ width: "100%", maxWidth: "360px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <button className="primary-btn" onClick={handleGoogleLogin}>
          Sign in with Google
        </button>

        <div className="divider">
          <span>or</span>
        </div>

        <button className="secondary-btn" onClick={() => setView("login")}>
          Sign in with Email
        </button>

        <button className="secondary-btn" onClick={() => setView("register")}>
          Create an Account
        </button>
    
      </div>
    </div>
  );
}

export default LoginPage;
