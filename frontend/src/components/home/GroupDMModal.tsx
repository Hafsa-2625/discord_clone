import React, { useState, useRef } from "react";
import { X, UserPlus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Friend {
  id: string;
  name: string;
}

interface GroupDMModalProps {
  open: boolean;
  onClose: () => void;
  friends: Friend[];
  onCreate: (selectedFriendIds: string[], groupName: string, groupImage: File | null) => void;
}

const maxSelectable = 9;

const GroupDMModal: React.FC<GroupDMModalProps> = ({ open, onClose, friends, onCreate }) => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Friend[]>([]);
  const [groupName, setGroupName] = useState("");
  const [groupImage, setGroupImage] = useState<File | null>(null);
  const [groupImagePreview, setGroupImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const filteredFriends = friends.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) && !selected.some(s => s.id === f.id)
  );

  const handleRemoveSelected = (id: string) => {
    setSelected(selected.filter(f => f.id !== id));
  };

  const handleAddSelected = (friend: Friend) => {
    if (selected.length < maxSelectable && !selected.some(f => f.id === friend.id)) {
      setSelected([...selected, friend]);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setGroupImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => setGroupImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setGroupImagePreview(null);
    }
  };

  // Default group name: comma-separated friend names
  const defaultGroupName = selected.map(f => f.name).join(", ");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-[#2b2d31] rounded-xl shadow-2xl w-full max-w-md p-6 relative animate-fade-in">
        <button className="absolute top-4 right-4 text-gray-400 hover:text-white" onClick={onClose}><X size={28} /></button>
        <div className="text-2xl font-bold mb-1 text-white">Select Friends</div>
        <div className="text-gray-400 mb-4">You can add {maxSelectable - selected.length} more friends.</div>
        {/* Search bar with chips for selected friends */}
        <div className="flex flex-wrap items-center gap-2 bg-[#23272a] rounded px-3 py-2 mb-4 min-h-[44px]">
          {selected.map(friend => (
            <span key={friend.id} className="flex items-center bg-[#404249] text-white rounded px-2 py-1 text-sm mr-1 mb-1">
              {friend.name}
              <button className="ml-1 text-gray-400 hover:text-white" onClick={() => handleRemoveSelected(friend.id)}><X size={14} /></button>
            </span>
          ))}
          <input
            type="text"
            placeholder={selected.length ? "" : "Type the username of a friend"}
            className="flex-1 bg-transparent text-white focus:outline-none min-w-[80px]"
            value={search}
            onChange={e => setSearch(e.target.value)}
            disabled={selected.length >= maxSelectable}
          />
        </div>
        {/* Friend list */}
        <div className="max-h-40 overflow-y-auto mb-4">
          {filteredFriends.length === 0 ? (
            <div className="text-gray-400 text-center">No friends found.</div>
          ) : (
            filteredFriends.map(friend => (
              <div
                key={friend.id}
                className="flex items-center gap-3 p-2 rounded-lg cursor-pointer mb-1 hover:bg-[#313338]"
                onClick={() => handleAddSelected(friend)}
              >
                <img src="/discord.png" alt="avatar" className="w-8 h-8 rounded-full bg-[#5865f2]" />
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-bold text-white truncate">{friend.name}</span>
                  <span className="text-xs text-gray-400 truncate">{friend.name.toLowerCase().replace(/\s+/g, '')}</span>
                </div>
                <input
                  type="checkbox"
                  checked={false}
                  readOnly
                  className="form-checkbox h-5 w-5 text-[#5865f2] rounded focus:ring-0 pointer-events-none"
                />
              </div>
            ))
          )}
        </div>
        {/* Group name and image section (only if more than 1 friend selected) */}
        {selected.length > 1 && (
          <div className="flex items-center gap-4 bg-[#23272a] rounded-lg p-4 mb-4">
            <div className="relative">
              <div
                className="w-14 h-14 rounded-full bg-[#404249] flex items-center justify-center text-gray-400 text-2xl cursor-pointer overflow-hidden"
                onClick={() => fileInputRef.current?.click()}
                title="Change group image"
              >
                {groupImagePreview ? (
                  <img src={groupImagePreview} alt="Group" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <UserPlus size={32} />
                )}
                <div className="absolute bottom-0 right-0 bg-[#5865f2] rounded-full p-1 border-2 border-[#23272a]">
                  <Pencil size={14} className="text-white" />
                </div>
              </div>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-400 mb-1">Group Name (optional)</div>
              <input
                type="text"
                className="w-full bg-[#23272a] border border-[#404249] rounded px-3 py-2 text-white focus:outline-none"
                placeholder={defaultGroupName}
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
              />
            </div>
          </div>
        )}
        <Button
          className="w-full mt-2 text-lg font-bold py-2"
          style={{ background: '#5865f2' }}
          disabled={selected.length < 2}
          onClick={() => onCreate(selected.map(f => f.id), groupName || defaultGroupName, groupImage)}
        >
          Create Group DM
        </Button>
      </div>
    </div>
  );
};

export default GroupDMModal; 