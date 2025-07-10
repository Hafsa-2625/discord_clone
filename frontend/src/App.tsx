import React from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { MessageCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Home from "./pages/Home/Home";
import "./App.css";

function LandingPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#23272a] via-[#313338] to-[#5865f2] text-white flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-2">
          {/* Logo Icon */}
          <span className="bg-[#5865f2] rounded-full p-0.5 mr-2">
            <img src="/discord.png" alt="Discord Logo" className="w-12 h-12" />
          </span>
          <span className="text-2xl font-extrabold tracking-wide">Discord</span>
        </div>
        <div className="hidden md:flex gap-8 text-lg font-medium">
          <a href="#" className="hover:text-[#5865f2] transition">Download</a>
          <a href="#" className="hover:text-[#5865f2] transition">Nitro</a>
          <a href="#" className="hover:text-[#5865f2] transition">Discover</a>
          <a href="#" className="hover:text-[#5865f2] transition">Safety</a>
          <a href="#" className="hover:text-[#5865f2] transition">Quests</a>
          <a href="#" className="hover:text-[#5865f2] transition">Support</a>
          <a href="#" className="hover:text-[#5865f2] transition">Blog</a>
          <a href="#" className="hover:text-[#5865f2] transition">Developers</a>
          <a href="#" className="hover:text-[#5865f2] transition">Careers</a>
        </div>
        <Button className="rounded-full px-6 py-2 bg-white text-[#23272a] font-bold hover:bg-[#5865f2] hover:text-white transition" onClick={() => navigate("/login")}>Log In</Button>
      </nav>
      {/* Hero Section */}
      <main className="flex flex-1 flex-col md:flex-row items-center justify-between px-8 md:px-24 py-12 gap-12">
        <div className="max-w-xl">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
            GROUP CHAT<br />THAT’S ALL<br />FUN & GAMES
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8">
            Discord is great for playing games and chilling with friends, or even building a worldwide community. Customize your own space to talk, play, and hang out.
          </p>
          <div className="flex gap-4">
            <Button className="bg-[#5865f2] text-white px-6 py-3 rounded-full text-lg font-bold hover:bg-[#4752c4] transition">Get Started</Button>
            <Button variant="outline" className="border-white text-black px-6 py-3 rounded-full text-lg font-bold hover:bg-black hover:text-white transition">Learn More</Button>
          </div>
        </div>
        {/* Illustration Placeholder */}
        <div className="flex flex-col items-center gap-6">
          <div className="bg-[#23272a] rounded-3xl shadow-2xl p-8 flex flex-col items-center">
            <MessageCircle size={64} className="mb-4 text-[#5865f2]" />
            <User size={48} className="mb-2 text-[#57f287]" />
            <span className="text-lg text-gray-300">Chat UI Illustration</span>
          </div>
          {/* Add more floating icons/characters for flair if needed */}
        </div>
      </main>
    </div>
  );
}

function PrivateRoute({ children }: React.PropsWithChildren) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
