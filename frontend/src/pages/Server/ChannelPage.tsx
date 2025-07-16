import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { Hash, Volume2, UserPlus } from "lucide-react";
import InviteToChannelModal from "@/components/server/InviteToChannelModal";
import { useFriendsList } from "@/hooks/useFriendsList";
import ChannelMessageList from "@/components/server/ChannelMessageList";
import { useChannelSocket } from "@/hooks/useChannelSocket";

export default function ChannelPage() {
  const { channelId } = useParams<{ channelId: string }>();
  const [channel, setChannel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // Get user and friends
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const { friends } = useFriendsList(user.id, "all");

  // Fetch channel info
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

  // Fetch channel messages and attachments
  useEffect(() => {
    if (!channelId) return;
    Promise.all([
      fetch(`http://localhost:5000/api/channels/${channelId}/messages`).then(res => res.json()),
      fetch(`http://localhost:5000/api/channels/${channelId}/attachments`).then(res => res.json()),
    ])
      .then(([msgs, atts]) => {
        // Normalize both arrays to have created_at and sort
        const all = [
          ...msgs.map((m: any) => ({ ...m, created_at: m.created_at, type: 'message' })),
          ...atts.map((a: any) => ({ ...a, created_at: a.created_at, type: 'attachment' })),
        ];
        all.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        setMessages(all);
      })
      .catch(() => setMessages([]));
  }, [channelId]);

  // Real-time socket logic
  const handleReceiveMessage = useCallback((msg: any) => {
    setMessages(msgs => [...msgs, msg]);
  }, []);
  const { socketRef } = useChannelSocket(channelId || "", handleReceiveMessage);

  // Send message handler
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socketRef.current) return;
    const msgObj = {
      channelId,
      userId: user.id,
      content: newMessage.trim(),
    };
    socketRef.current.emit('send_channel_message', msgObj);
    setNewMessage("");
  };

  // File upload handler
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !channelId) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', user.id);
      const res = await fetch(`http://localhost:5000/api/channels/${channelId}/attachments`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data && data.file_url) {
        setMessages(msgs => [
          ...msgs,
          data
        ]);
      } else if (data && data.attachment) {
        setMessages(msgs => [
          ...msgs,
          data.attachment
        ]);
      }
    } catch (err) {
      alert('Failed to upload file');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (loading) return <div className="flex-1 flex items-center justify-center text-white">Loading channel...</div>;
  if (error || !channel) return <div className="flex-1 flex items-center justify-center text-red-400">Channel not found.</div>;

  // Use channel.serverName or fallback
  const serverName = channel?.serverName || "Server";

  return (
    <div className="flex flex-col h-full min-h-0 flex-1">
      {/* Channel header */}
      <div className="flex items-center gap-2 px-6 py-4 border-b border-[#23272a] bg-[#313338] text-white text-xl font-semibold">
        {channel.type === "text" ? <Hash size={24} /> : <Volume2 size={24} />} {channel.name}
        <button
          className="ml-2 p-1 rounded hover:bg-[#23272a]"
          title="Invite Users"
          onClick={() => setShowInviteModal(true)}
        >
          <UserPlus size={20} />
        </button>
      </div>
      <InviteToChannelModal
        open={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        channel={channel}
        serverName={serverName}
        friends={friends}
      />
      {/* Chat/message area with its own scroll */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <ChannelMessageList messages={messages} userId={user.id} />
      </div>
      {/* Input area always at the bottom */}
      <form onSubmit={handleSend} className="flex items-center gap-2 px-6 py-4 border-t border-[#23272a] bg-[#313338]">
        <div className="relative">
          <button type="button" className="mr-3 text-gray-400 hover:text-white text-xl" onClick={() => fileInputRef.current?.click()} disabled={uploading}>+</button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileSelect}
            accept="image/*,application/pdf,application/zip,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
          />
        </div>
        <input
          className="flex-1 bg-transparent outline-none text-white placeholder-gray-400 px-2 py-2"
          placeholder={`Message #${channel.name}`}
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          disabled={uploading}
        />
        <div className="flex items-center gap-3 ml-3">
          <span className="text-gray-400">GIF</span>
          <span className="text-gray-400">😀</span>
          <span className="text-gray-400">🎮</span>
        </div>
        <button type="submit" className="ml-3 px-4 py-2 bg-[#5865f2] text-white rounded-lg font-bold" disabled={uploading || !newMessage.trim()}>Send</button>
      </form>
    </div>
  );
} 