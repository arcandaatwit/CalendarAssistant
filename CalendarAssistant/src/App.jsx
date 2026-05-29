import { Routes, Route } from "react-router-dom";
import LoginPage from "./login";
import MainPage from "./main";

function App() {
  return (
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/main" element={<MainPage />} />
      </Routes>
  );
}

export default App;

