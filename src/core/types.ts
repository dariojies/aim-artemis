/**
 * Escaneo numérico preexistente en el QR del usuario.
 * Actúa como llave foránea hacia la tabla 'users'.
 */
export type QRUserId = number;

/**
 * Módulo 1 (Misión Memoria)
 */
export interface ArtemisMisionMemoria {
  id: number;
  userId: QRUserId;
  /** Tiempo de resolución en milisegundos. Ranking evalúa el menor numéricamente. */
  tiempoExacto: number;
  fecha: string;
}

/**
 * Módulo 2 (Base Lunar)
 */
export interface ArtemisBaseLunar {
  id: number;
  userId: QRUserId;
  /** Cantidad de sentadillas validadas en la sesión. Equivale a energía. */
  sentadillas: number;
  fecha: string;
}

/**
 * Módulo 3 (Rumbo a la Luna)
 */
export interface ArtemisRumboLuna {
  id: number;
  userId: QRUserId;
  /** Altura máxima del salto detectada en centímetros. (1 cm = 1 km). */
  centimetros: number;
  fecha: string;
}

/**
 * Estado global comunitario cacheado en tiempo real.
 */
export interface ArtemisEstadoGlobal {
  id: number;
  /** Total de KM recorridos calculados sumando todos los centímetros saltados */
  totalKm: number;
  /** Energía total calculada a partir del histórico de sentadillas de todos los users */
  totalEnergia: number;
  ultimaActualizacion: string;
}
