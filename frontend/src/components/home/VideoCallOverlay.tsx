import React from "react";

type CallState = 'idle' | 'calling' | 'receiving' | 'in-call';

interface VideoCallOverlayProps {
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
  onEnd: () => void;
  callState: CallState;
  onAccept?: () => void;
  onDecline?: () => void;
  remoteName?: string;
  localName?: string;
}

const VideoCallOverlay: React.FC<VideoCallOverlayProps> = ({
  localVideoRef,
  remoteVideoRef,
  onEnd,
  callState,
  onAccept,
  onDecline,
  remoteName,
  localName,
}) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(30,32,36,0.98)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* Main remote video */}
      <div style={{
        position: 'relative',
        width: 480,
        height: 360,
        background: '#23272a',
        borderRadius: 16,
        boxShadow: '0 4px 32px #0008',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: 16,
            background: '#23272a',
          }}
        />
        {/* Remote user name */}
        {remoteName && (
          <div style={{
            position: 'absolute',
            top: 12,
            left: 16,
            color: '#fff',
            fontWeight: 700,
            fontSize: 18,
            textShadow: '0 2px 8px #000a',
          }}>
            @{remoteName}
          </div>
        )}
      </div>
      {/* Local video overlay */}
      <div style={{
        position: 'fixed',
        bottom: 40,
        right: 40,
        width: 160,
        height: 120,
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 2px 12px #0006',
        border: '2px solid #5865f2',
        background: '#23272a',
        zIndex: 1100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: 12,
            background: '#23272a',
          }}
        />
        {/* Local user name */}
        {localName && (
          <div style={{
            position: 'absolute',
            bottom: 4,
            left: 8,
            color: '#fff',
            fontWeight: 600,
            fontSize: 14,
            textShadow: '0 2px 8px #000a',
          }}>
            {localName}
          </div>
        )}
      </div>
      {/* Call controls */}
      <div style={{
        position: 'fixed',
        bottom: 40,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 16,
        zIndex: 1200,
      }}>
        {callState === 'receiving' ? (
          <>
            <button onClick={onAccept} style={{ padding: '12px 32px', background: '#43b581', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 18, cursor: 'pointer' }}>Accept</button>
            <button onClick={onDecline} style={{ padding: '12px 32px', background: '#f04747', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 18, cursor: 'pointer' }}>Decline</button>
          </>
        ) : (
          <button onClick={onEnd} style={{ padding: '12px 32px', background: '#f04747', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 18, cursor: 'pointer' }}>End Call</button>
        )}
      </div>
      {callState === 'calling' && <div style={{ color: '#fff', position: 'fixed', top: 32, left: '50%', transform: 'translateX(-50%)', fontSize: 20 }}>Calling...</div>}
      {callState === 'receiving' && <div style={{ color: '#fff', position: 'fixed', top: 32, left: '50%', transform: 'translateX(-50%)', fontSize: 20 }}>{remoteName} is calling you...</div>}
    </div>
  );
};

export default VideoCallOverlay; 