import React, { useState } from 'react';
import { useAuthStore } from '../hooks/useAuthStore';
import { UserPlus } from 'lucide-react';
import { KanvasLogo } from '../components/common/KanvasLogo';
import { GoogleAuthButton } from '../components/auth/GoogleAuthButton';

interface RegisterPageProps {
  onSwitchToLogin: () => void;
  onRegisterSuccess?: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onSwitchToLogin, onRegisterSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register, isLoading, error } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    try {
      await register({ name, email, password });
      if (onRegisterSuccess) onRegisterSuccess();
    } catch (err) {
      // Error handled in store
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'radial-gradient(circle at top right, #1e1b4b 0%, #0f172a 60%, #020617 100%)',
      padding: '1.5rem',
    }}>
      <div className="glass-panel animate-fade-in" style={{
        width: '100%',
        maxWidth: '420px',
        padding: '2.5rem',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-block', marginBottom: '1rem' }}>
            <KanvasLogo size="large" animated />
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.5rem' }}>
            Create Account
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Join KollabKanvas and collaborate in real-time
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fca5a5',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            fontSize: '0.875rem',
            marginBottom: '1.5rem',
          }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '1.25rem' }}>
          <GoogleAuthButton onSuccess={onRegisterSuccess} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', margin: '1.25rem 0', gap: '0.75rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
          <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Or with email</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1', marginBottom: '0.5rem' }}>
              Full Name
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="Alex Morgan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1', marginBottom: '0.5rem' }}>
              Email address
            </label>
            <input
              type="email"
              className="input-field"
              placeholder="alex@kanvas.app"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1', marginBottom: '0.5rem' }}>
              Password
            </label>
            <input
              type="password"
              className="input-field"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading}
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', height: '42px' }}
          >
            {isLoading ? 'Creating account...' : (
              <>
                <UserPlus size={18} /> Create Account
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.875rem', color: '#94a3b8' }}>
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            style={{
              background: 'none',
              border: 'none',
              color: '#818cf8',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
};

