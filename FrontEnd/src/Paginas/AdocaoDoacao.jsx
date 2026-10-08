import { useEffect, useMemo, useState } from "react";
import PetDetalhesModal from "../Componentes/PetDetalhesModal";
import "../assets/css/AdocaoeDoacao.css";
import { API_BASE_URL, listarPublicacoes } from "../servicos/autenticacao";

/*
  Tags disponíveis no filtro.
  O valor é usado internamente para comparar com cada publicação.
*/
const TAGS_FILTRO = [
  "Todos",
  "Perdido",
  "Encontra",
  "Adoção",
  "Em busca de um Cãopanheiro",
];

/* Converte o registro persistido no banco para o modelo visual dos cards. */
function adaptarPublicacao(publicacao) {
  const nomesDosTipos = {
    ADOCAO: "Adoção",
    PERDIDO: "Perdido",
    ENCONTRADO: "Encontra",
  };
  const tag = nomesDosTipos[publicacao.tipo] || publicacao.tipo || "Adoção";

  return {
    ...publicacao,
    autor: publicacao.usuario?.nome || "Membro da comunidade",
    local: [publicacao.cidade, publicacao.estado].filter(Boolean).join(", "),
    nome: publicacao.nome_pet,
    idade: publicacao.idade_pet,
    tag,
    imagem: publicacao.foto
      ? `${API_BASE_URL}/files/${publicacao.foto}`
      : "",
  };
}

/*
  Card individual de publicação.
  Foi separado em um componente para manter o código organizado em blocos reutilizáveis.
*/
function PostCard({ publicacao }) {
  /* Controla o modal aberto pela interação com a foto da publicação. */
  const [modalAberto, setModalAberto] = useState(false);

  return (
    <article className="adocao-post-card">
      <header className="adocao-post-header">
        <div className="adocao-post-avatar" aria-hidden="true">
          🐾
        </div>
        <div className="adocao-post-author">
          <h3>{publicacao.autor}</h3>
          <p>{publicacao.local}</p>
        </div>
        <span
          className={`adocao-post-tag tag-${publicacao.tag.toLowerCase().replaceAll(" ", "-")}`}
        >
          {publicacao.tag}
        </span>
      </header>

      <div className="adocao-post-content">
        <h2>{publicacao.nome}</h2>
        <p>{publicacao.descricao}</p>
        <span className="adocao-post-details">
          {publicacao.especie} <b>•</b>{" "}
          {publicacao.raca || "Raça não informada"} <b>•</b> {publicacao.idade}
        </span>
      </div>

      {/* A imagem funciona como botão para consultar todas as informações do pet. */}
      <button
        className="adocao-post-image-button"
        type="button"
        onClick={() => setModalAberto(true)}
        aria-label={`Ver informações completas de ${publicacao.nome}`}
      >
        <img
          className="adocao-post-image"
          src={publicacao.imagem}
          alt={`Foto de ${publicacao.nome}`}
        />
      </button>

      <footer className="adocao-post-actions">
        <button type="button">❤️ Tenho interesse</button>
        <button type="button">↗ Compartilhar</button>
      </footer>
      {/* O mapa é ativado automaticamente pelo modal quando a tag é Perdido. */}
      <PetDetalhesModal
        pet={publicacao}
        aberto={modalAberto}
        aoFechar={() => setModalAberto(false)}
      />
    </article>
  );
}

export default function AdocaoDoacao() {
  const [publicacoes, setPublicacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  /* Busca somente publicações reais e mantém a página sem dados demonstrativos. */
  useEffect(() => {
    async function carregarPublicacoes() {
      try {
        const resposta = await listarPublicacoes();
        const publicacoesDeAdocao = Array.isArray(resposta)
          ? resposta.filter((publicacao) => publicacao.tipo === "ADOCAO")
          : [];
        setPublicacoes(publicacoesDeAdocao.map(adaptarPublicacao));
      } catch (erroApi) {
        setErro(erroApi.message || "Não foi possível carregar as publicações.");
      } finally {
        setCarregando(false);
      }
    }

    carregarPublicacoes();
  }, []);
  const [tagSelecionada, setTagSelecionada] = useState("Todos");
  const [termoBusca, setTermoBusca] = useState("");
  const [especieSelecionada, setEspecieSelecionada] = useState("Todas");
  const [racaSelecionada, setRacaSelecionada] = useState("Todas");
  const [idadeBusca, setIdadeBusca] = useState("");

  /*
    Opções de espécie são geradas a partir das publicações disponíveis,
    evitando repetir valores manualmente no filtro.
  */
  const especies = useMemo(() => {
    const lista = publicacoes.map((publicacao) => publicacao.especie);
    return ["Todas", ...new Set(lista)];
  }, [publicacoes]);

  /* Gera as opções de raça a partir das publicações disponíveis. */
  const racas = useMemo(() => {
    const lista = publicacoes.map(
      (publicacao) => publicacao.raca || "Raça não informada",
    );

    return ["Todas", ...new Set(lista)];
  }, [publicacoes]);

  /*
    O filtro avançado combina tag, texto e espécie.
    A publicação só aparece quando atende a todos os critérios escolhidos.
  */
  const publicacoesFiltradas = useMemo(() => {
    const termoNormalizado = termoBusca.trim().toLowerCase();

    return publicacoes.filter((publicacao) => {
      const correspondeTag =
        tagSelecionada === "Todos" || publicacao.tag === tagSelecionada;
      const correspondeEspecie =
        especieSelecionada === "Todas" ||
        publicacao.especie === especieSelecionada;
      const correspondeRaca =
        racaSelecionada === "Todas" ||
        (publicacao.raca || "Raça não informada") === racaSelecionada;
      const correspondeIdade =
        !idadeBusca.trim() ||
        publicacao.idade
          .toLowerCase()
          .includes(idadeBusca.trim().toLowerCase());
      const correspondeTexto =
        !termoNormalizado ||
        [
          publicacao.nome,
          publicacao.autor,
          publicacao.local,
          publicacao.descricao,
          publicacao.tag,
          publicacao.raca || "Raça não informada",
          publicacao.idade,
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
    idadeBusca,
    publicacoes,
    racaSelecionada,
    tagSelecionada,
    termoBusca,
  ]);

  /* Limpa todos os controles e retorna à visualização completa. */
  function limparFiltros() {
    setTagSelecionada("Todos");
    setTermoBusca("");
    setEspecieSelecionada("Todas");
    setRacaSelecionada("Todas");
    setIdadeBusca("");
  }

  return (
    <main className="adocao-page">
      <section className="adocao-hero">
        <div className="adocao-hero-copy">
          <span className="adocao-eyebrow">🐾 Comunidade Cerca Trova</span>
          <h1>Encontre, ajude e compartilhe histórias.</h1>
          <p>
            Use os filtros para encontrar rapidamente uma publicação de adoção,
            animal perdido ou encontro.
          </p>
        </div>
        <div className="adocao-hero-art" aria-hidden="true">
          🐶<span>♥</span>🐱
        </div>
      </section>

      <section
        className="adocao-filter-panel"
        aria-label="Busca avançada de publicações"
      >
        <div className="adocao-filter-heading">
          <div>
            <span className="adocao-eyebrow">Busca avançada</span>
            <h2>Encontre uma publicação</h2>
          </div>
          <span className="adocao-results-count">
            {publicacoesFiltradas.length} resultado(s)
          </span>
        </div>

        <div className="adocao-filter-controls">
          <label className="adocao-search-field">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              value={termoBusca}
              onChange={(event) => setTermoBusca(event.target.value)}
              placeholder="Busque por nome, cidade ou descrição"
            />
          </label>

          <label className="adocao-select-field">
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

          {/* Select que filtra as publicações pela raça registrada. */}
          <label className="adocao-select-field">
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
          <label className="adocao-select-field adocao-age-field">
            <span>Idade</span>
            <input
              type="search"
              value={idadeBusca}
              onChange={(event) => setIdadeBusca(event.target.value)}
              placeholder="Ex.: 2 anos"
            />
          </label>

          <button
            className="adocao-clear-button"
            type="button"
            onClick={limparFiltros}
          >
            Limpar filtros
          </button>
        </div>

        <div className="adocao-tag-filters" aria-label="Filtrar por marcador">
          {TAGS_FILTRO.map((tag) => (
            <button
              key={tag}
              className={`adocao-filter-tag ${tagSelecionada === tag ? "selected" : ""}`}
              type="button"
              onClick={() => setTagSelecionada(tag)}
              aria-pressed={tagSelecionada === tag}
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      <section className="adocao-feed" aria-label="Publicações filtradas">
        <header className="adocao-feed-heading">
          <div>
            <span className="adocao-eyebrow">Publicações da comunidade</span>
            <h2>Pets que precisam de você</h2>
          </div>
          <p>Atualizações recentes</p>
        </header>

        {carregando ? (
          <div className="adocao-empty-state">
            <span aria-hidden="true">⌛</span>
            <h2>Carregando publicações...</h2>
          </div>
        ) : erro ? (
          <div className="adocao-empty-state">
            <span aria-hidden="true">⚠</span>
            <h2>{erro}</h2>
          </div>
        ) : publicacoesFiltradas.length > 0 ? (
          <div className="adocao-post-grid">
            {publicacoesFiltradas.map((publicacao) => (
              <PostCard key={publicacao.id} publicacao={publicacao} />
            ))}
          </div>
        ) : (
          <div className="adocao-empty-state">
            <span aria-hidden="true">🐾</span>
            <h2>Nenhuma publicação encontrada</h2>
            <p>Tente remover algum filtro ou buscar por outro termo.</p>
            <button type="button" onClick={limparFiltros}>
              Ver todas as publicações
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
