import React, { useState, useEffect } from "react";
import { X, Hash, Volume2, Lock } from "lucide-react";

interface CreateChannelModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: { type: "text" | "voice"; name: string; isPrivate: boolean }) => void;
  defaultType?: "text" | "voice";
}

export default function CreateChannelModal({ open, onClose, onCreate, defaultType = "text" }: CreateChannelModalProps) {
  const [type, setType] = useState<"text" | "voice">(defaultType);
  const [name, setName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    if (open) {
      setType(defaultType);
      setName("");
      setIsPrivate(false);
    }
  }, [open, defaultType]);

  if (!open) return null;

  const isValid = name.trim().length > 0 && /^[a-z0-9-_]+$/i.test(name.trim());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="relative bg-[#313338] rounded-2xl shadow-lg w-full max-w-lg p-8 flex flex-col">
        {/* Close button */}
        <button className="absolute top-4 right-4 text-gray-300 hover:text-white" onClick={onClose}>
          <X size={28} />
        </button>
        <h2 className="text-2xl font-bold mb-1">Create Channel</h2>
        {/* Channel Type */}
        <div className="mb-6">
          <div className="font-semibold text-sm mb-2">Channel Type</div>
          <div className="flex gap-4">
            <button
              className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${type === "text" ? "bg-[#404249] border-[#5865f2]" : "bg-[#23272a] border-transparent hover:bg-[#383a40]"}`}
              onClick={() => setType("text")}
            >
              <span className={`w-6 h-6 flex items-center justify-center rounded-full ${type === "text" ? "bg-[#5865f2] text-white" : "bg-[#23272a] text-gray-400"}`}><Hash size={20} /></span>
              <div className="flex flex-col items-start">
                <span className="font-semibold">Text</span>
                <span className="text-xs text-gray-400">Send messages, images, GIFs, emoji, opinions, and puns</span>
              </div>
            </button>
            <button
              className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${type === "voice" ? "bg-[#404249] border-[#5865f2]" : "bg-[#23272a] border-transparent hover:bg-[#383a40]"}`}
              onClick={() => setType("voice")}
            >
              <span className={`w-6 h-6 flex items-center justify-center rounded-full ${type === "voice" ? "bg-[#5865f2] text-white" : "bg-[#23272a] text-gray-400"}`}><Volume2 size={20} /></span>
              <div className="flex flex-col items-start">
                <span className="font-semibold">Voice</span>
                <span className="text-xs text-gray-400">Hang out together with voice, video, and screen share</span>
              </div>
            </button>
          </div>
        </div>
        {/* Channel Name */}
        <div className="mb-6">
          <div className="font-semibold text-sm mb-2">CHANNEL NAME</div>
          <div className="flex items-center bg-[#23272a] rounded px-3 py-2">
            {type === "text" ? <Hash size={20} className="text-gray-400 mr-2" /> : <Volume2 size={20} className="text-gray-400 mr-2" />}
            <input
              className="bg-transparent outline-none text-white flex-1 placeholder-gray-500 text-base"
              placeholder={type === "text" ? "new-channel" : "General"}
              value={name}
              onChange={e => setName(e.target.value.replace(/\s/g, "-"))}
              maxLength={32}
            />
          </div>
        </div>
        {/* Private Channel Toggle */}
        <div className="flex items-center mb-6">
          <Lock size={20} className="text-gray-400 mr-2" />
          <span className="font-semibold mr-2">Private Channel</span>
          <label className="ml-auto inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only"
              checked={isPrivate}
              onChange={() => setIsPrivate(v => !v)}
            />
            <span className={`w-10 h-6 flex items-center bg-[#23272a] rounded-full p-1 transition-colors ${isPrivate ? "bg-[#5865f2]" : "bg-[#23272a]"}`}>
              <span className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${isPrivate ? "translate-x-4" : "translate-x-0"}`}></span>
            </span>
          </label>
        </div>
        <div className="text-gray-400 text-xs mb-6">
          Only selected members and roles will be able to view this channel.
        </div>
        {/* Buttons */}
        <div className="flex justify-end gap-4 mt-2">
          <button
            className="px-5 py-2 rounded font-semibold bg-transparent text-gray-300 hover:text-white hover:bg-[#23272a] transition"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className={`px-5 py-2 rounded font-semibold text-white transition ${isValid ? "bg-[#5865f2] hover:bg-[#4752c4]" : "bg-[#23272a] text-gray-500 cursor-not-allowed"}`}
            disabled={!isValid}
            onClick={() => isValid && onCreate({ type, name: name.trim(), isPrivate })}
          >
            Create Channel
          </button>
        </div>
      </div>
    </div>
  );
} 