import React, { useEffect, useState } from "react";
import { useParams, Link, Outlet, useLocation } from "react-router-dom";
import { Hash, Calendar, Shield, Volume2, ChevronDown, Plus, Settings } from "lucide-react";
import Sidebar from "@/components/home/Sidebar";
import CreateChannelModal from "@/components/server/CreateChannelModal";
import ChannelSettingsModal from "@/components/server/ChannelSettingsModal";

export default function ServerPage() {
  const { id, channelId } = useParams<{ id: string; channelId?: string }>();
  const location = useLocation();
  const [server, setServer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"text" | "voice">("text");
  const [channels, setChannels] = useState<any[]>([]);
  const [channelsLoading, setChannelsLoading] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [settingsChannel, setSettingsChannel] = useState<any>(null);

  // Fetch server info
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`http://localhost:5000/api/servers/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Server not found");
        return res.json();
      })
      .then((data) => setServer(data.server))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  // Fetch channels for this server
  const fetchChannels = () => {
    if (!id) return;
    setChannelsLoading(true);
    fetch(`http://localhost:5000/api/channels/server/${id}`)
      .then((res) => res.json())
      .then((data) => setChannels(data))
      .catch(() => setChannels([]))
      .finally(() => setChannelsLoading(false));
  };
  useEffect(() => {
    fetchChannels();
    // eslint-disable-next-line
  }, [id]);

  // Split channels by type
  const textChannels = channels.filter((ch) => ch.type === "text");
  const voiceChannels = channels.filter((ch) => ch.type === "voice");

  // Handle channel creation
  const handleCreateChannel = async ({ type, name, isPrivate }: { type: "text" | "voice"; name: string; isPrivate: boolean }) => {
    if (!id) return;
    try {
      await fetch("http://localhost:5000/api/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serverId: id, name, type }),
      });
      setModalOpen(false);
      fetchChannels();
    } catch (err) {
      alert("Failed to create channel");
    }
  };

  // Save channel changes
  const handleSaveChannel = async (data: { name: string; topic: string }) => {
    if (!settingsChannel) return;
    try {
      await fetch(`http://localhost:5000/api/channels/${settingsChannel.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setSettingsModalOpen(false);
      fetchChannels();
    } catch (err) {
      alert("Failed to update channel");
    }
  };
  // Delete channel
  const handleDeleteChannel = async () => {
    if (!settingsChannel) return;
    try {
      await fetch(`http://localhost:5000/api/channels/${settingsChannel.id}`, {
        method: "DELETE"
      });
      setSettingsModalOpen(false);
      fetchChannels();
    } catch (err) {
      alert("Failed to delete channel");
    }
  };

  // Helper to check if a channel is selected
  const isChannelSelected = (chId: any) => channelId && String(channelId) === String(chId);

  if (loading) return <div className="p-8 text-white">Loading server...</div>;
  if (error) return <div className="p-8 text-red-400">{error}</div>;
  if (!server) return <div className="p-8 text-white">Server not found.</div>;

  return (
    <div className="flex min-h-screen bg-[#313338] text-white">
      <Sidebar onAddServer={() => {}} />
      {/* Channel List */}
      <nav className="w-72 bg-[#23272a] flex flex-col py-4 px-2 border-r border-[#23272a] min-h-screen">
        {/* Server Name Dropdown */}
        <div className="flex items-center gap-2 mb-4 px-2">
          <span className="font-semibold text-lg truncate">{server.name}</span>
          <ChevronDown size={20} />
        </div>
        {/* Events and Server Boosts */}
        <button className="flex items-center gap-2 px-2 py-2 hover:bg-[#2b2d31] rounded">
          <Calendar size={18} /> Events
        </button>
        <button className="flex items-center gap-2 px-2 py-2 hover:bg-[#2b2d31] rounded mb-4">
          <Shield size={18} /> Server Boosts
        </button>
        {/* Text Channels */}
        <div className="mb-2 mt-2">
          <div className="flex items-center justify-between px-2 text-gray-400 text-xs uppercase mb-1">
            <span>Text Channels</span>
            <button className="hover:text-white" onClick={() => { setModalType("text"); setModalOpen(true); }}><Plus size={16} /></button>
          </div>
          {channelsLoading ? (
            <div className="text-xs text-gray-400 px-2 py-1">Loading...</div>
          ) : textChannels.length === 0 ? (
            <div className="text-xs text-gray-400 px-2 py-1">No text channels</div>
          ) : textChannels.map((ch) => (
            <div key={ch.id} className="flex items-center group">
              <Link
                to={`/server/${id}/channel/${ch.id}`}
                className={`flex-1 flex items-center gap-2 px-2 py-2 rounded font-medium mb-1 bg-[#23272a] hover:bg-[#383a40] text-gray-400 ${isChannelSelected(ch.id) ? "bg-[#383a40] text-white" : ""}`}
              >
                <Hash size={18} /> {ch.name}
              </Link>
              <button
                className="ml-1 p-1 text-gray-400 hover:text-white opacity-70 group-hover:opacity-100"
                onClick={() => { setSettingsChannel(ch); setSettingsModalOpen(true); }}
              >
                <Settings size={16} />
              </button>
            </div>
          ))}
        </div>
        {/* Voice Channels */}
        <div className="mb-2 mt-4">
          <div className="flex items-center justify-between px-2 text-gray-400 text-xs uppercase mb-1">
            <span>Voice Channels</span>
            <button className="hover:text-white" onClick={() => { setModalType("voice"); setModalOpen(true); }}><Plus size={16} /></button>
          </div>
          {channelsLoading ? (
            <div className="text-xs text-gray-400 px-2 py-1">Loading...</div>
          ) : voiceChannels.length === 0 ? (
            <div className="text-xs text-gray-400 px-2 py-1">No voice channels</div>
          ) : voiceChannels.map((ch) => (
            <div key={ch.id} className="flex items-center group">
              <Link
                to={`/server/${id}/channel/${ch.id}`}
                className={`flex-1 flex items-center gap-2 px-2 py-2 rounded hover:bg-[#383a40] mb-1 text-gray-400 ${isChannelSelected(ch.id) ? "bg-[#383a40] text-white" : ""}`}
              >
                <Volume2 size={18} /> {ch.name}
              </Link>
              <button
                className="ml-1 p-1 text-gray-400 hover:text-white opacity-70 group-hover:opacity-100"
                onClick={() => { setSettingsChannel(ch); setSettingsModalOpen(true); }}
              >
                <Settings size={16} />
              </button>
            </div>
          ))}
        </div>
      </nav>

      {/* Main Content: Render nested channel page */}
      <main className="flex-1 flex flex-col bg-[#313338] min-h-screen">
        <Outlet />
      </main>
      <CreateChannelModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreateChannel}
        defaultType={modalType}
      />
      <ChannelSettingsModal
        open={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        channel={settingsChannel}
        onSave={handleSaveChannel}
        onDelete={handleDeleteChannel}
      />
    </div>
  );
} 