import React from 'react';

interface KanvasLogoProps {
  size?: number;
  showText?: boolean;
}

export const KanvasLogo: React.FC<KanvasLogoProps> = ({ size = 32, showText = true }) => {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.625rem', userSelect: 'none' }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'drop-shadow(0 4px 12px rgba(99, 102, 241, 0.4))' }}
      >
        <rect width="40" height="40" rx="10" fill="url(#kanvas-logo-grad)" />
        {/* Stylized dynamic K + canvas layer geometric paths */}
        <path d="M12 10V30M12 20L25 10M12 20L25 30" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="27" cy="13" r="2.5" fill="#fef08a" />
        <circle cx="27" cy="27" r="2.5" fill="#38bdf8" />
        <defs>
          <linearGradient id="kanvas-logo-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6366F1" />
            <stop offset="1" stopColor="#4F46E5" />
          </linearGradient>
        </defs>
      </svg>

      {showText && (
        <span style={{
          fontFamily: 'var(--font-heading)',
          fontSize: size * 0.55 + 'px',
          fontWeight: 800,
          letterSpacing: '-0.02em',
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
        }}>
          Kollab<span style={{ color: 'var(--accent-primary)', marginLeft: '1px' }}>Kanvas</span>
        </span>
      )}
    </div>
  );
};
