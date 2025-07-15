import { useState, useEffect, useRef } from "react";
import { io } from 'socket.io-client';
import Sidebar from "@/components/home/Sidebar";
import Navbar from "@/components/home/Navbar";
import DirectMessages from "@/components/home/DirectMessages";
import AddFriend from "@/components/home/AddFriend";
import FriendsList from "@/components/home/FriendsList";
import ChatWindow from "@/components/home/ChatWindow";
import RightSidebar from "@/components/home/RightSidebar";
import UserProfileBar from "@/components/home/UserProfileBar";
import { Users, Rocket, Package, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import AddServerModal from "@/components/server/AddServerModal";
import GroupDMModal from "@/components/home/GroupDMModal";
import GroupDMChatWindow from "@/components/home/GroupDMChatWindow";

export default function Home() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showAddServerModal, setShowAddServerModal] = useState(false);
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

  // Group DM modal state
  const [showGroupDmModal, setShowGroupDmModal] = useState(false);

  // Group DMs state
  const [groupDMs, setGroupDMs] = useState<any[]>([]); // [{ id, name, imageUrl, members: [] }]
  const [activeGroupDM, setActiveGroupDM] = useState<any | null>(null);

  // DM specific states
  const [dmMessages, setDmMessages] = useState<{senderId: string, message: string, createdAt?: string}[]>([]);
  const [dmNewMessage, setDmNewMessage] = useState('');
  // Group DM specific states
  const [groupMessages, setGroupMessages] = useState<{senderId: string, message: string, createdAt?: string}[]>([]);
  const [groupNewMessage, setGroupNewMessage] = useState('');

  // Fetches the current user's friends list when the active tab is 'all'.
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

  // Fetches incoming friend requests when addFriendStatus changes.
  useEffect(() => {
    setRequestsLoading(true);
    fetch("http://localhost:5000/api/friends/requests", {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(res => res.json())
      .then(data => setIncomingRequests(data))
      .finally(() => setRequestsLoading(false));
  }, [addFriendStatus]);

  // Fetch persistent DM sessions from backend and update dmList
  useEffect(() => {
    if (user.id && friends.length) {
      fetch(`http://localhost:5000/api/dms/list?userId=${user.id}`)
        .then(res => res.json())
        .then((sessions: Array<{ user1Id: number, user2Id: number }>) => {
          const dms = sessions.map(session => {
            const friendId = session.user1Id == user.id ? session.user2Id : session.user1Id;
            const friend = friends.find(f => f.id == friendId.toString());
            return friend ? { id: friend.id, name: friend.name } : null;
          }).filter(Boolean) as {id: string, name: string}[];
          setDmList(dms);
        });
    }
  }, [user.id, friends]);

  // Fetch group DMs for the user on mount
  useEffect(() => {
    if (user.id) {
      fetch(`http://localhost:5000/api/group-dms/user/${user.id}`)
        .then(res => res.json())
        .then(data => setGroupDMs(data.groupDMs || []));
    }
  }, [user.id]);

  // Initializes the socket connection and sets up DM receiving logic. Cleans up on unmount.
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

  // Handles accepting or declining a friend request and refreshes the friends list if accepted.
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
  
  // Logs out the user by clearing localStorage and redirecting to the login page.
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  // Handles sending a friend request to the backend and updates the UI based on the result.
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

  // Add this function to handle group DM creation (placeholder for now)
  const handleCreateGroupDM = () => {
    setShowGroupDmModal(true);
  };

  const handleCloseGroupDmModal = () => {
    setShowGroupDmModal(false);
  };

  // Handler for when Create Group DM is clicked in the modal
  const handleGroupDmCreate = async (selectedFriendIds: string[], groupName: string, groupImage: File | null) => {
    const formData = new FormData();
    formData.append('name', groupName);
    formData.append('creatorId', user.id);
    formData.append('memberIds', JSON.stringify(selectedFriendIds));
    if (groupImage) formData.append('image', groupImage);
    const res = await fetch('http://localhost:5000/api/group-dms', {
      method: 'POST',
      body: formData,
    });
    const { group } = await res.json();
    // Fetch group details (including members)
    const detailsRes = await fetch(`http://localhost:5000/api/group-dms/${group.id}`);
    const details = await detailsRes.json();
    setGroupDMs(gdms => [...gdms, { ...details.group, members: details.members }]);
    setActiveGroupDM({ ...details.group, members: details.members });
    setShowGroupDmModal(false);
  };

  // Handler for selecting a group DM from the sidebar
  const handleSelectGroupDM = async (groupId: number) => {
    const detailsRes = await fetch(`http://localhost:5000/api/group-dms/${groupId}`);
    const details = await detailsRes.json();
    setActiveGroupDM({ ...details.group, members: details.members });
    setActiveChat(null); // Deselect 1:1 DM
  };

  // Handler for selecting a DM from DirectMessages
  const handleSelectDM = (chat: {id: string, name: string}) => {
    setActiveChat(chat);
    setActiveGroupDM(null); // Deselect group DM
  };

  const maxSelectable = 9;

  return (
    <div className="flex min-h-screen bg-[#313338] text-white">
      <Sidebar onAddServer={() => setShowAddServerModal(true)} />
      {/* Friends/DMs Panel */}
      <nav className="h-screen flex flex-col w-72 bg-[#23272a] py-4 px-2 border-r border-[#23272a] justify-between">
        {/* Scrollable area for DMs and group DMs */}
        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">
          {/* Top Friends/DMs section */}
          <div className="flex items-center gap-2 mb-4">
            <Users size={20} className="cursor-pointer" />
            <span className="font-semibold">Friends</span>
          </div>
          <Button variant="ghost" className="justify-start gap-2 mb-1"><Users size={18} /> Friends</Button>
          <br></br>
          <Button variant="ghost" className="justify-start gap-2 mb-1"><Rocket size={18} /> Nitro</Button>
          <br></br>
          <Button variant="ghost" className="justify-start gap-2 mb-1"><Package size={18} /> Shop</Button>
          {/* Group DMs */}
          {groupDMs.length > 0 && (
            <>
              <div className="text-xs text-gray-400 mt-4 mb-1">Group DMs</div>
              <div className="flex flex-col gap-2 mb-2">
                {groupDMs.map(gdm => (
                  <div
                    key={gdm.id}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-[#313338] ${activeGroupDM?.id === gdm.id ? 'bg-[#404249]' : ''}`}
                    onClick={() => handleSelectGroupDM(gdm.id)}
                  >
                    <img src={gdm.imageUrl || "/discord.png"} alt="group avatar" className="w-8 h-8 rounded-full bg-[#5865f2]" />
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold truncate">{gdm.name}</span>
                      <span className="text-xs text-gray-400">{gdm.members?.length || 0} Members</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          <DirectMessages
            dmList={dmList}
            setActiveChat={handleSelectDM}
            user={user}
            friends={friends}
            socketRef={socketRef}
            setMessages={setDmMessages}
            setDmList={setDmList}
          />
        </div>
        {/* UserProfileBar at the bottom */}
        <UserProfileBar
          user={user}
          showProfileMenu={showProfileMenu}
          setShowProfileMenu={setShowProfileMenu}
          handleLogout={handleLogout}
        />
      </nav>
      {/* Main Content */}
      <main className="flex-1 flex flex-col h-[100vh] min-h-0">
        {!(activeChat || activeGroupDM) && (
          <Navbar activeTab={activeTab} setActiveTab={setActiveTab}>
            <div className="flex items-center gap-2">
              {/* <Search size={20} className="text-gray-400" /> */}
              <Button variant="secondary" className="flex items-center gap-2" onClick={handleCreateGroupDM}>
                <UserPlus size={18} /> New Group DM
              </Button>
            </div>
          </Navbar>
        )}
        <GroupDMModal
          open={showGroupDmModal}
          onClose={handleCloseGroupDmModal}
          friends={friends}
          onCreate={handleGroupDmCreate}
        />
        {/* Main Content Area */}
        {activeGroupDM ? (
          <GroupDMChatWindow
            group={activeGroupDM}
            members={activeGroupDM.members || []}
            onClose={() => { setActiveGroupDM(null); setActiveTab('all'); }}
            messages={groupMessages}
            newMessage={groupNewMessage}
            setNewMessage={setGroupNewMessage}
            user={{ id: user.id, name: user.name || 'You' }}
            socketRef={socketRef}
            setMessages={setGroupMessages}
          />
        ) : activeChat ? (
          <ChatWindow
            activeChat={activeChat}
            messages={dmMessages}
            newMessage={dmNewMessage}
            setNewMessage={setDmNewMessage}
            user={user}
            socketRef={socketRef}
            setMessages={setDmMessages}
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
      <AddServerModal open={showAddServerModal} onClose={() => setShowAddServerModal(false)} />
    </div>
  );
} 