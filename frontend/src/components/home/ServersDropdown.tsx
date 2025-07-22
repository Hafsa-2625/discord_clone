import React, { useEffect, useRef, useState } from "react";

interface Server {
  id: number;
  name: string;
  image_url?: string;
}

// In ServersDropdown.tsx
interface ServersDropdownProps {
  onSelectServer: (id: number) => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toLowerCase();
}

const ServersDropdown: React.FC<ServersDropdownProps> = ({ onSelectServer, anchorRef }) => {
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user.id) return;
    setLoading(true);
    const API_URL = import.meta.env.VITE_API_URL;
    fetch(`${API_URL}/api/servers/user/${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        setServers(data || []);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load servers");
        setLoading(false);
      });
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(event.target as Node)
      ) {
        onSelectServer(-1); // -1 means close only
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onSelectServer, anchorRef]);

  return (
    <div
      ref={dropdownRef}
      className="absolute left-0 top-[110%] z-50 min-w-[180px] bg-[#202225] rounded-lg shadow-lg p-2 max-h-80 overflow-y-auto"
    >
      {loading && <div className="text-white p-2">Loading...</div>}
      {error && <div className="text-red-400 p-2">{error}</div>}
      {!loading && !error && servers.length === 0 && (
        <div className="text-gray-400 p-2">No servers found</div>
      )}
      {!loading && !error && servers.map((server) => (
        <button
          key={server.id}
          className="flex items-center gap-2 w-full px-3 py-2 hover:bg-[#5865f2] rounded text-white text-left"
          onClick={() => onSelectServer(server.id)}
        >
          {server.image_url ? (
            <img
              src={server.image_url}
              alt={server.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <span className="w-8 h-8 flex items-center justify-center rounded-full bg-[#36393f] text-sm font-bold">
              {getInitials(server.name)}
            </span>
          )}
          <span>{server.name}</span>
        </button>
      ))}
    </div>
  );
};

export default ServersDropdown; 