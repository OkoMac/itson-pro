/**
 * useWebSocket — connects to the Socket.io backend for real-time updates.
 *
 * Only connects when VITE_WS_URL is set and the app is not in demo mode.
 * Automatically disconnects on unmount / sign-out.
 *
 * Usage:
 *   const { connected, socket } = useWebSocket();
 *   useEffect(() => {
 *     socket?.on('order:updated', (data) => { ... });
 *     return () => { socket?.off('order:updated'); };
 *   }, [socket]);
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { isDemoMode } from '@/lib/supabase';
import { getAuthToken } from '@/services/api';

const WS_URL = import.meta.env.VITE_WS_URL ?? '';

// Module-level singleton so multiple hook instances share one socket.
let _socket: Socket | null = null;
let _refCount = 0;

function getOrCreateSocket(): Socket | null {
  if (isDemoMode || !WS_URL) return null;
  if (!_socket) {
    _socket = io(WS_URL, {
      auth: { token: getAuthToken() },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });
  }
  return _socket;
}

function releaseSocket() {
  _refCount--;
  if (_refCount <= 0 && _socket) {
    _socket.disconnect();
    _socket = null;
    _refCount = 0;
  }
}

// ─── Known server events ──────────────────────────────────────────────────────

export type WsEvent =
  | 'order:created'
  | 'order:updated'
  | 'order:cancelled'
  | 'invoice:paid'
  | 'stock:low_threshold'
  | 'repair:status_changed'
  | 'approval:requested'
  | 'approval:processed';

export type WsHandler<T = unknown> = (data: T) => void;

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useWebSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = getOrCreateSocket();
    if (!socket) return;

    _refCount++;
    socketRef.current = socket;

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // Sync current state
    setConnected(socket.connected);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      releaseSocket();
    };
  }, []);

  const on = useCallback(<T = unknown>(event: WsEvent, handler: WsHandler<T>) => {
    socketRef.current?.on(event, handler as any);
  }, []);

  const off = useCallback(<T = unknown>(event: WsEvent, handler: WsHandler<T>) => {
    socketRef.current?.off(event, handler as any);
  }, []);

  const emit = useCallback((event: string, data?: unknown) => {
    socketRef.current?.emit(event, data);
  }, []);

  return { connected, socket: socketRef.current, on, off, emit };
}
