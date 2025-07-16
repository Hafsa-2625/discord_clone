import React, { useState } from "react";
import { Hash, X, UserPlus, Search } from "lucide-react";

interface Friend {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface InviteToChannelModalProps {
  open: boolean;
  onClose: () => void;
  channel: any;
  serverName: string;
  friends: Friend[];
}

const InviteToChannelModal: React.FC<InviteToChannelModalProps> = ({ open, onClose, channel, serverName, friends }) => {
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);
  const [invited, setInvited] = useState<{ [id: string]: boolean }>({});
  const [loading, setLoading] = useState<{ [id: string]: boolean }>({});
  const inviteLink = `https://yourapp.com/invite/${channel?.id || ""}`;

  if (!open) return null;

  // Filter friends by search
  const filteredFriends = friends.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleInvite = async (friendId: string) => {
    if (!channel || !channel.id || isNaN(Number(channel.id))) {
      alert('Channel not loaded. Please try again.');
      return;
    }
    setLoading(l => ({ ...l, [friendId]: true }));
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      await fetch(`http://localhost:5000/api/channels/${channel.id}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteeId: Number(friendId), inviterId: Number(user.id) }),
      });
      setInvited(i => ({ ...i, [friendId]: true }));
    } catch (e) {
      // Optionally show error
    } finally {
      setLoading(l => ({ ...l, [friendId]: false }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-[#23272a] rounded-lg shadow-lg w-full max-w-lg p-0 relative">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#383a40]">
          <div>
            <div className="text-lg font-bold text-white">Invite friends to {serverName}</div>
            <div className="flex items-center gap-2 text-gray-400 text-base mt-1">
              <Hash size={18} /> {channel?.name}
            </div>
          </div>
          <button className="text-gray-400 hover:text-white text-2xl" onClick={onClose}><X size={24} /></button>
        </div>
        {/* Search */}
        <div className="px-6 py-4 border-b border-[#383a40]">
          <div className="relative">
            <input
              className="w-full px-4 py-2 rounded bg-[#313338] text-white placeholder-gray-400 pr-10"
              placeholder="Search for friends"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        {/* Friends List */}
        <div className="px-6 py-4 max-h-64 overflow-y-auto border-b border-[#383a40]">
          {filteredFriends.length === 0 ? (
            <div className="text-gray-400 text-center py-8">No friends found.</div>
          ) : (
            filteredFriends.map(friend => (
              <div key={friend.id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <img
                    src={friend.avatarUrl || "/discord.png"}
                    alt={friend.name}
                    className="w-8 h-8 rounded-full bg-[#5865f2]"
                  />
                  <span className="text-white font-medium">{friend.name}</span>
                </div>
                <button
                  className="px-4 py-1 rounded border border-green-500 text-green-400 font-semibold hover:bg-green-500 hover:text-white transition text-sm disabled:opacity-60"
                  disabled={!!invited[friend.id] || loading[friend.id] || !channel || !channel.id || isNaN(Number(channel.id))}
                  onClick={() => handleInvite(friend.id)}
                >
                  {invited[friend.id] ? "Invited!" : loading[friend.id] ? "Inviting..." : "Invite"}
                </button>
              </div>
            ))
          )}
        </div>
        {/* Invite Link */}
        <div className="px-6 py-5 bg-[#23272a] rounded-b-lg">
          <div className="text-gray-400 text-sm mb-2">Or, Send A Server Invite Link To A Friend</div>
          <div className="flex items-center gap-2">
            <input
              className="flex-1 px-3 py-2 rounded bg-[#313338] text-white text-sm"
              value={inviteLink}
              readOnly
            />
            <button
              className="bg-[#5865f2] text-white px-4 py-2 rounded font-semibold text-sm"
              onClick={handleCopy}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-2">Your invite link expires in 7 days. <span className="underline cursor-pointer">Edit invite link.</span></div>
        </div>
      </div>
    </div>
  );
};

export default InviteToChannelModal; 