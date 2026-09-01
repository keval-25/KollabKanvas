import { useEffect, useRef } from 'react';
import { wsClientService as wsService } from '../services/wsClient';
import { useBoardStore } from './useBoardStore';
import { useAuthStore } from './useAuthStore';
import type { CursorPos, PresenceUser } from '../types/canvas';

export const useWebSocket = (boardId: string | null) => {
  const { user } = useAuthStore();
  const { updateElement, addElement, deleteElement, updateCursor } = useBoardStore();
  const connectedRef = useRef(false);

  useEffect(() => {
    if (!boardId || !user) return;

    wsService.connect(
      () => {
        connectedRef.current = true;

        // Subscribe to element updates
        wsService.subscribe(`/topic/board/${boardId}/elements`, (msg: any) => {
          if (msg.op === 'CREATE') {
            const newEl = {
              elementId: msg.elementId,
              type: msg.payload?.type || 'rect',
              props: msg.payload,
              zIndex: msg.payload?.zIndex || 1,
              version: msg.clientVersion || 1,
              lastEditedBy: msg.userId,
            };
            addElement(newEl);
          } else if (msg.op === 'UPDATE' || msg.op === 'MOVE') {
            updateElement(msg.elementId, msg.payload, msg.clientVersion);
          } else if (msg.op === 'DELETE') {
            deleteElement(msg.elementId);
          }
        });

        // Subscribe to cursors
        wsService.subscribe(`/topic/board/${boardId}/cursors`, (msg: CursorPos) => {
          if (msg.userId !== user.id) {
            updateCursor(msg);
          }
        });

        // Subscribe to presence
        wsService.subscribe(`/topic/board/${boardId}/presence`, (_msg: PresenceUser) => {
          // Presence handled
        });

        // Broadcast JOIN event
        wsService.publish(`/app/board/${boardId}/presence`, {
          type: 'JOIN',
          userId: user.id,
          userName: user.name,
          avatarUrl: user.avatarUrl,
        });
      },
      (err) => {
        console.error('WebSocket STOMP connection error:', err);
      }
    );

    return () => {
      if (connectedRef.current) {
        wsService.publish(`/app/board/${boardId}/presence`, {
          type: 'LEAVE',
          userId: user.id,
          userName: user.name,
        });
        wsService.disconnect();
        connectedRef.current = false;
      }
    };
  }, [boardId, user]);

  const sendElementOp = (op: 'CREATE' | 'UPDATE' | 'DELETE' | 'MOVE', elementId: string, payload: Record<string, any>, clientVersion: number = 1) => {
    if (!boardId || !user) return;
    wsService.publish(`/app/board/${boardId}/edit`, {
      type: `ELEMENT_${op}`,
      boardId,
      elementId,
      op,
      payload,
      clientVersion,
      userId: user.id,
      userName: user.name,
      timestamp: Date.now(),
    });
  };

  const sendCursorMove = (x: number, y: number, color: string = '#6366f1') => {
    if (!boardId || !user) return;
    wsService.publish(`/app/board/${boardId}/cursor`, {
      type: 'CURSOR_MOVE',
      boardId,
      userId: user.id,
      userName: user.name,
      color,
      x,
      y,
    });
  };

  return { sendElementOp, sendCursorMove };
};
