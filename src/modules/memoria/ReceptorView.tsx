import { useState, useEffect } from 'react';
import { useMemoriaSync } from './useMemoriaSync';

export function ReceptorView() {
  const { gameState, winGame } = useMemoriaSync();
  const [elapsedTime, setElapsedTime] = useState('00:00');
  const [userInput, setUserInput] = useState<number[]>([]);
  const [errorFlash, setErrorFlash] = useState(false);

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
      const diff = Math.floor((gameState.endTime - gameState.startTime) / 1000);
      const mins = Math.floor(diff / 60).toString().padStart(2, '0');
      const secs = (diff % 60).toString().padStart(2, '0');
      setElapsedTime(`${mins}:${secs}`);
    } else {
      setElapsedTime('00:00');
      setUserInput([]); // Reset custom state if game is reset
    }
    return () => clearInterval(interval);
  }, [gameState]);

  const handleNumpadClick = (num: number) => {
    if (!gameState.isActive || gameState.isWon) return;

    const currentLength = userInput.length;
    // Comprobar si el número tocado coincide con la secuencia en la posición actual
    if (gameState.sequence[currentLength] === num) {
      const newInput = [...userInput, num];
      setUserInput(newInput);
      
      // Si ya llenó la longitud total de la secuencia generada (5)
      if (newInput.length === gameState.sequence.length) {
        winGame();
      }
    } else {
      // Si se equivoca, error animado y resetea su input para empezar de 0
      setErrorFlash(true);
      setTimeout(() => setErrorFlash(false), 500);
      setUserInput([]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', padding: '16px', transition: 'background-color 0.2s', backgroundColor: errorFlash ? '#b33939' : 'transparent', borderRadius: '16px' }}>
      <h2 style={{ fontSize: '2rem', margin: 0, color: 'var(--cartoon-white)' }}>Estación Receptora</h2>
      
      {/* Estado */}
      {!gameState.isActive && !gameState.isWon && (
        <div style={{ padding: '32px', border: '4px dashed var(--cartoon-outline)', borderRadius: '16px', backgroundColor: 'var(--space-medium)' }}>
          <p style={{ margin: 0, fontSize: '1.5rem', opacity: 0.8 }} className="pulsing-text">Esperando transmisión del Visualizador...</p>
        </div>
      )}

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

      {(gameState.isActive || gameState.isWon) && (
        <>
          {/* Display de input o "_" */}
          <div style={{
            display: 'flex',
            gap: '8px',
            padding: '16px',
            backgroundColor: gameState.isWon ? '#1F6A40' : 'var(--space-light)',
            borderRadius: '16px',
            border: '4px solid var(--cartoon-outline)'
          }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{
                width: '48px',
                height: '64px',
                backgroundColor: 'var(--space-dark)',
                color: 'var(--cartoon-white)',
                fontSize: '2.5rem',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                border: '2px solid var(--cartoon-outline)'
              }}>
                {userInput[i] !== undefined ? userInput[i] : '_'}
              </div>
            ))}
          </div>

          {!gameState.isWon && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
              maxWidth: '300px',
              width: '100%'
            }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  className="btn-cartoon"
                  onClick={() => handleNumpadClick(num)}
                  style={{ fontSize: '2rem', padding: '16px 0', backgroundColor: '#005C8A' }}
                >
                  {num}
                </button>
              ))}
              {/* Botones dummy e cero */}
              <div />
              <button
                className="btn-cartoon"
                onClick={() => handleNumpadClick(0)}
                style={{ fontSize: '2rem', padding: '16px 0', backgroundColor: '#005C8A' }}
              >
                0
              </button>
              <div />
            </div>
          )}

          {gameState.isWon && (
            <div style={{ textAlign: 'center', color: '#1F6A40' }}>
              <h3 style={{ fontSize: '2.5rem', margin: 0, textShadow: '2px 2px 0px black' }}>¡Sincronizado!</h3>
            </div>
          )}
        </>
      )}
    </div>
  );
}
