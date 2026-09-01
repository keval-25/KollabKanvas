import React from 'react';
import { useBoardStore } from '../../hooks/useBoardStore';
import { Users } from 'lucide-react';

export const PresenceBar: React.FC = () => {
  const { presence } = useBoardStore();

  return (
    <div className="glass-panel" style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.375rem 0.75rem',
      borderRadius: '20px',
    }}>
      <Users size={16} color="#818cf8" />
      <div style={{ display: 'flex', alignItems: 'center', margin: '0 -0.25rem' }}>
        {presence.slice(0, 5).map((user, idx) => (
          <img
            key={user.userId + idx}
            src={user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.userName}`}
            alt={user.userName}
            title={user.userName}
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              border: '2px solid #1e293b',
              marginRight: '-6px',
            }}
          />
        ))}
      </div>
      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#e2e8f0', marginLeft: '0.25rem' }}>
        {presence.length > 0 ? `${presence.length} Active` : '1 Online'}
      </span>
    </div>
  );
};
