import { useState, useEffect, useCallback, useRef } from 'react';
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
  isPreparing: boolean; // Hemos recibido coordenadas pero no hemos empezado
  countdown: number | null; // 3, 2, 1...
  participantId: number | null;
  participantName: string | null;
}

// Utilidad para generar el "pitido" de inicio
const playBeep = (freq = 880, duration = 0.1) => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
  } catch (e) {
    console.warn("Audio not supported or blocked", e);
  }
};

export function useMemoriaSync() {
  const { artemisUserId } = useAuth();
  const [gameState, setGameState] = useState<MemoriaGameState>({
    isActive: false,
    sequence: [],
    gridSize: 3,
    difficulty: 'fácil',
    startTime: null,
    endTime: null,
    isWon: false,
    isPreparing: false,
    countdown: null,
    participantId: null,
    participantName: null
  });

  const countdownInterval = useRef<number | null>(null);

  useEffect(() => {
    if (!artemisUserId) return;

    // 1. Unirse a la sala privada del usuario
    socket.emit('join_room', artemisUserId);

    // 2. Escuchar actualizaciones sincronizadas
    const handleSync = (data: { type: string, payload: any }) => {
      console.log('Sincronización recibida por socket:', data);
      switch (data.type) {
        case 'PREPARE_GAME':
          setGameState(prev => ({
            ...prev,
            isActive: false,
            isPreparing: true,
            isWon: false,
            sequence: data.payload.sequence,
            gridSize: data.payload.gridSize,
            difficulty: data.payload.difficulty,
            participantId: data.payload.participantId || null,
            participantName: data.payload.participantName || null,
            countdown: null
          }));
          break;
        case 'START_COUNTDOWN':
          runCountdown();
          break;
        case 'START_GAME':
          setGameState(prev => ({
            ...prev,
            isActive: true,
            isPreparing: false,
            countdown: null,
            startTime: data.payload.startTime,
            endTime: null,
            isWon: false
          }));
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
          if (countdownInterval.current) clearInterval(countdownInterval.current);
          setGameState({
            isActive: false,
            sequence: [],
            gridSize: 3,
            difficulty: 'fácil',
            startTime: null,
            endTime: null,
            isWon: false,
            isPreparing: false,
            countdown: null,
            participantId: null,
            participantName: null
          });
          break;
      }
    };

    socket.on('memoria_sync', handleSync);

    return () => {
      socket.off('memoria_sync', handleSync);
      if (countdownInterval.current) clearInterval(countdownInterval.current);
    };
  }, [artemisUserId]);

  const runCountdown = () => {
    let count = 3;
    setGameState(prev => ({ ...prev, countdown: count, isPreparing: true }));
    playBeep(440, 0.1); // Pitido inicial

    if (countdownInterval.current) clearInterval(countdownInterval.current);

    countdownInterval.current = window.setInterval(() => {
      count--;
      if (count > 0) {
        setGameState(prev => ({ ...prev, countdown: count }));
        playBeep(440, 0.1);
      } else {
        if (countdownInterval.current) clearInterval(countdownInterval.current);
        setGameState(prev => ({ ...prev, countdown: 0 }));
        playBeep(880, 0.3); // Pitido final
      }
    }, 1000);
  };

  const prepareGame = useCallback((sequence: string[], gridSize: number, difficulty: string, participantId?: number | null, participantName?: string | null) => {
    const payload = { sequence, gridSize, difficulty, participantId, participantName };
    socket.emit('memoria_action', { userId: artemisUserId, type: 'PREPARE_GAME', payload });
    setGameState(prev => ({
      ...prev,
      isPreparing: true,
      sequence,
      gridSize,
      difficulty,
      participantId: participantId || null,
      participantName: participantName || null,
      isWon: false,
      countdown: null
    }));
  }, [artemisUserId]);

  const startCountdown = useCallback(() => {
    socket.emit('memoria_action', { userId: artemisUserId, type: 'START_COUNTDOWN' });
    runCountdown();
    
    // Programar el inicio real del juego automáticamente tras 3 segundos
    setTimeout(() => {
      const startTime = Date.now();
      socket.emit('memoria_action', { userId: artemisUserId, type: 'START_GAME', payload: { startTime } });
      setGameState(prev => ({
        ...prev,
        isActive: true,
        isPreparing: false,
        countdown: null,
        startTime,
        endTime: null,
        isWon: false
      }));
    }, 3100);
  }, [artemisUserId]);

  const winGame = useCallback(async () => {
    const endTime = Date.now();
    socket.emit('memoria_action', { userId: artemisUserId, type: 'WIN_GAME', payload: { endTime } });
    
    setGameState(prev => {
      const newState = {
        ...prev,
        isActive: false,
        isWon: true,
        endTime
      };
      if (prev.startTime) {
        const diff = endTime - prev.startTime;
        // Si hay un participante asignado, guardamos para él. Si no, para el admin/usuario logueado.
        const targetUserId = prev.participantId || artemisUserId;
        
        if (targetUserId) {
          artemisApi.saveMemoria(targetUserId, diff).catch(e => console.error("Error saving memory time", e));
        }
      }
      return newState;
    });
  }, [artemisUserId]);

  const resetGame = useCallback(() => {
    socket.emit('memoria_action', { userId: artemisUserId, type: 'RESET_GAME' });
    if (countdownInterval.current) clearInterval(countdownInterval.current);
    
    setGameState({
      isActive: false,
      sequence: [],
      gridSize: 3,
      difficulty: 'fácil',
      startTime: null,
      endTime: null,
      isWon: false,
      isPreparing: false,
      countdown: null,
      participantId: null,
      participantName: null
    });
  }, [artemisUserId]);

  return {
    gameState,
    prepareGame,
    startCountdown,
    winGame,
    resetGame
  };
}
