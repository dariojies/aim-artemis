import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../core/AuthContext';
import { artemisApi } from '../../services/api';

// Tipos de mensajes que enviaremos a través del canal
type MemoriaMessage = 
  | { type: 'START_GAME'; payload: { sequence: number[], startTime: number } }
  | { type: 'WIN_GAME'; payload: { endTime: number } }
  | { type: 'RESET_GAME' }
  | { type: 'PING' };

export interface MemoriaGameState {
  isActive: boolean;
  sequence: number[];
  startTime: number | null;
  endTime: number | null;
  isWon: boolean;
}

const CHANNEL_NAME = 'artemis_memoria_sync';

export function useMemoriaSync() {
  const { artemisUserId } = useAuth();
  const [gameState, setGameState] = useState<MemoriaGameState>({
    isActive: false,
    sequence: [],
    startTime: null,
    endTime: null,
    isWon: false
  });

  const [channel, setChannel] = useState<BroadcastChannel | null>(null);

  useEffect(() => {
    // Instanciar el canal (funciona cross-tab en el mismo navegador)
    const bc = new BroadcastChannel(CHANNEL_NAME);
    setChannel(bc);

    bc.onmessage = (event: MessageEvent<MemoriaMessage>) => {
      const data = event.data;
      switch (data.type) {
        case 'START_GAME':
          setGameState({
            isActive: true,
            sequence: data.payload.sequence,
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
            startTime: null,
            endTime: null,
            isWon: false
          });
          break;
      }
    };

    return () => {
      bc.close();
    };
  }, []);

  const startGame = useCallback((sequence: number[]) => {
    if (!channel) return;
    const startTime = Date.now();
    const payload = { sequence, startTime };
    channel.postMessage({ type: 'START_GAME', payload });
    setGameState({
      isActive: true,
      sequence,
      startTime,
      endTime: null,
      isWon: false
    });
  }, [channel]);

  const winGame = useCallback(async () => {
    if (!channel) return;
    const endTime = Date.now();
    channel.postMessage({ type: 'WIN_GAME', payload: { endTime } });
    
    setGameState(prev => {
      const newState = {
        ...prev,
        isActive: false,
        isWon: true,
        endTime
      };

      // Si tenemos un usuario identificado, guardamos el tiempo de forma asíncrona
      if (artemisUserId && prev.startTime) {
        const diff = endTime - prev.startTime;
        artemisApi.saveMemoria(artemisUserId, diff).catch(e => console.error("Error saving memory time", e));
      }

      return newState;
    });
  }, [channel, artemisUserId]);

  const resetGame = useCallback(() => {
    if (!channel) return;
    channel.postMessage({ type: 'RESET_GAME' });
    setGameState({
      isActive: false,
      sequence: [],
      startTime: null,
      endTime: null,
      isWon: false
    });
  }, [channel]);

  return {
    gameState,
    startGame,
    winGame,
    resetGame
  };
}
