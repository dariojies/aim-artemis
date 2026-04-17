import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../core/AuthContext';
import { artemisApi } from '../../services/api';
import { socket } from '../../services/socket';

// Estado inicial del juego de memoria
export interface MemoriaGameState {
  isActive: boolean;
  sequence: string[];
  gridSize: number;
  difficulty: string;
  startTime: number | null;
  endTime: number | null;
  isWon: boolean;
}

export function useMemoriaSync() {
  const { artemisUserId } = useAuth();
  const [gameState, setGameState] = useState<MemoriaGameState>({
    isActive: false,
    sequence: [],
    gridSize: 3,
    difficulty: 'fácil',
    startTime: null,
    endTime: null,
    isWon: false
  });

  useEffect(() => {
    if (!artemisUserId) return;

    // 1. Unirse a la sala privada del usuario
    socket.emit('join_room', artemisUserId);

    // 2. Escuchar actualizaciones sincronizadas
    const handleSync = (data: { type: string, payload: any }) => {
      console.log('Sincronización recibida por socket:', data);
      switch (data.type) {
        case 'START_GAME':
          setGameState({
            isActive: true,
            sequence: data.payload.sequence,
            gridSize: data.payload.gridSize,
            difficulty: data.payload.difficulty,
            startTime: data.payload.startTime,
            endTime: null,
            isWon: false
          });
          break;
        case 'WIN_GAME':
          setGameState(prev => ({
            ...prev,
            isActive: false,
            isWon: true,
            endTime: data.payload.endTime
          }));
          break;
        case 'RESET_GAME':
          setGameState({
            isActive: false,
            sequence: [],
            gridSize: 3,
            difficulty: 'fácil',
            startTime: null,
            endTime: null,
            isWon: false
          });
          break;
      }
    };

    socket.on('memoria_sync', handleSync);

    return () => {
      socket.off('memoria_sync', handleSync);
    };
  }, [artemisUserId]);

  const startGame = useCallback((sequence: string[], gridSize: number, difficulty: string) => {
    const startTime = Date.now();
    const payload = { sequence, gridSize, difficulty, startTime };
    
    // Emitir al servidor para otros dispositivos
    socket.emit('memoria_action', { userId: artemisUserId, type: 'START_GAME', payload });

    setGameState({
      isActive: true,
      sequence,
      gridSize,
      difficulty,
      startTime,
      endTime: null,
      isWon: false
    });
  }, [artemisUserId]);

  const winGame = useCallback(async () => {
    const endTime = Date.now();
    
    // Emitir al servidor para otros dispositivos
    socket.emit('memoria_action', { userId: artemisUserId, type: 'WIN_GAME', payload: { endTime } });
    
    setGameState(prev => {
      const newState = {
        ...prev,
        isActive: false,
        isWon: true,
        endTime
      };

      // Si tenemos un usuario identificado, guardamos el tiempo de forma asíncrona en DB
      if (artemisUserId && prev.startTime) {
        const diff = endTime - prev.startTime;
        artemisApi.saveMemoria(artemisUserId, diff).catch(e => console.error("Error saving memory time", e));
      }

      return newState;
    });
  }, [artemisUserId]);

  const resetGame = useCallback(() => {
    socket.emit('memoria_action', { userId: artemisUserId, type: 'RESET_GAME' });
    
    setGameState({
      isActive: false,
      sequence: [],
      gridSize: 3,
      difficulty: 'fácil',
      startTime: null,
      endTime: null,
      isWon: false
    });
  }, [artemisUserId]);

  return {
    gameState,
    startGame,
    winGame,
    resetGame
  };
}
