import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import ServerPurposeModal from "./ServerPurposeModal";
import CustomizeServerModal from "./CustomizeServerModal";

export default function AddServerModal({ open, onClose }: { open: boolean, onClose: () => void }) {
  const [step, setStep] = useState<'main' | 'purpose' | 'customize'>('main');

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
      <button className="w-full bg-[#23272a] hover:bg-[#404249] text-white rounded-lg py-3 font-semibold text-lg transition">
        Join a Server
      </button>
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
    </div>
  );
} 