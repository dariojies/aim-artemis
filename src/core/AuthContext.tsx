import { createContext, useContext, useState, type ReactNode } from 'react';

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
  const [role, setRole] = useState<UserRole>(() => (localStorage.getItem('artemis_role') as UserRole) || 'guest');
  const [userId, setUserId] = useState<string | null>(() => localStorage.getItem('artemis_userId'));
  const [artemisUserId, setArtemisUserId] = useState<number | null>(() => {
    const val = localStorage.getItem('artemis_artemisId');
    return val ? parseInt(val) : null;
  });
  const [astronautNumber, setAstronautNumber] = useState<string | null>(() => localStorage.getItem('artemis_astroNum'));

  const login = (newRole: UserRole, id: string, artemisId?: number, astroNum?: string) => {
    setRole(newRole);
    setUserId(id);
    localStorage.setItem('artemis_role', newRole);
    localStorage.setItem('artemis_userId', id);
    if (artemisId) {
      setArtemisUserId(artemisId);
      localStorage.setItem('artemis_artemisId', artemisId.toString());
    }
    if (astroNum) {
      setAstronautNumber(astroNum);
      localStorage.setItem('artemis_astroNum', astroNum);
    }
  };

  const logout = () => {
    setRole('guest');
    setUserId(null);
    setArtemisUserId(null);
    setAstronautNumber(null);
    localStorage.clear();
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
