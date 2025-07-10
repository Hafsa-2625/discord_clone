import React from "react";

interface FriendsListProps {
  friends: { id: string, name: string, status: string }[];
  friendsLoading: boolean;
  incomingRequests: any[];
  requestsLoading: boolean;
  handleRespond: (requestId: string, action: string) => void;
}

export default function FriendsList({ friends, friendsLoading, incomingRequests, requestsLoading, handleRespond }: FriendsListProps) {
  return (
    <div className="flex-1 w-full px-8 py-6">
      {requestsLoading ? (
        <div className="text-gray-400">Loading friend requests...</div>
      ) : incomingRequests.length > 0 ? (
        <div className="mb-6">
          <div className="font-bold mb-2">Incoming Friend Requests</div>
          {incomingRequests.map(req => (
            <div key={req.id} className="flex items-center gap-4 bg-[#23272a] rounded-lg p-3 mb-2">
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
            <div key={friend.id} className="flex items-center gap-4 bg-[#23272a] rounded-lg p-3 mb-2">
              <div className="font-semibold">{friend.name}</div>
              <span className="text-xs text-gray-400">{friend.status}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-400">There are no friends online at this time. Check back later!</div>
      )}
    </div>
  );
} 