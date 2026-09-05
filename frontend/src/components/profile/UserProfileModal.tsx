import React, { useState } from 'react';
import { useAuthStore } from '../../hooks/useAuthStore';
import { api } from '../../services/api';
import { X, Key, Lock, Check, Moon, Sun, Coffee, Shield } from 'lucide-react';
import type { ThemeType } from '../toolbar/ThemeToggle';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuthStore();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [theme, setTheme] = useState<ThemeType>(() => {
    const saved = localStorage.getItem('kanvas_theme') as ThemeType;
    return saved || 'dark';
  });

  if (!isOpen || !user) return null;

  const handleThemeChange = (newTheme: ThemeType) => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('kanvas_theme', newTheme);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/auth/change-password', { oldPassword, newPassword });
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to change password. Check old password.';
      setMessage({ type: 'error', text: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 120,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(2, 6, 23, 0.75)',
      backdropFilter: 'blur(8px)',
      padding: '1rem',
    }}>
      <div className="glass-panel animate-fade-in" style={{
        width: '100%',
        maxWidth: '480px',
        padding: '2rem',
        position: 'relative',
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
          }}
        >
          <X size={20} />
        </button>

        {/* User Info Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.75rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border-color)' }}>
          <img
            src={user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.email}`}
            alt={user.name}
            style={{ width: '56px', height: '56px', borderRadius: '50%', border: '2px solid var(--accent-primary)' }}
          />
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {user.name}
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
              {user.email}
            </p>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '0.15rem 0.5rem',
              borderRadius: '4px',
              background: 'var(--accent-light)',
              color: 'var(--accent-primary)',
              marginTop: '0.5rem',
            }}>
              <Shield size={12} /> Registered Member
            </span>
          </div>
        </div>

        {/* Theme Preference (Moved to Profile per requirement) */}
        <div style={{ marginBottom: '1.75rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border-color)' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            Application Theme
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => handleThemeChange('dark')}
              className={`theme-pill-btn ${theme === 'dark' ? 'active' : ''}`}
              style={{ justifyContent: 'center', padding: '0.625rem' }}
            >
              <Moon size={16} /> Dark
            </button>
            <button
              type="button"
              onClick={() => handleThemeChange('cream')}
              className={`theme-pill-btn ${theme === 'cream' ? 'active' : ''}`}
              style={{ justifyContent: 'center', padding: '0.625rem' }}
            >
              <Coffee size={16} /> Cream
            </button>
            <button
              type="button"
              onClick={() => handleThemeChange('light')}
              className={`theme-pill-btn ${theme === 'light' ? 'active' : ''}`}
              style={{ justifyContent: 'center', padding: '0.625rem' }}
            >
              <Sun size={16} /> Light
            </button>
          </div>
        </div>

        {/* Change Password Form */}
        <form onSubmit={handleChangePassword}>
          <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Key size={18} color="var(--accent-primary)" /> Security & Password
          </h4>

          {message && (
            <div style={{
              background: message.type === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: `1px solid ${message.type === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              color: message.type === 'success' ? '#4ade80' : '#fca5a5',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              {message.type === 'success' && <Check size={16} />} {message.text}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                Current Password
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                New Password
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                Confirm New Password
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
              style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', height: '42px' }}
            >
              {isSubmitting ? 'Updating...' : (
                <>
                  <Lock size={16} /> Update Password
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
