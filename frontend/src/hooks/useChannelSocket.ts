import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

export function useChannelSocket(channelId: string, onMessage: (msg: any) => void) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!channelId) return;
    if (!socketRef.current) {
      socketRef.current = io('http://localhost:5000');
    }
    // Join channel room
    socketRef.current.emit('join_channel', channelId);

    // Listen for channel messages
    socketRef.current.on('receive_channel_message', onMessage);

    return () => {
      if (socketRef.current) {
        socketRef.current.off('receive_channel_message', onMessage);
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [channelId, onMessage]);

  return { socketRef };
}