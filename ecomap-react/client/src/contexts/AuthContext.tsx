import { createContext, useContext, useState, ReactNode } from 'react';
import axios from 'axios';

type User = {
  id: number;
  name: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const api = axios.create({
    baseURL: 'http://localhost:3001/api', // rota do backend
  });

  // login
  const login = async (email: string, password: string) => {
    const res = await api.post('/login', { email, password });
    setUser(res.data.user);
    localStorage.setItem('user', JSON.stringify(res.data.user));
  };

  // cadastro
  const register = async (name: string, email: string, password: string) => {
    const res = await api.post('/register', { name, email, password });
    setUser(res.data.user);
    localStorage.setItem('user', JSON.stringify(res.data.user));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook de fácil acesso
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
