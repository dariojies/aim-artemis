const API_BASE = window.location.origin + '/api';

export const artemisApi = {
  // Auth & Usuarios
  register: async (phone: string) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    });
    return res.json();
  },

  loginWithGoogle: async (credential: string) => {
    const res = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential })
    });
    return res.json();
  },

  searchAstronaut: async (query: string) => {
    const res = await fetch(`${API_BASE}/auth/search-astronaut?q=${encodeURIComponent(query)}`);
    return res.json();
  },

  // Juegos
  saveMemoria: async (artemis_user_id: number, tiempo_exacto: number) => {
    const res = await fetch(`${API_BASE}/memoria`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ artemis_user_id, tiempo_exacto })
    });
    return res.json();
  },

  saveBaseLunar: async (astronaut_number: string, sentadillas: number) => {
    const res = await fetch(`${API_BASE}/base-lunar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ astronaut_number, sentadillas })
    });
    return res.json();
  },

  saveRumboLuna: async (astronaut_number: string, centimetros: number) => {
    const res = await fetch(`${API_BASE}/rumbo-luna`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ astronaut_number, centimetros })
    });
    return res.json();
  },

  // Global & Rankings
  getGlobalStatus: async () => {
    const res = await fetch(`${API_BASE}/status/global`);
    return res.json();
  },

  getRankings: async (type: 'energia' | 'vuelo' | 'velocidad') => {
    const res = await fetch(`${API_BASE}/rankings/${type}`);
    return res.json();
  }
};
