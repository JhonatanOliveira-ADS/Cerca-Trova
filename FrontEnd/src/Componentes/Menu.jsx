import { Link } from "react-router-dom";
import "../assets/css/Menu.css";

export default function Menu() {
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/adocao">Adoção</Link>
      <Link to="/tinder-pet">Tinder Pet</Link>
      <Link to="/favoritos">Favoritos</Link>
      {/* Acrescentado: acesso à área de dados e publicações do usuário. */}
      <Link to="/perfil">Meu perfil</Link>
      {/* Acrescentado: atalho para as conversas da referência. */}
      <Link to="/chat">Chat</Link>
      <Link to="/login">Entrar</Link>
    </nav>
  );
}

/* menu individual para facilitar nossa vida */
