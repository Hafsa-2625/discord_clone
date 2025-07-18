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
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showAddServerModal, setShowAddServerModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'add-friend'>("all");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<{senderId: string, message: string, createdAt?: string}[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const {
    friends,
    friendsLoading,
    incomingRequests,
    requestsLoading,
    friendUsername,
    setFriendUsername,
    addFriendStatus,
    handleSendFriendRequest,
    handleRespond,
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
  } = useGroupDMs(user);

  const { socketRef } = useSocket(user, friends, dmList, setMessages, setDmList);
  const [channelInvites, setChannelInvites] = useState<any[]>([]);
  const [invitesLoading, setInvitesLoading] = useState(false);

  useEffect(() => {
    // Fetch channel invites for this user
    setInvitesLoading(true);
    console.log('Fetching invites for user.id:', user.id, typeof user.id);
    fetch(`http://localhost:5000/api/channels/invites?userId=${Number(user.id)}`)
      .then(res => res.json())
      .then(data => setChannelInvites(data))
      .finally(() => setInvitesLoading(false));
  }, [user.id]);

  const handleChannelInviteRespond = async (inviteId: number, action: 'accept' | 'decline') => {
    await fetch(`http://localhost:5000/api/channels/invites/${inviteId}/respond`, {
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
    const res = await fetch('http://localhost:5000/api/group-dms', {
      method: 'POST',
      body: formData,
    });
    const { group } = await res.json();
    const detailsRes = await fetch(`http://localhost:5000/api/group-dms/${group.id}`);
    const details = await detailsRes.json();
    setGroupDMs(gdms => [...gdms, { ...details.group, members: details.members }]);
    setActiveGroupDM({ ...details.group, members: details.members });
    handleCloseGroupDmModal();
  };

  const handleSelectDMExclusive = (chat: {id: string, name: string}) => {
    setActiveGroupDM(null);
    handleSelectDM(chat);
  };

  const handleSelectGroupDMExclusive = (groupId: number) => {
    setActiveChat(null);
    handleSelectGroupDM(groupId);
  };

  const maxSelectable = 9;

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
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-[#313338] ${activeGroupDM?.id === gdm.id ? 'bg-[#404249]' : ''}`}
                    onClick={() => handleSelectGroupDMExclusive(gdm.id)}
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
            setActiveChat={handleSelectDMExclusive}
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