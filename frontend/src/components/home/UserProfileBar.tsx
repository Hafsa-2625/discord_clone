import { User, Mic, Headphones, Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface UserProfileBarProps {
  user: { name: string };
  showProfileMenu: boolean;
  setShowProfileMenu: (v: boolean) => void;
  handleLogout: () => void;
}

export default function UserProfileBar({ user, showProfileMenu, setShowProfileMenu, handleLogout }: UserProfileBarProps) {
  const navigate = useNavigate();
  return (
    <div className="w-full px-2 mb-3 relative">
      <div className="flex items-center gap-2 bg-[#23272a] rounded-lg p-2 cursor-pointer w-full" onClick={() => setShowProfileMenu(!showProfileMenu)}>
        <div className="bg-[#5865f2] rounded-full w-9 h-9 flex items-center justify-center"><User size={22} /></div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold truncate">{user.name || "User"}</div>
          <div className="text-xs text-gray-400">Invisible</div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" className="p-1"><Mic size={16} className="text-red-400" /></Button>
          <Button variant="ghost" className="p-1"><Headphones size={16} className="text-red-400" /></Button>
          <Button variant="ghost" className="p-1" onClick={e => { e.stopPropagation(); navigate("/settings"); }}><SettingsIcon size={16} /></Button>
        </div>
      </div>
      {showProfileMenu && (
        <div className="absolute left-0 bottom-full mb-2 z-50 bg-[#202225] border border-[#5865f2] rounded-lg shadow-lg w-40 p-2 flex flex-col gap-2 animate-fade-in">
          <Button variant="ghost" className="justify-start" onClick={() => alert('Manage Account coming soon!')}>Manage Account</Button>
          <Button variant="ghost" className="justify-start text-red-500" onClick={handleLogout}>Logout</Button>
        </div>
      )}
    </div>
  );
} 