import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import './index.css';

function LoginPage() {
  const navigate = useNavigate();
  const [view, setView] = useState("main"); // "main" | "login" | "register"

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const googleLogin = useGoogleLogin({
    scope: "https://www.googleapis.com/auth/calendar.readonly",
    onSuccess: (tokenResponse) => {
      localStorage.setItem("access_token", tokenResponse.access_token);
      navigate("/main");
    },
    onError: () => {
      alert("Google login failed, please try again");
    },
  });

  const handleLogin = () => {
    if (!email || !password) {
      alert("Please fill in all fields");
      return;
    }
    // TODO: send to backend POST /auth/login
    alert("Login not connected to backend yet");
  };

  const handleRegister = () => {
    if (!name || !email || !password || !confirmPassword) {
      alert("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    // TODO: send to backend POST /auth/register
    alert("Register not connected to backend yet");
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

  // main view — three options
  return (
    <div className="login-container">
      <h2>Calendar Assistant</h2>
      <p>How would you like to sign in?</p>

      <div className="card-box" style={{ width: "100%", maxWidth: "360px", gap: "10px", display: "flex", flexDirection: "column" }}>
        <button className="primary-btn" onClick={() => googleLogin()}>
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
