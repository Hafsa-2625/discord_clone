import React, { useEffect, useRef } from "react";

interface ChannelMessage {
  id?: number;
  user_id: number;
  content?: string;
  created_at?: string;
  userName?: string;
  file_url?: string;
  file_name?: string;
  file_type?: string;
}

interface ChannelMessageListProps {
  messages: ChannelMessage[];
  userId: number | string;
}

function isImageFile(type?: string) {
  return !!type && type.startsWith('image/');
}

const ChannelMessageList: React.FC<ChannelMessageListProps> = ({ messages, userId }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4 bg-[#313338]">
      {messages.map((msg, idx) => (
        <div
          key={msg.id || idx}
          className={`flex flex-col ${msg.user_id == userId ? 'items-end' : 'items-start'}`}
        >
          <span className="text-xs text-gray-400 mb-1">
            {msg.userName || (msg.user_id == userId ? 'You' : `User ${msg.user_id}`)}
          </span>
          {msg.file_url ? (
            <div className="bg-[#23272a] rounded-lg p-4 max-w-xs">
              {isImageFile(msg.file_type) ? (
                <img src={msg.file_url} alt={msg.file_name} className="rounded mb-2 max-w-full max-h-48" />
              ) : null}
              <a href={msg.file_url} target="_blank" rel="noopener noreferrer" className="block text-white text-sm mt-1">{msg.file_name}</a>
            </div>
          ) : (
            <div className={`px-4 py-2 rounded-lg ${msg.user_id == userId ? 'bg-[#5865f2] text-white' : 'bg-[#23272a] text-gray-200'}`}>{msg.content}</div>
          )}
          <span className="text-[10px] text-gray-500 mt-1 self-end">{msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
        </div>
      ))}
    </div>
  );
};

export default ChannelMessageList; 