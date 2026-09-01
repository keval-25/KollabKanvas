import React, { useState } from 'react';
import { X, Sparkles, Layout, GitFork, ListTodo } from 'lucide-react';

interface CreateBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, template: string) => Promise<void>;
}

export const CreateBoardModal: React.FC<CreateBoardModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('blank');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await onCreate(name.trim(), selectedTemplate);
      setName('');
      setSelectedTemplate('blank');
      onClose();
    } catch (err) {
      // Handled upstream
    } finally {
      setIsSubmitting(false);
    }
  };

  const templates = [
    { id: 'blank', title: 'Blank Canvas', desc: 'Start with a clean slate', icon: Layout },
    { id: 'mindmap', title: 'Mind Map', desc: 'Central topic with sticky notes', icon: Sparkles },
    { id: 'flowchart', title: 'Flowchart', desc: 'Process diagrams & shape flows', icon: GitFork },
    { id: 'kanban', title: 'Kanban Board', desc: 'Agile columns & card notes', icon: ListTodo },
  ];

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

        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>
          Create New Whiteboard
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          Choose a board title and starting template
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1', marginBottom: '0.5rem' }}>
              Board Title
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Q4 Product Architecture Brainstorm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1', marginBottom: '0.75rem' }}>
              Select Starter Template
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {templates.map((tpl) => {
                const IconComponent = tpl.icon;
                const isSelected = selectedTemplate === tpl.id;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => setSelectedTemplate(tpl.id)}
                    style={{
                      padding: '1rem',
                      borderRadius: '10px',
                      border: isSelected ? '2px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.1)',
                      background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'rgba(15, 23, 42, 0.4)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <IconComponent size={22} color={isSelected ? '#818cf8' : '#94a3b8'} style={{ marginBottom: '0.5rem' }} />
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: isSelected ? '#ffffff' : '#e2e8f0' }}>
                      {tpl.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                      {tpl.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting || !name.trim()}>
              {isSubmitting ? 'Creating...' : 'Create Whiteboard'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
