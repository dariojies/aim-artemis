import { useState } from 'react';
import { Eye, Keyboard } from 'lucide-react';
import { VisualizadorView } from './VisualizadorView';
import { ReceptorView } from './ReceptorView';

export function MemoriaGame() {
  const [role, setRole] = useState<'visualizador' | 'receptor' | null>(null);

  if (!role) {
    return (
      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Misión Memoria</h2>
        <p style={{ opacity: 0.8, marginBottom: '32px' }}>
          Juego cooperativo para dos dispositivos. Selecciona el rol de esta estación:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '400px', margin: '0 auto' }}>
          <button 
            className="btn-cartoon"
            onClick={() => setRole('visualizador')}
            style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '24px', backgroundColor: '#005C8A' }}
          >
            <Eye size={40} />
            <div style={{ textAlign: 'left' }}>
              <strong style={{ fontSize: '1.2rem', display: 'block' }}>Visualizador</strong>
              <small style={{ opacity: 0.9 }}>Genera y muestra la secuencia secreta.</small>
            </div>
          </button>

          <button 
            className="btn-cartoon"
            onClick={() => setRole('receptor')}
            style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '24px', backgroundColor: '#1F6A40' }}
          >
            <Keyboard size={40} />
            <div style={{ textAlign: 'left' }}>
              <strong style={{ fontSize: '1.2rem', display: 'block' }}>Receptor</strong>
              <small style={{ opacity: 0.9 }}>Ingresa la secuencia desde el otro dispositivo.</small>
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <button 
        onClick={() => setRole(null)}
        style={{
          position: 'absolute',
          top: '-40px',
          left: 0,
          background: 'none',
          border: 'none',
          color: 'var(--artemis-orange)',
          fontWeight: 'bold',
          cursor: 'pointer',
          textDecoration: 'underline'
        }}
      >
        Cambiar Rol
      </button>

      {role === 'visualizador' && <VisualizadorView />}
      {role === 'receptor' && <ReceptorView />}
    </div>
  );
}
