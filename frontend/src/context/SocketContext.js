import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { AuthContext } from './AuthContext';
import { connectSocket, disconnectSocket } from '../services/socketService';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const socketInstance = connectSocket();

      const handleConnect = () => setConnected(true);
      const handleDisconnect = () => setConnected(false);

      socketInstance.on('connect', handleConnect);
      socketInstance.on('disconnect', handleDisconnect);

      setSocket(socketInstance);

      return () => {
        socketInstance.off('connect', handleConnect);
        socketInstance.off('disconnect', handleDisconnect);
      };
    }

    if (!isAuthenticated) {
      disconnectSocket();
      setSocket(null);
      setConnected(false);
    }
  }, [isAuthenticated, authLoading]);

  const value = useMemo(
    () => ({ socket, connected }),
    [socket, connected],
  );

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

SocketProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
