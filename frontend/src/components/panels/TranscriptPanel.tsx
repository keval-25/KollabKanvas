import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { X, FileText, Download, Filter, Clock } from 'lucide-react';

interface TranscriptItem {
  id: string;
  boardId: string;
  userId: string;
  userName: string;
  actionType: string;
  details: Record<string, any>;
  timestamp: string;
}

interface TranscriptPanelProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
}

export const TranscriptPanel: React.FC<TranscriptPanelProps> = ({ isOpen, onClose, boardId }) => {
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionFilter, setActionFilter] = useState('');

  const fetchTranscripts = async () => {
    setIsLoading(true);
    try {
      const url = actionFilter
        ? `/boards/${boardId}/transcript?actionType=${actionFilter}`
        : `/boards/${boardId}/transcript`;
      const response = await api.get<TranscriptItem[]>(url);
      setTranscripts(response.data);
    } catch (err) {
      // Handled
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && boardId) {
      fetchTranscripts();
    }
  }, [isOpen, boardId, actionFilter]);

  if (!isOpen) return null;

  const handleExportCsv = () => {
    window.open(`${api.defaults.baseURL}/boards/${boardId}/transcript/export`, '_blank');
  };

  return (
    <div style={{
      position: 'fixed',
      top: '60px',
      right: 0,
      bottom: 0,
      width: '420px',
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
          <FileText size={20} color="#6366f1" />
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
            Action Transcript History
          </h3>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
          <X size={20} />
        </button>
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <Filter size={16} color="#94a3b8" />
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          style={{
            flex: 1,
            background: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid var(--border-color)',
            color: '#f8fafc',
            borderRadius: '8px',
            padding: '0.4rem 0.625rem',
            fontSize: '0.8125rem',
          }}
        >
          <option value="">All Action Types</option>
          <option value="ELEMENT_CREATE">Element Creation</option>
          <option value="ELEMENT_UPDATE">Element Update</option>
          <option value="ELEMENT_DELETE">Element Deletion</option>
          <option value="JOIN">Session Join</option>
          <option value="LEAVE">Session Leave</option>
        </select>
      </div>

      {/* Transcript Timeline */}
      {isLoading ? (
        <div style={{ flex: 1, textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
          Loading transcript history...
        </div>
      ) : transcripts.length === 0 ? (
        <div style={{ flex: 1, textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
          No action history recorded yet
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '0.25rem' }}>
          {transcripts.map((item) => (
            <div
              key={item.id || item.timestamp}
              style={{
                background: 'rgba(15, 23, 42, 0.5)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '0.875rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.375rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#f8fafc' }}>
                  {item.userName || 'Collaborator'}
                </span>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  padding: '0.15rem 0.4rem',
                  borderRadius: '4px',
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: '#818cf8',
                }}>
                  {item.actionType}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Clock size={12} /> {new Date(item.timestamp).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
        <button onClick={handleExportCsv} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
          <Download size={16} /> Export Transcript (CSV)
        </button>
      </div>
    </div>
  );
};
