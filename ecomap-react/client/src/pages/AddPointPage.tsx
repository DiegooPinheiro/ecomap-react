import { useState } from 'react';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AddPointPage() {
  const [form, setForm] = useState({ title: '', address: '', lat: '', lng: '', tipo: 'eletronico', horario: '' });
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!user) { alert('Faça login primeiro'); return; }

    try {
      await api.post('/api/pontos', {
        ...form,
        lat: Number(form.lat),
        lng: Number(form.lng)
      });
      alert('Ponto enviado para aprovação');
      navigate('/');
    } catch (err: any) {
      alert(err?.response?.data?.error || err.message || 'Erro');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 max-w-md mx-auto flex flex-col gap-2">
      <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Título" className="p-2 border" />
      <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Endereço" className="p-2 border" />
      <input value={form.lat} onChange={e => setForm({ ...form, lat: e.target.value })} placeholder="Latitude" className="p-2 border" />
      <input value={form.lng} onChange={e => setForm({ ...form, lng: e.target.value })} placeholder="Longitude" className="p-2 border" />
      <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })} className="p-2 border">
        <option value="eletronico">Eletrônico</option>
        <option value="reciclavel">Reciclável</option>
        <option value="oleo">Óleo de cozinha</option>
      </select>
      <input value={form.horario} onChange={e => setForm({ ...form, horario: e.target.value })} placeholder="Horário" className="p-2 border" />
      <button className="p-2 bg-sky-600 text-white">Enviar</button>
    </form>
  );
}
