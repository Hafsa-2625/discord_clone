import { useState, useEffect } from "react";

export function useDMs(user: any, friends: {id: string, name: string}[]) {
  const [dmList, setDmList] = useState<{id: string, name: string}[]>([]);
  const [activeChat, setActiveChat] = useState<{id: string, name: string} | null>(null);
  const [dmMessages, setDmMessages] = useState<{senderId: string, message: string, createdAt?: string}[]>([]);
  const [dmNewMessage, setDmNewMessage] = useState('');
  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch persistent DM sessions from backend and update dmList
  useEffect(() => {
    if (user.id && friends.length) {
      fetch(`${API_URL}/api/dms/list?userId=${user.id}`)
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

  // Handler for selecting a DM chat
  const handleSelectDM = (chat: {id: string, name: string}) => {
    setActiveChat(chat);
    // Fetch messages for this DM session if needed
    // (You can expand this logic as needed)
  };

  return {
    dmList,
    setDmList,
    activeChat,
    setActiveChat,
    dmMessages,
    setDmMessages,
    dmNewMessage,
    setDmNewMessage,
    handleSelectDM,
  };
} 