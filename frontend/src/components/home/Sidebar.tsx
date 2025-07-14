import { User, Plus, Rocket, Download, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ServersDropdown from "./ServersDropdown";

export default function Sidebar({ onAddServer }: { onAddServer: () => void }) {
  const [showServers, setShowServers] = useState(false);
  const serversBtnRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  return (
    <aside className="flex flex-col items-center bg-[#1e1f22] w-20 py-4 gap-2 relative">
      {/* Home icon and other sidebar items */}
      <Button
        variant="ghost"
        className="bg-[#5865f2] rounded-2xl p-3 mb-2 w-12 h-12 flex items-center justify-center"
        onClick={() => navigate('/home')}
        aria-label="Go to Home"
      >
        <User size={28} />
      </Button>
      <Button variant="ghost" className="p-0" onClick={onAddServer}>
        <Plus size={28} />
      </Button>
      <Button variant="ghost" className="p-0">
        <Rocket size={28} />
      </Button>
      <Button variant="ghost" className="p-0">
        <Download size={28} />
      </Button>
      {/* Servers Button */}
      <div className="relative w-full flex flex-col items-center">
        <Button
          ref={serversBtnRef}
          variant="ghost"
          className="p-0 rounded-md bg-[#23272a] hover:bg-[#FFFFFF] flex items-center justify-center text-lg font-bold text-white"
          onClick={() => setShowServers((prev) => !prev)}
        >
          <Server size={28} />
        </Button>
        {showServers && (
          <ServersDropdown
            onSelectServer={(id: number) => {
              setShowServers(false);
              if (id > 0) navigate(`/server/${id}`);
            }}
            anchorRef={serversBtnRef}
          />
        )}
      </div>
      {/* Direct Messages and other sidebar content go here */}
      <div className="flex-1" />
    </aside>
  );
} 