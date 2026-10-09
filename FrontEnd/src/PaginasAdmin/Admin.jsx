
/*
==========================================================
 CERCA TROVA - PAINEL ADMINISTRATIVO
 Arquivo: src/PaginasAdmin/Admin.jsx

 FUNCIONALIDADES:
 - Menu lateral administrativo
 - Visão geral com indicadores
 - Decoração de animais
 - Tabelas de gerenciamento
 - Pesquisa por ID, nome e outros campos
 - Logout

 OBSERVAÇÕES:
 - Nenhum registro fictício
 - Dados aguardando integração com backend
 - Controle visual de acesso por sessionStorage
==========================================================
*/

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/Admin.css";

/* ======================================================
   1. DADOS INICIAIS

   Todos os registros começam vazios.
   Posteriormente serão carregados do banco de dados.
====================================================== */

const DADOS_INICIAIS = {
  usuarios: [],
  pets: [],
  adocoes: [],
  achados: [],
  tinder: [],
  publicacoes: [],
  chat: [],
  publicidade: [],
};

/* ======================================================
   2. CONFIGURAÇÃO DO MENU LATERAL

   Cada item contém:
   - ID da seção
   - Nome visível
   - Ícone

   Menus removidos:
   Matches IA, Denúncias, Relatórios,
   Configurações e Pontos/Honrarias.
====================================================== */

const secoes = [
  ["visao", "Visão geral", "▦"],
  ["usuarios", "Usuários", "👥"],
  ["pets", "Pets", "🐾"],
  ["adocoes", "Adoções / Doações", "🏠"],
  ["achados", "Achados / Perdidos", "📍"],
  ["tinder", "Tinder Pet", "💜"],
  ["publicacoes", "Publicações", "📰"],
  ["chat", "Chat / Suporte", "💬"],
  ["publicidade", "Publicidade", "📢"],
  ["pesquisas", "Pesquisas", "🔎"],
];

/* ======================================================
   3. CONFIGURAÇÃO DAS TABELAS

   Cada categoria possui suas colunas específicas.
   A estrutura permite adicionar novos campos
   futuramente sem reconstruir o painel.
====================================================== */

const configuracao = {
  // USUÁRIOS
  usuarios: {
    titulo: "Usuários",
    descricao: "Gerenciamento de usuários cadastrados.",
    colunas: [
      ["id", "ID"],
      ["nome", "Nome"],
      ["email", "E-mail"],
      ["tipo", "Tipo"],
      ["status", "Status"],
    ],
  },

  // PETS
  pets: {
    titulo: "Pets",
    descricao: "Controle dos animais cadastrados.",
    colunas: [
      ["id", "ID"],
      ["nome", "Pet"],
      ["especie", "Espécie"],
      ["tipo", "Tipo"],
      ["tutor", "Tutor"],
      ["status", "Status"],
    ],
  },

  // ADOÇÕES E DOAÇÕES
  adocoes: {
    titulo: "Adoções e doações",
    descricao: "Acompanhamento dos processos de adoção.",
    colunas: [
      ["id", "ID"],
      ["pet", "Pet"],
      ["responsavel", "Responsável"],
      ["interessados", "Interessados"],
      ["status", "Status"],
    ],
  },

  // ACHADOS E PERDIDOS
  achados: {
    titulo: "Achados e perdidos",
    descricao: "Ocorrências de animais encontrados e perdidos.",
    colunas: [
      ["id", "ID"],
      ["pet", "Pet"],
      ["tipo", "Tipo"],
      ["local", "Local"],
      ["confirmacoes", "Confirmações"],
      ["status", "Status"],
    ],
  },

  // TINDER PET
  tinder: {
    titulo: "Tinder Pet",
    descricao: "Perfis e matches dos animais.",
    colunas: [
      ["id", "ID"],
      ["pet", "Pet"],
      ["tutor", "Tutor"],
      ["curtidas", "Curtidas"],
      ["matches", "Matches"],
      ["status", "Status"],
    ],
  },

  // PUBLICAÇÕES
  publicacoes: {
    titulo: "Publicações",
    descricao: "Gerenciamento das publicações.",
    colunas: [
      ["id", "ID"],
      ["titulo", "Título"],
      ["tipo", "Tipo"],
      ["autor", "Autor"],
      ["status", "Status"],
    ],
  },

  // CHAT E SUPORTE
  chat: {
    titulo: "Chat e suporte",
    descricao: "Solicitações de suporte da plataforma.",
    colunas: [
      ["id", "ID"],
      ["usuario", "Usuário"],
      ["motivo", "Motivo"],
      ["status", "Status"],
    ],
  },

  // PUBLICIDADE
  publicidade: {
    titulo: "Publicidade",
    descricao: "Banners e parceiros cadastrados.",
    colunas: [
      ["id", "ID"],
      ["empresa", "Empresa"],
      ["local", "Local"],
      ["status", "Status"],
    ],
  },
};

/* ======================================================
   4. NORMALIZAÇÃO DE TEXTO

   Permite pesquisar ignorando:
   - Letras maiúsculas/minúsculas
   - Acentos
====================================================== */

function normalizar(valor) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/* ======================================================
   5. FILTRO DE REGISTROS

   Pesquisa em todas as propriedades ou apenas
   no campo especificado.
====================================================== */

function filtrarRegistros(lista, termo, campo = "todos") {
  const busca = normalizar(String(termo ?? "").trim());

  if (!busca) return lista;

  return lista.filter((item) => {
    if (campo === "todos") {
      return Object.values(item).some((valor) =>
        normalizar(valor).includes(busca)
      );
    }

    return normalizar(item[campo]).includes(busca);
  });
}

/* ======================================================
   6. COMPONENTE DE CARD

   Usado para organizar conteúdos administrativos.
====================================================== */

function Card({ titulo, descricao, children }) {
  return (
    <section className="ct-admin-card">
      <div className="ct-admin-card-header">
        <div>
          <h2>{titulo}</h2>
          <p>{descricao}</p>
        </div>
      </div>

      {children}
    </section>
  );
}

/* ======================================================
   7. COMPONENTE DE INDICADORES

   Exibe o nome, a quantidade e a descrição.
====================================================== */

function StatCard({ titulo, valor, descricao }) {
  return (
    <article className="ct-admin-stat">
      <span>{titulo}</span>
      <strong>{valor}</strong>
      <small>{descricao}</small>
    </article>
  );
}

/* ======================================================
   8. COMPONENTE DE TABELAS

   Renderiza dinamicamente as colunas.

   Caso a lista esteja vazia, mostra uma mensagem
   indicando a ausência de registros.
====================================================== */

function Tabela({ registros, colunas }) {
  return (
    <div className="ct-admin-table-wrap">
      <table className="ct-admin-table">
        <thead>
          <tr>
            {colunas.map(([chave, titulo]) => (
              <th key={chave}>{titulo}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {registros.length === 0 ? (
            <tr>
              <td
                colSpan={colunas.length}
                className="ct-admin-empty-cell"
              >
                Nenhum registro encontrado.
              </td>
            </tr>
          ) : (
            registros.map((registro, indice) => (
              <tr key={registro.id ?? indice}>
                {colunas.map(([chave]) => (
                  <td key={chave}>
                    {registro[chave] ?? "—"}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ======================================================
   9. DECORAÇÃO DA VISÃO GERAL

   Esta área substitui:
   - Ações rápidas
   - Situação do sistema

   Possui patinhas decorativas e uma mensagem
   relacionada à proteção dos animais.
====================================================== */

function AreaDecorativaPets() {
  return (
    <section className="ct-admin-pet-area">
      {/* Patinhas decorativas */}
      <div
        className="ct-admin-pet-decoration"
        aria-hidden="true"
      >
        <span className="ct-paw paw-1">🐾</span>
        <span className="ct-paw paw-2">🐾</span>
        <span className="ct-paw paw-3">🐾</span>
        <span className="ct-paw paw-4">🐾</span>
        <span className="ct-paw paw-5">🐾</span>
      </div>

      {/* Conteúdo principal */}
      <div className="ct-admin-pet-content">
        <div
          className="ct-admin-pet-icon"
          aria-hidden="true"
        >
          🐶 🐱
        </div>

        <h2>Cada patinha conta uma história.</h2>

        <p>
          Cada animal merece cuidado, proteção e
          uma oportunidade de encontrar seu lar.
          O Cerca Trova aproxima pessoas e
          transforma reencontros em novas histórias.
        </p>

        {/* Etiquetas decorativas */}
        <div className="ct-admin-pet-tags">
          <span>🐾 Proteção</span>
          <span>❤️ Adoção</span>
          <span>🏡 Reencontros</span>
        </div>
      </div>
    </section>
  );
}

/* ======================================================
   10. COMPONENTE PRINCIPAL DO ADMIN
====================================================== */

export default function Admin() {
  /* --------------------------------------------------
     NAVEGAÇÃO
  -------------------------------------------------- */

  const navigate = useNavigate();

  /* --------------------------------------------------
     ESTADOS DO PAINEL
  -------------------------------------------------- */

  // Verificação visual de sessão.
  const [autorizado, setAutorizado] = useState(false);

  // Seção selecionada no menu lateral.
  const [secaoAtiva, setSecaoAtiva] = useState("visao");

  // Pesquisa simples no cabeçalho.
  const [busca, setBusca] = useState("");

  // Listas administrativas vazias.
  // Futuramente serão substituídas por dados da API.
  const dados = DADOS_INICIAIS;

  /* --------------------------------------------------
     ESTADOS DA PESQUISA AVANÇADA
  -------------------------------------------------- */

  // Categoria selecionada.
  const [categoriaPesquisa, setCategoriaPesquisa] =
    useState("todos");

  // Campo da pesquisa.
  const [campoPesquisa, setCampoPesquisa] =
    useState("todos");

  // Texto pesquisado.
  const [termoPesquisa, setTermoPesquisa] =
    useState("");

  /* ==================================================
     11. VERIFICAÇÃO DE SESSÃO

     Mantém a lógica atual do projeto.

     ATENÇÃO:
     sessionStorage não é uma verificação segura
     de privilégios administrativos.
     O backend deve validar cada operação protegida.
  ================================================== */

  useEffect(() => {
    const autenticado =
      sessionStorage.getItem(
        "cercaTrovaAdminAutenticado"
      ) === "true";

    if (!autenticado) {
      navigate("/login", { replace: true });
      return;
    }

    setAutorizado(true);
  }, [navigate]);

  /* ==================================================
     12. RESUMO DA VISÃO GERAL

     Calcula os indicadores com base nos registros.
  ================================================== */

  const resumo = useMemo(() => {
    return {
      usuarios: dados.usuarios.length,
      pets: dados.pets.length,
      adocoes: dados.adocoes.length,

      perdidos: dados.achados.filter(
        (item) =>
          item.tipo === "Perdido" &&
          item.status === "Ativo"
      ).length,

      publicacoes: dados.publicacoes.length,
      mensagens: dados.chat.length,
    };
  }, [dados]);

  /* ==================================================
     13. PESQUISA AVANÇADA

     Pesquisa uma categoria específica ou todas.
  ================================================== */

  const resultadosPesquisa = useMemo(() => {
    const categorias =
      categoriaPesquisa === "todos"
        ? Object.keys(configuracao)
        : [categoriaPesquisa];

    const resultados = [];

    categorias.forEach((categoria) => {
      const lista = dados[categoria] || [];

      const filtrados = filtrarRegistros(
        lista,
        termoPesquisa,
        campoPesquisa
      );

      filtrados.forEach((item) => {
        resultados.push({
          ...item,
          categoria,
          origem: configuracao[categoria].titulo,
        });
      });
    });

    return resultados;
  }, [
    dados,
    categoriaPesquisa,
    campoPesquisa,
    termoPesquisa,
  ]);

  /* ==================================================
     14. NAVEGAÇÃO ENTRE SEÇÕES
  ================================================== */

  function mudarSecao(id) {
    setSecaoAtiva(id);
    setBusca("");
  }

  /* ==================================================
     15. LOGOUT ADMINISTRATIVO
  ================================================== */

  function sairAdmin() {
    sessionStorage.removeItem(
      "cercaTrovaAdminAutenticado"
    );

    navigate("/login", { replace: true });
  }

  /* ==================================================
     16. VERIFICAÇÃO ANTES DA RENDERIZAÇÃO
  ================================================== */

  if (!autorizado) return null;

  // Configuração da seção selecionada.
  const configAtual = configuracao[secaoAtiva];

  /* ==================================================
     17. INTERFACE PRINCIPAL
  ================================================== */

  return (
    <div className="ct-admin">
      {/* ==============================================
          MENU LATERAL
      ============================================== */}

      <aside className="ct-admin-sidebar">
        {/* Logo administrativo */}
        <div className="ct-admin-brand">
          <div className="ct-admin-brand-mark">
            🐾
          </div>

          <div>
            <strong>Cerca Trova</strong>
            <span>Administração</span>
          </div>
        </div>

        {/* Botões do menu */}
        <nav className="ct-admin-nav">
          {secoes.map(([id, nome, icone]) => (
            <button
              key={id}
              type="button"
              className={
                secaoAtiva === id ? "active" : ""
              }
              onClick={() => mudarSecao(id)}
            >
              <span className="ct-admin-nav-icon">
                {icone}
              </span>

              <span>{nome}</span>
            </button>
          ))}
        </nav>

        {/* Botão de saída */}
        <button
          type="button"
          className="ct-admin-logout"
          onClick={sairAdmin}
        >
          Sair do Admin
        </button>
      </aside>

      {/* ==============================================
          CONTEÚDO PRINCIPAL
      ============================================== */}

      <main className="ct-admin-main">
        {/* CABEÇALHO */}
        <header className="ct-admin-header">
          <div>
            <span className="ct-admin-eyebrow">
              PAINEL ADMINISTRATIVO
            </span>

            <h1>
              {secoes.find(
                ([id]) => id === secaoAtiva
              )?.[1]}
            </h1>

            <p>Controle central do Cerca Trova.</p>
          </div>

          <div className="ct-admin-header-actions">
            {/* Pesquisa simples da seção */}
            {configAtual && (
              <input
                type="search"
                placeholder="Pesquisar nesta seção..."
                value={busca}
                onChange={(event) =>
                  setBusca(event.target.value)
                }
              />
            )}

            {/* Avatar administrativo */}
            <div className="ct-admin-avatar">
              ADM
            </div>
          </div>
        </header>

        {/* ==========================================
            VISÃO GERAL
        ========================================== */}

        {secaoAtiva === "visao" && (
          <>
            {/* INDICADORES */}
            <section className="ct-admin-stats">
              <StatCard
                titulo="Usuários"
                valor={resumo.usuarios}
                descricao="Contas cadastradas"
              />

              <StatCard
                titulo="Pets"
                valor={resumo.pets}
                descricao="Animais cadastrados"
              />

              <StatCard
                titulo="Perdidos ativos"
                valor={resumo.perdidos}
                descricao="Buscas em andamento"
              />

              <StatCard
                titulo="Adoções"
                valor={resumo.adocoes}
                descricao="Processos cadastrados"
              />

              <StatCard
                titulo="Publicações"
                valor={resumo.publicacoes}
                descricao="Posts cadastrados"
              />

              <StatCard
                titulo="Chat / Suporte"
                valor={resumo.mensagens}
                descricao="Solicitações cadastradas"
              />
            </section>

            {/* ÁREA DECORATIVA DOS ANIMAIS */}
            <AreaDecorativaPets />
          </>
        )}

        {/* ==========================================
            TABELAS DAS SEÇÕES ADMINISTRATIVAS

            Exibe a tabela correspondente à seção.
        ========================================== */}

        {configAtual && (
          <Card
            titulo={configAtual.titulo}
            descricao={configAtual.descricao}
          >
            <Tabela
              colunas={configAtual.colunas}
              registros={filtrarRegistros(
                dados[secaoAtiva] || [],
                busca
              )}
            />
          </Card>
        )}

        {/* ==========================================
            PESQUISA AVANÇADA

            Filtros:
            - Categoria
            - Campo
            - Termo pesquisado
        ========================================== */}

        {secaoAtiva === "pesquisas" && (
          <Card
            titulo="Pesquisa de cadastros"
            descricao="Localize registros por ID, nome ou outros campos."
          >
            {/* CAMPOS DE FILTRO */}
            <div className="ct-admin-search-filters">
              {/* Categoria */}
              <label>
                Categoria

                <select
                  value={categoriaPesquisa}
                  onChange={(event) =>
                    setCategoriaPesquisa(
                      event.target.value
                    )
                  }
                >
                  <option value="todos">
                    Todas
                  </option>

                  {Object.entries(configuracao).map(
                    ([id, config]) => (
                      <option key={id} value={id}>
                        {config.titulo}
                      </option>
                    )
                  )}
                </select>
              </label>

              {/* Campo da pesquisa */}
              <label>
                Filtrar por

                <select
                  value={campoPesquisa}
                  onChange={(event) =>
                    setCampoPesquisa(
                      event.target.value
                    )
                  }
                >
                  <option value="todos">
                    Todos os campos
                  </option>

                  <option value="id">ID</option>
                  <option value="nome">Nome</option>
                  <option value="email">E-mail</option>
                  <option value="pet">Pet</option>
                  <option value="tutor">Tutor</option>
                  <option value="autor">Autor</option>
                  <option value="status">Status</option>
                </select>
              </label>

              {/* Texto da pesquisa */}
              <label>
                Pesquisar

                <input
                  type="search"
                  value={termoPesquisa}
                  onChange={(event) =>
                    setTermoPesquisa(
                      event.target.value
                    )
                  }
                  placeholder="Digite ID ou nome..."
                />
              </label>
            </div>

            {/* QUANTIDADE DE RESULTADOS */}
            <p className="ct-admin-search-count">
              {resultadosPesquisa.length} resultado(s)
            </p>

            {/* TABELA DE RESULTADOS */}
            <div className="ct-admin-table-wrap">
              <table className="ct-admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Categoria</th>
                    <th>Nome / Título</th>
                    <th>Informação</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {resultadosPesquisa.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="ct-admin-empty-cell"
                      >
                        Nenhum registro encontrado.
                      </td>
                    </tr>
                  ) : (
                    resultadosPesquisa.map(
                      (item, indice) => (
                        <tr
                          key={`${item.categoria}-${item.id ?? indice}`}
                        >
                          {/* ID */}
                          <td>{item.id ?? "—"}</td>

                          {/* Categoria */}
                          <td>{item.origem}</td>

                          {/* Nome */}
                          <td>
                            {item.nome ??
                              item.pet ??
                              item.titulo ??
                              item.usuario ??
                              item.empresa ??
                              "—"}
                          </td>

                          {/* Informação complementar */}
                          <td>
                            {item.email ??
                              item.tutor ??
                              item.autor ??
                              item.local ??
                              item.responsavel ??
                              "—"}
                          </td>

                          {/* Status */}
                          <td>
                            {item.status ?? "—"}
                          </td>
                        </tr>
                      )
                    )
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}

/* ==========================================================
   FIM DO ARQUIVO ADMIN.JSX
========================================================== */
