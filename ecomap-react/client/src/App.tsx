import { Routes, Route } from 'react-router-dom';
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
          <Route path="/cadastro-ponto" element={<AddPointPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </AuthLoader>
    </AuthProvider>
  );
}

// Componente para lidar com carregamento de autenticação
function AuthLoader({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();

  if (loading) return <div className="p-4">Carregando...</div>;
  return <>{children}</>;
}
