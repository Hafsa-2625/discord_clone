import { useState, useEffect } from "react";

export function useFriendsList(userId: string, activeTab: 'all' | 'add-friend') {
  const [friends, setFriends] = useState<{id: string, name: string, status: string, createdAt?: string}[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [friendUsername, setFriendUsername] = useState("");
  const [addFriendStatus, setAddFriendStatus] = useState("");
  const API_URL = import.meta.env.VITE_API_URL;

  // Fetches the current user's friends list when the active tab is 'all'.
  useEffect(() => {
    if (activeTab === "all" && userId) {
      setFriendsLoading(true);
      fetch(`${API_URL}/api/friends/list`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
        .then(res => res.json())
        .then(data => setFriends(data))
        .finally(() => setFriendsLoading(false));
    }
  }, [activeTab, userId]);

  // Fetches incoming friend requests when addFriendStatus changes.
  useEffect(() => {
    if (!userId) return;
    setRequestsLoading(true);
    fetch(`${API_URL}/api/friends/requests`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(res => res.json())
      .then(data => setIncomingRequests(data))
      .finally(() => setRequestsLoading(false));
  }, [addFriendStatus, userId]);

  // Handler for sending a friend request
  const handleSendFriendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddFriendStatus("");
    setFriendsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/friends/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ username: friendUsername }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAddFriendStatus(data.message || "Failed to send request");
      } else {
        setAddFriendStatus("Friend request sent!");
        setFriendUsername("");
      }
    } catch (err) {
      setAddFriendStatus("Network error. Please try again.");
    } finally {
      setFriendsLoading(false);
    }
  };

  // Handler for accepting/declining a friend request
  const handleRespond = async (requestId: string, action: string) => {
    await fetch(`${API_URL}/api/friends/respond`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ requestId, action }),
    });
    setIncomingRequests(reqs => reqs.filter(r => r.id !== requestId));
    if (action === "accept") {
      // Refresh friends list
      refreshFriendsList();
    }
  };

  // Utility to refresh friends list
  const refreshFriendsList = () => {
    setFriendsLoading(true);
    fetch(`${API_URL}/api/friends/list`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(res => res.json())
      .then(data => setFriends(data))
      .finally(() => setFriendsLoading(false));
  };

  // Handler for unfriending someone
  const handleUnfriend = async (friendId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/friends/unfriend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ friendId }),
      });
      
      if (res.ok) {
        // Remove friend from local state immediately
        setFriends(friends => friends.filter(friend => friend.id !== friendId));
      } else {
        const data = await res.json();
        console.error('Failed to unfriend:', data.message);
      }
    } catch (error) {
      console.error('Error unfriending:', error);
    }
  };

  return {
    friends,
    friendsLoading,
    incomingRequests,
    requestsLoading,
    friendUsername,
    setFriendUsername,
    addFriendStatus,
    setAddFriendStatus,
    handleSendFriendRequest,
    handleRespond,
    refreshFriendsList,
    handleUnfriend,
  };
} 