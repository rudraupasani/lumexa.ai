import { Router, Routes, Route } from "react-router-dom";
import ChatPAge from "../pages/ChatPage";
import LoginPage from "../components/Login";
import Home from "../pages/Home";
import Profile from "../pages/Profile";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<ChatPAge />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
}
