import { Plus, Gift, Image, Smile, Gamepad2, Phone, Video, Paperclip } from "lucide-react";
import React from "react";

interface ChatWindowProps {
  activeChat: { id: string, name: string };
  messages: { senderId: string, message: string, createdAt?: string }[];
  newMessage: string;
  setNewMessage: (v: string) => void;
  user: { id: string };
  socketRef: React.MutableRefObject<any>;
  setMessages: React.Dispatch<React.SetStateAction<{ senderId: string, message: string, createdAt?: string }[]>>;
  dmList: { id: string, name: string }[];
  setDmList: React.Dispatch<React.SetStateAction<{ id: string, name: string }[]>>;
  setActiveChat: (v: null) => void;
}

export default function ChatWindow({ activeChat, messages, newMessage, setNewMessage, user, socketRef, setMessages, dmList, setDmList, setActiveChat }: ChatWindowProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center px-6 py-4 border-b border-[#23272a] bg-[#313338]">
        <img src="/discord.png" alt="avatar" className="w-8 h-8 rounded-full bg-[#5865f2] mr-3" />
        <span className="font-bold text-lg">{activeChat.name}</span>
        <div className="flex gap-2 ml-auto">
          <button className="p-2 hover:bg-[#23272a] rounded-full"><Phone size={20} /></button>
          <button className="p-2 hover:bg-[#23272a] rounded-full"><Video size={20} /></button>
          <button className="p-2 hover:bg-[#23272a] rounded-full"><Paperclip size={20} /></button>
        </div>
        <button className="ml-2 text-gray-400 hover:text-white" onClick={() => setActiveChat(null)}>&times;</button>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#313338]" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.senderId == user.id ? 'justify-end' : 'justify-start'}`}>
            <div className={`px-4 py-2 rounded-lg ${msg.senderId == user.id ? 'bg-[#5865f2] text-white' : 'bg-[#23272a] text-gray-200'}`}>{msg.message}</div>
          </div>
        ))}
      </div>
      <form
        className="flex items-center p-4 border-t border-[#23272a] bg-[#23272a]"
        onSubmit={e => {
          e.preventDefault();
          if (newMessage.trim() && socketRef.current) {
            socketRef.current.emit('send_dm', {
              senderId: user.id,
              receiverId: activeChat.id,
              message: newMessage
            });
            setMessages(msgs => [...msgs, { senderId: user.id, message: newMessage }]);
            // Add to dmList if not already present
            if (!dmList.some(dm => dm.id === activeChat.id)) {
              setDmList(list => [...list, { id: activeChat.id, name: activeChat.name }]);
            }
            setNewMessage('');
          }
        }}
      >
        <button type="button" className="p-2 hover:bg-[#313338] rounded-full"><Plus size={20} /></button>
        <input
          className="flex-1 bg-[#313338] rounded-full px-4 py-2 text-white focus:outline-none mx-2"
          placeholder={`Message @${activeChat.name}`}
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
} 