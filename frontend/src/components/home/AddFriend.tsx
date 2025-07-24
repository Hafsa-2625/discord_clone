import { Button } from "@/components/ui/button";

interface AddFriendProps {
  friendUsername: string;
  setFriendUsername: (v: string) => void;
  addFriendStatus: string;
  handleSendFriendRequest: (e: React.FormEvent) => void;
}

export default function AddFriend({ friendUsername, setFriendUsername, addFriendStatus, handleSendFriendRequest }: AddFriendProps) {
  const isLoading = addFriendStatus === "Sending friend request...";
  
  return (
    <div className="flex flex-col md:flex-row items-start gap-8 p-8">
      <div className="flex-1">
        <h2 className="text-3xl font-bold mb-2">Add Friend</h2>
        <p className="text-lg text-gray-300 mb-6">You can add friends with their Discord username.</p>
        <form onSubmit={handleSendFriendRequest} className="flex items-center border border-blue-600 rounded-lg overflow-hidden">
          <input
            type="text"
            placeholder="You can add friends with their Discord username"
            className="flex-1 bg-transparent px-4 py-3 text-white focus:outline-none"
            value={friendUsername}
            onChange={e => setFriendUsername(e.target.value)}
            required
          />
          <Button type="submit" className="rounded-lg h-full px-4 bg-[#5865f2] text-white font-bold" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Request"}
          </Button>
        </form>
        {addFriendStatus && <div className="mt-4 text-sm text-center text-blue-400">{addFriendStatus}</div>}
      </div>
    </div>
  );
} 