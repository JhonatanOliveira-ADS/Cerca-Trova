import { Link } from 'react-router-dom';

export default function CardAnimais({ pet }) {
  return (
    <div className="pet-card">
      <img src={pet.imagem} alt={pet.nome} className="pet-card-img" />
      <div className="pet-card-content">
        <h3>{pet.nome}</h3>
        <p><strong>Espécie:</strong> {pet.especie}</p>
        <p><strong>Idade:</strong> {pet.idade}</p>
        <p><strong>Cidade:</strong> {pet.cidade}</p>
        <Link to={`/pets/${pet.id}`} className="pet-card-btn">
          Ver detalhes
        </Link>
      </div>
    </div>
  );
}