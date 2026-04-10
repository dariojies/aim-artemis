import { useNavigate } from 'react-router-dom';
import { Brain, Activity, Rocket, LogOut } from 'lucide-react';
import { useAuth } from '../core/AuthContext';

export function Menu() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const gameModules = [
    // ...
    {
      id: 'memoria',
      title: 'Misión Memoria',
      description: 'Contrarreloj de números entre dos dispositivos.',
      icon: <Brain size={48} />,
      color: '#4B3F72', // Morado espacial
      path: '/memoria'
    },
    {
      id: 'base-lunar',
      title: 'Base Lunar',
      description: 'Genera energía realizando sentadillas válidas.',
      icon: <Activity size={48} />,
      color: '#1F6A40', // Verde militar/oxígeno
      path: '/base-lunar'
    },
    {
      id: 'rumbo-luna',
      title: 'Rumbo a la Luna',
      description: 'Salta lo más alto posible para avanzar kilómetros.',
      icon: <Rocket size={48} />,
      color: '#005C8A', // Azul propulsor
      path: '/rumbo-luna'
    }
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      maxWidth: '600px',
      margin: '0 auto',
      paddingBottom: '40px',
      position: 'relative'
    }}>
      <button 
        onClick={handleLogout}
        style={{
          position: 'absolute',
          top: '0',
          right: '0',
          background: 'none',
          border: 'none',
          color: 'var(--artemis-orange)',
          cursor: 'pointer',
          padding: '10px'
        }}
        title="Cerrar Sesión"
      >
        <LogOut size={24} />
      </button>

      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Módulos de Entrenamiento</h1>
        <p style={{ opacity: 0.8 }}>Selecciona la estación física en la que te encuentras.</p>
      </div>

      {gameModules.map((module) => (
        <button
          key={module.id}
          onClick={() => navigate(module.path)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            padding: '16px 20px',
            backgroundColor: module.color,
            border: 'var(--border-width-cartoon) solid var(--cartoon-outline)',
            borderRadius: 'var(--radius-card)',
            color: 'var(--cartoon-white)',
            boxShadow: '4px 6px 0px var(--cartoon-outline)',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'transform 0.1s ease',
            width: '100%'
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'translateY(4px)';
            e.currentTarget.style.boxShadow = '0px 2px 0px var(--cartoon-outline)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '4px 6px 0px var(--cartoon-outline)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '4px 6px 0px var(--cartoon-outline)';
          }}
        >
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            padding: '12px',
            borderRadius: '50%',
            border: '2px solid var(--cartoon-outline)',
            flexShrink: 0
          }}>
            {module.icon}
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', margin: '0 0 4px 0' }}>{module.title}</h2>
            <p style={{ fontSize: '1rem', margin: 0, opacity: 0.9 }}>{module.description}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
