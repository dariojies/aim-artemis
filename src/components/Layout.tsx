import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '../core/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, userId, logout } = useAuth();

  const isUserScanned = role !== 'guest'; 
  const showBackButton = location.pathname !== '/';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: '100%',
    }}>
      {/* Header Artemis */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        backgroundColor: 'var(--space-medium)',
        borderBottom: 'var(--border-width-cartoon) solid var(--cartoon-outline)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {showBackButton && (
            <button 
              onClick={() => navigate(-1)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--cartoon-white)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <ArrowLeft size={32} />
            </button>
          )}
          <h2 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--artemis-orange)' }}>
            {role === 'superadmin' ? 'Artemis (Admin)' : 'Artemis II'}
          </h2>
        </div>

        {isUserScanned && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontWeight: 'bold' }}>#{userId}</span>
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: role === 'superadmin' ? 'var(--artemis-orange)' : 'var(--cartoon-white)',
              borderRadius: '50%',
              border: '2px solid var(--cartoon-outline)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--space-dark)',
              fontWeight: 'bold',
            }}>
              {role === 'superadmin' ? 'S' : 'U'}
            </div>
            <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--cartoon-white)' }}>
              <LogOut size={24} />
            </button>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        {children}
      </main>
    </div>
  );
}
