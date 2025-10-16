// src/hooks/usePontos.ts
import { useEffect, useState } from 'react';
import api from '../api';

export type Ponto = {
  id:number;
  title?:string;
  address?:string;
  lat?:number;
  lng?:number;
  tipo?:string;
  horario?:string;
  approved?:number;
  created_by?:number;
};

export function usePontos(tipo?:string) {
  const [pontos, setPontos] = useState<Ponto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/pontos', { params: tipo ? { tipo } : {} });
      setPontos(res.data);
    } catch (e:any) {
      setError(e.message || 'Erro');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [tipo]);

  return { pontos, loading, error, reload: load, setPontos };
}
