import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

export function useSocket(user: any, friends: {id: string, name: string}[], dmList: {id: string, name: string}[], setMessages: any, setDmList: any) {
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
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user.id, friends, dmList, setMessages, setDmList]);

  return { socketRef };
} 