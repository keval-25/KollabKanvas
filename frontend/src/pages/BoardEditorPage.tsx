import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Board } from '../types/board';
import { useBoardStore } from '../hooks/useBoardStore';
import { useWebSocket } from '../hooks/useWebSocket';
import { CanvasRenderer } from '../components/canvas/CanvasRenderer';
import { CursorLayer } from '../components/canvas/CursorLayer';
import { Toolbar } from '../components/toolbar/Toolbar';
import { PresenceBar } from '../components/toolbar/PresenceBar';
import { ArrowLeft, Share2, Sparkles, FileText, Download } from 'lucide-react';
import { exportBoardAsPng } from '../utils/exportBoard';

interface BoardEditorPageProps {
  boardId: string;
  onBackToDashboard: () => void;
  onOpenShareModal?: () => void;
  onOpenSummaryPanel?: () => void;
  onOpenTranscriptPanel?: () => void;
}

export const BoardEditorPage: React.FC<BoardEditorPageProps> = ({
  boardId,
  onBackToDashboard,
  onOpenShareModal,
  onOpenSummaryPanel,
  onOpenTranscriptPanel,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const { setBoardData, boardName, userRole, undo, redo, deleteElement, selectedElementId } = useBoardStore();

  const { sendElementOp, sendCursorMove } = useWebSocket(boardId);

  useEffect(() => {
    const fetchBoard = async () => {
      setIsLoading(true);
      try {
        const response = await api.get<Board>(`/boards/${boardId}`);
        setBoardData(response.data.id, response.data.name, response.data.role, response.data.elements || []);
      } catch (err) {
        alert('Failed to load board details');
        onBackToDashboard();
      } finally {
        setIsLoading(false);
      }
    };
    fetchBoard();
  }, [boardId]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-primary)', color: '#94a3b8' }}>
        Loading collaborative whiteboard...
      </div>
    );
  }

  const handleElementCreate = (element: any) => {
    sendElementOp('CREATE', element.elementId, element.props, element.version);
  };

  const handleElementUpdate = (elementId: string, payload: Record<string, any>) => {
    sendElementOp('UPDATE', elementId, payload);
  };

  const handleUndo = () => {
    undo();
  };

  const handleRedo = () => {
    redo();
  };

  const handleDeleteSelected = () => {
    if (selectedElementId) {
      deleteElement(selectedElementId);
      sendElementOp('DELETE', selectedElementId, {});
    }
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: 'var(--bg-canvas)' }}>
      {/* Top Header Bar */}
      <header style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '60px',
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--glass-border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={onBackToDashboard} className="btn-secondary" style={{ padding: '0.4rem 0.75rem' }}>
            <ArrowLeft size={18} /> Boards
          </button>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.125rem', fontWeight: 600, color: '#f8fafc' }}>
            {boardName}
          </h2>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            padding: '0.2rem 0.5rem',
            borderRadius: '4px',
            background: 'rgba(99, 102, 241, 0.2)',
            color: '#818cf8',
          }}>
            {userRole}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <PresenceBar />

          <button onClick={() => {
            const canvas = document.querySelector('canvas');
            if (canvas) exportBoardAsPng(canvas, `${boardName}.png`);
          }} className="btn-secondary" style={{ padding: '0.4rem 0.75rem' }}>
            <Download size={16} /> Export Image
          </button>

          {onOpenSummaryPanel && (
            <button onClick={onOpenSummaryPanel} className="btn-secondary" style={{ padding: '0.4rem 0.75rem' }}>
              <Sparkles size={16} color="#818cf8" /> AI Summary
            </button>
          )}

          {onOpenTranscriptPanel && (
            <button onClick={onOpenTranscriptPanel} className="btn-secondary" style={{ padding: '0.4rem 0.75rem' }}>
              <FileText size={16} /> Transcript
            </button>
          )}

          {onOpenShareModal && userRole === 'OWNER' && (
            <button onClick={onOpenShareModal} className="btn-primary" style={{ padding: '0.4rem 0.875rem' }}>
              <Share2 size={16} /> Share
            </button>
          )}
        </div>
      </header>

      {/* Main Drawing Canvas & Layers */}
      <CanvasRenderer
        onElementCreate={handleElementCreate}
        onElementUpdate={handleElementUpdate}
        onCursorMove={sendCursorMove}
      />
      <CursorLayer />

      {/* Left Toolbar */}
      <Toolbar
        onUndo={handleUndo}
        onRedo={handleRedo}
        onDeleteSelected={handleDeleteSelected}
      />
    </div>
  );
};
