import type { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './core/AuthContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Menu } from './pages/Menu';
import { UserProfile } from './pages/UserProfile';
import { MemoriaGame } from './modules/memoria/MemoriaGame';
import { BaseLunarGame } from './modules/base-lunar/BaseLunarGame';
import { RumboLunaGame } from './modules/rumbo-luna/RumboLunaGame';

// Wrapper para proteger rutas Superadmin
function RequireSuperadmin({ children }: { children: ReactNode }) {
  const { role } = useAuth();
  if (role !== 'superadmin') {
    return <Navigate to="/profile" replace />;
  }
  return children;
}

// Wrapper para proteger rutas de Usuario logueado (Cualquiera)
function RequireAuth({ children }: { children: ReactNode }) {
  const { role } = useAuth();
  if (role === 'guest') {
    return <Navigate to="/" replace />;
  }
  return children;
}

function RoutesConfig() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      
      {/* Vistas de Gamificación y Perfil - Requieren haber escaneado QR al menos */}
      <Route path="/profile" element={
        <RequireAuth><UserProfile /></RequireAuth>
      } />

      {/* Vistas Administrativas (Estaciones de Inputs) */}
      <Route path="/menu" element={
        <RequireSuperadmin><Menu /></RequireSuperadmin>
      } />
      <Route path="/memoria" element={
        <RequireSuperadmin><MemoriaGame /></RequireSuperadmin>
      } />
      <Route path="/base-lunar" element={
        <RequireSuperadmin><BaseLunarGame /></RequireSuperadmin>
      } />
      <Route path="/rumbo-luna" element={
        <RequireSuperadmin><RumboLunaGame /></RequireSuperadmin>
      } />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <RoutesConfig />
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
