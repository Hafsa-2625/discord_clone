import React from "react";
import { X } from "lucide-react";

export default function ServerPurposeModal({ onBack, onClose, onForFriends }: { onBack: () => void, onClose: () => void, onForFriends: () => void }) {
  return (
    <div className="relative bg-[#313338] rounded-2xl shadow-lg w-full max-w-md p-8 flex flex-col items-center">
      {/* Close button */}
      <button className="absolute top-4 right-4 text-gray-300 hover:text-white" onClick={onClose}>
        <X size={28} />
      </button>
      <h2 className="text-2xl font-bold mb-2 text-center">Tell Us More About Your Server</h2>
      <p className="text-gray-300 mb-6 text-center">
        In order to help you with your setup, is your new server for just a few friends or a larger community?
      </p>
      <button className="w-full flex items-center gap-3 bg-[#23272a] hover:bg-[#404249] text-white rounded-lg py-3 mb-4 font-semibold text-lg transition justify-start px-4">
        <span className="text-2xl">🌎</span>
        For a club or community
        <span className="ml-auto text-gray-400">&gt;</span>
      </button>
      <button className="w-full flex items-center gap-3 bg-[#23272a] hover:bg-[#404249] text-white rounded-lg py-3 mb-4 font-semibold text-lg transition justify-start px-4" onClick={onForFriends}>
        <span className="text-2xl">👾</span>
        For me and my friends
        <span className="ml-auto text-gray-400">&gt;</span>
      </button>
      <div className="text-center text-gray-400 text-sm mb-4">
        Not sure? You can <a href="#" className="text-[#00a8fc] hover:underline">skip this question</a> for now.
      </div>
      <button className="text-gray-300 hover:text-white text-base font-medium mt-2" onClick={onBack}>Back</button>
    </div>
  );
} 