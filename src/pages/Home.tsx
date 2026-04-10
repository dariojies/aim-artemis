import { useNavigate } from 'react-router-dom';
import { QrCode } from 'lucide-react';
import { useAuth } from '../core/AuthContext';
import { useEffect, useState } from 'react';
import { artemisApi } from '../services/api';

declare global {
  interface Window {
    google: any;
  }
}

export function Home() {
  const navigate = useNavigate();
  const { login, role } = useAuth();
  const [isIdentifying, setIsIdentifying] = useState(false);

  // Redirección automática si ya está logueado
  useEffect(() => {
    if (role === 'superadmin') navigate('/menu');
    else if (role === 'user') navigate('/profile');
  }, [role, navigate]);

  useEffect(() => {
    // Inicializar Google One Tap
    const initializeGoogle = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: true // Intento de login automático si ya eligió cuenta antes
        });
        
        window.google.accounts.id.prompt(); // Mostrar el One Tap
      }
    };

    const handleCredentialResponse = async (response: any) => {
      setIsIdentifying(true);
      try {
        const user = await artemisApi.loginWithGoogle(response.credential);
        login(user.role || 'user', user.user_id || user.id, user.id, user.astronaut_number);
      } catch (e) {
        console.error("Error en login Google", e);
        alert("Error al identificar Astronauta. Inténtalo de nuevo.");
      } finally {
        setIsIdentifying(false);
      }
    };

    // Pequeño delay para asegurar que el script de Google cargó
    const timer = setTimeout(initializeGoogle, 1000);
    return () => clearTimeout(timer);
  }, [login]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      gap: '32px'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '8px', color: 'var(--cartoon-white)' }}>
          Preparación <span style={{ color: 'var(--artemis-orange)' }}>Artemis</span>
        </h1>
        {isIdentifying ? (
          <p style={{ fontSize: '1.2rem', color: 'var(--artemis-orange)', fontWeight: 'bold' }} className="animate-pulse">
            Identificando Identidad Digital...
          </p>
        ) : (
          <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>
            Escanea el QR e inicia sesión con Google para comenzar.
          </p>
        )}
      </div>

      <div style={{
        width: '240px',
        height: '240px',
        backgroundColor: 'var(--space-light)',
        border: '6px dashed var(--cartoon-outline)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '24px',
        gap: '16px'
      }}>
        <QrCode size={100} color="var(--cartoon-white)" opacity={0.5} />
        {isIdentifying && <span>Buscando...</span>}
      </div>

      {/* Botón de respaldo por si el One Tap no sale automáticamente */}
      <div id="google-login-btn" style={{ minHeight: '40px' }}></div>

      <div style={{ borderTop: '2px dashed var(--cartoon-outline)', width: '100%', maxWidth: '300px' }} />

      <p style={{ fontSize: '0.9rem', opacity: 0.6, maxWidth: '300px', textAlign: 'center' }}>
        Tus datos de misión se guardarán automáticamente en tu cuenta al completar el despliegue.
      </p>
    </div>
  );
}
