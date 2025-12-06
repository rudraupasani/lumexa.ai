import { Router, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import About from "../pages/About";
import ChatPAge from "../pages/ChatPage";
import LoginPage from "../components/Login";

export default function AppRouter() {
  return (
      <Routes>
        <Route path="/" element={<ChatPAge />} />
        <Route path="/about" element={<LoginPage />} />
      </Routes>
  );
}
