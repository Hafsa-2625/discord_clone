import React, { useState, useEffect } from "react";

interface InviteLinkModalProps {
  serverId: number;
  onClose: () => void;
}

const InviteLinkModal: React.FC<InviteLinkModalProps> = ({ serverId, onClose }) => {
  const [inviteUrl, setInviteUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!serverId) return;
    const API_URL = import.meta.env.VITE_API_URL;
    fetch(`${API_URL}/api/servers/${serverId}/invites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })
      .then(res => res.json())
      .then(data => setInviteUrl(data.inviteUrl));
  }, [serverId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#23272a] p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-lg font-bold mb-4">Invite People</h2>
        <input
          className="w-full p-2 rounded bg-[#313338] text-white mb-2"
          value={inviteUrl}
          readOnly
        />
        <button
          className="bg-[#5865f2] text-white px-4 py-2 rounded mr-2"
          onClick={handleCopy}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
        <button className="ml-2 text-gray-400 hover:text-white" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default InviteLinkModal; 