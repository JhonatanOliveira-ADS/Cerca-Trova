import { useMemo, useState } from "react";
import "../assets/css/AdocaoeDoacao.css";

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

/*
  Dados iniciais das publicações.
  Em uma etapa futura, esta lista poderá ser substituída por dados vindos de uma API.
*/
const PUBLICACOES_INICIAIS = [
  {
    id: 1,
    autor: "Mariana Alves",
    local: "Bauru, SP",
    nome: "Thor",
    especie: "Cão",
    raca: "Sem raça definida",
    idade: "2 anos",
    tag: "Adoção",
    descricao:
      "Thor é carinhoso, brincalhão e procura uma família responsável para chamar de lar.",
    imagem: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=900",
  },
  {
    id: 2,
    autor: "Lucas Ferreira",
    local: "Agudos, SP",
    nome: "Luna",
    especie: "Gato",
    raca: "Sem raça definida",
    idade: "6 meses",
    tag: "Perdido",
    descricao:
      "Luna desapareceu próximo à praça central. Ela é dócil e atende pelo próprio nome.",
    imagem:
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=900",
  },
  {
    id: 3,
    autor: "Projeto Patinhas",
    local: "Jaú, SP",
    nome: "Bob",
    especie: "Cão",
    raca: "Sem raça definida",
    idade: "1 ano",
    tag: "Encontra",
    descricao:
      "Encontramos este cão amigável perto do bairro Jardim América. Ajude a localizar sua família.",
    imagem:
      "https://plus.unsplash.com/premium_photo-1666777247416-ee7a95235559?q=80&w=900&auto=format&fit=crop",
  },
  {
    id: 4,
    autor: "Ana Beatriz",
    local: "Bauru, SP",
    nome: "Mel",
    especie: "Gato",
    raca: "Siamês",
    idade: "1 ano",
    tag: "Em busca de um Cãopanheiro",
    descricao:
      "Mel é tranquila, carinhosa e procura uma companhia para dividir momentos especiais.",
    imagem:
      "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=900",
  },
  {
    id: 5,
    autor: "Casa dos Animais",
    local: "Lençóis Paulista, SP",
    nome: "Jade",
    especie: "Cão",
    raca: "Border Collie",
    idade: "3 anos",
    tag: "Adoção",
    descricao:
      "Jade convive bem com crianças e outros animais. Está pronta para uma adoção responsável.",
    imagem: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=900",
  },
  {
    id: 6,
    autor: "Rafael Santos",
    local: "Pederneiras, SP",
    nome: "Simba",
    especie: "Gato",
    raca: "Persa",
    idade: "2 anos",
    tag: "Em busca de um Cãopanheiro",
    descricao:
      "Simba procura um amigo para brincar e uma família que ofereça muito carinho.",
    imagem: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=900",
  },
];

/*
  Card individual de publicação.
  Foi separado em um componente para manter o código organizado em blocos reutilizáveis.
*/
function PostCard({ publicacao }) {
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

      <img
        className="adocao-post-image"
        src={publicacao.imagem}
        alt={`Foto de ${publicacao.nome}`}
      />

      <footer className="adocao-post-actions">
        <button type="button">❤️ Tenho interesse</button>
        <button type="button">↗ Compartilhar</button>
      </footer>
    </article>
  );
}

export default function AdocaoDoacao() {
  const [publicacoes] = useState(PUBLICACOES_INICIAIS);
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

        {publicacoesFiltradas.length > 0 ? (
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
