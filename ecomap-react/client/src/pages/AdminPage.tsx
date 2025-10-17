/* //AdminPage.tsx
import { useEffect, useState } from 'react';
import api from '../api';

export default function AdminPage() {
  const [pontos, setPontos] = useState<any[]>([]);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const res = await api.get('/api/admin/pontos');
    setPontos(res.data);
  };

  const approve = async (id: number) => {
    await api.post(`/api/admin/pontos/${id}/approve`);
    setPontos(pontos.map(p => p.id === id ? { ...p, status: 'aprovado' } : p));
  };

  const del = async (id: number) => {
    await api.delete(`/api/admin/pontos/${id}`);
    setPontos(pontos.filter(p => p.id !== id));
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Painel Admin</h2>
      {pontos.length === 0 && <p>Nenhum ponto pendente</p>}
      {pontos.map(p => (
        <div key={p.id} className="border p-2 my-2 flex justify-between items-center">
          <div>
            <strong>{p.title || p.tipo}</strong>
            <div className="text-sm">{p.address}</div>
            <div className="text-sm">Status: {p.status}</div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => approve(p.id)} className="p-2 bg-green-600 text-white">Aprovar</button>
            <button onClick={() => del(p.id)} className="p-2 bg-red-600 text-white">Excluir</button>
          </div>
        </div>
      ))}
    </div>
  );
}
 */
// src/pages/AdminPage.tsx
import { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import api from '../api';

export default function AdminPage() {
  const [pontos, setPontos] = useState<any[]>([]);
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const res = await api.get('/api/admin/pontos');
    setPontos(res.data);
  };

  const approve = async (id: number) => {
    await api.post(`/api/admin/pontos/${id}/approve`);
    setPontos(pontos.map(p => p.id === id ? { ...p, status: 'aprovado' } : p));
  };

  const del = async (id: number) => {
    await api.delete(`/api/admin/pontos/${id}`);
    setPontos(pontos.filter(p => p.id !== id));
  };

  useEffect(() => {
    if (!mapRef.current && mapContainerRef.current) {
      const map = L.map(mapContainerRef.current).setView([-3.7, -38.5], 12);
      mapRef.current = map;
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);
    }

    if (mapRef.current) {
      // Limpa marcadores antigos
      mapRef.current.eachLayer((layer) => {
        if (layer instanceof L.Marker) mapRef.current?.removeLayer(layer);
      });

      // Adiciona novos pontos
      pontos.forEach((p) => {
        if (p.latitude && p.longitude) {
          const marker = L.marker([p.latitude, p.longitude]).addTo(mapRef.current!);
          marker.bindPopup(`
            <b>${p.title || p.tipo}</b><br/>
            ${p.address || ''}<br/>
            Status: ${p.status}
            <br/><button id="approve-${p.id}" style="margin-top:5px;">Aprovar</button>
            <button id="del-${p.id}" style="margin-top:5px; color:red;">Excluir</button>
          `);
          marker.on('popupopen', () => {
            document
              .getElementById(`approve-${p.id}`)
              ?.addEventListener('click', () => approve(p.id));
            document
              .getElementById(`del-${p.id}`)
              ?.addEventListener('click', () => del(p.id));
          });
        }
      });
    }
  }, [pontos]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Painel Admin com Mapa</h2>
      <div ref={mapContainerRef} style={{ height: '70vh', width: '100%', marginBottom: '1rem' }} />
      <button
        onClick={load}
        className="p-2 bg-blue-600 text-white rounded"
      >
        Recarregar pontos
      </button>
    </div>
  );
}
