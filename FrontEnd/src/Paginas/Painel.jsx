/* Hooks usados para estado local, efeitos de persistência e cálculos derivados. */
import { useEffect, useMemo, useState } from "react";
/* Hook de navegação usado para sair da área administrativa. */
import { useNavigate } from "react-router-dom";

/* Folha de estilos exclusiva do layout do painel administrativo. */
import "../assets/css/Painel.css";

/* Chave usada para persistir as páginas editadas no navegador durante a demonstração. */
const CHAVE_PAGINAS_ADMIN = "cercaTrovaPaginasAdmin";

/* Registros iniciais exibidos quando o painel ainda não possui páginas salvas. */
const PAGINAS_INICIAIS = [
  {
    id: "home",
    nome: "Home",
    rota: "/",
    titulo: "Encontre seu melhor amigo.",
    descricao: "Página principal da comunidade Cerca Trova.",
    status: "Publicada",
  },
  {
    id: "adocao",
    nome: "Adoção",
    rota: "/adocao",
    titulo: "Encontre, ajude e compartilhe histórias.",
    descricao: "Publicações de adoção, animais perdidos e encontrados.",
    status: "Publicada",
  },
  {
    id: "chat",
    nome: "Chat",
    rota: "/chat",
    titulo: "Conversas da comunidade.",
    descricao: "Área de conversas entre os usuários da plataforma.",
    status: "Publicada",
  },
];

/* Modelo vazio usado no formulário de criação de página. */
const PAGINA_VAZIA = {
  nome: "",
  rota: "",
  titulo: "",
  descricao: "",
  status: "Rascunho",
};

/* Faz a leitura segura dos registros administrativos salvos localmente. */
function carregarPaginas() {
  try {
    return (
      JSON.parse(localStorage.getItem(CHAVE_PAGINAS_ADMIN)) || PAGINAS_INICIAIS
    );
  } catch {
    return PAGINAS_INICIAIS;
  }
}

export default function Painel() {
  /* Estados responsáveis pela lista, editor e mensagens do painel. */
  /* A lista inicia com os dados persistidos ou com os registros de demonstração. */
  const [paginas, setPaginas] = useState(carregarPaginas);
  /* Guarda a página atualmente aberta no formulário de criação ou edição. */
  const [paginaEditando, setPaginaEditando] = useState(null);
  /* Exibe ao administrador o resultado da última operação realizada. */
  const [mensagem, setMensagem] = useState("");
  /* Permite retornar ao login ao encerrar a sessão administrativa. */
  const navigate = useNavigate();

  /* Mantém os registros persistidos sempre que a lista sofre alterações. */
  useEffect(() => {
    /* Sincroniza a lista atual com o armazenamento local do navegador. */
    localStorage.setItem(CHAVE_PAGINAS_ADMIN, JSON.stringify(paginas));
  }, [paginas]);

  /* Calcula o resumo de páginas publicadas para o card de indicadores. */
  /* Deriva a quantidade de páginas que estão com status Publicada. */
  const totalPublicadas = useMemo(
    () => paginas.filter((pagina) => pagina.status === "Publicada").length,
    [paginas],
  );

  /* Abre o formulário para criar um novo registro de página. */
  function iniciarCriacao() {
    setPaginaEditando({ ...PAGINA_VAZIA, modo: "criar" });
    setMensagem("");
  }

  /* Abre o registro escolhido no modo de edição. */
  function iniciarEdicao(pagina) {
    setPaginaEditando({ ...pagina, modo: "editar" });
    setMensagem("");
  }

  /* Atualiza um único campo do formulário sem perder os demais valores. */
  function atualizarCampo(campo, valor) {
    setPaginaEditando((paginaAtual) => ({
      ...paginaAtual,
      [campo]: valor,
    }));
  }

  /* Salva uma criação ou edição na lista local do painel. */
  function salvarPagina(event) {
    event.preventDefault();

    const { modo, id, ...dadosPagina } = paginaEditando;

    if (modo === "criar") {
      setPaginas((listaAtual) => [
        ...listaAtual,
        { ...dadosPagina, id: `pagina-${Date.now()}` },
      ]);
      setMensagem("Página criada com sucesso.");
    } else {
      setPaginas((listaAtual) =>
        listaAtual.map((pagina) =>
          pagina.id === id ? { ...pagina, ...dadosPagina } : pagina,
        ),
      );
      setMensagem("Página atualizada com sucesso.");
    }

    setPaginaEditando(null);
  }

  /* Remove o registro selecionado depois da confirmação do administrador. */
  function excluirPagina(id) {
    if (!window.confirm("Deseja excluir esta página?")) {
      return;
    }

    setPaginas((listaAtual) => listaAtual.filter((pagina) => pagina.id !== id));
    setMensagem("Página excluída com sucesso.");
  }

  /* Encerra a sessão administrativa e retorna para a tela de login. */
  function sair() {
    sessionStorage.removeItem("cercaTrovaAdminAutenticado");
    navigate("/login", { replace: true });
  }

  /* Estrutura visual principal: navegação lateral e conteúdo administrativo. */
  return (
    <main className="admin-page">
      {/* Barra lateral exclusiva da área administrativa. */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="admin-brand-symbol">CT</span>
          <div>
            <strong>Cerca Trova</strong>
            <small>Administração</small>
          </div>
        </div>

        {/*
          Navegação interna do painel em uma div semântica para não herdar
          os estilos globais aplicados ao elemento nav do menu público.
        */}
        <div
          className="admin-navigation"
          role="navigation"
          aria-label="Navegação administrativa"
        >
          <a className="active" href="#visao-geral">
            Visão geral
          </a>
          <a href="#paginas">Páginas e conteúdo</a>
          <a href="#configuracoes">Configurações</a>
        </div>

        {/* Botão para finalizar a sessão administrativa atual. */}
        <button className="admin-logout" type="button" onClick={sair}>
          Sair da administração
        </button>
      </aside>

      {/* Conteúdo principal com indicadores e ferramentas de gerenciamento. */}
      <section className="admin-content">
        <header className="admin-topbar" id="visao-geral">
          <div>
            <span className="admin-eyebrow">Área restrita</span>
            <h1>Painel administrativo</h1>
            <p>Gerencie páginas e informações da Cerca Trova.</p>
          </div>
          <span className="admin-badge">Acesso autorizado</span>
        </header>

        {/* Cards com indicadores gerais do conteúdo administrativo. */}
        <section
          className="admin-stats"
          aria-label="Indicadores administrativos"
        >
          <article className="admin-stat-card">
            <strong>{paginas.length}</strong>
            <span>Páginas cadastradas</span>
          </article>
          <article className="admin-stat-card destaque">
            <strong>{totalPublicadas}</strong>
            <span>Páginas publicadas</span>
          </article>
          <article className="admin-stat-card">
            <strong>Admin</strong>
            <span>Perfil conectado</span>
          </article>
        </section>

        {/* Área de listagem e gerenciamento de todas as páginas. */}
        <section className="admin-card" id="paginas">
          <div className="admin-section-heading">
            <div>
              <span className="admin-eyebrow">Conteúdo</span>
              <h2>Páginas do site</h2>
              <p>Crie, edite, atualize ou remova páginas do projeto.</p>
            </div>
            <button
              className="admin-primary-button"
              type="button"
              onClick={iniciarCriacao}
            >
              + Criar página
            </button>
          </div>

          {/* Feedback das ações realizadas no painel. */}
          {mensagem && (
            <p className="admin-feedback" role="status">
              {mensagem}
            </p>
          )}

          {/* Tabela responsiva com os registros editáveis. */}
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Página</th>
                  <th>Rota</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {paginas.map((pagina) => (
                  <tr key={pagina.id}>
                    <td>
                      <strong>{pagina.nome}</strong>
                      <small>{pagina.titulo}</small>
                    </td>
                    <td>{pagina.rota}</td>
                    <td>
                      <span
                        className={`admin-status ${pagina.status.toLowerCase()}`}
                      >
                        {pagina.status}
                      </span>
                    </td>
                    <td className="admin-actions">
                      <button
                        type="button"
                        onClick={() => iniciarEdicao(pagina)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => excluirPagina(pagina.id)}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Editor exibido somente quando o administrador cria ou edita uma página. */}
        {/* Card dedicado ao formulário ativo de criação ou edição. */}
        {paginaEditando && (
          <section className="admin-card admin-editor" id="configuracoes">
            <div className="admin-section-heading">
              <div>
                <span className="admin-eyebrow">Editor</span>
                <h2>
                  {paginaEditando.modo === "criar"
                    ? "Criar página"
                    : "Editar página"}
                </h2>
              </div>
              <button
                className="admin-close-button"
                type="button"
                onClick={() => setPaginaEditando(null)}
              >
                Fechar
              </button>
            </div>

            {/* Formulário dos dados que podem ser atualizados pelo administrador. */}
            <form className="admin-form" onSubmit={salvarPagina}>
              {/* Campo que identifica o nome amigável exibido no painel. */}
              <label>
                <span>Nome da página</span>
                <input
                  value={paginaEditando.nome}
                  onChange={(event) =>
                    atualizarCampo("nome", event.target.value)
                  }
                  required
                />
              </label>

              {/* Campo que informa o caminho usado pela página no roteamento. */}
              <label>
                <span>Rota</span>
                <input
                  value={paginaEditando.rota}
                  onChange={(event) =>
                    atualizarCampo("rota", event.target.value)
                  }
                  placeholder="/minha-pagina"
                  required
                />
              </label>

              {/* Campo amplo para o título principal do conteúdo. */}
              <label className="campo-amplo">
                <span>Título</span>
                <input
                  value={paginaEditando.titulo}
                  onChange={(event) =>
                    atualizarCampo("titulo", event.target.value)
                  }
                  required
                />
              </label>

              {/* Campo amplo para a descrição administrativa da página. */}
              <label className="campo-amplo">
                <span>Descrição</span>
                <textarea
                  value={paginaEditando.descricao}
                  onChange={(event) =>
                    atualizarCampo("descricao", event.target.value)
                  }
                  rows="4"
                  required
                />
              </label>

              {/* Seletor que controla a situação editorial da página. */}
              <label>
                <span>Status</span>
                <select
                  value={paginaEditando.status}
                  onChange={(event) =>
                    atualizarCampo("status", event.target.value)
                  }
                >
                  <option value="Rascunho">Rascunho</option>
                  <option value="Publicada">Publicada</option>
                  <option value="Desativada">Desativada</option>
                </select>
              </label>

              {/* Ações finais do editor de páginas. */}
              <div className="admin-form-actions">
                <button
                  className="admin-secondary-button"
                  type="button"
                  onClick={() => setPaginaEditando(null)}
                >
                  Cancelar
                </button>
                <button className="admin-primary-button" type="submit">
                  Salvar alterações
                </button>
              </div>
            </form>
          </section>
        )}
      </section>
    </main>
  );
}
