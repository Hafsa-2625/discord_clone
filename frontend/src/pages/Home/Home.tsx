import { useState, useEffect, useRef } from "react";
import { User, Users, Store, Rocket, Download, MessageCircle, Mic, Headphones, Settings, Plus, Search, Phone, Video, Paperclip, Smile, Gift, Image, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { io } from 'socket.io-client';

export default function Home() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'add-friend'>("all");
  const [friendUsername, setFriendUsername] = useState("");
  const [addFriendStatus, setAddFriendStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState<{id: string, name: string, status: string}[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [showDmModal, setShowDmModal] = useState(false);
  const [dmSearch, setDmSearch] = useState("");
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

  // Filtered friends for DM search
  const filteredFriends = friends.filter(f => f.name.toLowerCase().includes(dmSearch.toLowerCase()));

  return (
    <div className="flex h-screen bg-[#313338] text-white">
      {/* Sidebar */}
      <aside className="flex flex-col items-center bg-[#1e1f22] w-20 py-4 gap-2 relative">
        <div className="bg-[#5865f2] rounded-2xl p-3 mb-2">
          <MessageCircle size={32} />
        </div>
        <Button variant="ghost" className="p-0"><Plus size={28} /></Button>
        <Button variant="ghost" className="p-0"><Rocket size={28} /></Button>
        <Button variant="ghost" className="p-0"><Download size={28} /></Button>
        <div className="flex-1" />
        {/* User profile at bottom */}
        <div className="mb-2 relative">
          <div className="flex items-center gap-2 bg-[#23272a] rounded-lg p-2 cursor-pointer" onClick={() => setShowProfileMenu(v => !v)}>
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
      {/* Friends/DMs Panel */}
      <nav className="w-72 bg-[#23272a] flex flex-col py-4 px-2 border-r border-[#23272a]">
        <div className="flex items-center gap-2 mb-4">
          <Users size={20} />
          <span className="font-semibold">Friends</span>
        </div>
        <Button variant="ghost" className="justify-start gap-2 mb-1"><Users size={18} /> Friends</Button>
        <Button variant="ghost" className="justify-start gap-2 mb-1"><Rocket size={18} /> Nitro <span className="ml-2 bg-pink-500 text-xs px-2 py-0.5 rounded-full">OFFER</span></Button>
        <Button variant="ghost" className="justify-start gap-2 mb-1"><Store size={18} /> Shop</Button>
        <div className="text-xs text-gray-400 mt-4 mb-1 flex items-center justify-between">
          <span>Direct Messages</span>
          <Plus size={14} className="inline ml-1 cursor-pointer" onClick={() => setShowDmModal(true)} />
        </div>
        <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
          {/* Placeholder for DMs */}
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-2 bg-[#2b2d31] rounded px-2 py-2 opacity-60">
              <div className="bg-gray-700 rounded-full w-8 h-8" />
              <div className="flex-1 h-3 bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      </nav>
      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Bar */}
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
          <div className="flex items-center gap-2">
            <div className="relative">
              <input type="text" placeholder="Find or start a conversation" className="bg-[#23272a] rounded-full px-4 py-2 text-sm text-white focus:outline-none" style={{ width: 220 }} />
              <Search size={16} className="absolute right-3 top-2.5 text-gray-400" />
            </div>
          </div>
        </div>
        {/* Main Content Area */}
        {activeChat ? (
          // DM chat window
          <div className="flex flex-col h-full">
            <div className="flex items-center px-6 py-4 border-b border-[#23272a] bg-[#313338]">
              <img src="/discord.png" alt="avatar" className="w-8 h-8 rounded-full bg-[#5865f2] mr-3" />
              <span className="font-bold text-lg">{activeChat.name}</span>
              <div className="flex gap-2 ml-auto">
                <button className="p-2 hover:bg-[#23272a] rounded-full"><Phone size={20} /></button>
                <button className="p-2 hover:bg-[#23272a] rounded-full"><Video size={20} /></button>
                <button className="p-2 hover:bg-[#23272a] rounded-full"><Paperclip size={20} /></button>
              </div>
              <button className="ml-2 text-gray-400 hover:text-white" onClick={() => setActiveChat(null)}>&times;</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#313338]" style={{ maxHeight: 'calc(100vh - 200px)' }}>
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.senderId == user.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`px-4 py-2 rounded-lg ${msg.senderId == user.id ? 'bg-[#5865f2] text-white' : 'bg-[#23272a] text-gray-200'}`}>{msg.message}</div>
                </div>
              ))}
            </div>
            <form
              className="flex items-center p-4 border-t border-[#23272a] bg-[#23272a]"
              onSubmit={e => {
                e.preventDefault();
                if (newMessage.trim() && socketRef.current) {
                  socketRef.current.emit('send_dm', {
                    senderId: user.id,
                    receiverId: activeChat.id,
                    message: newMessage
                  });
                  setMessages(msgs => [...msgs, { senderId: user.id, message: newMessage }]);
                  // Add to dmList if not already present
                  if (!dmList.some(dm => dm.id === activeChat.id)) {
                    setDmList(list => [...list, { id: activeChat.id, name: activeChat.name }]);
                  }
                  setNewMessage('');
                }
              }}
            >
              <button type="button" className="p-2 hover:bg-[#313338] rounded-full"><Plus size={20} /></button>
              <input
                className="flex-1 bg-[#313338] rounded-full px-4 py-2 text-white focus:outline-none mx-2"
                placeholder={`Message @${activeChat.name}`}
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
              />
              <div className="flex gap-1">
                <button type="button" className="p-2 hover:bg-[#313338] rounded-full"><Gift size={20} /></button>
                <button type="button" className="p-2 hover:bg-[#313338] rounded-full"><Image size={20} /></button>
                <button type="button" className="p-2 hover:bg-[#313338] rounded-full"><Smile size={20} /></button>
                <button type="button" className="p-2 hover:bg-[#313338] rounded-full"><Gamepad2 size={20} /></button>
              </div>
              <button type="submit" className="ml-2 px-4 py-2 bg-[#5865f2] text-white rounded-lg font-bold">Send</button>
            </form>
          </div>
        ) : activeTab === 'add-friend' ? (
          // Add Friend form
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
                <Button type="submit" className="rounded-lg h-full px-4 bg-[#5865f2] text-white font-bold" disabled={loading}>
                  {loading ? "Sending..." : "Send Request"}
                </Button>
              </form>
              {addFriendStatus && <div className="mt-4 text-sm text-center text-blue-400">{addFriendStatus}</div>}
            </div>
          </div>
        ) : (
          // Friends list (All tab)
          <div className="flex-1 w-full px-8 py-6">
            {requestsLoading ? (
              <div className="text-gray-400">Loading friend requests...</div>
            ) : incomingRequests.length > 0 && (
              <div className="mb-6">
                <div className="text-lg font-bold mb-2">Incoming Friend Requests</div>
                <ul className="space-y-2">
                  {incomingRequests.map(req => (
                    <li key={req.id} className="flex items-center justify-between bg-[#23272a] rounded p-3">
                      <span className="font-semibold">{req.senderName}</span>
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-green-600 text-white" onClick={() => handleRespond(req.id, 'accept')}>Accept</Button>
                        <Button size="sm" className="bg-red-600 text-white" onClick={() => handleRespond(req.id, 'reject')}>Reject</Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="text-lg font-bold mb-4">All friends — {friends.length}</div>
            {friendsLoading ? (
              <div className="text-gray-400">Loading friends...</div>
            ) : friends.length === 0 ? (
              <div className="text-gray-400">You have no friends yet. Add some!</div>
            ) : (
              <ul className="space-y-4">
                {friends.map(friend => (
                  <li key={friend.id} className="flex items-center gap-4 bg-[#23272a] rounded-lg px-4 py-3">
                    <img src="/discord.png" alt="avatar" className="w-10 h-10 rounded-full bg-[#5865f2]" />
                    <div className="flex-1">
                      <div className="font-bold text-lg">{friend.name}</div>
                      <div className="text-gray-400 text-sm">{friend.status.charAt(0).toUpperCase() + friend.status.slice(1)}</div>
                    </div>
                    <Button variant="ghost" size="icon"><MessageCircle /></Button>
                    <Button variant="ghost" size="icon"><Settings /></Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </main>
      {/* Right Panel */}
      <aside className="w-96 bg-[#23272a] border-l border-[#23272a] flex flex-col p-8">
        <h2 className="text-xl font-bold mb-2">Active Now</h2>
        <div className="text-gray-300 font-semibold mb-1">It's quiet for now...</div>
        <div className="text-gray-400 text-sm">When a friend starts an activity—like playing a game or hanging out on voice—we'll show it here!</div>
      </aside>

      {/* DM Modal */}
      {showDmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-[#23272a] rounded-xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Start a Direct Message</h3>
              <button onClick={() => setShowDmModal(false)} className="text-gray-400 hover:text-white text-2xl">&times;</button>
            </div>
            <input
              type="text"
              placeholder="Search friends..."
              className="w-full mb-4 px-4 py-2 rounded bg-[#313338] text-white border border-[#5865f2] focus:outline-none"
              value={dmSearch}
              onChange={e => setDmSearch(e.target.value)}
            />
            <div className="max-h-60 overflow-y-auto">
              {filteredFriends.length === 0 ? (
                <div className="text-gray-400 text-center py-4">No friends found.</div>
              ) : (
                <ul className="space-y-2">
                  {filteredFriends.map(friend => (
                    <li
                      key={friend.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#313338] cursor-pointer"
                      onClick={() => {
                        setShowDmModal(false);
                        setActiveChat(friend);
                        if (socketRef.current) {
                          socketRef.current.emit('fetch_dm_history', { userId: user.id, friendId: friend.id }, (history: Array<{ senderId: string, content: string, createdAt?: string }>) => {
                            setMessages(history.map((m: { senderId: string, content: string, createdAt?: string }) => ({ senderId: m.senderId, message: m.content, createdAt: m.createdAt })));
                          });
                        }
                      }}
                    >
                      <img src="/discord.png" alt="avatar" className="w-8 h-8 rounded-full bg-[#5865f2]" />
                      <span className="font-semibold">{friend.name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 