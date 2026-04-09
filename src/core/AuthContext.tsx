import { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'guest' | 'user' | 'superadmin';

interface AuthState {
  role: UserRole;
  userId: string | null; // UUID de users (opcional)
  artemisUserId: number | null; // ID de artemis_users
  astronautNumber: string | null; // "0000"-"9999"
  login: (role: UserRole, id: string, artemisId?: number, astroNum?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>('guest');
  const [userId, setUserId] = useState<string | null>(null);
  const [artemisUserId, setArtemisUserId] = useState<number | null>(null);
  const [astronautNumber, setAstronautNumber] = useState<string | null>(null);

  const login = (newRole: UserRole, id: string, artemisId?: number, astroNum?: string) => {
    setRole(newRole);
    setUserId(id);
    if (artemisId) setArtemisUserId(artemisId);
    if (astroNum) setAstronautNumber(astroNum);
  };

  const logout = () => {
    setRole('guest');
    setUserId(null);
    setArtemisUserId(null);
    setAstronautNumber(null);
  };

  return (
    <AuthContext.Provider value={{ role, userId, artemisUserId, astronautNumber, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth instanciado sin AuthProvider');
  }
  return context;
}
