import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import useAuth from '../hooks/useAuth';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const activeRooms = useRef(new Set());

  // Derive Socket Server URL
  const getSocketUrl = () => {
    if (import.meta.env.VITE_SOCKET_URL) {
      return import.meta.env.VITE_SOCKET_URL;
    }
    if (import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL.replace('/api', '');
    }
    return window.location.hostname === 'localhost' ? 'http://localhost:5000' : window.location.origin;
  };

  useEffect(() => {
    const socketUrl = getSocketUrl();
    const newSocket = io(socketUrl, {
      withCredentials: true,
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    newSocket.on('connect', () => {
      console.log('🔌 Connected to Smart Bakery Socket Server:', newSocket.id);
      setIsConnected(true);

      // Re-join any previously joined rooms upon reconnect
      activeRooms.current.forEach((room) => {
        newSocket.emit('join_room', room);
      });
    });

    newSocket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from Socket Server:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.warn('Socket connection error (server may be starting or offline):', error.message);
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Room Helpers
  const joinOrderRoom = useCallback(
    (orderId) => {
      if (!socket || !orderId) return;
      const room = `order_${orderId}`;
      socket.emit('join_room', room);
      activeRooms.current.add(room);
    },
    [socket]
  );

  const leaveOrderRoom = useCallback(
    (orderId) => {
      if (!socket || !orderId) return;
      const room = `order_${orderId}`;
      socket.emit('leave_room', room);
      activeRooms.current.delete(room);
    },
    [socket]
  );

  const joinKitchenRoom = useCallback(() => {
    if (!socket) return;
    const room = 'kitchen_channel';
    socket.emit('join_room', room);
    activeRooms.current.add(room);
  }, [socket]);

  const leaveKitchenRoom = useCallback(() => {
    if (!socket) return;
    const room = 'kitchen_channel';
    socket.emit('leave_room', room);
    activeRooms.current.delete(room);
  }, [socket]);

  const joinDeliveryRoom = useCallback(() => {
    if (!socket) return;
    const room = 'delivery_couriers';
    socket.emit('join_room', room);
    activeRooms.current.add(room);
  }, [socket]);

  const leaveDeliveryRoom = useCallback(() => {
    if (!socket) return;
    const room = 'delivery_couriers';
    socket.emit('leave_room', room);
    activeRooms.current.delete(room);
  }, [socket]);

  // Event Subscription Helpers
  const onOrderStatusUpdated = useCallback(
    (callback) => {
      if (!socket) return () => {};
      socket.on('order_status_updated', callback);
      return () => socket.off('order_status_updated', callback);
    },
    [socket]
  );

  const onNewOrder = useCallback(
    (callback) => {
      if (!socket) return () => {};
      socket.on('new_order_placed', callback);
      return () => socket.off('new_order_placed', callback);
    },
    [socket]
  );

  const onCourierLocationUpdated = useCallback(
    (callback) => {
      if (!socket) return () => {};
      socket.on('courier_location_updated', callback);
      return () => socket.off('courier_location_updated', callback);
    },
    [socket]
  );

  const emitCourierLocation = useCallback(
    (orderId, coordinates) => {
      if (!socket || !orderId) return;
      socket.emit('update_courier_location', { orderId, coordinates });
    },
    [socket]
  );

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        joinOrderRoom,
        leaveOrderRoom,
        joinKitchenRoom,
        leaveKitchenRoom,
        joinDeliveryRoom,
        leaveDeliveryRoom,
        onOrderStatusUpdated,
        onNewOrder,
        onCourierLocationUpdated,
        emitCourierLocation,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export default SocketContext;
