import React from "react";

interface Member {
  id: string;
  name: string;
  imageUrl?: string;
}

interface GroupDMChatWindowProps {
  group: { name: string; imageUrl?: string };
  members: Member[];
}

const GroupDMChatWindow: React.FC<GroupDMChatWindowProps> = ({ group, members }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <div className="flex items-center mb-6">
        {/* Group image and member avatars */}
        <div className="relative">
          {group.imageUrl ? (
            <img src={group.imageUrl} alt={group.name} className="w-20 h-20 rounded-full border-4 border-[#23272a] object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-[#404249] flex items-center justify-center text-5xl text-white">
              {/* Show up to 2 member avatars if no group image */}
              {members.slice(0, 2).map((m, i) => (
                <img
                  key={m.id}
                  src={m.imageUrl || "/discord.png"}
                  alt={m.name}
                  className={`w-10 h-10 rounded-full border-2 border-[#23272a] object-cover ${i === 1 ? "-ml-4" : ""}`}
                  style={{ zIndex: 2 - i }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="text-3xl font-extrabold text-white mb-2">{group.name}</div>
      <div className="text-gray-300 text-lg mb-6">
        Welcome to the beginning of the <span className="font-bold text-white">{group.name}</span> group.
      </div>
      <div className="flex flex-wrap justify-center gap-4 mb-2">
        {members.map(m => (
          <div key={m.id} className="flex flex-col items-center">
            <img
              src={m.imageUrl || "/discord.png"}
              alt={m.name}
              className="w-10 h-10 rounded-full border-2 border-[#23272a] object-cover mb-1"
            />
            <span className="text-xs text-gray-400 font-semibold truncate max-w-[60px] text-center">{m.name}</span>
          </div>
        ))}
      </div>
      <div className="text-xs text-gray-500">{members.length} Members</div>
    </div>
  );
};

export default GroupDMChatWindow; 