import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';

export default function LiveAttendeeCount({ eventId }) {
  const socket = useSocket();
  const [liveCount, setLiveCount] = useState(0);

  useEffect(() => {
    if (!socket || !eventId) return;
    // Join event room
    socket.emit('joinEventRoom', eventId);
    // Listen for live viewer count updates
    const handleCount = ({ count }) => setLiveCount(count);
    socket.on('liveViewerCount', handleCount);
    return () => {
      socket.emit('leaveEventRoom', eventId);
      socket.off('liveViewerCount', handleCount);
    };
  }, [socket, eventId]);

  if (liveCount === 0) return null;

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200">
      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
      <span className="text-xs font-semibold text-red-700">
        {liveCount} viewing now
      </span>
    </div>
  );
}
