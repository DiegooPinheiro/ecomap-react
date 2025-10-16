import { useEffect, useState } from 'react';
import api from '../api';

export default function AdminPage(){
  const [pontos, setPontos] = useState<any[]>([]);
  useEffect(()=>{ load(); }, []);

  const load = async () => {
    const res = await api.get('/api/admin/pontos');
    setPontos(res.data);
  };

  const approve = async (id:number) => {
    await api.post(`/api/admin/pontos/${id}/approve`);
    setPontos(pontos.map(p=>p.id===id?{...p,approved:1}:p));
  };

  const del = async (id:number) => {
    await api.delete(`/api/admin/pontos/${id}`);
    setPontos(pontos.filter(p=>p.id!==id));
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Painel Admin</h2>
      {pontos.map(p=>(
        <div key={p.id} className="border p-2 my-2">
          <div className="flex justify-between items-center">
            <div>
              <strong>{p.title || p.tipo}</strong><div className="text-sm">{p.address}</div>
              <div className="text-sm">Aprovado: {p.approved}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={()=>approve(p.id)} className="p-2 bg-green-600 text-white">Aprovar</button>
              <button onClick={()=>del(p.id)} className="p-2 bg-red-600 text-white">Excluir</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
