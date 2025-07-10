import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Login failed");
      } else {
        localStorage.setItem('token', data.token);
        // Save user object to localStorage
        localStorage.setItem('user', JSON.stringify({ id: data.user.id, name: data.user.name, email: data.user.email }));
        navigate("/home");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#23272a] via-[#313338] to-[#5865f2]">
      <form onSubmit={handleSubmit} className="bg-[#23272a] p-8 rounded-2xl shadow-xl w-full max-w-md flex flex-col gap-6">
        <h2 className="text-3xl font-bold text-white mb-2">Log In</h2>
        {error && <div className="text-red-400 text-sm">{error}</div>}
        <input
          type="email"
          placeholder="Email"
          className="p-3 rounded bg-[#313338] text-white border border-[#5865f2] focus:outline-none focus:ring-2 focus:ring-[#5865f2]"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="p-3 rounded bg-[#313338] text-white border border-[#5865f2] focus:outline-none focus:ring-2 focus:ring-[#5865f2]"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <Button type="submit" className="w-full bg-[#5865f2] text-white font-bold rounded-full py-3" disabled={loading}>{loading ? "Logging in..." : "Log In"}</Button>
        <div className="text-gray-300 text-center">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#5865f2] hover:underline">Register</Link>
        </div>
      </form>
    </div>
  );
} 