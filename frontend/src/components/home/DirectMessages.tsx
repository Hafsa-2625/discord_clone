import React, { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProfilePicture from "@/components/ui/ProfilePicture";

interface DirectMessagesProps {
  dmList: { id: string, name: string, profilePicture?: string }[];
  setActiveChat: (chat: { id: string, name: string, profilePicture?: string } | null) => void;
  user: { id: string, name: string, profilePicture?: string };
  friends: { id: string, name: string, status: string, profilePicture?: string }[];
  setMessages: React.Dispatch<React.SetStateAction<{ senderId: string, message: string, createdAt?: string }[]>>;
  setDmList: React.Dispatch<React.SetStateAction<{ id: string, name: string, profilePicture?: string }[]>>;
}

export default function DirectMessages({ dmList, setActiveChat, user, friends, setMessages, setDmList }: DirectMessagesProps) {
  const [showDmModal, setShowDmModal] = useState(false);
  const [dmSearch, setDmSearch] = useState("");
  const filteredFriends = friends.filter(f => f.name.toLowerCase().includes(dmSearch.toLowerCase()));

  const handleStartDm = async (friend: { id: string, name: string, profilePicture?: string }) => {
    setActiveChat(friend);
    setShowDmModal(false);
    // Add to dmList if not already present
    setDmList(list => list.some(dm => dm.id === friend.id) ? list : [...list, friend]);
    // Fetch all DM sessions for this user
    const API_URL = import.meta.env.VITE_API_URL;
    const res = await fetch(`${API_URL}/api/dms/list?userId=${user.id}`);
    const sessions = await res.json();
    // Find the session for this friend
    const session = sessions.find((s: any) =>
      (s.user1Id == user.id && s.user2Id == friend.id) ||
      (s.user2Id == user.id && s.user1Id == friend.id)
    );
    if (session) {
      // Fetch all messages (text and files) for this session
      const msgRes = await fetch(`${API_URL}/api/dms/${session.id}/messages`);
      const allMessages = await msgRes.json();
      // Map to ChatWindow format
      setMessages(allMessages.map((m: any) => {
        if (m.type === 'text') {
          return { senderId: m.senderId.toString(), message: m.content, createdAt: m.createdAt };
        } else if (m.type === 'file') {
          return {
            senderId: m.senderId.toString(),
            message: '',
            createdAt: m.createdAt,
            file: {
              url: m.fileUrl,
              name: m.fileName,
              type: m.fileType,
            },
          };
        }
        return null;
      }).filter(Boolean));
    } else {
      setMessages([]);
    }
  };

  return (
    <div>
      <div className="text-xs text-gray-400 mt-4 mb-1 flex items-center justify-between">
        <span>Direct Messages</span>
        <Button variant="ghost" className="justify-start gap-2 mb-1" onClick={() => setShowDmModal(true)}><Plus size={18} /></Button>
      </div>
      <div className="flex flex-col gap-2">
        {dmList.map(dm => (
          <div
            key={dm.id}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#313338] cursor-pointer"
            onClick={() => handleStartDm(dm)}
          >
            <ProfilePicture 
              src={dm.profilePicture} 
              alt={`${dm.name}'s profile`} 
              size="sm" 
            />
            <span className="font-bold">{dm.name}</span>
          </div>
        ))}
      </div>
      {/* DM Modal */}
      {showDmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#23272a] rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center gap-2 mb-4">
              <Search size={20} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search friends to DM"
                className="bg-[#23272a] rounded px-3 py-1 text-white focus:outline-none flex-1"
                value={dmSearch}
                onChange={e => setDmSearch(e.target.value)}
              />
            </div>
            <div className="max-h-60 overflow-y-auto">
              {filteredFriends.length === 0 ? (
                <div className="text-gray-400 text-center">No friends found.</div>
              ) : (
                filteredFriends.map(friend => (
                  <div
                    key={friend.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#313338] cursor-pointer"
                    onClick={() => handleStartDm(friend)}
                  >
                    <ProfilePicture 
                      src={friend.profilePicture} 
                      alt={`${friend.name}'s profile`} 
                      size="sm" 
                    />
                    <span className="font-bold">{friend.name}</span>
                  </div>
                ))
              )}
            </div>
            <div className="flex justify-end mt-4">
              <Button variant="secondary" onClick={() => setShowDmModal(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 