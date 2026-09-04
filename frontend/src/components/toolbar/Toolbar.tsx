import React from 'react';
import { useBoardStore } from '../../hooks/useBoardStore';
import type { ToolType } from '../../types/canvas';
import { MousePointer, Edit2, Square, Circle, Minus, Type, StickyNote, Undo, Redo, Trash2 } from 'lucide-react';

interface ToolbarProps {
  onUndo: () => void;
  onRedo: () => void;
  onDeleteSelected: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ onUndo, onRedo, onDeleteSelected }) => {
  const { activeTool, setActiveTool, strokeColor, setStrokeColor, userRole, selectedElementId } = useBoardStore();

  const isReadOnly = userRole === 'VIEWER' || userRole === 'COMMENTER';

  const tools: { id: ToolType; label: string; icon: React.FC<any> }[] = [
    { id: 'select', label: 'Select / Move', icon: MousePointer },
    { id: 'freehand', label: 'Pen / Draw', icon: Edit2 },
    { id: 'rect', label: 'Rectangle', icon: Square },
    { id: 'ellipse', label: 'Ellipse', icon: Circle },
    { id: 'line', label: 'Line', icon: Minus },
    { id: 'text', label: 'Text Box', icon: Type },
    { id: 'sticky', label: 'Sticky Note', icon: StickyNote },
  ];

  const colors = ['#f8fafc', '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#a855f7'];

  return (
    <div style={{
      position: 'absolute',
      left: '1.5rem',
      top: '50%',
      transform: 'translateY(-50%)',
      zIndex: 40,
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    }}>
      {/* Tool Selector Panel */}
      <div className="glass-panel" style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.375rem',
        padding: '0.5rem',
      }}>
        {tools.map((t) => {
          const Icon = t.icon;
          const isActive = activeTool === t.id;
          return (
            <button
              key={t.id}
              title={t.label}
              disabled={isReadOnly && t.id !== 'select'}
              onClick={() => setActiveTool(t.id)}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                border: 'none',
                background: isActive ? 'var(--accent-primary)' : 'transparent',
                color: isActive ? '#ffffff' : isReadOnly && t.id !== 'select' ? 'var(--text-muted)' : 'var(--text-secondary)',
                cursor: isReadOnly && t.id !== 'select' ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={20} />
            </button>
          );
        })}

        <div style={{ height: '1px', background: 'var(--border-color)', margin: '0.25rem 0' }} />

        {/* Undo / Redo */}
        <button
          title="Undo"
          disabled={isReadOnly}
          onClick={onUndo}
          style={{ width: '40px', height: '40px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Undo size={18} />
        </button>
        <button
          title="Redo"
          disabled={isReadOnly}
          onClick={onRedo}
          style={{ width: '40px', height: '40px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Redo size={18} />
        </button>

        {selectedElementId && !isReadOnly && (
          <button
            title="Delete Selected"
            onClick={onDeleteSelected}
            style={{ width: '40px', height: '40px', borderRadius: '8px', border: 'none', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      {/* Color Palette Panel */}
      {!isReadOnly && (
        <div className="glass-panel" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '0.375rem',
          padding: '0.5rem',
        }}>
          {colors.map((c) => (
            <div
              key={c}
              onClick={() => setStrokeColor(c)}
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: c,
                cursor: 'pointer',
                border: strokeColor === c ? '2px solid #ffffff' : '1px solid rgba(0,0,0,0.3)',
                boxShadow: strokeColor === c ? '0 0 8px ' + c : 'none',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
