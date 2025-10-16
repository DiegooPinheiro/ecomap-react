// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../api';

type User = {
  id: number;
  nome: string;
  email: string;
  is_admin: number;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
  register: (nome: string, email: string, senha: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Carregar usuário do token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verificar token no backend
      api.get('/api/me')
        .then(res => setUser(res.data.user))
        .catch(() => {
          localStorage.removeItem('token');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Login
  const login = async (email: string, senha: string) => {
    const res = await api.post('/api/login', { email, senha });
    const { token, user } = res.data;
    localStorage.setItem('token', token);
    setUser(user);
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Registro
  const register = async (nome: string, email: string, senha: string) => {
    await api.post('/api/register', { nome, email, senha });
    // Logar automaticamente após registro
    await login(email, senha);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar contexto
export function useAuth() {
  return useContext(AuthContext);
}
