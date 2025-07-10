import { useState, useEffect, useRef } from "react";
import { io } from 'socket.io-client';
import Sidebar from "@/components/home_components/Sidebar";
import Navbar from "@/components/home_components/Navbar";
import DirectMessages from "@/components/home_components/DirectMessages";
import AddFriend from "@/components/home_components/AddFriend";
import FriendsList from "@/components/home_components/FriendsList";
import ChatWindow from "@/components/home_components/ChatWindow";
import RightSidebar from "@/components/home_components/RightSidebar";
import { Users, Rocket, Package, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';

export default function Home() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'add-friend'>("all");
  const [friendUsername, setFriendUsername] = useState("");
  const [addFriendStatus, setAddFriendStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState<{id: string, name: string, status: string, createdAt?: string}[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [activeChat, setActiveChat] = useState<{id: string, name: string} | null>(null);
  const [messages, setMessages] = useState<{senderId: string, message: string, createdAt?: string}[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [dmList, setDmList] = useState<{id: string, name: string}[]>([]);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    if (activeTab === "all") {
      setFriendsLoading(true);
      fetch("http://localhost:5000/api/friends/list", {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
        .then(res => res.json())
        .then(data => setFriends(data))
        .finally(() => setFriendsLoading(false));
    }
  }, [activeTab]);

  // Fetch incoming friend requests 
  useEffect(() => {
    setRequestsLoading(true);
    fetch("http://localhost:5000/api/friends/requests", {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(res => res.json())
      .then(data => setIncomingRequests(data))
      .finally(() => setRequestsLoading(false));
  }, [addFriendStatus]);

  // Fetch DM sessions from backend on mount
  useEffect(() => {
    if (socketRef.current && user.id && friends.length) {
      socketRef.current.emit('fetch_dm_sessions', { userId: user.id }, (sessions: Array<{ user1Id: string, user2Id: string }>) => {
        // For each session, find the friend (not self) and add to dmList
        const dms = sessions.map(session => {
          const friendId = session.user1Id == user.id ? session.user2Id : session.user1Id;
          const friend = friends.find(f => f.id == friendId);
          return friend ? { id: friend.id, name: friend.name } : null;
        }).filter(Boolean) as {id: string, name: string}[];
        setDmList(dms);
      });
    }
  }, [user.id, friends]);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io('http://localhost:5000');
      socketRef.current.emit('join', user.id);
      socketRef.current.on('receive_dm', ({ senderId, message }: { senderId: string, message: string }) => {
        setMessages(msgs => [...msgs, { senderId, message }]);
        // Add sender to dmList if not already present and not self
        if (senderId !== user.id) {
          const friend = friends.find(f => f.id === senderId);
          if (friend && !dmList.some(dm => dm.id === friend.id)) {
            setDmList(list => [...list, friend]);
          }
        }
      });
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user.id, friends, dmList]);

  const handleRespond = async (requestId: string, action: string) => {
    await fetch("http://localhost:5000/api/friends/respond", {
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
      fetch("http://localhost:5000/api/friends/list", {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
        .then(res => res.json())
        .then(data => setFriends(data));
    }
  };
  
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const handleSendFriendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddFriendStatus("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/friends/request", {
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
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#313338] text-white">
      <Sidebar
        user={user}
        showProfileMenu={showProfileMenu}
        setShowProfileMenu={setShowProfileMenu}
        handleLogout={handleLogout}
      />
      {/* Friends/DMs Panel */}
      <nav className="w-72 bg-[#23272a] flex flex-col py-4 px-2 border-r border-[#23272a]">
        {/* Top Friends/DMs section */}
        <div className="flex items-center gap-2 mb-4">
          <Users size={20} className="cursor-pointer" />
          <span className="font-semibold">Friends</span>
        </div>
        <Button variant="ghost" className="justify-start gap-2 mb-1"><Users size={18} /> Friends</Button>
        <Button variant="ghost" className="justify-start gap-2 mb-1"><Rocket size={18} /> Nitro <span className="ml-2 bg-pink-500 text-xs px-2 py-0.5 rounded-full">OFFER</span></Button>
        <Button variant="ghost" className="justify-start gap-2 mb-1"><Package size={18} /> Shop</Button>
        <DirectMessages
          dmList={dmList}
          setActiveChat={setActiveChat}
          user={user}
          friends={friends}
          socketRef={socketRef}
          setMessages={setMessages}
          setDmList={setDmList}
        />
      </nav>
      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab}>
          <div className="flex items-center gap-2">
            <Search size={20} className="text-gray-400" />
            <input
              type="text"
              placeholder="Find or start a conversation"
              className="bg-[#23272a] rounded px-3 py-1 text-white focus:outline-none"
            />
          </div>
        </Navbar>
        {/* Main Content Area */}
        {activeChat ? (
          <ChatWindow
            activeChat={activeChat}
            messages={messages}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            user={user}
            socketRef={socketRef}
            setMessages={setMessages}
            dmList={dmList}
            setDmList={setDmList}
            setActiveChat={setActiveChat}
          />
        ) : activeTab === 'add-friend' ? (
          <AddFriend
            friendUsername={friendUsername}
            setFriendUsername={setFriendUsername}
            addFriendStatus={addFriendStatus}
            loading={loading}
            handleSendFriendRequest={handleSendFriendRequest}
          />
        ) : (
          <FriendsList
            friends={friends}
            friendsLoading={friendsLoading}
            incomingRequests={incomingRequests}
            requestsLoading={requestsLoading}
            handleRespond={handleRespond}
          />
        )}
      </main>
      <RightSidebar profile={activeChat ? {
      id: activeChat.id,
      name: activeChat.name,
      status: friends.find(f => f.id === activeChat.id)?.status,
      username: activeChat.name.toLowerCase().replace(/\s+/g, ''),
      memberSince: friends.find(f => f.id === activeChat.id)?.createdAt
        ? format(new Date(friends.find(f => f.id === activeChat.id)?.createdAt!), 'MMM dd, yyyy')
        : 'Unknown',
      } : undefined} />
    </div>
  );
} 