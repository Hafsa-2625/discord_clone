import ProfilePicture from "@/components/ui/ProfilePicture";

interface FriendsListProps {
  friends: { id: string, name: string, status: string, profilePicture?: string }[];
  friendsLoading: boolean;
  incomingRequests: any[];
  requestsLoading: boolean;
  handleRespond: (requestId: string, action: string) => void;
  handleUnfriend: (friendId: string) => void;
}

export default function FriendsList({ friends, friendsLoading, incomingRequests, requestsLoading, handleRespond, handleUnfriend }: FriendsListProps) {
  return (
    <div className="flex-1 w-full px-8 py-6">
      {requestsLoading ? (
        <div className="text-gray-400">Loading friend requests...</div>
      ) : incomingRequests.length > 0 ? (
        <div className="mb-6">
          <div className="font-bold mb-2">Incoming Friend Requests</div>
          {incomingRequests.map(req => (
            <div key={req.id} className="flex items-center gap-4 bg-[#23272a] rounded-lg p-3 mb-2">
              <ProfilePicture 
                src={req.senderProfilePicture} 
                alt={`${req.senderName}'s profile`} 
                size="sm" 
              />
              <div className="font-semibold">{req.senderName}</div>
              <button className="bg-green-600 px-3 py-1 rounded text-white" onClick={() => handleRespond(req.id, "accept")}>Accept</button>
              <button className="bg-red-600 px-3 py-1 rounded text-white" onClick={() => handleRespond(req.id, "reject")}>Reject</button>
            </div>
          ))}
        </div>
      ) : null}
      {friendsLoading ? (
        <div className="text-gray-400">Loading friends...</div>
      ) : friends.length > 0 ? (
        <div>
          <div className="font-bold mb-2">All Friends</div>
          {friends.map(friend => (
            <div key={friend.id} className="flex items-center justify-between bg-[#23272a] rounded-lg p-3 mb-2">
              <div className="flex items-center gap-4">
                <ProfilePicture 
                  src={friend.profilePicture} 
                  alt={`${friend.name}'s profile`} 
                  size="sm" 
                />
                <div>
                  <div className="font-semibold">{friend.name}</div>
                  <span className="text-xs text-gray-400">{friend.status}</span>
                </div>
              </div>
              <button 
                onClick={() => {
                  if (window.confirm(`Are you sure you want to unfriend ${friend.name}?`)) {
                    handleUnfriend(friend.id);
                  }
                }} 
                className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-900/20 transition-colors"
                title="Unfriend"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 7H18V6C18 3.79 16.21 2 14 2H10C7.79 2 6 3.79 6 6V7H5C4.45 7 4 7.45 4 8S4.45 9 5 9H6V19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V9H19C19.55 9 20 8.55 20 8S19.55 7 19 7ZM8 6C8 4.9 8.9 4 10 4H14C15.1 4 16 4.9 16 6V7H8V6ZM16 19H8V9H16V19Z"/>
                  <path d="M10 11V17H12V11H10ZM14 11V17H16V11H14Z"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-400">There are no friends online at this time. Check back later!</div>
      )}
    </div>
  );
} 