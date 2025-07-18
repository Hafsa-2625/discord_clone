import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import ServerPurposeModal from "./ServerPurposeModal";
import CustomizeServerModal from "./CustomizeServerModal";
import { useNavigate } from "react-router-dom";

export default function AddServerModal({ open, onClose }: { open: boolean, onClose: () => void }) {
  const [step, setStep] = useState<'main' | 'purpose' | 'customize' | 'join'>('main');
  const [inviteInput, setInviteInput] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (open) setStep('main');
  }, [open]);

  if (!open) return null;

  // Main modal content
  const mainContent = (
    <div className="relative bg-[#313338] rounded-2xl shadow-lg w-full max-w-md p-8 flex flex-col items-center">
      {/* Close button */}
      <button className="absolute top-4 right-4 text-gray-300 hover:text-white" onClick={onClose}>
        <X size={28} />
      </button>
      <h2 className="text-2xl font-bold mb-2 text-center">Create or Join a Server</h2>
      <p className="text-gray-300 mb-6 text-center">
        Your server is where you and your friends hang out. Make yours and start talking.
      </p>
      <button
        className="w-full bg-[#23272a] hover:bg-[#404249] text-white rounded-lg py-3 mb-4 font-semibold text-lg transition"
        onClick={() => setStep('purpose')}
      >
        Create Your Own
      </button>
      <button
        className="w-full bg-[#23272a] hover:bg-[#404249] text-white rounded-lg py-3 font-semibold text-lg transition"
        onClick={() => setStep('join')}
      >
        Join a Server
      </button>
    </div>
  );

  // Join server content
  const joinContent = (
    <div className="relative bg-[#313338] rounded-2xl shadow-lg w-full max-w-md p-8 flex flex-col items-center">
      <button className="absolute top-4 right-4 text-gray-300 hover:text-white" onClick={onClose}>
        <X size={28} />
      </button>
      <h2 className="text-2xl font-bold mb-2 text-center">Join a Server</h2>
      <p className="text-gray-300 mb-6 text-center">
        Enter an invite link below to join an existing server.
      </p>
      <form
        className="w-full flex flex-col gap-4"
        onSubmit={e => {
          e.preventDefault();
          setError("");
          // Extract invite code from link
          const match = inviteInput.match(/invite\/(\w+)/i);
          const code = match ? match[1] : inviteInput.trim();
          if (!code) {
            setError("Please enter a valid invite link or code.");
            return;
          }
          setInviteInput("");
          onClose();
          navigate(`/invite/${code}`);
        }}
      >
        <input
          className="w-full p-3 rounded bg-[#23272a] text-white border border-[#404249] focus:outline-none"
          placeholder="Paste an invite link or code"
          value={inviteInput}
          onChange={e => setInviteInput(e.target.value)}
        />
        {error && <div className="text-red-400 text-sm">{error}</div>}
        <button
          type="submit"
          className="w-full bg-[#5865f2] hover:bg-[#4752c4] text-white rounded-lg py-3 font-semibold text-lg transition"
        >
          Join Server
        </button>
        <button
          type="button"
          className="w-full mt-2 bg-[#23272a] hover:bg-[#404249] text-white rounded-lg py-2 font-semibold text-base transition"
          onClick={() => setStep('main')}
        >
          Back
        </button>
      </form>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      {step === 'main' && mainContent}
      {step === 'purpose' && (
        <ServerPurposeModal
          onBack={() => setStep('main')}
          onClose={onClose}
          onForFriends={() => setStep('customize')}
        />
      )}
      {step === 'customize' && (
        <CustomizeServerModal onBack={() => setStep('purpose')} onClose={onClose} />
      )}
      {step === 'join' && joinContent}
    </div>
  );
} 