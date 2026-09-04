import React, { useEffect, useState } from 'react';
import { Moon, Sun, Coffee } from 'lucide-react';

export type ThemeType = 'dark' | 'cream' | 'light';

export const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<ThemeType>(() => {
    const saved = localStorage.getItem('kanvas_theme') as ThemeType;
    return saved || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('kanvas_theme', theme);
  }, [theme]);

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
      background: 'var(--glass-bg)',
      border: '1px solid var(--border-color)',
      padding: '0.25rem',
      borderRadius: '10px',
    }}>
      <button
        type="button"
        title="Dark / Midnight Theme"
        onClick={() => setTheme('dark')}
        className={`theme-pill-btn ${theme === 'dark' ? 'active' : ''}`}
      >
        <Moon size={14} />
        <span>Dark</span>
      </button>

      <button
        type="button"
        title="Warm Cream Theme"
        onClick={() => setTheme('cream')}
        className={`theme-pill-btn ${theme === 'cream' ? 'active' : ''}`}
      >
        <Coffee size={14} />
        <span>Cream</span>
      </button>

      <button
        type="button"
        title="Clean Light Theme"
        onClick={() => setTheme('light')}
        className={`theme-pill-btn ${theme === 'light' ? 'active' : ''}`}
      >
        <Sun size={14} />
        <span>Light</span>
      </button>
    </div>
  );
};
