import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { X, Sparkles, RefreshCw, Copy, Check, Clock } from 'lucide-react';

interface SummaryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
}

export const SummaryPanel: React.FC<SummaryPanelProps> = ({ isOpen, onClose, boardId }) => {
  const [summaryText, setSummaryText] = useState<string | null>(null);
  const [isCached, setIsCached] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchSummary = async (force: boolean = false) => {
    setIsLoading(true);
    try {
      const response = await api.post(`/boards/${boardId}/summary?force=${force}`);
      setSummaryText(response.data.content);
      setIsCached(response.data.cached);
      setUpdatedAt(response.data.createdAt);
    } catch (err) {
      alert('Failed to generate AI summary.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && boardId) {
      fetchSummary(false);
    }
  }, [isOpen, boardId]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (summaryText) {
      navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '60px',
      right: 0,
      bottom: 0,
      width: '400px',
      zIndex: 60,
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(16px)',
      borderLeft: '1px solid var(--glass-border)',
      boxShadow: 'var(--shadow-lg)',
      display: 'flex',
      flexDirection: 'column',
      padding: '1.5rem',
    }} className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={20} color="#818cf8" />
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
            AI Board Summary
          </h3>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
          <X size={20} />
        </button>
      </div>

      {isLoading ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', gap: '1rem' }}>
          <RefreshCw size={28} className="animate-spin" color="#6366f1" />
          <span>Generating AI summary...</span>
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Clock size={12} /> {updatedAt ? new Date(updatedAt).toLocaleTimeString() : 'Just now'}
            </span>
            {isCached && (
              <span style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                Cached
              </span>
            )}
          </div>

          <div style={{
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '1.25rem',
            color: '#e2e8f0',
            fontSize: '0.875rem',
            lineHeight: 1.6,
            whiteSpace: 'pre-line',
          }}>
            {summaryText}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
        <button onClick={handleCopy} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} disabled={!summaryText}>
          {copied ? <Check size={16} color="#22c55e" /> : <Copy size={16} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
        <button onClick={() => fetchSummary(true)} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={isLoading}>
          <RefreshCw size={16} /> Regenerate
        </button>
      </div>
    </div>
  );
};
