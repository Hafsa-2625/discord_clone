import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function InviteJoinPage() {
  const { inviteCode } = useParams();
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleJoin = async () => {
    setJoining(true);
    setError("");
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const API_URL = import.meta.env.VITE_API_URL;
    const res = await fetch(`${API_URL}/api/invites/${inviteCode}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    });
    const data = await res.json();
    setJoining(false);
    if (data.success && data.server) {
      navigate(`/server/${data.server.id}`);
    } else {
      setError(data.error || "Failed to join server.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#313338] text-white">
      <h1 className="text-2xl font-bold mb-4">Join Server</h1>
      <button
        className="bg-[#5865f2] text-white px-6 py-2 rounded font-bold"
        onClick={handleJoin}
        disabled={joining}
      >
        {joining ? "Joining..." : "Join Server"}
      </button>
      {error && <div className="text-red-400 mt-2">{error}</div>}
    </div>
  );
} 