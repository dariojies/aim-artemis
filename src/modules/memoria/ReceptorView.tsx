import { useState, useEffect } from 'react';
import { useMemoriaSync } from './useMemoriaSync';

export function ReceptorView() {
  const { gameState, winGame } = useMemoriaSync();
  const [elapsedTime, setElapsedTime] = useState('00:00');
  const [userInputValues, setUserInputValues] = useState<string[]>([]);
  const [validatedCells, setValidatedCells] = useState<boolean[]>([]);
  const [errorCellIndex, setErrorCellIndex] = useState<number | null>(null);

  // Determinar cuántas cifras tiene cada celda
  const getRequiredDigits = () => {
    if (gameState.difficulty.includes('Satelite')) {
      return gameState.difficulty.includes('fácil') ? 2 : 3;
    } else {
      return gameState.difficulty.includes('fácil') ? 3 : 4;
    }
  };

  const requiredDigits = getRequiredDigits();

  // Resetear estados locales al empezar nueva partida
  useEffect(() => {
    if (gameState.isActive) {
      setUserInputValues(new Array(gameState.sequence.length).fill(''));
      setValidatedCells(new Array(gameState.sequence.length).fill(false));
      setErrorCellIndex(null);
    }
  }, [gameState.isActive, gameState.sequence.length]);

  // Cronómetro
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
    }
    return () => clearInterval(interval);
  }, [gameState.isActive, gameState.isWon, gameState.startTime, gameState.endTime]);

  const handleInputChange = (index: number, val: string) => {
    if (validatedCells[index] || gameState.isWon || !gameState.isActive) return;

    // Solo números
    const numericVal = val.replace(/\D/g, '').slice(0, requiredDigits);
    
    const nextValues = [...userInputValues];
    nextValues[index] = numericVal;
    setUserInputValues(nextValues);

    // Si ya completó las cifras requeridas, validar
    if (numericVal.length === requiredDigits) {
      if (numericVal === gameState.sequence[index]) {
        const nextValidated = [...validatedCells];
        nextValidated[index] = true;
        setValidatedCells(nextValidated);
        
        // Comprobar victoria total
        if (nextValidated.every(v => v === true)) {
          winGame();
        }
      } else {
        // ERROR: Flash rojo y limpiar
        setErrorCellIndex(index);
        setTimeout(() => {
          setErrorCellIndex(null);
          const clearedValues = [...nextValues];
          clearedValues[index] = '';
          setUserInputValues(clearedValues);
        }, 500);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', padding: '16px' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '4px', color: 'var(--cartoon-white)' }}>
          Receptor: {gameState.difficulty}
        </h2>
        <div style={{ fontSize: '3rem', fontWeight: 'bold', color: gameState.isWon ? '#1F6A40' : 'var(--artemis-orange)', fontFamily: 'monospace' }}>
          {elapsedTime}
        </div>
        {gameState.participantName && (
          <div style={{ marginTop: '8px', fontSize: '1rem', color: 'var(--cartoon-white)', opacity: 0.8, backgroundColor: 'rgba(255,165,0,0.2)', padding: '4px 12px', borderRadius: '20px', display: 'inline-block' }}>
            Participante: <strong>#{gameState.participantName}</strong>
          </div>
        )}
      </div>

      {!gameState.isActive && !gameState.isWon && !gameState.isPreparing && (
        <div style={{ padding: '40px', border: '4px dashed var(--cartoon-outline)', borderRadius: '24px', backgroundColor: 'var(--space-medium)', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '1.5rem', opacity: 0.8 }} className="pulsing-text">
            📡 Esperando coordenadas del Visualizador...
          </p>
        </div>
      )}

      {gameState.isPreparing && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          {gameState.countdown !== null ? (
            <div className="fade-in">
              <p style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'var(--artemis-orange)' }}>TRANSMISIÓN EN...</p>
              <div style={{ fontSize: '8rem', fontWeight: 'bold' }}>
                {gameState.countdown > 0 ? gameState.countdown : '🚀'}
              </div>
            </div>
          ) : (
            <div style={{ padding: '32px', backgroundColor: 'var(--space-medium)', borderRadius: '24px', border: '4px solid #005C8A', animation: 'pulse-soft 2s infinite' }}>
              <h3 style={{ fontSize: '1.8rem', color: '#005C8A', marginBottom: '12px' }}>🛰️ ¡COORDENADAS RECIBIDAS!</h3>
              <p style={{ fontSize: '1.2rem', margin: 0 }}>Esperando a que el Comandante inicie la secuencia...</p>
              <p style={{ fontSize: '1rem', marginTop: '16px', opacity: 0.7 }}>Prepárate para la entrada de datos.</p>
            </div>
          )}
        </div>
      )}

      {(gameState.isActive || gameState.isWon) && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${gameState.gridSize}, 1fr)`,
          gap: '12px',
          padding: '20px',
          backgroundColor: 'var(--space-medium)',
          borderRadius: '20px',
          border: '4px solid var(--cartoon-outline)',
        }}>
          {gameState.sequence.map((_, i) => {
            const isCorrect = validatedCells[i];
            const isError = errorCellIndex === i;
            
            return (
              <input
                key={i}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={userInputValues[i] || ''}
                readOnly={isCorrect || gameState.isWon}
                onChange={(e) => handleInputChange(i, e.target.value)}
                placeholder={'?'.repeat(requiredDigits)}
                style={{
                  width: gameState.gridSize === 5 ? '60px' : '80px',
                  height: gameState.gridSize === 5 ? '60px' : '80px',
                  backgroundColor: isCorrect ? '#1F6A40' : (isError ? '#b33939' : 'var(--cartoon-white)'),
                  color: isCorrect || isError ? 'white' : 'var(--space-dark)',
                  fontSize: gameState.gridSize === 5 ? '1.5rem' : '2rem',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  borderRadius: '12px',
                  border: `3px solid ${isCorrect ? 'white' : 'var(--space-dark)'}`,
                  outline: 'none',
                  transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
              />
            );
          })}
        </div>
      )}

      {gameState.isWon && (
        <div className="fade-in" style={{ textAlign: 'center', color: '#1F6A40' }}>
          <h3 style={{ fontSize: '2.5rem', margin: 0, textShadow: '2px 2px 0px black' }}>🚀 ¡CONEXIÓN ESTABLECIDA!</h3>
        </div>
      )}
    </div>
  );
}
