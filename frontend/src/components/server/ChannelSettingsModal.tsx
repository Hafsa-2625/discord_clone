import React, { useState, useEffect } from "react";
import { X, Trash2 } from "lucide-react";

const sidebarItems = [
  { key: "overview", label: "Overview" },
  { key: "permissions", label: "Permissions" },
  { key: "invites", label: "Invites" },
  { key: "integrations", label: "Integrations" },
];

interface ChannelSettingsModalProps {
  open: boolean;
  onClose: () => void;
  channel: any;
  onSave: (data: { name: string; topic: string }) => void;
  onDelete: () => void;
}

export default function ChannelSettingsModal({ open, onClose, channel, onSave, onDelete }: ChannelSettingsModalProps) {
  const [selected, setSelected] = useState("overview");
  const [name, setName] = useState(channel?.name || "");
  const [topic, setTopic] = useState(channel?.topic || "");

  useEffect(() => {
    if (open) {
      setSelected("overview");
      setName(channel?.name || "");
      setTopic(channel?.topic || "");
    }
  }, [open, channel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="relative bg-[#23272a] rounded-2xl shadow-2xl w-[800px] max-w-full h-[600px] flex">
        {/* Sidebar */}
        <div className="w-64 bg-[#1e1f22] rounded-l-2xl flex flex-col py-8 px-4 border-r border-[#23272a]">
          <div className="mb-6">
            <div className="text-xs text-gray-400 mb-1 uppercase tracking-widest"># {channel.name} <span className="ml-1 text-[10px] font-bold">{channel.type === "text" ? "TEXT CHANNELS" : "VOICE CHANNELS"}</span></div>
          </div>
          <div className="flex flex-col gap-1 mb-4">
            {sidebarItems.map((item) => (
              <button
                key={item.key}
                className={`text-left px-3 py-2 rounded font-medium text-sm transition ${selected === item.key ? "bg-[#313338] text-white" : "text-gray-300 hover:bg-[#23272a]"}`}
                onClick={() => setSelected(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="mt-auto pt-4 border-t border-[#23272a]">
            <button
              className="flex items-center gap-2 text-red-500 hover:bg-[#2b2d31] px-3 py-2 rounded w-full font-medium text-sm"
              onClick={onDelete}
            >
              Delete Channel <Trash2 size={16} />
            </button>
          </div>
        </div>
        {/* Main Content */}
        <div className="flex-1 flex flex-col p-10 relative overflow-y-auto">
          {/* Close button */}
          <button className="absolute top-6 right-8 text-gray-300 hover:text-white flex flex-col items-center" onClick={onClose}>
            <X size={32} />
            <span className="text-xs mt-1">ESC</span>
          </button>
          {selected === "overview" && (
            <>
              <h2 className="text-2xl font-bold mb-8">Overview</h2>
              <div className="mb-8">
                <label className="block text-sm font-semibold mb-2">Channel Name</label>
                <input
                  className="w-full bg-[#1e1f22] border border-[#23272a] rounded px-4 py-2 text-white outline-none focus:border-[#5865f2]"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
              <div className="mb-8">
                <label className="block text-sm font-semibold mb-2">Channel Topic</label>
                <div className="bg-[#1e1f22] border border-[#23272a] rounded-t px-4 py-2 flex items-center gap-2">
                  <button className="text-gray-400 hover:text-white font-bold">B</button>
                  <button className="text-gray-400 hover:text-white italic font-bold">I</button>
                  <button className="text-gray-400 hover:text-white font-bold">S</button>
                  <button className="text-gray-400 hover:text-white font-bold">↺</button>
                  <button className="text-gray-400 hover:text-white font-bold">👁️</button>
                  <button className="ml-auto text-gray-400 hover:text-white font-bold">😊</button>
                </div>
                <textarea
                  className="w-full h-32 bg-[#1e1f22] border-x border-b border-[#23272a] rounded-b px-4 py-2 text-white outline-none resize-none"
                  placeholder="Let everyone know how to use this channel!"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  maxLength={1024}
                />
                <div className="text-right text-xs text-gray-400 mt-1">{topic.length}/1024</div>
              </div>
              <div className="flex justify-end">
                <button
                  className="bg-[#5865f2] hover:bg-[#4752c4] text-white font-semibold px-6 py-2 rounded transition"
                  onClick={() => onSave({ name, topic })}
                  disabled={name.trim().length === 0}
                >
                  Save Changes
                </button>
              </div>
            </>
          )}
          {selected !== "overview" && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <span className="text-lg">{sidebarItems.find(i => i.key === selected)?.label} settings coming soon...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 