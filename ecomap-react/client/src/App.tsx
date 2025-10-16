// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import MapPage from './pages/MapPage';
import LoginPage from './pages/LoginPage';
import AddPointPage from './pages/AddPointPage';
import AdminPage from './pages/AdminPage';
import Header from './components/Header';
import { AuthProvider, useAuth } from './contexts/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <Header />
      <AuthLoader>
        <Routes>
          <Route path="/" element={<MapPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/cadastro-ponto"
            element={
              <PrivateRoute>
                <AddPointPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            }
          />
        </Routes>
      </AuthLoader>
    </AuthProvider>
  );
}

// Loader para autenticação
function AuthLoader({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();
  if (loading) return <div className="p-4">Carregando...</div>;
  return <>{children}</>;
}

// Rota privada para usuários logados
function PrivateRoute({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// Rota privada para admins
function AdminRoute({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  if (!user || user.is_admin !== 1) return <Navigate to="/" replace />;
  return children;
}
