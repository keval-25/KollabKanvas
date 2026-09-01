import React from 'react';
import { useBoardStore } from '../../hooks/useBoardStore';
import { MousePointer2 } from 'lucide-react';

export const CursorLayer: React.FC = () => {
  const { cursors } = useBoardStore();

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 50, overflow: 'hidden' }}>
      {Array.from(cursors.values()).map((cursor) => (
        <div
          key={cursor.userId}
          style={{
            position: 'absolute',
            left: `${cursor.x}px`,
            top: `${cursor.y}px`,
            transform: 'translate(-2px, -2px)',
            transition: 'all 0.05s linear',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}
        >
          <MousePointer2 size={20} color={cursor.color || '#6366f1'} style={{ fill: cursor.color || '#6366f1' }} />
          <span style={{
            background: cursor.color || '#6366f1',
            color: '#ffffff',
            fontSize: '0.75rem',
            fontWeight: 600,
            padding: '0.2rem 0.5rem',
            borderRadius: '12px',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}>
            {cursor.userName}
          </span>
        </div>
      ))}
    </div>
  );
};
