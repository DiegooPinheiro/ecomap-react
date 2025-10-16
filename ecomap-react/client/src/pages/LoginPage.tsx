import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  // Estados separados
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  // Login
  const handleLogin = async (e: any) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return alert('Preencha email e senha');

    try {
      await login(loginEmail, loginPassword);
      alert('Logado com sucesso');
      navigate('/');
    } catch (err: any) {
      alert(err?.response?.data?.error || err.message || 'Erro ao fazer login');
    }
  };

  // Cadastro
  const handleRegister = async (e: any) => {
    e.preventDefault();
    if (!registerName || !registerEmail || !registerPassword)
      return alert('Preencha todos os campos');

    if (registerPassword.length < 6)
      return alert('A senha deve ter pelo menos 6 caracteres');

    try {
      await register(registerName, registerEmail, registerPassword);
      alert('Cadastrado e logado com sucesso');
      navigate('/');
    } catch (err: any) {
      alert(err?.response?.data?.error || err.message || 'Erro ao cadastrar');
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto flex flex-col gap-4">
      {/* LOGIN */}
      <h2 className="text-xl font-bold">Login</h2>
      <form onSubmit={handleLogin} className="flex flex-col gap-2">
        <input
          placeholder="Email"
          value={loginEmail}
          onChange={(e) => setLoginEmail(e.target.value)}
          className="p-2 border"
        />
        <input
          placeholder="Senha"
          type="password"
          value={loginPassword}
          onChange={(e) => setLoginPassword(e.target.value)}
          className="p-2 border"
        />
        <button className="p-2 bg-sky-600 text-white">Entrar</button>
      </form>

      <hr/>

      {/* CADASTRO */}
      <h3 className="text-lg font-bold">Cadastrar</h3>
      <form onSubmit={handleRegister} className="flex flex-col gap-2">
        <input
          placeholder="Nome"
          value={registerName}
          onChange={(e) => setRegisterName(e.target.value)}
          className="p-2 border"
        />
        <input
          placeholder="Email"
          value={registerEmail}
          onChange={(e) => setRegisterEmail(e.target.value)}
          className="p-2 border"
        />
        <input
          placeholder="Senha"
          type="password"
          value={registerPassword}
          onChange={(e) => setRegisterPassword(e.target.value)}
          className="p-2 border"
        />
        <button className="p-2 bg-green-600 text-white">Cadastrar</button>
      </form>
    </div>
  );
}
