export default function CardAnimais({ pet }) {

  return (
    <article className="feed-card">

      <div className="feed-card-header">

        <div className="feed-avatar">
          🐾
        </div>

        <div>
          <h3>{pet.nome}</h3>

          <span>
            {pet.cidade} • {pet.status}
          </span>
        </div>

      </div>

      <div className="feed-card-texto">
        <p>{pet.descricao}</p>

        <span>
          {pet.especie} • {pet.idade}
        </span>
      </div>

      <img
        className="feed-card-img"
        src={pet.imagem}
        alt={pet.nome}
      />

      <div className="feed-card-acoes">

        <button type="button">
          ❤️ Tenho interesse
        </button>
        
        <button type="button">
          ↗ Compartilhar
        </button>

      </div>

    </article>
  );
}