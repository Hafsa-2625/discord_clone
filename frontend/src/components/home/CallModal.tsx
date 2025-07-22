import React, { useState } from "react";

interface CallModalProps {
  callState: "calling" | "receiving" | "in-call";
  localUser: { id: string; name: string; avatarUrl?: string };
  remoteUser: { id: string; name: string; avatarUrl?: string };
  onAccept?: () => void;
  onDecline?: () => void;
  onEnd?: () => void;
  // ...other props as needed
}

const CallModal: React.FC<CallModalProps> = ({
  callState,
  localUser,
  remoteUser,
  onAccept,
  onDecline,
  onEnd,
}) => {
  const [muted, setMuted] = useState(false);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50">
      <div className="flex items-center gap-8 mb-8">
        {/* Local User */}
        <div className="flex flex-col items-center">
          <img src={localUser.avatarUrl || "/discord.png"} className="w-24 h-24 rounded-full" />
          <span className="text-white mt-2">{localUser.name}</span>
        </div>
        {/* Remote User */}
        <div className="flex flex-col items-center">
          <img src={remoteUser.avatarUrl || "/discord.png"} className="w-24 h-24 rounded-full border-4 border-gray-700" />
          <span className="text-white mt-2">{remoteUser.name}</span>
        </div>
      </div>
      {/* State-specific UI */}
      {callState === "calling" && (
        <>
          <div className="text-white text-xl mb-6">Calling {remoteUser.name}...</div>
          <button onClick={onEnd} className="bg-red-600 px-8 py-3 rounded-full text-white text-lg font-bold">End Call</button>
        </>
      )}
      {callState === "receiving" && (
        <>
          <div className="text-white text-xl mb-6">{remoteUser.name} is calling you...</div>
          <div className="flex gap-4">
            <button onClick={onAccept} className="bg-green-600 px-8 py-3 rounded-full text-white text-lg font-bold">Accept</button>
            <button onClick={onDecline} className="bg-red-600 px-8 py-3 rounded-full text-white text-lg font-bold">Decline</button>
          </div>
        </>
      )}
      {callState === "in-call" && (
        <>
          {/* Call controls here */}
          <div className="flex gap-6 mt-8">
            {/* Mute mic button */}
            <button
              className={`bg-gray-800 p-4 rounded-full text-white ${muted ? 'opacity-60' : ''}`}
              title={muted ? "Unmute Mic" : "Mute Mic"}
              onClick={() => setMuted(m => !m)}
            >
              <span role="img" aria-label="mic">{muted ? "🔇" : "🎤"}</span>
            </button>
            {/* Stop video button (future) */}
            <button
              className="bg-gray-800 p-4 rounded-full text-white opacity-60 cursor-not-allowed"
              title="Stop Video (coming soon)"
              disabled
            >
              <span role="img" aria-label="video">🎥</span>
            </button>
            {/* Screen share button (placeholder) */}
            <button
              className="bg-gray-800 p-4 rounded-full text-white"
              title="Screen Share (not implemented)"
            >
              <span role="img" aria-label="screen">🖥️</span>
            </button>
            {/* End call button */}
            <button onClick={onEnd} className="bg-red-600 p-4 rounded-full text-white" title="End Call">
              <span role="img" aria-label="end">📞</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CallModal; 