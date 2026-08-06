import { Link } from "react-router-dom";
//precisamos importar o css - devemos fazer css global ou individual , creio que o global seja melhor 

export default function Menu() {
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/adocao">Adoção</Link>
      <Link to="/tinder-pet">Tinder Pet</Link>
      <Link to="/favoritos">Favoritos</Link>
      <Link to="/login">Entrar</Link>
    </nav>
  );
}