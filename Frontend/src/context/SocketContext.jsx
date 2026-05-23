/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // In development Vite proxies /socket.io to the backend automatically,
    // so we can connect without specifying the host. In production the
    // frontend is served from the same origin as the API.
    // Vercel serverless cannot hold persistent WebSocket connections.
    // Use polling-only transport so Socket.IO works in production.
    // For true real-time WebSockets, consider migrating the backend to Railway/Render.
    const isProduction = import.meta.env.PROD;
    const newSocket = io(import.meta.env.VITE_API_URL || '', {
      withCredentials: true,
      transports: isProduction ? ['polling'] : ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('⚡ Socket connected:', newSocket.id);
    });

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
