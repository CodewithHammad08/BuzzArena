/**
 * Socket.IO Client Singleton
 * A single socket instance shared across the entire app.
 * Import { socket } wherever socket events are needed.
 */

import { io } from 'socket.io-client';

import { API_URL } from '../config/api';

export const socket = io(API_URL, {
  autoConnect: false,       // We connect manually when entering a room
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
  timeout: 10000,
  transports: ['websocket', 'polling'],
});

// Debug logging in development
if (import.meta.env.DEV) {
  socket.on('connect', () => console.log('[Socket] Connected:', socket.id));
  socket.on('disconnect', (reason) => console.log('[Socket] Disconnected:', reason));
  socket.on('connect_error', (err) => console.error('[Socket] Error:', err.message));
}

export default socket;
