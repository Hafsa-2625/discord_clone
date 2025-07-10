import React, { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DirectMessagesProps {
  dmList: { id: string, name: string }[];
  setActiveChat: (friend: { id: string, name: string }) => void;
  user: { id: string };
  friends: { id: string, name: string, status: string }[];
  socketRef: React.MutableRefObject<any>;
  setMessages: React.Dispatch<React.SetStateAction<{ senderId: string, message: string, createdAt?: string }[]>>;
  setDmList: React.Dispatch<React.SetStateAction<{ id: string, name: string }[]>>;
}

export default function DirectMessages({ dmList, setActiveChat, user, friends, socketRef, setMessages, setDmList }: DirectMessagesProps) {
  const [showDmModal, setShowDmModal] = useState(false);
  const [dmSearch, setDmSearch] = useState("");
  const filteredFriends = friends.filter(f => f.name.toLowerCase().includes(dmSearch.toLowerCase()));

  const handleStartDm = (friend: { id: string, name: string }) => {
    setActiveChat(friend);
    setShowDmModal(false);
    // Add to dmList if not already present
    setDmList(list => list.some(dm => dm.id === friend.id) ? list : [...list, friend]);
    if (socketRef.current) {
      socketRef.current.emit('fetch_dm_history', { userId: user.id, friendId: friend.id }, (history: Array<{ senderId: string, content: string, createdAt?: string }>) => {
        setMessages(history.map((m: { senderId: string, content: string, createdAt?: string }) => ({ senderId: m.senderId, message: m.content, createdAt: m.createdAt })));
      });
    }
  };

  return (
    <div>
      <div className="text-xs text-gray-400 mt-4 mb-1 flex items-center justify-between">
        <span>Direct Messages</span>
        <Button variant="ghost" className="justify-start gap-2 mb-1" onClick={() => setShowDmModal(true)}><Plus size={18} /></Button>
      </div>
      <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
        {dmList.map(dm => (
          <div
            key={dm.id}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#313338] cursor-pointer"
            onClick={() => handleStartDm(dm)}
          >
            <img src="/discord.png" alt="avatar" className="w-8 h-8 rounded-full bg-[#5865f2]" />
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
                    <img src="/discord.png" alt="avatar" className="w-8 h-8 rounded-full bg-[#5865f2]" />
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