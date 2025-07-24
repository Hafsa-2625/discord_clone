import React from 'react';

interface VideoDebugPanelProps {
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
  localStreamRef: React.MutableRefObject<MediaStream | null>;
  remoteStreamRef: React.MutableRefObject<MediaStream | null>;
  callState: string;
  callType: string;
}

export default function VideoDebugPanel({
  localVideoRef,
  remoteVideoRef,
  localStreamRef,
  remoteStreamRef,
  callState,
  callType
}: VideoDebugPanelProps) {
  const checkStreamAssignments = () => {
    console.log('=== MANUAL STREAM CHECK ===');
    
    console.log('📍 Call State:', callState, 'Type:', callType);
    
    console.log('📹 Local Video Element:');
    if (localVideoRef.current) {
      const el = localVideoRef.current;
      console.log('  - Has srcObject:', !!el.srcObject);
      console.log('  - Video tracks:', el.srcObject ? (el.srcObject as MediaStream).getVideoTracks().length : 0);
      console.log('  - Dimensions:', el.videoWidth + 'x' + el.videoHeight);
      console.log('  - Ready state:', el.readyState);
      console.log('  - Playing:', !el.paused);
    } else {
      console.log('  - Element: NULL');
    }
    
    console.log('📹 Remote Video Element:');
    if (remoteVideoRef.current) {
      const el = remoteVideoRef.current;
      console.log('  - Has srcObject:', !!el.srcObject);
      console.log('  - Video tracks:', el.srcObject ? (el.srcObject as MediaStream).getVideoTracks().length : 0);
      console.log('  - Dimensions:', el.videoWidth + 'x' + el.videoHeight);
      console.log('  - Ready state:', el.readyState);
      console.log('  - Playing:', !el.paused);
    } else {
      console.log('  - Element: NULL');
    }
    
    console.log('📊 Stream References:');
    console.log('  - localStreamRef exists:', !!localStreamRef.current);
    console.log('  - remoteStreamRef exists:', !!remoteStreamRef.current);
    
    if (localStreamRef.current) {
      console.log('  - Local tracks:', localStreamRef.current.getTracks().map(t => `${t.kind}:${t.enabled}`));
    }
    if (remoteStreamRef.current) {
      console.log('  - Remote tracks:', remoteStreamRef.current.getTracks().map(t => `${t.kind}:${t.enabled}`));
    }
  };

  const forceStreamAssignment = () => {
    console.log('🔧 Forcing stream assignment...');
    
    if (callType === 'video') {
      if (localStreamRef.current && localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
        console.log('✅ Forced local video assignment');
      }
      
      if (remoteStreamRef.current && remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStreamRef.current;
        console.log('✅ Forced remote video assignment');
      }
    }
  };

  if (callState === 'idle') {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-black bg-opacity-80 text-white p-4 rounded-lg max-w-xs">
      <h3 className="text-sm font-bold mb-2">Video Debug Panel</h3>
      <div className="text-xs space-y-1">
        <div>State: {callState}</div>
        <div>Type: {callType}</div>
        <div>
          Local Video: {localVideoRef.current ? 
            (localVideoRef.current.srcObject ? '✅' : '❌') : '❌'}
        </div>
        <div>
          Remote Video: {remoteVideoRef.current ? 
            (remoteVideoRef.current.srcObject ? '✅' : '❌') : '❌'}
        </div>
      </div>
      
      <div className="mt-3 space-y-1">
        <button 
          onClick={checkStreamAssignments}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
        >
          Check Streams
        </button>
        <button 
          onClick={forceStreamAssignment}
          className="w-full bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
        >
          Force Assignment
        </button>
      </div>
    </div>
  );
}
