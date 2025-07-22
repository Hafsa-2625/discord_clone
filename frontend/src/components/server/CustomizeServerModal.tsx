import React, { useRef, useState } from "react";
import { X, Plus, Camera } from "lucide-react";

export default function CustomizeServerModal({ onBack, onClose }: { onBack: () => void, onClose: () => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [serverName, setServerName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setImagePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleCreate = async () => {
    if (!serverName) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("name", serverName);
    if (imageFile) formData.append("image", imageFile);
    // Get user from localStorage and append owner_id
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user && user.id) {
      formData.append("owner_id", String(user.id));
    }
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const res = await fetch(`${API_URL}/api/servers`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!res.ok) throw new Error("Failed to create server");
      onClose();
    } catch (err) {
      alert("Error creating server");
      console.error("Create server error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative bg-[#313338] rounded-2xl shadow-lg w-full max-w-md p-8 flex flex-col items-center">
      {/* Close button */}
      <button className="absolute top-4 right-4 text-gray-300 hover:text-white" onClick={onClose}>
        <X size={28} />
      </button>
      <h2 className="text-2xl font-bold mb-2 text-center">Customize Your Server</h2>
      <p className="text-gray-300 mb-6 text-center">
        Give your new server a personality with a name and an icon. You can always change it later.
      </p>
      {/* Upload Avatar */}
      <div className="relative flex flex-col items-center mb-6">
        <div
          className="w-24 h-24 rounded-full border-2 border-dashed border-gray-500 flex items-center justify-center cursor-pointer bg-[#23272a] hover:bg-[#404249] transition overflow-hidden"
          onClick={() => fileInputRef.current?.click()}
        >
          {imagePreview ? (
            <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
          ) : (
            <Camera size={32} className="text-gray-400" />
          )}
          <Plus size={28} className="absolute top-2 right-2 bg-[#5865f2] rounded-full p-1 text-white" />
        </div>
        <span className="mt-2 text-xs text-gray-400 font-semibold">UPLOAD</span>
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
      </div>
      {/* Server Name Input */}
      <div className="w-full mb-2 text-left">
        <label className="text-xs font-bold text-gray-300 mb-1 block">SERVER NAME</label>
        <input
          type="text"
          className="w-full bg-[#23272a] border border-[#404249] rounded px-3 py-2 text-white focus:outline-none focus:border-[#5865f2]"
          placeholder="Server Name"
          value={serverName}
          onChange={e => setServerName(e.target.value)}
        />
      </div>
      <div className="w-full flex justify-between items-center mt-6">
        <button className="text-gray-300 hover:text-white text-base font-medium" onClick={onBack}>Back</button>
        <button className="bg-[#5865f2] hover:bg-[#4752c4] text-white font-semibold rounded px-6 py-2 text-base transition" onClick={handleCreate} disabled={loading}>
          {loading ? "Creating..." : "Create"}
        </button>
      </div>
    </div>
  );
} 