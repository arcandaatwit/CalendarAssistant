import { Routes, Route } from "react-router-dom";
import LoginPage from "./login";
import MainPage from "./main";
import AddEventPage from "./addEvent";
import Tasks from "./taskPage";
import './index.css';

function App() {
  return (
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/addEvent" element={<AddEventPage />} />
        <Route path="/taskPage" element={<Tasks />}/>
        
      </Routes>
  );
}

export default App;

