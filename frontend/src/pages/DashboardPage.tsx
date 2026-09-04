import React, { useEffect, useState } from 'react';
import type { Board } from '../types/board';
import { api } from '../services/api';
import { useAuthStore } from '../hooks/useAuthStore';
import { CreateBoardModal } from '../components/dashboard/CreateBoardModal';
import { Plus, Search, Sparkles, LogOut, Copy, Trash2, Grid, List as ListIcon, Clock, Users } from 'lucide-react';

import { ThemeToggle } from '../components/toolbar/ThemeToggle';

interface DashboardPageProps {
  onSelectBoard: (boardId: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onSelectBoard }) => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { user, logout } = useAuthStore();

  const fetchBoards = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<Board[]>('/boards');
      setBoards(response.data);
    } catch (err) {
      // Handled
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  const handleCreateBoard = async (name: string, template: string) => {
    const response = await api.post<Board>('/boards', { name, template });
    await fetchBoards();
    onSelectBoard(response.data.id);
  };

  const handleDuplicateBoard = async (e: React.MouseEvent, boardId: string) => {
    e.stopPropagation();
    try {
      await api.post(`/boards/${boardId}/duplicate`);
      await fetchBoards();
    } catch (err) {
      alert('Failed to duplicate board');
    }
  };

  const handleDeleteBoard = async (e: React.MouseEvent, boardId: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this whiteboard?')) {
      try {
        await api.delete(`/boards/${boardId}`);
        await fetchBoards();
      } catch (err) {
        alert('Failed to delete board');
      }
    }
  };

  const filteredBoards = boards.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <header style={{
        height: '64px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-hover) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 10px var(--accent-light)',
          }}>
            <Sparkles size={20} color="#ffffff" />
          </div>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            KollabKanvas
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <ThemeToggle />

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.375rem 0.75rem', borderRadius: '20px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <img
              src={user?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.email}`}
              alt={user?.name}
              style={{ width: '28px', height: '28px', borderRadius: '50%' }}
            />
            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>{user?.name}</span>
          </div>
          <button onClick={() => logout()} className="btn-secondary" style={{ padding: '0.5rem 0.75rem' }}>
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem 3rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 700, color: '#f8fafc' }}>
              My Whiteboards
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Manage and collaborate on your interactive canvases
            </p>
          </div>
          <button onClick={() => setIsCreateModalOpen(true)} className="btn-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '0.9375rem' }}>
            <Plus size={20} /> Create New Board
          </button>
        </div>

        {/* Toolbar & Search */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.75rem' }}>
          <div style={{ position: 'relative', width: '320px' }}>
            <Search size={18} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Search whiteboards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.25rem', background: 'rgba(30, 41, 59, 0.6)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                background: viewMode === 'grid' ? '#6366f1' : 'transparent',
                border: 'none',
                color: viewMode === 'grid' ? '#ffffff' : '#94a3b8',
                padding: '0.375rem 0.625rem',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                background: viewMode === 'list' ? '#6366f1' : 'transparent',
                border: 'none',
                color: viewMode === 'list' ? '#ffffff' : '#94a3b8',
                padding: '0.375rem 0.625rem',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              <ListIcon size={18} />
            </button>
          </div>
        </div>

        {/* Board List / Grid */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
            Loading your whiteboards...
          </div>
        ) : filteredBoards.length === 0 ? (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem', borderRadius: '16px' }}>
            <Sparkles size={48} color="#6366f1" style={{ marginBottom: '1rem', opacity: 0.8 }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.5rem' }}>
              No whiteboards found
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              {searchQuery ? 'No board matches your search query' : 'Create your first collaborative board to get started'}
            </p>
            <button onClick={() => setIsCreateModalOpen(true)} className="btn-primary">
              <Plus size={18} /> Create Whiteboard
            </button>
          </div>
        ) : (
          <div style={viewMode === 'grid' ? {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.5rem',
          } : { display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filteredBoards.map((b) => (
              <div
                key={b.id}
                onClick={() => onSelectBoard(b.id)}
                className="glass-panel"
                style={{
                  padding: '1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#f8fafc', wordBreak: 'break-word' }}>
                    {b.name}
                  </h3>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    background: b.role === 'OWNER' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(148, 163, 184, 0.2)',
                    color: b.role === 'OWNER' ? '#818cf8' : '#cbd5e1',
                  }}>
                    {b.role}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', color: '#94a3b8', fontSize: '0.8125rem', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Sparkles size={14} /> {b.elementsCount} elements
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Users size={14} /> {b.collaboratorsCount} members
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Clock size={12} /> {new Date(b.updatedAt || b.createdAt).toLocaleDateString()}
                  </span>

                  <div style={{ display: 'flex', gap: '0.375rem' }}>
                    <button
                      title="Duplicate"
                      onClick={(e) => handleDuplicateBoard(e, b.id)}
                      style={{ background: 'none', border: 'none', color: '#94a3b8', padding: '0.25rem', cursor: 'pointer' }}
                    >
                      <Copy size={16} />
                    </button>
                    {b.role === 'OWNER' && (
                      <button
                        title="Delete"
                        onClick={(e) => handleDeleteBoard(e, b.id)}
                        style={{ background: 'none', border: 'none', color: '#f87171', padding: '0.25rem', cursor: 'pointer' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <CreateBoardModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateBoard}
      />
    </div>
  );
};
