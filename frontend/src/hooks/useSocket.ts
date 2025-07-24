import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

export function useSocket(
  user: any, 
  friends: {id: string, name: string, profilePicture?: string}[], 
  dmList: {id: string, name: string, profilePicture?: string}[], 
  setMessages: any, 
  setDmList: any,
  setFriends?: React.Dispatch<React.SetStateAction<{id: string, name: string, profilePicture?: string, status: string, createdAt?: string}[]>>,
  setActiveChat?: (chat: {id: string, name: string, profilePicture?: string} | null) => void,
  activeChat?: {id: string, name: string, profilePicture?: string} | null
) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(import.meta.env.VITE_API_URL);
      socketRef.current.emit('join', user.id);
      
      socketRef.current.on('receive_dm', ({ senderId, message }: { senderId: string, message: string }) => {
        setMessages((msgs: any[]) => [...msgs, { senderId, message }]);
        // Add sender to dmList if not already present and not self
        if (senderId !== user.id) {
          const friend = friends.find(f => f.id === senderId);
          if (friend && !dmList.some(dm => dm.id === friend.id)) {
            setDmList((list: any[]) => [...list, friend]);
          }
        }
      });

      // Listen for profile picture updates
      socketRef.current.on('profile_picture_updated', ({ userId, profilePicture }: { userId: string, profilePicture: string }) => {
        // Update friends list if this user is in it
        if (setFriends) {
          setFriends(currentFriends => 
            currentFriends.map(friend => 
              friend.id === userId ? { ...friend, profilePicture } : friend
            )
          );
        }
        
        // Update DM list if this user is in it
        setDmList((currentDmList: any[]) =>
          currentDmList.map((dm: any) =>
            dm.id === userId ? { ...dm, profilePicture } : dm
          )
        );
        
        // Update active chat if it's the same user
        if (setActiveChat && activeChat && activeChat.id === userId) {
          setActiveChat({ ...activeChat, profilePicture });
        }
        
        // Update user's own profile picture in localStorage
        if (userId === user.id) {
          const updatedUser = { ...user, profilePicture };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      });
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user.id, friends, dmList, setMessages, setDmList, setFriends, user, setActiveChat, activeChat]);

  return { socketRef };
} 