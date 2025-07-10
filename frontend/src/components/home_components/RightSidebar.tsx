import React from "react";

interface ProfileProps {
  id: string;
  name: string;
  status?: string;
  username?: string;
  memberSince?: string;
}

export default function RightSidebar({ profile }: { profile?: ProfileProps }) {
  if (profile) {
    return (
      <aside className="w-80 bg-[#23272a] border-l border-[#23272a] p-6 flex flex-col items-center">
        <div className="w-full bg-[#5865f2] rounded-t-lg h-32 flex flex-col items-center justify-end relative">
          <img src="/discord.png" alt="avatar" className="w-24 h-24 rounded-full bg-[#5865f2] border-4 border-[#23272a] absolute left-1/2 -bottom-12 -translate-x-1/2" />
        </div>
        <div className="mt-16 w-full flex flex-col items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{profile.name}</span>
            <span className="text-gray-400 text-xs align-middle">{profile.status === 'online' ? '🟢' : profile.status === 'offline' ? '🔴' : ''}</span>
          </div>
          <div className="text-gray-400 text-lg mb-2">{profile.username && `@${profile.username}`}</div>
          <div className="bg-[#23272a] rounded-lg w-full p-4 mt-4">
            <div className="text-xs text-gray-400 mb-1">Member Since</div>
            <div className="text-base">{profile.memberSince || 'Unknown'}</div>
          </div>
          <button className="mt-6 w-full bg-[#5865f2] text-white rounded-lg py-2 font-bold">View Full Profile</button>
        </div>
      </aside>
    );
  }
  return (
    <aside className="w-80 bg-[#23272a] border-l border-[#23272a] p-6 flex flex-col">
      <div className="font-bold text-xl mb-2">Active Now</div>
      <div className="text-gray-400">It's quiet for now...<br />When a friend starts an activity—like playing a game or hanging out on voice—we’ll show it here!</div>
    </aside>
  );
} 