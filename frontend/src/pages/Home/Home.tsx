import { useState, useEffect } from "react";
import Sidebar from "@/components/home/Sidebar";
import Navbar from "@/components/home/Navbar";
import DirectMessages from "@/components/home/DirectMessages";
import AddFriend from "@/components/home/AddFriend";
import FriendsList from "@/components/home/FriendsList";
import ChatWindow from "@/components/home/ChatWindow";
import RightSidebar from "@/components/home/RightSidebar";
import UserProfileBar from "@/components/home/UserProfileBar";
import { Users, Rocket, Package, UserPlus, Check, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import AddServerModal from "@/components/server/AddServerModal";
import GroupDMModal from "@/components/home/GroupDMModal";
import GroupDMChatWindow from "@/components/home/GroupDMChatWindow";
import { useFriendsList } from "@/hooks/useFriendsList";
import { useDMs } from "@/hooks/useDMs";
import { useGroupDMs } from "@/hooks/useGroupDMs";
import { useSocket } from "@/hooks/useSocket";

export default function Home() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || '{}'));
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showAddServerModal, setShowAddServerModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'add-friend'>("all");
  // messages state is required by useSocket hook even though not directly read here
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [messages, setMessages] = useState<{senderId: string, message: string, createdAt?: string}[]>([]);
  
  // Update user state when localStorage changes (from profile picture upload)
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedUser = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(updatedUser);
    };
    
    // Listen for custom event (for same-tab updates)
    const handleUserUpdate = () => {
      const updatedUser = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(updatedUser);
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userProfileUpdated', handleUserUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userProfileUpdated', handleUserUpdate);
    };
  }, []);
  
  const {
    friends,
    setFriends,
    friendsLoading,
    incomingRequests,
    requestsLoading,
    friendUsername,
    setFriendUsername,
    addFriendStatus,
    handleSendFriendRequest,
    handleRespond,
    handleUnfriend,
  } = useFriendsList(user.id, activeTab);

const {
    dmList,
    setDmList,
    activeChat,
    setActiveChat,
    dmMessages,
    setDmMessages,
    dmNewMessage,
    setDmNewMessage,
    handleSelectDM,
  } = useDMs(user, friends);

  // Group DMs logic
  const {
    groupDMs,
    setGroupDMs,
    activeGroupDM,
    setActiveGroupDM,
    groupMessages,
    setGroupMessages,
    groupNewMessage,
    setGroupNewMessage,
    showGroupDmModal,
    handleCreateGroupDM,
    handleCloseGroupDmModal,
    handleSelectGroupDM,
    handleLeaveGroupDM,
  } = useGroupDMs(user);

  const { socketRef } = useSocket(user, friends, dmList, setMessages, setDmList, setFriends, setActiveChat, activeChat);
  const [channelInvites, setChannelInvites] = useState<any[]>([]);
  const API_URL = import.meta.env.VITE_API_URL;
  
  // Log messages length to satisfy TypeScript unused variable warning
  console.log('Messages count:', messages.length);

  useEffect(() => {
    // Fetch channel invites for this user
    console.log('Fetching invites for user.id:', user.id, typeof user.id);
    fetch(`${API_URL}/api/channels/invites?userId=${Number(user.id)}`)
      .then(res => res.json())
      .then(data => setChannelInvites(data));
  }, [user.id]);

  const handleChannelInviteRespond = async (inviteId: number, action: 'accept' | 'decline') => {
    await fetch(`${API_URL}/api/channels/invites/${inviteId}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    setChannelInvites(invites => invites.filter(inv => inv.id !== inviteId));
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const handleGroupDmCreate = async (selectedFriendIds: string[], groupName: string, groupImage: File | null) => {
    const formData = new FormData();
    formData.append('name', groupName);
    formData.append('creatorId', user.id);
    formData.append('memberIds', JSON.stringify(selectedFriendIds));
    if (groupImage) formData.append('image', groupImage);
    const res = await fetch(`${API_URL}/api/group-dms`, {
      method: 'POST',
      body: formData,
    });
    const { group } = await res.json();
    const detailsRes = await fetch(`${API_URL}/api/group-dms/${group.id}`);
    const details = await detailsRes.json();
    setGroupDMs(gdms => [...gdms, { ...details.group, members: details.members }]);
    setActiveGroupDM({ ...details.group, members: details.members });
    handleCloseGroupDmModal();
  };

  const handleSelectDMExclusive = (chat: { id: string; name: string; profilePicture?: string } | null) => {
    setActiveGroupDM(null);
    if (chat) {
      handleSelectDM({ id: chat.id, name: chat.name, profilePicture: chat.profilePicture });
    } else {
      setActiveChat(null);
    }
  };

  const handleSelectGroupDMExclusive = (groupId: number) => {
    setActiveChat(null);
    handleSelectGroupDM(groupId);
  };

  return (
    <div className="flex min-h-screen bg-[#313338] text-white">
      <Sidebar onAddServer={() => setShowAddServerModal(true)} />
      {/* Friends/DMs Panel */}
      <nav className="h-screen flex flex-col w-72 bg-[#23272a] py-4 px-2 border-r border-[#23272a] justify-between">
        {/* Channel Invites */}
        {channelInvites.length > 0 && (
          <div className="mb-4">
            <div className="text-xs text-gray-400 mb-1">Channel Invites</div>
            <div className="flex flex-col gap-2">
              {channelInvites.map(invite => (
                <div key={invite.id} className="flex items-center justify-between bg-[#313338] rounded p-2">
                  <div className="flex flex-col">
                    <span className="font-semibold text-white">Invited to Channel #{invite.channelId}</span>
                    <span className="text-xs text-gray-400">From user {invite.inviterId}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="p-1 rounded bg-green-600 hover:bg-green-700"
                      title="Accept"
                      onClick={() => handleChannelInviteRespond(invite.id, 'accept')}
                    >
                      <Check size={16} />
                    </button>
                    <button
                      className="p-1 rounded bg-red-600 hover:bg-red-700"
                      title="Decline"
                      onClick={() => handleChannelInviteRespond(invite.id, 'decline')}
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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
                    className={`group flex items-center justify-between gap-3 p-2 rounded-lg cursor-pointer hover:bg-[#313338] ${activeGroupDM?.id === gdm.id ? 'bg-[#404249]' : ''}`}
                  >
                    <div 
                      className="flex items-center gap-3 flex-1 min-w-0"
                      onClick={() => handleSelectGroupDMExclusive(gdm.id)}
                    >
                      <img src={gdm.imageUrl || "/discord.png"} alt="group avatar" className="w-8 h-8 rounded-full bg-[#5865f2]" />
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold truncate">{gdm.name}</span>
                        <span className="text-xs text-gray-400">{gdm.members?.length || 0} Members</span>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Are you sure you want to leave "${gdm.name}"?`)) {
                          handleLeaveGroupDM(gdm.id);
                        }
                      }} 
                      className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100"
                      title="Leave Group DM"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 7H18V6C18 3.79 16.21 2 14 2H10C7.79 2 6 3.79 6 6V7H5C4.45 7 4 7.45 4 8S4.45 9 5 9H6V19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V9H19C19.55 9 20 8.55 20 8S19.55 7 19 7ZM8 6C8 4.9 8.9 4 10 4H14C15.1 4 16 4.9 16 6V7H8V6ZM16 19H8V9H16V19Z"/>
                        <path d="M10 11V17H12V11H10ZM14 11V17H16V11H14Z"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
          <DirectMessages
            dmList={dmList}
            setActiveChat={handleSelectDMExclusive}
            user={user}
            friends={friends}
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
            handleSendFriendRequest={handleSendFriendRequest}
          />
        ) : (
          <FriendsList
            friends={friends}
            friendsLoading={friendsLoading}
            incomingRequests={incomingRequests}
            requestsLoading={requestsLoading}
            handleRespond={handleRespond}
            handleUnfriend={handleUnfriend}
          />
        )}
      </main>
      <RightSidebar profile={activeChat ? {
        id: activeChat.id,
        name: activeChat.name,
        profilePicture: activeChat.profilePicture,
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