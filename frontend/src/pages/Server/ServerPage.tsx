import React, { useEffect, useState } from "react";
import { useParams, Link, Outlet, useLocation } from "react-router-dom";
import { Hash, Calendar, Shield, Volume2, ChevronDown, Plus, Settings, UserPlus } from "lucide-react";
import Sidebar from "@/components/home/Sidebar";
import CreateChannelModal from "@/components/server/CreateChannelModal";
import ChannelSettingsModal from "@/components/server/ChannelSettingsModal";
import UserProfileBar from "@/components/home/UserProfileBar";
import InviteLinkModal from "@/components/server/InviteLinkModal";
import { useRef } from "react";

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
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

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
    <div className="flex h-screen bg-[#313338] text-white">
      <Sidebar onAddServer={() => {}} />
      {/* Channel List */}
      <nav className="w-72 bg-[#23272a] flex flex-col py-4 px-2 border-r border-[#23272a] h-full">
        {/* Server Name Dropdown */}
        <div className="flex items-center gap-2 mb-4 px-2 relative">
          <span className="font-semibold text-lg truncate">{server?.name}</span>
          <button
            className="p-1 rounded hover:bg-[#23272a]"
            onClick={() => setDropdownOpen((v) => !v)}
          >
            <ChevronDown size={20} />
          </button>
          {dropdownOpen && (
            <div
              ref={dropdownRef}
              className="absolute left-0 top-10 z-50 min-w-[200px] bg-[#202225] rounded-lg shadow-lg p-2"
            >
              <button
                className="flex items-center gap-2 w-full px-3 py-2 hover:bg-[#5865f2] rounded text-white text-left"
                onClick={() => {
                  setInviteModalOpen(true);
                  setDropdownOpen(false);
                }}
              >
                <UserPlus size={18} /> Invite People
              </button>
              {/* Add more menu items here if needed */}
            </div>
          )}
        </div>
        {/* Events and Server Boosts */}
        <button className="flex items-center gap-2 px-2 py-2 hover:bg-[#2b2d31] rounded">
          <Calendar size={18} /> Events
        </button>
        <button className="flex items-center gap-2 px-2 py-2 hover:bg-[#2b2d31] rounded mb-4">
          <Shield size={18} /> Server Boosts
        </button>
        {/* Channel List Scrollable Area */}
        <div className="flex-1 min-h-0 overflow-y-auto pr-1">
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
        </div>
        <div className="flex-1" />
        <UserProfileBar
          user={user}
          showProfileMenu={showProfileMenu}
          setShowProfileMenu={setShowProfileMenu}
          handleLogout={handleLogout}
        />
      </nav>

      {/* Main Content: Render nested channel page */}
      <main className="flex-1 flex flex-col h-full min-h-0">
        <div className="flex-1 min-h-0 overflow-y-auto">
          <Outlet />
        </div>
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
      {inviteModalOpen && (
        <InviteLinkModal
          serverId={server?.id}
          onClose={() => setInviteModalOpen(false)}
        />
      )}
    </div>
  );
} 