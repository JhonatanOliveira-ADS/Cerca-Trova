import { useEffect, useMemo, useState } from "react";
import "../assets/css/Favoritos.css";
import {
  listarFavoritos,
  removerFavorito,
} from "../servicos/autenticacao";

/* Tags usadas no filtro avançado da página de favoritos. */
const TAGS_FILTRO = [
  "Todos",
  "Perdido",
  "Encontra",
  "Adoção",
  "Em busca de um Cãopanheiro",
];

/*
  Normaliza favoritos antigos da Home.
  Caso o registro não possua a propriedade tag, o status é usado como tag.
*/
function normalizarFavorito(pet) {
  return {
    ...pet,
    nome: pet.nome || "Pet favorito",
    autor: pet.autor || "Cerca Trova",
    tag: pet.tag || pet.status || "Adoção",
    cidade: pet.cidade || "Localização não informada",
    especie: pet.especie || "Pet",
    raca: pet.raca || "Raça não informada",
    idade: pet.idade || "Idade não informada",
    descricao: pet.descricao || "Este pet está salvo nos seus favoritos.",
  };
}

/* Converte a relação Favoritos + Publicacoes devolvida pelo Prisma para o card. */
function adaptarFavoritoApi(registro) {
  const publicacao = registro.publicacao || registro;
  const nomesDosTipos = {
    ADOCAO: "Adoção",
    PERDIDO: "Perdido",
    ENCONTRADO: "Achado",
  };
  const tag = nomesDosTipos[publicacao.tipo] || publicacao.tipo || "Adoção";

  return normalizarFavorito({
    ...publicacao,
    idFavorito: registro.id,
    nome: publicacao.nome_pet,
    idade: publicacao.idade_pet,
    imagem: publicacao.foto
      ? `http://localhost:3333/files/${publicacao.foto}`
      : "",
    status: tag,
    tag,
  });
}

/* Card de favorito com ação própria para remover o item sem depender de outro componente. */
function FavoritoCard({ pet, onRemover }) {
  return (
    <article className="favoritos-post-card">
      <header className="favoritos-post-header">
        <div className="favoritos-post-avatar" aria-hidden="true">
          🐾
        </div>
        <div className="favoritos-post-author">
          <h3>{pet.nome || "Pet sem nome"}</h3>
          <p>{pet.cidade}</p>
        </div>
        <span
          className={`favoritos-post-tag tag-${pet.tag.toLowerCase().replaceAll(" ", "-")}`}
        >
          {pet.tag}
        </span>
      </header>

      <div className="favoritos-post-content">
        <h2>{pet.nome || "Pet favorito"}</h2>
        <p>{pet.descricao}</p>
        <span className="favoritos-post-details">
          {pet.especie} <b>•</b> {pet.raca} <b>•</b> {pet.idade}
        </span>
      </div>

      {pet.imagem ? (
        <img
          className="favoritos-post-image"
          src={pet.imagem}
          alt={`Foto de ${pet.nome || "pet favorito"}`}
        />
      ) : (
        <div
          className="favoritos-post-no-image"
          aria-label="Imagem não disponível"
        >
          🐶
        </div>
      )}

      <footer className="favoritos-post-actions">
        <button type="button">❤️ Favoritado</button>
        <button type="button" onClick={() => onRemover(pet)}>
          🗑 Remover
        </button>
      </footer>
    </article>
  );
}

export default function Favoritos() {
  const [favoritos, setFavoritos] = useState([]);
  const [tagSelecionada, setTagSelecionada] = useState("Todos");
  const [termoBusca, setTermoBusca] = useState("");
  const [especieSelecionada, setEspecieSelecionada] = useState("Todas");
  const [racaSelecionada, setRacaSelecionada] = useState("Todas");
  const [idadeBusca, setIdadeBusca] = useState("");
  const [erroFavoritos, setErroFavoritos] = useState("");

  /* Carrega os favoritos salvos pelo usuário assim que a página é aberta. */
  useEffect(() => {
    async function carregarFavoritosReais() {
      try {
        const resposta = await listarFavoritos();
        if (Array.isArray(resposta)) {
          setFavoritos(resposta.map(adaptarFavoritoApi));
          return;
        }
      } catch (erro) {
        setErroFavoritos(erro.message || "Não foi possível carregar seus favoritos.");
        setFavoritos([]);
      }
    }

    carregarFavoritosReais();
  }, []);

  /* Cria as opções de espécie com base nos favoritos existentes. */
  const especies = useMemo(() => {
    const lista = favoritos.map((pet) => pet.especie);
    return ["Todas", ...new Set(lista)];
  }, [favoritos]);

  /* Gera as opções de raça somente com base nos favoritos existentes. */
  const racas = useMemo(() => {
    const lista = favoritos.map((pet) => pet.raca);
    return ["Todas", ...new Set(lista)];
  }, [favoritos]);

  /* Aplica simultaneamente tag, espécie e texto digitado. */
  const favoritosFiltrados = useMemo(() => {
    const termoNormalizado = termoBusca.trim().toLowerCase();

    return favoritos.filter((pet) => {
      const correspondeTag =
        tagSelecionada === "Todos" || pet.tag === tagSelecionada;
      const correspondeEspecie =
        especieSelecionada === "Todas" || pet.especie === especieSelecionada;
      const correspondeRaca =
        racaSelecionada === "Todas" || pet.raca === racaSelecionada;
      const correspondeIdade =
        !idadeBusca.trim() ||
        pet.idade.toLowerCase().includes(idadeBusca.trim().toLowerCase());
      const correspondeTexto =
        !termoNormalizado ||
        [
          pet.nome,
          pet.cidade,
          pet.descricao,
          pet.tag,
          pet.especie,
          pet.raca,
          pet.idade,
        ].some((campo) => campo.toLowerCase().includes(termoNormalizado));

      return (
        correspondeTag &&
        correspondeEspecie &&
        correspondeRaca &&
        correspondeIdade &&
        correspondeTexto
      );
    });
  }, [
    especieSelecionada,
    favoritos,
    idadeBusca,
    racaSelecionada,
    tagSelecionada,
    termoBusca,
  ]);

  /* Remove o pet da tela e sincroniza a alteração com o LocalStorage. */
  async function removerFavoritoDaLista(pet) {
    try {
      if (pet.idFavorito) {
        await removerFavorito(pet.idFavorito);
      }
    } catch (erro) {
      console.info("Favorito não removido pela API; sincronizando localmente.", erro.message);
    }

    const listaAtualizada = favoritos.filter(
      (favorito) => favorito.id !== pet.id,
    );
    setFavoritos(listaAtualizada);
  }

  /* Restaura todos os controles da busca avançada. */
  function limparFiltros() {
    setTagSelecionada("Todos");
    setTermoBusca("");
    setEspecieSelecionada("Todas");
    setRacaSelecionada("Todas");
    setIdadeBusca("");
  }

  return (
    <main className="favoritos-page">
      <section className="favoritos-hero">
        <div className="favoritos-hero-copy">
          <span className="favoritos-eyebrow">⭐ Seus salvos</span>
          <h1>Meus favoritos</h1>
          <p>
            Reveja os animais que chamaram sua atenção e acompanhe as
            publicações que você guardou.
          </p>
        </div>
        <div className="favoritos-hero-art" aria-hidden="true">
          ♥ 🐾
        </div>
      </section>

      <section
        className="favoritos-filter-panel"
        aria-label="Busca avançada nos favoritos"
      >
        <div className="favoritos-filter-heading">
          <div>
            <span className="favoritos-eyebrow">Busca avançada</span>
            <h2>Filtre seus favoritos</h2>
          </div>
          <span className="favoritos-results-count">
            {favoritosFiltrados.length} resultado(s)
          </span>
        </div>

        <div className="favoritos-filter-controls">
          <label className="favoritos-search-field">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              value={termoBusca}
              onChange={(event) => setTermoBusca(event.target.value)}
              placeholder="Busque por nome, cidade ou descrição"
            />
          </label>

          <label className="favoritos-select-field">
            <span>Espécie</span>
            <select
              value={especieSelecionada}
              onChange={(event) => setEspecieSelecionada(event.target.value)}
            >
              {especies.map((especie) => (
                <option key={especie} value={especie}>
                  {especie}
                </option>
              ))}
            </select>
          </label>

          {/* Select que filtra os favoritos pela raça registrada. */}
          <label className="favoritos-select-field">
            <span>Raça</span>
            <select
              value={racaSelecionada}
              onChange={(event) => setRacaSelecionada(event.target.value)}
            >
              {racas.map((raca) => (
                <option key={raca} value={raca}>
                  {raca}
                </option>
              ))}
            </select>
          </label>

          {/* Campo que filtra a idade por texto, aceitando anos ou meses. */}
          <label className="favoritos-select-field favoritos-age-field">
            <span>Idade</span>
            <input
              type="search"
              value={idadeBusca}
              onChange={(event) => setIdadeBusca(event.target.value)}
              placeholder="Ex.: 2 anos"
            />
          </label>

          <button
            className="favoritos-clear-button"
            type="button"
            onClick={limparFiltros}
          >
            Limpar filtros
          </button>
        </div>

        <div
          className="favoritos-tag-filters"
          aria-label="Filtrar favoritos por marcador"
        >
          {TAGS_FILTRO.map((tag) => (
            <button
              key={tag}
              className={`favoritos-filter-tag ${tagSelecionada === tag ? "selected" : ""}`}
              type="button"
              onClick={() => setTagSelecionada(tag)}
              aria-pressed={tagSelecionada === tag}
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      <section className="favoritos-feed" aria-label="Animais favoritados">
        <header className="favoritos-feed-heading">
          <div>
            <span className="favoritos-eyebrow">Sua coleção</span>
            <h2>Pets que você salvou</h2>
          </div>
          <p>Gerencie seus interesses</p>
        </header>

        {erroFavoritos ? (
          <div className="favoritos-empty-state">
            <span aria-hidden="true">⚠</span>
            <h2>{erroFavoritos}</h2>
            <p>Entre na sua conta para consultar os favoritos salvos.</p>
          </div>
        ) : favoritos.length === 0 ? (
          <div className="favoritos-empty-state">
            <span aria-hidden="true">💔</span>
            <h2>Você ainda não favoritou nenhum bichinho</h2>
            <p>
              Volte para a página inicial e encontre um novo amigo para salvar
              aqui.
            </p>
          </div>
        ) : favoritosFiltrados.length === 0 ? (
          <div className="favoritos-empty-state">
            <span aria-hidden="true">🐾</span>
            <h2>Nenhum favorito corresponde aos filtros</h2>
            <p>Tente remover algum filtro ou buscar por outro termo.</p>
            <button type="button" onClick={limparFiltros}>
              Ver todos os favoritos
            </button>
          </div>
        ) : (
          <div className="favoritos-post-grid">
            {favoritosFiltrados.map((pet) => (
              <FavoritoCard
                key={pet.id}
                pet={pet}
                onRemover={removerFavoritoDaLista}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
