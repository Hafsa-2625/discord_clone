import { X, Gift, Image, Smile, Gamepad2, Upload, BarChart2, Grid, Phone, Video, Paperclip, Plus } from "lucide-react";
import React, { useRef, useState, useEffect } from "react";

interface Member {
  id: string;
  name: string;
  imageUrl?: string;
}

interface FileMessage {
  url: string;
  name: string;
  type: string;
}

interface ChatMessage {
  senderId: string;
  senderName?: string;
  message: string;
  createdAt?: string;
  file?: FileMessage;
}

interface GroupDMChatWindowProps {
  group: { id: string | number; name: string; imageUrl?: string };
  members: Member[];
  onClose: () => void;
  messages: ChatMessage[];
  newMessage: string;
  setNewMessage: (v: string) => void;
  user: { id: string; name: string };
  socketRef: React.MutableRefObject<any>;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

function isImageFile(type: string) {
  return type.startsWith('image/');
}

function DmPlusMenu({ onUploadFile, onClose }: { onUploadFile: () => void; onClose: () => void }) {
  return (
    <div className="absolute bottom-16 left-4 z-50 bg-[#23272a] rounded-xl shadow-lg py-2 w-56 flex flex-col gap-1 border border-[#383a40] animate-fade-in">
      <button className="flex items-center gap-3 px-4 py-3 hover:bg-[#313338] text-white text-base font-medium rounded transition" onClick={() => { onUploadFile(); onClose(); }}>
        <Upload size={20} /> Upload a File
      </button>
      <button className="flex items-center gap-3 px-4 py-3 hover:bg-[#313338] text-white text-base font-medium rounded transition" onClick={onClose}>
        <BarChart2 size={20} /> Create Poll
      </button>
      <button className="flex items-center gap-3 px-4 py-3 hover:bg-[#313338] text-white text-base font-medium rounded transition" onClick={onClose}>
        <Grid size={20} /> Use Apps
      </button>
    </div>
  );
}

const GroupDMChatWindow: React.FC<GroupDMChatWindowProps> = ({ group, members, onClose, messages, newMessage, setNewMessage, user, socketRef, setMessages }) => {
  const [plusMenuOpen, setPlusMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch messages and join group DM room on mount or group change
  useEffect(() => {
    if (!group || !group.id) return;
    // Fetch messages
    fetch(`http://localhost:5000/api/group-dms/${group.id}/messages`)
      .then(res => res.json())
      .then(data => setMessages(data.messages.map((m: any) => {
        if (m.type === 'text') {
          return {
            senderId: m.senderId.toString(),
            senderName: m.senderName,
            message: m.content,
            createdAt: m.createdAt,
          };
        } else if (m.type === 'file') {
          return {
            senderId: m.senderId.toString(),
            senderName: m.senderName,
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
      }).filter(Boolean)));
    // Join group DM room
    if (socketRef.current) {
      socketRef.current.emit('join_group_dm', group.id);
    }
    // Listen for new group messages
    const handler = (msg: any) => {
      setMessages(msgs => [...msgs, {
        senderId: msg.senderId.toString(),
        senderName: msg.senderName,
        message: msg.content,
        createdAt: msg.createdAt,
      }]);
    };
    if (socketRef.current) {
      socketRef.current.on('receive_group_dm', handler);
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.off('receive_group_dm', handler);
      }
      setMessages([]);
    };
  }, [group?.id]);

  // Handle file selection and upload for group DM
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('groupDmId', group.id.toString());
      formData.append('senderId', user.id);
      formData.append('senderName', user.name);
      const res = await fetch('http://localhost:5000/api/group-dms/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.attachment) {
        setMessages(msgs => [
          ...msgs,
          {
            senderId: user.id,
            senderName: user.name,
            message: '',
            file: {
              url: data.attachment.fileUrl,
              name: data.attachment.fileName,
              type: data.attachment.fileType,
            },
            createdAt: data.attachment.createdAt,
          },
        ]);
      }
    } catch (err) {
      alert('Failed to upload file: ' + (err as any).message);
    }
  };

  // Close menu on click outside
  useEffect(() => {
    if (!plusMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".dm-plus-menu-trigger")) {
        setPlusMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [plusMenuOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    if (!socketRef.current) return;
    socketRef.current.emit('send_group_dm', {
      groupDmId: group.id,
      senderId: user.id,
      senderName: user.name,
      content: newMessage,
    });
    setNewMessage('');
    // Do NOT update setMessages here! Only update in socket event handler.
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Top Bar */}
      <div className="flex items-center px-6 py-4 border-b border-[#23272a] bg-[#313338]">
        {group.imageUrl ? (
          <img src={group.imageUrl} alt={group.name} className="w-8 h-8 rounded-full bg-[#5865f2] mr-3" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#5865f2] mr-3 flex items-center justify-center text-lg font-bold text-white">
            {group.name[0]}
          </div>
        )}
        <span className="font-bold text-lg">{group.name}</span>
        <div className="flex gap-2 ml-auto">
          <button className="p-2 hover:bg-[#23272a] rounded-full"><Phone size={20} /></button>
          <button className="p-2 hover:bg-[#23272a] rounded-full"><Video size={20} /></button>
          <button className="p-2 hover:bg-[#23272a] rounded-full"><Paperclip size={20} /></button>
        </div>
        <button className="ml-2 text-gray-400 hover:text-white" onClick={onClose}><X size={24} /></button>
      </div>
      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4 bg-[#313338]">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.senderId == user.id ? 'items-end' : 'items-start'}`}>
            <span className="text-xs text-gray-400 mb-1">{msg.senderName || (msg.senderId == user.id ? 'You' : 'Unknown')}</span>
            {msg.file ? (
              <div className="bg-[#23272a] rounded-lg p-4 max-w-xs">
                {isImageFile(msg.file.type) ? (
                  <img src={msg.file.url} alt={msg.file.name} className="rounded mb-2 max-w-full max-h-48" />
                ) : null}
                <a href={msg.file.url} target="_blank" rel="noopener noreferrer" className="block text-white text-sm mt-1">{msg.file.name}</a>
              </div>
            ) : (
              <div className={`px-4 py-2 rounded-lg ${msg.senderId == user.id ? 'bg-[#5865f2] text-white' : 'bg-[#23272a] text-gray-200'}`}>{msg.message}</div>
            )}
            <span className="text-[10px] text-gray-500 mt-1 self-end">{msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
          </div>
        ))}
      </div>
      {/* Bottom Bar */}
      <form
        className="flex items-center p-4 border-t border-[#23272a] bg-[#23272a] relative"
        onSubmit={handleSend}
      >
        <div className="dm-plus-menu-trigger relative">
          <button type="button" className="p-2 hover:bg-[#313338] rounded-full" onClick={() => setPlusMenuOpen(v => !v)}>
            <Plus size={20} />
          </button>
          {plusMenuOpen && (
            <DmPlusMenu
              onUploadFile={() => fileInputRef.current?.click()}
              onClose={() => setPlusMenuOpen(false)}
            />
          )}
        </div>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileSelect}
          accept="image/*,application/pdf,application/zip,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
        />
        <input
          className="flex-1 bg-[#313338] rounded-full px-4 py-2 text-white focus:outline-none mx-2"
          placeholder={`Message @${group.name}`}
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
        />
        <div className="flex gap-1">
          <button type="button" className="p-2 hover:bg-[#313338] rounded-full"><Gift size={20} /></button>
          <button type="button" className="p-2 hover:bg-[#313338] rounded-full"><Image size={20} /></button>
          <button type="button" className="p-2 hover:bg-[#313338] rounded-full"><Smile size={20} /></button>
          <button type="button" className="p-2 hover:bg-[#313338] rounded-full"><Gamepad2 size={20} /></button>
        </div>
        <button type="submit" className="ml-2 px-4 py-2 bg-[#5865f2] text-white rounded-lg font-bold">Send</button>
      </form>
    </div>
  );
};

export default GroupDMChatWindow; 