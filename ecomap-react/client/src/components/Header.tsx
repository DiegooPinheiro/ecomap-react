import { Link } from 'react-router-dom';
export default function Header(){
return (
<header className="p-3 bg-sky-700 text-white flex justify-between">
<h1 className="font-bold">EcoMap</h1>
<nav className="flex gap-3">
<Link to="/">Mapa</Link>
<Link to="/login">Login</Link>
<Link to="/cadastro-ponto">Cadastrar</Link>
<Link to="/admin">Admin</Link>
</nav>
</header>
);
}