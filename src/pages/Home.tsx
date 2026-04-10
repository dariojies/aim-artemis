import { useNavigate } from 'react-router-dom';
import { QrCode, ShieldAlert } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
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
  const [currentUrl, setCurrentUrl] = useState(window.location.href);

  // Redirección automática si ya está logueado
  useEffect(() => {
    if (role === 'superadmin') navigate('/menu');
    else if (role === 'user') navigate('/profile');
  }, [role, navigate]);

  useEffect(() => {
    setCurrentUrl(window.location.origin); // URL base para el QR
    
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
        if (user.error) throw new Error(user.error);
        login(user.role || 'user', user.user_id || user.id, user.id, user.astronaut_number);
      } catch (e: any) {
        console.error("Error en login Google:", e);
        alert(`Error al identificar Astronauta: ${e.message || 'Inténtalo de nuevo.'}`);
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
        gap: '16px',
        padding: '20px'
      }}>
        {isIdentifying ? (
          <div className="animate-pulse">
            <QrCode size={100} color="var(--artemis-orange)" />
          </div>
        ) : (
          <QRCodeCanvas 
            value={currentUrl} 
            size={200}
            bgColor={"transparent"}
            fgColor={"#FFFFFF"}
            level={"H"}
            includeMargin={false}
          />
        )}
      </div>

      {/* Botón de respaldo por si el One Tap no sale automáticamente */}
      <div id="google-login-btn" style={{ minHeight: '40px' }}></div>

      <div style={{ borderTop: '2px dashed var(--cartoon-outline)', width: '100%', maxWidth: '300px' }} />

      <p style={{ fontSize: '0.9rem', opacity: 0.6, maxWidth: '300px', textAlign: 'center' }}>
        Tus datos de misión se guardarán automáticamente en tu cuenta al completar el despliegue.
      </p>

      {/* Botón flotante para Staff/Admin */}
      <button
        onClick={() => {
          if (window.google) window.google.accounts.id.prompt();
          else alert("Inicia sesión con el selector de Google de arriba.");
        }}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'var(--artemis-orange)',
          border: '3px solid var(--cartoon-outline)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          cursor: 'pointer',
          zIndex: 1000
        }}
        title="Acceso Staff / Administrador"
      >
        <ShieldAlert size={28} />
      </button>
    </div>
  );
}
