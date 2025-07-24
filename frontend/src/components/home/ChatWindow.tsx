// Video Call Overlay Component
import React, { useRef, useState, useEffect } from "react";
import CallModal from "./CallModal";
import VideoCallOverlay from "./VideoCallOverlay";
import { X, Plus, Gift, Image, Smile, Gamepad2, Phone, Video, Paperclip, Upload, BarChart2, Grid } from "lucide-react";

// Voice Call State Types 
type CallState = 'idle' | 'calling' | 'receiving' | 'in-call';

interface FileMessage {
  url: string;
  name: string;
  type: string;
}

interface CallLog {
  endedAt?: string;
  status?: string;
  callType?: 'audio' | 'video';
}

interface ChatMessage {
  senderId: string;
  message: string;
  createdAt?: string;
  file?: FileMessage;
  call?: CallLog;
}

interface ChatWindowProps {
  activeChat: { id: string, name: string };
  messages: ChatMessage[];
  newMessage: string;
  setNewMessage: (v: string) => void;
  user: { id: string; name: string };
  socketRef: React.MutableRefObject<any>;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  dmList: { id: string, name: string }[];
  setDmList: React.Dispatch<React.SetStateAction<{ id: string, name: string }[]>>;
  setActiveChat: (v: null) => void;
}

function DmPlusMenu({ onUploadFile, onClose }: { onUploadFile: () => void; onClose: () => void }) {
  return (
    <div className="absolute bottom-16 left-4 z-50 bg-[#202225] rounded-xl shadow-lg py-2 w-56 flex flex-col gap-1 border border-[#383a40] animate-fade-in">
      <button className="flex items-center gap-3 px-4 py-3 hover:bg-[#313338] text-white text-base font-medium rounded transition" onClick={() => { onUploadFile(); onClose(); }}>
        <Upload size={20} /> Upload a File
      </button>
      <button className="flex items-center gap-3 px-4 py-3 hover:bg-[#313338] text-white text-base font-medium rounded transition" onClick={onClose}>
        <BarChart2 size={20} /> Create Poll
      </button>
      <button className="flex items-center gap-3 px-4 py-3 hover:bg-[#313338] text-white text-base font-medium rounded transition" onClick={onClose}>
        <Grid size={20} /> Use Apps
      </button>
    </div>
  );
}

function isImageFile(type: string) {
  return type.startsWith('image/');
}

export default function ChatWindow({ activeChat, messages, newMessage, setNewMessage, user, socketRef, setMessages, dmList, setDmList, setActiveChat }: ChatWindowProps) {
const [plusMenuOpen, setPlusMenuOpen] = useState(false);
const fileInputRef = useRef<HTMLInputElement>(null);
const [sessionIdCache, setSessionIdCache] = useState<{ [friendId: string]: number }>({});
const [currentCallLogId, setCurrentCallLogId] = useState<string | null>(null);
const [callType, setCallType] = useState<'audio' | 'video'>('audio');
const localVideoRef = useRef<HTMLVideoElement>(null);
const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Voice Call State 
  const [callState, setCallState] = useState<CallState>('idle');
  const [callFrom, setCallFrom] = useState<string | null>(null); // userId of caller
  // const [isMuted, setIsMuted] = useState(false);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const iceCandidateQueue = useRef<RTCIceCandidate[]>([]); // Queue for early ICE candidates

  // WebRTC Config 
  const rtcConfig = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

  // Start Call (Audio) 
  const startCall = async () => {
    setCallType('audio');
    setCallState('calling');
    try {
      const localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = localStream;
      const pc = new RTCPeerConnection(rtcConfig);
      peerConnectionRef.current = pc;
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current.emit('call:ice-candidate', {
            to: activeChat.id,
            from: user.id,
            candidate: event.candidate
          });
        }
      };
      pc.ontrack = (event: RTCTrackEvent) => {
        remoteStreamRef.current = event.streams[0];
        if (remoteAudioRef.current) remoteAudioRef.current.srcObject = event.streams[0];
      };
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketRef.current.emit('call:offer', {
        to: activeChat.id,
        from: user.id,
        offer,
        callType: 'audio',
      });
      // Call log: POST to backend 
      const API_URL = import.meta.env.VITE_API_URL;
      const res = await fetch(`${API_URL}/api/dms/${activeChat.id}/call/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callerId: user.id, receiverId: activeChat.id, callType: 'audio' }),
      });
      const data = await res.json();
      setCurrentCallLogId(data.callLog.id);
    } catch (err) {
      setCallState('idle');
    }
  };

  // Start Video Call 
  const startVideoCall = async () => {
    setCallType('video');
    setCallState('calling');
    try {
      const localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      localStreamRef.current = localStream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }
      
      const pc = new RTCPeerConnection(rtcConfig);
      peerConnectionRef.current = pc;
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
      
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current.emit('call:ice-candidate', {
            to: activeChat.id,
            from: user.id,
            candidate: event.candidate
          });
        }
      };
      
      pc.oniceconnectionstatechange = () => {
        // Connection state monitoring (can be expanded if needed)
      };
      
      pc.onconnectionstatechange = () => {
        // Connection state monitoring (can be expanded if needed)
      };
      pc.ontrack = (event: RTCTrackEvent) => {
        if (event.streams && event.streams[0]) {
          remoteStreamRef.current = event.streams[0];
          
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
        }
      };
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketRef.current.emit('call:offer', {
        to: activeChat.id,
        from: user.id,
        offer,
        callType: 'video',
      });
      // Call log: POST to backend 
      const API_URL = import.meta.env.VITE_API_URL;
      const res = await fetch(`${API_URL}/api/dms/${activeChat.id}/call/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callerId: user.id, receiverId: activeChat.id, callType: 'video' }),
      });
      const data = await res.json();
      setCurrentCallLogId(data.callLog.id);
    } catch (err) {
      setCallState('idle');
    }
  };

// Accept Call
const acceptCall = async () => {
  setCallState('in-call');
  try {
    // Request correct media based on callType
    const constraints = callType === 'video' ? { audio: true, video: true } : { audio: true };
    
    const localStream = await navigator.mediaDevices.getUserMedia(constraints);
    localStreamRef.current = localStream;
    
    // Always assign local video for video calls
    if (callType === 'video' && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
    
    const pc = new RTCPeerConnection(rtcConfig);
    peerConnectionRef.current = pc;
    localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit('call:ice-candidate', {
          to: callFrom,
          from: user.id,
          candidate: event.candidate
        });
      }
    };
    pc.oniceconnectionstatechange = () => {
      // Connection state monitoring
    };
    pc.onsignalingstatechange = () => {
      // Signaling state monitoring
    };
    pc.ontrack = (event: RTCTrackEvent) => {
      if (event.streams && event.streams[0]) {
        remoteStreamRef.current = event.streams[0];
        
        // Always assign remote video for video calls
        if (callType === 'video' && remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        } else if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = event.streams[0];
        }
      }
    };
    // Wait for offer to be set as remote desc in handler below
  } catch (err) {
    setCallState('idle');
  }
};

  // End Call 
  const endCall = async (shouldNotifyPeer: boolean = true) => {
    setCallState('idle');
    setCallFrom(null);
    
    // Clear ICE candidate queue
    iceCandidateQueue.current = [];
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }
    // Only notify peer if this is initiated by the user, not in response to receiving call:end
    if (shouldNotifyPeer) {
      socketRef.current.emit('call:end', {
        to: callState === 'in-call' ? (callFrom || activeChat.id) : activeChat.id,
        from: user.id
      });
    }
    // Call log: POST to backend 
    if (currentCallLogId) {
      const API_URL = import.meta.env.VITE_API_URL;
      await fetch(`${API_URL}/api/dms/${activeChat.id}/call/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callLogId: currentCallLogId }),
      });
      setCurrentCallLogId(null);
    }
  };

  // Decline Call 
  const declineCall = () => {
    setCallState('idle');
    setCallFrom(null);
    socketRef.current.emit('call:end', {
      to: callFrom,
      from: user.id
    });
  };

// --- In your socket event handler for incoming offers ---
useEffect(() => {
  if (!socketRef.current) return;
  // Incoming Offer 
  const handleOffer = async ({ offer, from, callType: incomingCallType }: { offer: any; from: string; callType: 'audio' | 'video' }) => {
    setCallFrom(from);
    setCallType(incomingCallType);
    
    // Set call state FIRST to render VideoCallOverlay and create video elements
    if (incomingCallType === 'video') {
      setCallState('calling');
    } else {
      setCallState('receiving');
    }
    
    // Wait a brief moment for the VideoCallOverlay to render and video refs to be available
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 1. Create peer connection
    const pc = new RTCPeerConnection(rtcConfig);
    peerConnectionRef.current = pc;
    
    // Set up ontrack handler EARLY to catch incoming streams
    pc.ontrack = (event: RTCTrackEvent) => {
      if (event.streams && event.streams[0]) {
        remoteStreamRef.current = event.streams[0];
        
        // Always assign remote video for video calls
        if (incomingCallType === 'video' && remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        } else if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = event.streams[0];
        }
      }
    };
    // 2. Get local stream and add tracks
    let localStream = localStreamRef.current;
    if (!localStream) {
      try {
        const constraints = incomingCallType === 'video' ? { audio: true, video: true } : { audio: true };
        localStream = await navigator.mediaDevices.getUserMedia(constraints);
        localStreamRef.current = localStream;
        // Always assign local video for video calls
        if (incomingCallType === 'video' && localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }
      } catch (err) {
        return;
      }
    }
    // Always add all tracks to peer connection
    localStream.getTracks().forEach(track => {
      pc.addTrack(track, localStream!);
    });
    
    // 4. Set remote description (offer)
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    
    // Process any queued ICE candidates now that remote description is set
    for (const candidate of iceCandidateQueue.current) {
      try {
        await pc.addIceCandidate(candidate);
      } catch (err) {
        // Handle silently or log if needed
      }
    }
    iceCandidateQueue.current = []; // Clear the queue
    
    // 5. Create and set local answer
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    
    // 6. Send answer
    socketRef.current.emit('call:answer', {
      to: from,
      from: user.id,
      answer
    });
    
    // ICE candidate handler
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit('call:ice-candidate', {
          to: from,
          from: user.id,
          candidate: event.candidate
        });
      }
    };
    pc.oniceconnectionstatechange = () => {
      // Connection state monitoring
    };
    pc.onsignalingstatechange = () => {
      // Signaling state monitoring
    };
  };
    // Incoming Answer 
    const handleAnswer = async ({ answer }: { answer: any }) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        setCallState('in-call');
      }
    };
    // Incoming ICE Candidate 
    const handleIceCandidate = async ({ candidate }: { candidate: any }) => {
      if (!candidate) {
        return;
      }
      
      if (peerConnectionRef.current && peerConnectionRef.current.remoteDescription) {
        try {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          // Handle silently or log if needed
        }
      } else {
        // Queue the ICE candidate for later
        iceCandidateQueue.current.push(new RTCIceCandidate(candidate));
      }
    };
    // Incoming Call End 
    const handleCallEnd = () => {
      endCall(false); // Don't notify peer - we're responding to their call:end event
    };
    socketRef.current.on('call:offer', handleOffer);
    socketRef.current.on('call:answer', handleAnswer);
    socketRef.current.on('call:ice-candidate', handleIceCandidate);
    socketRef.current.on('call:end', handleCallEnd);
    return () => {
      socketRef.current.off('call:offer', handleOffer);
      socketRef.current.off('call:answer', handleAnswer);
      socketRef.current.off('call:ice-candidate', handleIceCandidate);
      socketRef.current.off('call:end', handleCallEnd);
    };
    // eslint-disable-next-line
  }, [socketRef, user.id, activeChat.id]);

  // Helper to get or fetch sessionId for this DM
  const getSessionId = async () => {
    if (sessionIdCache[activeChat.id]) return sessionIdCache[activeChat.id];
    const API_URL = import.meta.env.VITE_API_URL;
    // Fetch all sessions for this user
    const res = await fetch(`${API_URL}/api/dms/list?userId=${user.id}`);
    const sessions = await res.json();
    // Find the session for this friend
    const session = sessions.find((s: any) =>
      (s.user1Id == user.id && s.user2Id == activeChat.id) ||
      (s.user2Id == user.id && s.user1Id == activeChat.id)
    );
    if (session) {
      setSessionIdCache(cache => ({ ...cache, [activeChat.id]: session.id }));
      return session.id;
    }
    // Optionally: create session if not found (not implemented here)
    throw new Error('DM session not found');
  };

  // Fetch messages from backend when activeChat changes
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const sessionId = await getSessionId();
        const API_URL = import.meta.env.VITE_API_URL;
        const res = await fetch(`${API_URL}/api/dms/${sessionId}/messages`);
        const allMessages = await res.json();
        setMessages(allMessages.map((m: any) => {
          if (m.type === 'text') {
            return { senderId: m.senderId.toString(), message: m.content, createdAt: m.createdAt };
          } else if (m.type === 'file') {
            return {
              senderId: m.senderId.toString(),
              message: '',
              createdAt: m.createdAt,
              file: {
                url: m.fileUrl,
                name: m.fileName,
                type: m.fileType,
              },
            };
          } else if (m.type === 'call') {
            return {
              senderId: m.senderId.toString(),
              message: '',
              createdAt: m.createdAt,
              call: {
                endedAt: m.endedAt,
                status: m.status,
              },
            };
          }
          return null;
        }).filter(Boolean));
      } catch (err) {
        setMessages([]);
      }
    };
    if (activeChat && activeChat.id) {
      fetchMessages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChat?.id]);

  // Handle file selection and upload
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const sessionId = await getSessionId();
      const API_URL = import.meta.env.VITE_API_URL;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('sessionId', sessionId);
      formData.append('senderId', user.id);
      formData.append('receiverId', activeChat.id);
      const res = await fetch(`${API_URL}/api/dms/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.attachment) {
        // Add file message to chat
        setMessages(msgs => [
          ...msgs,
          {
            senderId: user.id,
            message: '',
            file: {
              url: data.attachment.fileUrl,
              name: data.attachment.fileName,
              type: data.attachment.fileType,
            },
          },
        ]);
      }
    } catch (err) {
      alert('Failed to upload file: ' + (err as any).message);
    }
  };

  // Close menu on click outside
  React.useEffect(() => {
    if (!plusMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".dm-plus-menu-trigger")) {
        setPlusMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [plusMenuOpen]);

  // Ensure remote stream is assigned to audio element when it appears or when call state changes
  useEffect(() => {
    if (callState === 'in-call' && remoteAudioRef.current && remoteStreamRef.current) {
      remoteAudioRef.current.srcObject = remoteStreamRef.current;
    }
  }, [callState]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Always render VideoCallOverlay for video calls if callState !== 'idle' */}
      {callType === 'video' && callState !== 'idle' ? (
        <VideoCallOverlay
          localVideoRef={localVideoRef}
          remoteVideoRef={remoteVideoRef}
          onEnd={endCall}
          callState={callState}
          remoteName={activeChat.name}
          localName={user.name}
        />
      ) : callState !== 'idle' && (
        <CallModal
          callState={callState as any}
          localUser={{ id: user.id, name: user.name || user.id, avatarUrl: "/discord.png" }}
          remoteUser={{ id: activeChat.id, name: activeChat.name, avatarUrl: "/discord.png" }}
          onAccept={acceptCall}
          onDecline={declineCall}
          onEnd={endCall}
        />
      )}
      {/* Main chat UI, only show if not in call modal */}
      {callState === 'idle' && (
        <>
      <div className="flex items-center px-6 py-4 border-b border-[#23272a] bg-[#313338]">
        <img src="/discord.png" alt="avatar" className="w-8 h-8 rounded-full bg-[#5865f2] mr-3" />
        <span className="font-bold text-lg">{activeChat.name}</span>
        <div className="flex gap-2 ml-auto">
          {/* --- Voice Call Button --- */}
          <button
            className="p-2 hover:bg-[#23272a] rounded-full"
            onClick={startCall}
            disabled={callState !== 'idle'}
            title={callState !== 'idle' ? 'Already in a call' : 'Start voice call'}
          >
            <Phone size={20} />
          </button>
          <button
            className="p-2 hover:bg-[#23272a] rounded-full"
            onClick={startVideoCall}
            disabled={callState !== 'idle'}
            title={callState !== 'idle' ? 'Already in a call' : 'Start video call'}
          >
            <Video size={20} />
          </button>
          <button className="p-2 hover:bg-[#23272a] rounded-full"><Paperclip size={20} /></button>
        </div>
        <button className="ml-2 text-gray-400 hover:text-white" onClick={() => setActiveChat(null)}><X size={24} /></button>
      </div>
      <div
        className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4 bg-[#313338]"
        style={{ display: 'flex', flexDirection: 'column-reverse' }}
      >
        {[...messages].reverse().map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.senderId == user.id ? 'justify-end' : 'justify-start'}`}
          >
            {msg.call ? (
              <div className="flex items-center gap-2 text-xs text-green-400 bg-[#23272a] rounded-lg px-3 py-2">
                {msg.call?.callType === 'video' ? <Video size={16} /> : <Phone size={16} />}
                {msg.senderId == user.id ? 'You' : activeChat.name} started a {msg.call?.callType === 'video' ? 'video' : 'voice'} call{msg.call.endedAt ? ' that lasted a few seconds.' : '...' }
              </div>
            ) : msg.file ? (
              <div className="bg-[#23272a] rounded-lg p-4 max-w-xs">
                {isImageFile(msg.file.type) ? (
                  <img src={msg.file.url} alt={msg.file.name} className="rounded mb-2 max-w-full max-h-48" />
                ) : null}
                <a href={msg.file.url} target="_blank" rel="noopener noreferrer" className="block text-white text-sm mt-1">{msg.file.name}</a>
              </div>
            ) : (
              <div className={`px-4 py-2 rounded-lg ${msg.senderId == user.id ? 'bg-[#5865f2] text-white' : 'bg-[#23272a] text-gray-200'}`}>{msg.message}</div>
            )}
          </div>
        ))}
      </div>
      <form
        className="flex items-center p-4 border-t border-[#23272a] bg-[#23272a] relative"
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
        <div className="dm-plus-menu-trigger relative">
          <button type="button" className="p-2 hover:bg-[#313338] rounded-full" onClick={() => setPlusMenuOpen(v => !v)}>
            <Plus size={20} />
          </button>
          {plusMenuOpen && (
            <DmPlusMenu
              onUploadFile={() => fileInputRef.current?.click()}
              onClose={() => setPlusMenuOpen(false)}
            />
          )}
        </div>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileSelect}
          accept="image/*,application/pdf,application/zip,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
        />
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
        </>
      )}
      {/* Always render the audio element for remote stream, but hide video elements (handled by overlay) */}
      <audio ref={remoteAudioRef} autoPlay playsInline style={{ display: 'none' }} />
    </div>
  );
} 