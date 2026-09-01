import { useState, useEffect } from 'react';
import { useAuthStore } from './hooks/useAuthStore';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { BoardEditorPage } from './pages/BoardEditorPage';
import { ShareModal } from './components/panels/ShareModal';
import { SummaryPanel } from './components/panels/SummaryPanel';
import { TranscriptPanel } from './components/panels/TranscriptPanel';
import { useBoardStore } from './hooks/useBoardStore';

export function App() {
  const { token, setAuth } = useAuthStore();
  const [currentPage, setCurrentPage] = useState<'login' | 'register' | 'dashboard' | 'editor'>('login');
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);

  // Modals & Panels state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSummaryPanelOpen, setIsSummaryPanelOpen] = useState(false);
  const [isTranscriptPanelOpen, setIsTranscriptPanelOpen] = useState(false);

  const { setBoardData, collaborators } = useBoardStore();

  // Handle Demo Mode / Auto Login if token is empty
  useEffect(() => {
    if (token) {
      setCurrentPage('dashboard');
    } else {
      setCurrentPage('login');
    }
  }, [token]);

  const handleSelectBoard = (boardId: string) => {
    setActiveBoardId(boardId);
    setCurrentPage('editor');
  };

  const handleDemoAccess = () => {
    // Immediate Live Demo Mode for Instant UI Testing
    setAuth(
      {
        id: 'demo-user-1',
        name: 'Alex Rivers (Demo)',
        email: 'alex@kollabkanvas.app',
        avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Alex',
      },
      'demo-jwt-token-12345'
    );
    // Initialize sample whiteboard elements
    setBoardData(
      'demo-board-1',
      'Sprint 42 Architecture Whiteboard',
      'OWNER',
      [
        {
          elementId: 'el-1',
          type: 'sticky',
          props: { x: 140, y: 120, width: 180, height: 140, text: '💡 Microservice Event Architecture', fillColor: '#fef08a' },
          zIndex: 1,
          version: 1,
        },
        {
          elementId: 'el-2',
          type: 'rect',
          props: { x: 380, y: 120, width: 220, height: 140, strokeColor: '#6366f1', strokeWidth: 3 },
          zIndex: 2,
          version: 1,
        },
        {
          elementId: 'el-3',
          type: 'text',
          props: { x: 400, y: 170, text: 'Spring Boot REST Gateway', strokeColor: '#818cf8' },
          zIndex: 3,
          version: 1,
        },
        {
          elementId: 'el-4',
          type: 'ellipse',
          props: { x: 680, y: 130, width: 160, height: 120, strokeColor: '#22c55e', strokeWidth: 2 },
          zIndex: 4,
          version: 1,
        },
        {
          elementId: 'el-5',
          type: 'text',
          props: { x: 710, y: 175, text: 'Redis Pub/Sub', strokeColor: '#4ade80' },
          zIndex: 5,
          version: 1,
        },
        {
          elementId: 'el-6',
          type: 'sticky',
          props: { x: 380, y: 320, width: 220, height: 140, text: '✅ Task: Deploy Docker Containers to Render & Vercel', fillColor: '#bbf7d0' },
          zIndex: 6,
          version: 1,
        },
      ]
    );
    setActiveBoardId('demo-board-1');
    setCurrentPage('editor');
  };

  return (
    <div style={{ minHeight: '100vh', width: '100vw', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Demo Banner */}
      {!token && (
        <div style={{
          background: 'linear-gradient(90deg, #4f46e5, #7c3aed)',
          color: '#ffffff',
          padding: '0.5rem 1rem',
          textAlign: 'center',
          fontSize: '0.875rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          zIndex: 1000,
          position: 'relative',
        }}>
          <span>✨ KollabKanvas Platform — Click Demo to launch Whiteboard Editor immediately</span>
          <button
            onClick={handleDemoAccess}
            style={{
              background: '#ffffff',
              color: '#4f46e5',
              border: 'none',
              borderRadius: '20px',
              padding: '0.25rem 0.875rem',
              fontWeight: 700,
              fontSize: '0.8125rem',
              cursor: 'pointer',
            }}
          >
            🚀 Launch Instant Demo
          </button>
        </div>
      )}

      {currentPage === 'login' && (
        <LoginPage
          onSwitchToRegister={() => setCurrentPage('register')}
          onLoginSuccess={() => setCurrentPage('dashboard')}
        />
      )}

      {currentPage === 'register' && (
        <RegisterPage
          onSwitchToLogin={() => setCurrentPage('login')}
          onRegisterSuccess={() => setCurrentPage('dashboard')}
        />
      )}

      {currentPage === 'dashboard' && (
        <DashboardPage onSelectBoard={handleSelectBoard} />
      )}

      {currentPage === 'editor' && activeBoardId && (
        <BoardEditorPage
          boardId={activeBoardId}
          onBackToDashboard={() => setCurrentPage('dashboard')}
          onOpenShareModal={() => setIsShareModalOpen(true)}
          onOpenSummaryPanel={() => setIsSummaryPanelOpen((prev) => !prev)}
          onOpenTranscriptPanel={() => setIsTranscriptPanelOpen((prev) => !prev)}
        />
      )}

      {/* Panels & Modals */}
      {activeBoardId && (
        <>
          <ShareModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            boardId={activeBoardId}
            collaborators={collaborators}
            onRefreshBoard={() => {}}
          />
          <SummaryPanel
            isOpen={isSummaryPanelOpen}
            onClose={() => setIsSummaryPanelOpen(false)}
            boardId={activeBoardId}
          />
          <TranscriptPanel
            isOpen={isTranscriptPanelOpen}
            onClose={() => setIsTranscriptPanelOpen(false)}
            boardId={activeBoardId}
          />
        </>
      )}
    </div>
  );
}

export default App;
