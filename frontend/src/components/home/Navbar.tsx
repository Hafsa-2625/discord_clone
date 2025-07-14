import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import React from "react";

interface NavbarProps {
  activeTab: 'all' | 'add-friend';
  setActiveTab: (tab: 'all' | 'add-friend') => void;
  children?: React.ReactNode;
}

export default function Navbar({ activeTab, setActiveTab, children }: NavbarProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-[#23272a] bg-[#313338]">
      <div className="flex items-center gap-2">
        <Users size={20} />
        <span className="font-semibold">Friends</span>
        <span className="mx-2 text-gray-500">·</span>
        <Button
          className={`text-sm px-4 py-1 rounded-md font-semibold ${activeTab === 'all' ? 'bg-[#5865f2] text-white' : 'bg-[#23272a] text-[#5865f2] border border-[#5865f2]'}`}
          onClick={() => setActiveTab('all')}
        >
          All
        </Button>
        <Button
          className={`ml-4 font-bold rounded-lg px-6 ${activeTab === 'add-friend' ? 'bg-[#5865f2] text-white' : 'bg-[#23272a] text-[#5865f2] border border-[#5865f2]'}`}
          onClick={() => setActiveTab('add-friend')}
        >
          Add Friend
        </Button>
      </div>
      {children}
    </div>
  );
} 