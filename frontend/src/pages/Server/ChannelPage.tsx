import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Hash, Volume2 } from "lucide-react";

export default function ChannelPage() {
  const { channelId } = useParams<{ channelId: string }>();
  const [channel, setChannel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!channelId) return;
    setLoading(true);
    fetch(`http://localhost:5000/api/channels/${channelId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Channel not found");
        return res.json();
      })
      .then((data) => setChannel(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [channelId]);

  if (loading) return <div className="flex-1 flex items-center justify-center text-white">Loading channel...</div>;
  if (error || !channel) return <div className="flex-1 flex items-center justify-center text-red-400">Channel not found.</div>;

  return (
    <div className="flex flex-col flex-1 h-full">
      {/* Channel header */}
      <div className="flex items-center gap-2 px-6 py-4 border-b border-[#23272a] bg-[#313338] text-white text-xl font-semibold">
        {channel.type === "text" ? <Hash size={24} /> : <Volume2 size={24} />} {channel.name}
      </div>
      {/* Welcome message */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="bg-[#23272a] rounded-full p-6 mb-4">
            {channel.type === "text" ? <Hash size={48} /> : <Volume2 size={48} />}
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome to #{channel.name}!</h1>
          <p className="text-gray-400 mb-4">This is the start of the #{channel.name} channel.</p>
          <button className="text-[#5865f2] hover:underline text-sm font-medium">Edit Channel</button>
        </div>
      </div>
      {/* Message input area placeholder */}
      <div className="border-t border-[#23272a] px-6 py-4 bg-[#313338] flex items-center">
        <button className="mr-3 text-gray-400 hover:text-white text-xl">+</button>
        <input
          className="flex-1 bg-transparent outline-none text-white placeholder-gray-400 px-2 py-2"
          placeholder={`Message #${channel.name}`}
          disabled
        />
        <div className="flex items-center gap-3 ml-3">
          <span className="text-gray-400">GIF</span>
          <span className="text-gray-400">😀</span>
          <span className="text-gray-400">🎮</span>
        </div>
      </div>
    </div>
  );
} 