import { useState, useEffect } from 'react';
import { useMemoriaSync } from './useMemoriaSync';
import { Play } from 'lucide-react';

type Mode = 'Satelite' | 'Nave';
type Difficulty = 'fácil' | 'difícil';

export function VisualizadorView() {
  const { gameState, startGame, resetGame } = useMemoriaSync();
  const [elapsedTime, setElapsedTime] = useState('00:00');
  const [selectedMode, setSelectedMode] = useState<Mode | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);

  // Generador de secuencia rándom según modo y dificultad
  const generateSequence = (mode: Mode, diff: Difficulty) => {
    const size = mode === 'Satelite' ? 3 * 3 : 5 * 5;
    let digits = 2; // Default Satelite Facil

    if (mode === 'Satelite') {
      digits = diff === 'fácil' ? 2 : 3;
    } else {
      digits = diff === 'fácil' ? 3 : 4;
    }

    const seq = [];
    for (let i = 0; i < size; i++) {
      const max = Math.pow(10, digits);
      const num = Math.floor(Math.random() * max).toString().padStart(digits, '0');
      seq.push(num);
    }
    return seq;
  };

  const handleStart = () => {
    if (!selectedMode || !selectedDifficulty) return;
    const size = selectedMode === 'Satelite' ? 3 : 5;
    const newSeq = generateSequence(selectedMode, selectedDifficulty);
    startGame(newSeq, size, `${selectedMode} ${selectedDifficulty}`);
  };

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

  // Pantalla de Selección
  if (!gameState.isActive && !gameState.isWon) {
    return (
      <div style={{ textAlign: 'center', padding: '24px' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '32px' }}>Configuración de Misión</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '500px', margin: '0 auto' }}>
          {/* Paso 1: Modo */}
          <div>
            <p style={{ fontWeight: 'bold', marginBottom: '16px', fontSize: '1.2rem' }}>1. Selecciona el Sistema:</p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button 
                className="btn-cartoon"
                onClick={() => setSelectedMode('Satelite')}
                style={{ flex: 1, backgroundColor: selectedMode === 'Satelite' ? 'var(--artemis-orange)' : '#4B3F72' }}
              >
                🛰️ Satélite (3x3)
              </button>
              <button 
                className="btn-cartoon"
                onClick={() => setSelectedMode('Nave')}
                style={{ flex: 1, backgroundColor: selectedMode === 'Nave' ? 'var(--artemis-orange)' : '#4B3F72' }}
              >
                🚀 Nave (5x5)
              </button>
            </div>
          </div>

          {/* Paso 2: Dificultad */}
          {selectedMode && (
            <div className="fade-in">
              <p style={{ fontWeight: 'bold', marginBottom: '16px', fontSize: '1.2rem' }}>2. Nivel de Encriptación:</p>
              <div style={{ display: 'flex', gap: '16px' }}>
                <button 
                  className="btn-cartoon"
                  onClick={() => setSelectedDifficulty('fácil')}
                  style={{ flex: 1, backgroundColor: selectedDifficulty === 'fácil' ? '#1F6A40' : '#2D4059' }}
                >
                  Fácil ({selectedMode === 'Satelite' ? '2' : '3'} cifras)
                </button>
                <button 
                  className="btn-cartoon"
                  onClick={() => setSelectedDifficulty('difícil')}
                  style={{ flex: 1, backgroundColor: selectedDifficulty === 'difícil' ? '#b33939' : '#2D4059' }}
                >
                  Difícil ({selectedMode === 'Satelite' ? '3' : '4'} cifras)
                </button>
              </div>
            </div>
          )}

          {/* Botón Iniciar */}
          {selectedMode && selectedDifficulty && (
            <button 
              className="btn-cartoon pulse"
              onClick={handleStart}
              style={{ padding: '24px', fontSize: '1.5rem', marginTop: '16px', backgroundColor: '#005C8A' }}
            >
              <Play style={{ display: 'inline', marginRight: '8px' }} /> Iniciar Transmisión
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '16px' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Visualizador: {gameState.difficulty}</h2>
        <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--artemis-orange)', fontFamily: 'monospace' }}>
          {elapsedTime}
        </div>
      </div>

      {gameState.isWon ? (
        <div style={{ backgroundColor: '#1F6A40', padding: '32px', borderRadius: '24px', textAlign: 'center', border: '4px solid white' }}>
          <h3 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>¡Sincronización Exitosa!</h3>
          <p>Tiempo final: {elapsedTime}</p>
          <button className="btn-cartoon" onClick={() => { setSelectedMode(null); setSelectedDifficulty(null); resetGame(); }} style={{ marginTop: '24px', backgroundColor: 'white', color: 'black' }}>
            Nueva Misión
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${gameState.gridSize}, 1fr)`,
            gap: '12px',
            padding: '20px',
            backgroundColor: 'var(--space-medium)',
            borderRadius: '20px',
            border: '4px solid var(--cartoon-outline)',
            maxWidth: '90vw'
          }}>
            {gameState.sequence.map((num, i) => (
              <div key={i} style={{
                width: gameState.gridSize === 5 ? '60px' : '80px',
                height: gameState.gridSize === 5 ? '60px' : '80px',
                backgroundColor: 'var(--cartoon-white)',
                color: 'var(--space-dark)',
                fontSize: gameState.gridSize === 5 ? '1.5rem' : '2.5rem',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '12px',
                border: '3px solid var(--space-dark)',
                boxShadow: 'inset 0 -4px 0 rgba(0,0,0,0.1)'
              }}>
                {num}
              </div>
            ))}
          </div>

          <button className="btn-cartoon" onClick={resetGame} style={{ backgroundColor: '#b33939' }}>
            Abortar Transmisión
          </button>
        </div>
      )}
    </div>
  );
}
