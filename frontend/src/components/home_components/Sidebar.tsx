import { User, Mic, Headphones, Settings, Plus, Rocket, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  user: { name: string };
  showProfileMenu: boolean;
  setShowProfileMenu: (v: boolean) => void;
  handleLogout: () => void;
}

export default function Sidebar({ user, showProfileMenu, setShowProfileMenu, handleLogout }: SidebarProps) {
  return (
    <aside className="flex flex-col items-center bg-[#1e1f22] w-20 py-4 gap-2 relative">
      <div className="bg-[#5865f2] rounded-2xl p-3 mb-2">
        <User size={32} />
      </div>
      <Button variant="ghost" className="p-0"><Plus size={28} /></Button>
      <Button variant="ghost" className="p-0"><Rocket size={28} /></Button>
      <Button variant="ghost" className="p-0"><Download size={28} /></Button>
      <div className="flex-1" />
      {/* User profile at bottom */}
      <div className="mb-2 relative">
        <div className="flex items-center gap-2 bg-[#23272a] rounded-lg p-2 cursor-pointer" onClick={() => setShowProfileMenu(!showProfileMenu)}>
          <div className="bg-[#5865f2] rounded-full p-1"><User size={20} /></div>
          <div>
            <div className="text-sm font-bold">{user.name || "User"}</div>
          </div>
        </div>
        <div className="flex gap-2 mt-2 justify-center">
          <Mic size={18} className="text-red-400" />
          <Headphones size={18} className="text-red-400" />
          <Settings size={18} />
        </div>
        {showProfileMenu && (
          <div className="absolute left-0 bottom-14 z-50 bg-[#23272a] border border-[#5865f2] rounded-lg shadow-lg w-40 p-2 flex flex-col gap-2 animate-fade-in">
            <Button variant="ghost" className="justify-start" onClick={() => alert('Manage Account coming soon!')}>Manage Account</Button>
            <Button variant="ghost" className="justify-start text-red-500" onClick={handleLogout}>Logout</Button>
          </div>
        )}
      </div>
    </aside>
  );
} 