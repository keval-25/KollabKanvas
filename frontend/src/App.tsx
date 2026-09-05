import { useEffect, useState } from 'react';
import { useAuthStore } from './hooks/useAuthStore';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { BoardEditorPage } from './pages/BoardEditorPage';
import { ShareModal } from './components/panels/ShareModal';
import { SummaryPanel } from './components/panels/SummaryPanel';
import { TranscriptPanel } from './components/panels/TranscriptPanel';

export function App() {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSummaryPanelOpen, setIsSummaryPanelOpen] = useState(false);
  const [isTranscriptPanelOpen, setIsTranscriptPanelOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    const handleShareLinkRouting = async () => {
      const pathname = window.location.pathname;
      if (pathname.startsWith('/share/')) {
        const token = pathname.replace('/share/', '').trim();
        if (token && isAuthenticated) {
          try {
            const response = await import('./services/api').then(m => m.api.get(`/boards/share/${token}`));
            if (response.data && response.data.id) {
              setActiveBoardId(response.data.id);
              window.history.replaceState({}, '', '/');
            }
          } catch (err) {
            alert('Share link invalid or expired.');
            window.history.replaceState({}, '', '/');
          }
        }
      }
    };

    if (isAuthenticated) {
      handleShareLinkRouting();
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        color: '#94a3b8',
        fontFamily: 'sans-serif'
      }}>
        Loading KollabKanvas...
      </div>
    );
  }

  if (!isAuthenticated) {
    if (authMode === 'login') {
      return <LoginPage onSwitchToRegister={() => setAuthMode('register')} />;
    }
    return <RegisterPage onSwitchToLogin={() => setAuthMode('login')} />;
  }

  if (activeBoardId) {
    return (
      <>
        <BoardEditorPage
          boardId={activeBoardId}
          onBackToDashboard={() => {
            setActiveBoardId(null);
            setIsShareModalOpen(false);
            setIsSummaryPanelOpen(false);
            setIsTranscriptPanelOpen(false);
          }}
          onOpenShareModal={() => setIsShareModalOpen(true)}
          onOpenSummaryPanel={() => setIsSummaryPanelOpen(true)}
          onOpenTranscriptPanel={() => setIsTranscriptPanelOpen(true)}
        />

        {isShareModalOpen && (
          <ShareModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            boardId={activeBoardId}
          />
        )}

        {isSummaryPanelOpen && (
          <SummaryPanel
            isOpen={isSummaryPanelOpen}
            onClose={() => setIsSummaryPanelOpen(false)}
            boardId={activeBoardId}
          />
        )}

        {isTranscriptPanelOpen && (
          <TranscriptPanel
            isOpen={isTranscriptPanelOpen}
            onClose={() => setIsTranscriptPanelOpen(false)}
            boardId={activeBoardId}
          />
        )}
      </>
    );
  }

  return <DashboardPage onSelectBoard={(boardId) => setActiveBoardId(boardId)} />;
}

export default App;
