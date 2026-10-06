import { useState } from "react";
import PetDetalhesModal from "./PetDetalhesModal";

/*
  Chave única usada para compartilhar favoritos entre Home e Favoritos.
  O mesmo nome precisa ser usado pelas duas páginas.
*/
const CHAVE_FAVORITOS = "cercaTrovaFavoritos";

/* Leitura segura dos favoritos já salvos no navegador. */
function carregarFavoritos() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_FAVORITOS)) || [];
  } catch {
    return [];
  }
}

export default function CardAnimais({
  pet,
  isFavorito = false,
  onToggleFavorito,
  mapaAvistamentos = [],
}) {
  /*
    Inicializa o botão consultando o LocalStorage.
    A função lazy evita uma leitura desnecessária a cada renderização.
  */
  const [favoritado, setFavoritado] = useState(() => {
    if (isFavorito) return true;
    return carregarFavoritos().some((favorito) => favorito.id === pet.id);
  });

  /* Controla a abertura do modal de detalhes acionada pela foto do card. */
  const [modalAberto, setModalAberto] = useState(false);

  /*
    Salva ou remove o card dos favoritos e atualiza o botão imediatamente.
    A tag é normalizada para que a página Favoritos consiga filtrar o item.
  */
  function alternarFavorito() {
    const favoritosAtuais = carregarFavoritos();
    const jaExiste = favoritosAtuais.some((favorito) => favorito.id === pet.id);

    if (jaExiste) {
      const listaAtualizada = favoritosAtuais.filter(
        (favorito) => favorito.id !== pet.id,
      );
      localStorage.setItem(CHAVE_FAVORITOS, JSON.stringify(listaAtualizada));
      setFavoritado(false);

      if (onToggleFavorito) onToggleFavorito(pet);
      return;
    }

    const petParaSalvar = {
      ...pet,
      tag: pet.tag || pet.status || "Adoção",
    };

    localStorage.setItem(
      CHAVE_FAVORITOS,
      JSON.stringify([...favoritosAtuais, petParaSalvar]),
    );
    setFavoritado(true);
  }

  return (
    <article className="feed-card">
      <div className="feed-card-header">
        <div className="feed-avatar">🐾</div>

        <div className="feed-card-identidade">
          <h3>{pet.nome}</h3>
          <span>
            {pet.cidade} • {pet.status}
          </span>
        </div>

        {/* O botão permanece no canto superior direito do card. */}
        <div className="feed-card-header-actions">
          {/* A tag foi retirada visualmente dos cards da Home conforme solicitado. */}
          <button
            className={`feed-card-favorito ${favoritado ? "ativo" : ""}`}
            type="button"
            onClick={alternarFavorito}
            aria-label={
              favoritado
                ? `Remover ${pet.nome} dos favoritos`
                : `Adicionar ${pet.nome} aos favoritos`
            }
            aria-pressed={favoritado}
            title={
              favoritado ? "Remover dos favoritos" : "Adicionar aos favoritos"
            }
          >
            {favoritado ? "♥" : "♡"}
          </button>
        </div>
      </div>

      <div className="feed-card-texto">
        <p>{pet.descricao}</p>
        <span>
          {pet.especie} • {pet.raca || "Raça não informada"} • {pet.idade}
        </span>
      </div>

      {/*
        A foto tornou-se um controle acessível. O clique abre os dados completos
        sem alterar as ações já existentes no rodapé do card.
      */}
      <button
        className="feed-card-image-button"
        type="button"
        onClick={() => setModalAberto(true)}
        aria-label={`Ver informações completas de ${pet.nome}`}
      >
        <img className="feed-card-img" src={pet.imagem} alt={pet.nome} />
      </button>

      <div className="feed-card-acoes">
        <button type="button">❤️ Tenho interesse</button>
        <button type="button">↗ Compartilhar</button>
      </div>
      {/* Modal compartilhado com o mapa opcional para pets perdidos. */}
      <PetDetalhesModal
        pet={pet}
        aberto={modalAberto}
        aoFechar={() => setModalAberto(false)}
        mapaAvistamentos={mapaAvistamentos}
      />
    </article>
  );
}
