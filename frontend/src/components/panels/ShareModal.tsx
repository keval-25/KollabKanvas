import React, { useState } from 'react';
import { api } from '../../services/api';
import type { Collaborator } from '../../types/board';
import { X, UserPlus, Link2, Check, Shield, Trash2 } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
  collaborators?: Collaborator[];
  shareToken?: string;
  onRefreshBoard?: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  boardId,
  collaborators: initialCollaborators = [],
  shareToken: initialShareToken = '',
  onRefreshBoard,
}) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'EDITOR' | 'COMMENTER' | 'VIEWER'>('EDITOR');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [currentShareToken, setCurrentShareToken] = useState(initialShareToken);
  const [collaboratorsList, setCollaboratorsList] = useState<Collaborator[]>(initialCollaborators);

  const refreshBoardDetails = async () => {
    try {
      const res = await api.get(`/boards/${boardId}`);
      if (res.data.collaborators) {
        setCollaboratorsList(res.data.collaborators);
      }
      if (res.data.shareToken) {
        setCurrentShareToken(res.data.shareToken);
      }
      if (onRefreshBoard) onRefreshBoard();
    } catch (e) {
      // Ignore
    }
  };

  React.useEffect(() => {
    if (isOpen && boardId) {
      refreshBoardDetails();
    }
  }, [isOpen, boardId]);

  if (!isOpen) return null;

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsSubmitting(true);
    try {
      await api.post(`/boards/${boardId}/collaborators`, { email: email.trim(), role });
      setEmail('');
      onRefreshBoard();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to invite collaborator. Ensure email is registered.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateRole = async (targetUserId: string, newRole: string) => {
    try {
      await api.patch(`/boards/${boardId}/collaborators/${targetUserId}`, { role: newRole });
      onRefreshBoard();
    } catch (err) {
      alert('Failed to update collaborator role');
    }
  };

  const handleRevoke = async (targetUserId: string) => {
    if (window.confirm('Revoke collaborator access?')) {
      try {
        await api.delete(`/boards/${boardId}/collaborators/${targetUserId}`);
        onRefreshBoard();
      } catch (err) {
        alert('Failed to revoke collaborator');
      }
    }
  };

  const handleGenerateLink = async () => {
    try {
      const res = await api.post(`/boards/${boardId}/share-link?defaultRole=VIEWER`);
      setCurrentShareToken(res.data.token);
      onRefreshBoard();
    } catch (err) {
      alert('Failed to generate share link');
    }
  };

  const copyShareLink = () => {
    const link = `${window.location.origin}/share/${currentShareToken}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(2, 6, 23, 0.75)',
      backdropFilter: 'blur(8px)',
      padding: '1rem',
    }}>
      <div className="glass-panel animate-fade-in" style={{
        width: '100%',
        maxWidth: '540px',
        padding: '2rem',
        position: 'relative',
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
          }}
        >
          <X size={20} />
        </button>

        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.375rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.375rem' }}>
          Share Whiteboard & Roles
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          Invite team members or generate shareable access links
        </p>

        {/* Invite by Email */}
        <form onSubmit={handleInvite} style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1', marginBottom: '0.5rem' }}>
            Invite Collaborator
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="email"
              className="input-field"
              placeholder="teammate@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              style={{
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid var(--border-color)',
                color: '#f8fafc',
                borderRadius: '8px',
                padding: '0.5rem',
                fontSize: '0.875rem',
              }}
            >
              <option value="EDITOR">Editor</option>
              <option value="COMMENTER">Commenter</option>
              <option value="VIEWER">Viewer</option>
            </select>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              <UserPlus size={16} /> Invite
            </button>
          </div>
        </form>

        {/* Share Link Generation */}
        <div style={{ marginBottom: '2rem', padding: '1rem', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Link2 size={16} color="#818cf8" /> Shareable Link
            </span>
            {currentShareToken && (
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Default: Viewer</span>
            )}
          </div>

          {currentShareToken ? (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                readOnly
                className="input-field"
                value={`${window.location.origin}/share/${currentShareToken}`}
                style={{ fontSize: '0.8125rem' }}
              />
              <button onClick={copyShareLink} className="btn-secondary">
                {copiedLink ? <Check size={16} color="#22c55e" /> : <Link2 size={16} />}
                {copiedLink ? 'Copied' : 'Copy'}
              </button>
            </div>
          ) : (
            <button onClick={handleGenerateLink} className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
              Generate Shareable Link
            </button>
          )}
        </div>

        {/* Collaborators List */}
        <div>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Shield size={16} color="#6366f1" /> Collaborators ({collaboratorsList.length})
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
            {collaboratorsList.map((c) => (
              <div
                key={c.userId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.625rem 0.875rem',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.04)',
                }}
              >
                <div style={{ fontSize: '0.875rem', color: '#f8fafc' }}>
                  User ID: {c.userId.substring(0, 8)}...
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {c.role === 'OWNER' ? (
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#818cf8' }}>Owner</span>
                  ) : (
                    <>
                      <select
                        value={c.role}
                        onChange={(e) => handleUpdateRole(c.userId, e.target.value)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#94a3b8',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                        }}
                      >
                        <option value="EDITOR">Editor</option>
                        <option value="COMMENTER">Commenter</option>
                        <option value="VIEWER">Viewer</option>
                      </select>
                      <button
                        onClick={() => handleRevoke(c.userId)}
                        style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
