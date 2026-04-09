import { useNavigate } from 'react-router-dom';
import { QrCode, ShieldAlert, User, Phone } from 'lucide-react';
import { useAuth } from '../core/AuthContext';
import { useState } from 'react';
import { artemisApi } from '../services/api';

export function Home() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setLoading(true);
    try {
      const user = await artemisApi.register(phone);
      login('user', user.user_id || user.id, user.id, user.astronaut_number);
      navigate('/profile');
    } catch (e) {
      alert("Error al acceder. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateAdmin = () => {
    login('superadmin', '0001'); // Admin bypass para tests
    navigate('/menu');
  };

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
        <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>
          Por favor, escanea tu Identificador (QR) para comenzar.
        </p>
      </div>

      <div style={{
        width: '240px',
        height: '240px',
        backgroundColor: 'var(--space-light)',
        border: '6px dashed var(--cartoon-outline)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '24px'
      }}>
        <QrCode size={100} color="var(--cartoon-white)" opacity={0.5} />
      </div>

      <form 
        onSubmit={handleRegister}
        style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '320px' }}
      >
        <div style={{ position: 'relative' }}>
          <Phone size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
          <input 
            type="tel"
            placeholder="Tu Teléfono (ej: 600000000)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 12px 12px 40px',
              borderRadius: '12px',
              border: '3px solid var(--cartoon-outline)',
              fontSize: '1.1rem',
              outline: 'none'
            }}
            required
          />
        </div>

        <button 
          type="submit"
          className="btn-cartoon" 
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: '#4B3F72' }}
        >
          <User size={24} /> {loading ? 'Accediendo...' : 'Comenzar Aventura'}
        </button>

        <div style={{ borderTop: '2px dashed var(--cartoon-outline)', margin: '8px 0' }} />

        <button 
          type="button"
          className="btn-cartoon" 
          onClick={handleSimulateAdmin}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '1rem', padding: '12px' }}
        >
          <ShieldAlert size={24} /> Modo Estación (Staff)
        </button>
      </form>

    </div>
  );
}
