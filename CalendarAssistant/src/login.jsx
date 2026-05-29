import { useState } from "react";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    // Authorize with google??
    if (username && password) {
      navigate("/main");
    } else {
      alert("Please enter username and password");
    }
  };

  const handleCreateAccount = () => {
    alert("Account creation flow goes here");
  };

  return (
    <div style={styles.container}>
      <h2>Login</h2>

      <input
        style={styles.input}
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        style={styles.input}
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button style={styles.button} onClick={handleLogin}>
        Login
      </button>

      <button style={styles.secondaryButton} onClick={handleCreateAccount}>
        Create New Account
      </button>
    </div>
  );
}

const styles = {
  container: {
    width: "300px",
    margin: "100px auto",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    textAlign: "center",
  },
  input: {
    padding: "15px",
    fontSize: "16px",
  },
  button: {
    padding: "10px",
    backgroundColor: "#3f7ad3",
    color: "white",
    border: "none",
    cursor: "pointer",
  },
  secondaryButton: {
    padding: "10px",
    backgroundColor: "#2196F3",
    color: "white",
    border: "none",
    cursor: "pointer",
  },
};

export default LoginPage;
