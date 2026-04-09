import { useState, useEffect } from 'react';
import { useMemoriaSync } from './useMemoriaSync';

export function VisualizadorView() {
  const { gameState, startGame, resetGame } = useMemoriaSync();
  const [elapsedTime, setElapsedTime] = useState('00:00');

  // Generador de secuencia rándom de 5 números
  const generateSequence = () => {
    const seq = [];
    for (let i = 0; i < 5; i++) {
      seq.push(Math.floor(Math.random() * 10)); // 0-9
    }
    return seq;
  };

  const handleStart = () => {
    const newSeq = generateSequence();
    startGame(newSeq);
  };

  // Efecto del cronómetro visual
  useEffect(() => {
    let interval: number;
    if (gameState.isActive && gameState.startTime) {
      interval = setInterval(() => {
        const diff = Math.floor((Date.now() - gameState.startTime!) / 1000);
        const mins = Math.floor(diff / 60).toString().padStart(2, '0');
        const secs = (diff % 60).toString().padStart(2, '0');
        setElapsedTime(`${mins}:${secs}`);
      }, 1000);
    } else if (gameState.isWon && gameState.startTime && gameState.endTime) {
      // Congelar el tiempo ganador
      const diff = Math.floor((gameState.endTime - gameState.startTime) / 1000);
      const mins = Math.floor(diff / 60).toString().padStart(2, '0');
      const secs = (diff % 60).toString().padStart(2, '0');
      setElapsedTime(`${mins}:${secs}`);
    } else {
      setElapsedTime('00:00');
    }
    return () => clearInterval(interval);
  }, [gameState.isActive, gameState.isWon, gameState.startTime, gameState.endTime]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', padding: '16px' }}>
      <h2 style={{ fontSize: '2rem', margin: 0, color: 'var(--cartoon-white)' }}>Estación Visualizadora</h2>
      <p style={{ margin: 0, fontSize: '1.2rem', opacity: 0.8, textAlign: 'center' }}>
        Asegúrate de que el equipo receptor esté listo antes de iniciar la transmisión.
      </p>

      {/* Cronómetro */}
      <div style={{
        fontSize: '4rem',
        fontWeight: 'bold',
        color: gameState.isWon ? '#1F6A40' : 'var(--artemis-orange)',
        fontFamily: 'monospace',
        textShadow: '2px 2px 0px rgba(0,0,0,0.5)'
      }}>
        {elapsedTime}
      </div>

      {gameState.isWon ? (
        <div style={{
          backgroundColor: '#1F6A40',
          padding: '24px',
          borderRadius: 'var(--radius-card)',
          border: '4px solid var(--cartoon-outline)',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '2rem', margin: '0 0 16px 0' }}>¡Código Aceptado!</h3>
          <p style={{ fontSize: '1.2rem', marginBottom: '24px' }}>Transmisión finalizada en {elapsedTime}.</p>
          <button className="btn-cartoon" onClick={resetGame} style={{ backgroundColor: 'white', color: 'black' }}>
            Generar Nuevo Código
          </button>
        </div>
      ) : gameState.isActive ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px'
        }}>
          {/* Matriz visual de números */}
          <div style={{
            display: 'flex',
            gap: '16px',
            padding: '24px',
            backgroundColor: 'var(--space-medium)',
            borderRadius: '16px',
            border: '4px dashed var(--cartoon-outline)'
          }}>
            {gameState.sequence.map((num, i) => (
              <div key={i} style={{
                width: '64px',
                height: '80px',
                backgroundColor: 'var(--cartoon-white)',
                color: 'var(--space-dark)',
                fontSize: '3rem',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                border: '4px solid var(--space-dark)',
                boxShadow: 'inset 0 -6px 0 rgba(0,0,0,0.1)'
              }}>
                {num}
              </div>
            ))}
          </div>

          <button className="btn-cartoon" onClick={resetGame} style={{ backgroundColor: '#b33939' }}>
            Abortar Misión
          </button>
        </div>
      ) : (
        <button 
          className="btn-cartoon" 
          onClick={handleStart} 
          style={{ fontSize: '1.5rem', padding: '24px 48px' }}
        >
          Generar Secuencia e Iniciar Misión
        </button>
      )}
    </div>
  );
}
