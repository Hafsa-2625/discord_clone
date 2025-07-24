import { useState, useEffect } from "react";

export function useGroupDMs(user: any) {
  const [groupDMs, setGroupDMs] = useState<any[]>([]); // [{ id, name, imageUrl, members: [] }]
  const [activeGroupDM, setActiveGroupDM] = useState<any | null>(null);
  const [groupMessages, setGroupMessages] = useState<{senderId: string, message: string, createdAt?: string}[]>([]);
  const [groupNewMessage, setGroupNewMessage] = useState('');
  const [showGroupDmModal, setShowGroupDmModal] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch group DMs for the user on mount
  useEffect(() => {
    if (user.id) {
      fetch(`${API_URL}/api/group-dms/user/${user.id}`)
        .then(res => res.json())
        .then(data => setGroupDMs(data.groupDMs || []))
        .catch(err => console.error('Error fetching group DMs:', err));
    }
  }, [user.id]);

  // Handler for selecting a group DM
  const handleSelectGroupDM = async (groupId: number) => {
    const group = groupDMs.find(g => g.id === groupId);
    setActiveGroupDM(group || null);
    // Fetch group messages for this group DM if needed
    // (You can expand this logic as needed)
  };

  // Handler for opening/closing the group DM modal
  const handleCreateGroupDM = () => setShowGroupDmModal(true);
  const handleCloseGroupDmModal = () => setShowGroupDmModal(false);

  // Handler for leaving a group DM
  const handleLeaveGroupDM = async (groupId: number) => {
    try {
      const res = await fetch(`${API_URL}/api/group-dms/${groupId}/leave`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (res.ok) {
        // Remove group DM from local state
        setGroupDMs(prevGroups => prevGroups.filter(group => group.id !== groupId));
        // If the active group DM is the one being left, clear it
        if (activeGroupDM && activeGroupDM.id === groupId) {
          setActiveGroupDM(null);
          setGroupMessages([]);
        }
      } else {
        const data = await res.json();
        console.error('Failed to leave group DM:', data.error);
      }
    } catch (error) {
      console.error('Error leaving group DM:', error);
    }
  };

  return {
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
  };
} 