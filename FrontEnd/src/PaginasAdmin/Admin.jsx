
/* ======================================================
   CERCA TROVA - PAINEL ADMINISTRATIVO

   Este painel carrega dados reais do backend.

   Funcionalidades:
   - Carregar usuários cadastrados
   - Exibir pets publicados
   - Separar adoções, perdidos e encontrados
   - Consultar Tinder Pet
   - Consultar metadados das conversas
   - Ativar/desativar publicações
   - Pesquisar registros por ID e outros campos
   - Atualizar listagens manualmente
   - Manter a decoração e o menu existentes

   Não utiliza dados fictícios.
====================================================== */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/Admin.css";

import {
  listarDadosPainelAdmin,
  atualizarStatusPublicacaoAdmin,
} from "../servicos/adminApi";

import {
  encerrarSessao,
  obterUsuarioAtual,
  obterTokenAdministrador,
} from "../servicos/autenticacao";

/* ======================================================
   1. MENU ADMINISTRATIVO
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
   2. ESTADO INICIAL

   Listas vazias são utilizadas durante o carregamento.
   Não representam números reais até a API responder.
====================================================== */

const DADOS_VAZIOS = {
  usuarios: [],
  publicacoes: [],
  petsTinder: [],
  conversas: [],
};

/* ======================================================
   3. TRADUÇÃO DAS CATEGORIAS
====================================================== */

const NOMES_TIPOS = {
  ADOCAO: "Adoção",
  PERDIDO: "Perdido",
  ENCONTRADO: "Encontrado",
  TINDER_PET: "Tinder Pet",
};

function nomeTipo(tipo) {
  return NOMES_TIPOS[tipo] || tipo || "—";
}

/* ======================================================
   4. AJUDANTES DE EXIBIÇÃO
====================================================== */

// Formata datas recebidas da API.
function formatarData(data) {
  if (!data) return "—";

  const valor = new Date(data);

  if (Number.isNaN(valor.getTime())) return "—";

  return valor.toLocaleDateString("pt-BR");
}

// Normaliza os textos para permitir busca sem acentos.
function normalizar(valor) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

// Busca por todos os campos ou por um campo específico.
function filtrarRegistros(lista, termo, campo = "todos") {
  const busca = normalizar(termo.trim());

  if (!busca) return lista;

  return lista.filter((registro) => {
    if (campo !== "todos") {
      return normalizar(registro[campo]).includes(busca);
    }

    return Object.values(registro).some((valor) =>
      normalizar(valor).includes(busca)
    );
  });
}

/* ======================================================
   5. COMPONENTE CARD
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
   6. COMPONENTE DE ESTATÍSTICAS
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
   7. TABELA REUTILIZÁVEL

   Pode incluir uma coluna de ações.
====================================================== */

function Tabela({ registros, colunas, renderAcoes }) {
  const totalColunas =
    colunas.length + (renderAcoes ? 1 : 0);

  return (
    <div className="ct-admin-table-wrap">
      <table className="ct-admin-table">
        <thead>
          <tr>
            {colunas.map(([campo, titulo]) => (
              <th key={campo}>{titulo}</th>
            ))}

            {renderAcoes && <th>Ações</th>}
          </tr>
        </thead>

        <tbody>
          {registros.length === 0 ? (
            <tr>
              <td
                colSpan={totalColunas}
                className="ct-admin-empty-cell"
              >
                Nenhum registro encontrado.
              </td>
            </tr>
          ) : (
            registros.map((registro, indice) => (
              <tr key={registro.id ?? indice}>
                {colunas.map(([campo]) => (
                  <td key={campo}>
                    {registro[campo] ?? "—"}
                  </td>
                ))}

                {renderAcoes && (
                  <td>{renderAcoes(registro)}</td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ======================================================
   8. DECORAÇÃO DA VISÃO GERAL
====================================================== */

function AreaDecorativaPets() {
  return (
    <section className="ct-admin-pet-area">
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

      <div className="ct-admin-pet-content">
        <div className="ct-admin-pet-icon">
          🐶 🐱
        </div>

        <h2>Cada patinha conta uma história.</h2>

        <p>
          Cada animal merece cuidado, proteção e uma
          oportunidade de encontrar seu lar.
          O Cerca Trova aproxima pessoas e transforma
          reencontros em novas histórias.
        </p>

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
   9. CONFIGURAÇÃO DE CADA TABELA

   Utiliza os nomes dos campos presentes no
   schema.prisma do projeto enviado.
====================================================== */

const configuracao = {
  usuarios: {
    titulo: "Usuários",
    descricao: "Contas reais cadastradas no Cerca Trova.",
    colunas: [
      ["id", "ID"],
      ["nome", "Nome"],
      ["email", "E-mail"],
      ["telefone", "Telefone"],
      ["tipo", "Tipo"],
      ["status", "Verificação"],
    ],
  },

  pets: {
    titulo: "Pets",
    descricao: "Todos os animais das publicações.",
    colunas: [
      ["id", "ID"],
      ["nome", "Pet"],
      ["especie", "Espécie"],
      ["raca", "Raça"],
      ["tutor", "Tutor"],
      ["tipo", "Tipo"],
      ["status", "Status"],
    ],
  },

  adocoes: {
    titulo: "Adoções e doações",
    descricao: "Publicações reais de adoção.",
    colunas: [
      ["id", "ID"],
      ["nome", "Pet"],
      ["especie", "Espécie"],
      ["tutor", "Responsável"],
      ["cidade", "Cidade"],
      ["status", "Status"],
    ],
  },

  achados: {
    titulo: "Achados e perdidos",
    descricao: "Ocorrências publicadas pelos usuários.",
    colunas: [
      ["id", "ID"],
      ["nome", "Pet"],
      ["tipo", "Ocorrência"],
      ["cidade", "Cidade"],
      ["tutor", "Publicado por"],
      ["status", "Status"],
    ],
  },

  tinder: {
    titulo: "Tinder Pet",
    descricao: "Animais cadastrados no Tinder Pet.",
    colunas: [
      ["id", "ID"],
      ["nome", "Pet"],
      ["especie", "Espécie"],
      ["tutor", "Tutor"],
      ["cidade", "Cidade"],
      ["status", "Status"],
    ],
  },

  publicacoes: {
    titulo: "Publicações",
    descricao: "Todas as publicações do site.",
    colunas: [
      ["id", "ID"],
      ["nome", "Pet"],
      ["tipo", "Categoria"],
      ["tutor", "Autor"],
      ["data", "Data"],
      ["status", "Status"],
    ],
  },

  chat: {
    titulo: "Chat e suporte",
    descricao:
      "Conversas registradas. O conteúdo das mensagens permanece privado.",
    colunas: [
      ["id", "ID"],
      ["nome", "Participantes"],
      ["pet", "Publicação"],
      ["mensagens", "Mensagens"],
      ["data", "Criada em"],
    ],
  },

  publicidade: {
    titulo: "Publicidade",
    descricao: "Gerenciamento de parceiros e anúncios.",
    colunas: [
      ["id", "ID"],
      ["nome", "Empresa"],
      ["status", "Status"],
    ],
  },
};

/* ======================================================
   10. COMPONENTE ADMIN
====================================================== */

export default function Admin() {
  const navigate = useNavigate();

  /* CONTROLE DAS SEÇÕES */
  const [secaoAtiva, setSecaoAtiva] = useState("visao");
  const [busca, setBusca] = useState("");

  /* DADOS CARREGADOS DO BACKEND */
  const [dados, setDados] = useState(DADOS_VAZIOS);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [salvandoId, setSalvandoId] = useState(null);

  /* PESQUISA AVANÇADA */
  const [categoriaPesquisa, setCategoriaPesquisa] =
    useState("todos");

  const [campoPesquisa, setCampoPesquisa] =
    useState("todos");

  const [termoPesquisa, setTermoPesquisa] =
    useState("");

  /* ====================================================
     11. PROTEÇÃO DO ADMIN

     O frontend faz apenas uma verificação visual.
     O backend protege /admin/dados usando JWT.
  ==================================================== */

  const usuarioAtual = obterUsuarioAtual();

  const autorizado =
    usuarioAtual?.tipo === "ADMIN" &&
    Boolean(obterTokenAdministrador());

  useEffect(() => {
    if (!autorizado) {
      navigate("/login", { replace: true });
    }
  }, [autorizado, navigate]);

  /* ====================================================
     12. CARREGAR DADOS REAIS DA API
  ==================================================== */

  const carregarDados = useCallback(async () => {
    if (!autorizado) return;

    setCarregando(true);
    setErro("");

    try {
      const resposta = await listarDadosPainelAdmin();

      setDados({
        usuarios: Array.isArray(resposta.usuarios)
          ? resposta.usuarios
          : [],

        publicacoes: Array.isArray(resposta.publicacoes)
          ? resposta.publicacoes
          : [],

        petsTinder: Array.isArray(resposta.petsTinder)
          ? resposta.petsTinder
          : [],

        conversas: Array.isArray(resposta.conversas)
          ? resposta.conversas
          : [],
      });
    } catch (erroApi) {
      setErro(
        erroApi.message ||
        "Não foi possível carregar os cadastros."
      );

      // Em caso de erro, não mostramos dados antigos.
      setDados(DADOS_VAZIOS);
    } finally {
      setCarregando(false);
    }
  }, [autorizado]);

  /* CARREGAMENTO INICIAL */
  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  /* ====================================================
     13. ADAPTAR OS DADOS DO PRISMA

     As categorias ADOCAO, PERDIDO e ENCONTRADO
     vêm da mesma tabela publicacoes.
  ==================================================== */

  const registros = useMemo(() => {
    const usuarios = dados.usuarios.map((usuario) => ({
      ...usuario,
      status: usuario.verificado
        ? "Verificado"
        : "Não verificado",
    }));

    const publicacoes = dados.publicacoes.map((post) => ({
      ...post,
      nome: post.nome_pet,
      tipo: nomeTipo(post.tipo),
      tutor: post.usuario?.nome || "—",
      data: formatarData(post.data_criacao),
      status: post.status ? "Ativa" : "Inativa",
      tipoOriginal: post.tipo,
    }));

    const tinder = dados.petsTinder.map((pet) => ({
      ...pet,
      tutor: pet.usuario?.nome || "—",
      status: pet.ativo ? "Ativo" : "Inativo",
    }));

    const chat = dados.conversas.map((conversa) => ({
      id: conversa.id,
      nome: [
        conversa.remetente?.nome,
        conversa.destinatario?.nome,
      ]
        .filter(Boolean)
        .join(" / "),
      pet: conversa.publicacao?.nome_pet || "—",
      mensagens: conversa._count?.mensagens ?? 0,
      data: formatarData(conversa.data_criacao),
    }));

    return {
      usuarios,

      // Todas as publicações com animais.
      pets: publicacoes,

      // Adoções são publicações do tipo ADOCAO.
      adocoes: publicacoes.filter(
        (post) => post.tipoOriginal === "ADOCAO"
      ),

      // Ocorrências perdidas ou encontradas.
      achados: publicacoes.filter(
        (post) =>
          post.tipoOriginal === "PERDIDO" ||
          post.tipoOriginal === "ENCONTRADO"
      ),

      tinder,
      publicacoes,
      chat,

      // Não existe tabela Publicidade neste schema.
      publicidade: [],
    };
  }, [dados]);

  /* ====================================================
     14. INDICADORES DO DASHBOARD

     Os números refletem os registros carregados.
  ==================================================== */

  const resumo = useMemo(() => {
    return {
      usuarios: registros.usuarios.length,

      pets:
        registros.pets.length + registros.tinder.length,

      perdidos: registros.achados.filter(
        (post) =>
          post.tipoOriginal === "PERDIDO" &&
          post.status === "Ativa"
      ).length,

      adocoes: registros.adocoes.length,
      publicacoes: registros.publicacoes.length,
      mensagens: registros.chat.length,
    };
  }, [registros]);

  /* ====================================================
     15. PESQUISA EM TODAS AS CATEGORIAS
  ==================================================== */

  const resultadosPesquisa = useMemo(() => {
    const categorias =
      categoriaPesquisa === "todos"
        ? Object.keys(configuracao)
        : [categoriaPesquisa];

    return categorias.flatMap((categoria) => {
      const lista = registros[categoria] || [];

      return filtrarRegistros(
        lista,
        termoPesquisa,
        campoPesquisa
      ).map((item) => ({
        ...item,
        categoria,
        origem: configuracao[categoria].titulo,
      }));
    });
  }, [
    registros,
    categoriaPesquisa,
    campoPesquisa,
    termoPesquisa,
  ]);

  /* ====================================================
     16. TROCAR SEÇÃO DO MENU
  ==================================================== */

  function mudarSecao(id) {
    setSecaoAtiva(id);
    setBusca("");
    setMensagem("");
  }

  /* ====================================================
     17. LOGOUT ADMINISTRATIVO
  ==================================================== */

  function sairAdmin() {
    encerrarSessao();
    navigate("/login", { replace: true });
  }

  /* ====================================================
     18. ATIVAR OU DESATIVAR PUBLICAÇÃO

     Usa a rota PATCH que já existe no backend.
     Não exclui registros permanentemente.
  ==================================================== */

  async function alterarStatusPublicacao(post) {
    const novoStatus = !post.statusOriginal;

    try {
      setSalvandoId(post.id);
      setErro("");

      await atualizarStatusPublicacaoAdmin(
        post.id,
        novoStatus
      );

      // Atualiza os dados com a versão do banco.
      await carregarDados();

      setMensagem(
        novoStatus
          ? "Publicação ativada com sucesso."
          : "Publicação desativada com sucesso."
      );
    } catch (erroApi) {
      setErro(
        erroApi.message ||
        "Não foi possível atualizar a publicação."
      );
    } finally {
      setSalvandoId(null);
    }
  }

  /* ====================================================
     19. CONFIGURAÇÃO DA SEÇÃO SELECIONADA
  ==================================================== */

  if (!autorizado) return null;

  const configAtual = configuracao[secaoAtiva];

  /* Inclui o status booleano original para a ação. */
  const registrosSecao = (registros[secaoAtiva] || [])
    .map((registro) => ({
      ...registro,
      statusOriginal:
        dados.publicacoes.find(
          (post) => post.id === registro.id
        )?.status,
    }));

  /* ====================================================
     20. INTERFACE
  ==================================================== */

  return (
    <div className="ct-admin">
      {/* ==============================================
          MENU LATERAL
      ============================================== */}

      <aside className="ct-admin-sidebar">
        <div className="ct-admin-brand">
          <div className="ct-admin-brand-mark">
            🐾
          </div>

          <div>
            <strong>Cerca Trova</strong>
            <span>Administração</span>
          </div>
        </div>

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

        <button
          type="button"
          className="ct-admin-logout"
          onClick={sairAdmin}
        >
          Sair do Admin
        </button>
      </aside>

      {/* ==============================================
          CONTEÚDO DO PAINEL
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
            {/* Busca na seção ativa */}
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

            {/* Recarrega as informações do banco */}
            <button
              type="button"
              onClick={carregarDados}
              disabled={carregando}
              style={{
                padding: "11px 14px",
                border: "1px solid #dbe4ea",
                borderRadius: "10px",
                cursor: "pointer",
                background: "#fff",
                color: "#0d2b3e",
              }}
            >
              {carregando ? "Carregando..." : "Atualizar"}
            </button>

            <div className="ct-admin-avatar">
              ADM
            </div>
          </div>
        </header>

        {/* AVISOS DE ERRO E SUCESSO */}
        {erro && (
          <p
            role="alert"
            style={{
              color: "#9c2637",
              background: "#ffe9ed",
              padding: "12px",
              borderRadius: "10px",
            }}
          >
            {erro}
          </p>
        )}

        {mensagem && (
          <p role="status" className="ct-admin-search-count">
            {mensagem}
          </p>
        )}

        {/* ==========================================
            VISÃO GERAL
        ========================================== */}

        {secaoAtiva === "visao" && (
          <>
            <section className="ct-admin-stats">
              <StatCard
                titulo="Usuários"
                valor={carregando ? "..." : resumo.usuarios}
                descricao="Contas cadastradas"
              />

              <StatCard
                titulo="Pets"
                valor={carregando ? "..." : resumo.pets}
                descricao="Animais publicados"
              />

              <StatCard
                titulo="Perdidos ativos"
                valor={carregando ? "..." : resumo.perdidos}
                descricao="Buscas em andamento"
              />

              <StatCard
                titulo="Adoções"
                valor={carregando ? "..." : resumo.adocoes}
                descricao="Publicações de adoção"
              />

              <StatCard
                titulo="Publicações"
                valor={
                  carregando ? "..." : resumo.publicacoes
                }
                descricao="Posts no sistema"
              />

              <StatCard
                titulo="Conversas"
                valor={carregando ? "..." : resumo.mensagens}
                descricao="Conversas iniciadas"
              />
            </section>

            <AreaDecorativaPets />
          </>
        )}

        {/* ==========================================
            CADASTROS POR CATEGORIA
        ========================================== */}

        {configAtual && (
          <Card
            titulo={configAtual.titulo}
            descricao={configAtual.descricao}
          >
            {carregando ? (
              <p className="ct-admin-search-count">
                Carregando cadastros do banco...
              </p>
            ) : (
              <Tabela
                colunas={configAtual.colunas}
                registros={filtrarRegistros(
                  registrosSecao,
                  busca
                )}
                renderAcoes={
                  ["publicacoes", "pets", "adocoes", "achados"]
                    .includes(secaoAtiva)
                    ? (post) => (
                        <button
                          type="button"
                          disabled={salvandoId === post.id}
                          onClick={() =>
                            alterarStatusPublicacao(post)
                          }
                          style={{
                            padding: "8px 12px",
                            border: "none",
                            borderRadius: "8px",
                            background: post.statusOriginal
                              ? "#c95757"
                              : "#2f8f67",
                            color: "white",
                            cursor: "pointer",
                          }}
                        >
                          {salvandoId === post.id
                            ? "Salvando..."
                            : post.statusOriginal
                              ? "Desativar"
                              : "Ativar"}
                        </button>
                      )
                    : undefined
                }
              />
            )}
          </Card>
        )}

        {/* ==========================================
            PESQUISA AVANÇADA
        ========================================== */}

        {secaoAtiva === "pesquisas" && (
          <Card
            titulo="Pesquisa de cadastros"
            descricao="Pesquise registros reais por ID, nome ou outros campos."
          >
            <div className="ct-admin-search-filters">
              {/* Categoria */}
              <label>
                Categoria
                <select
                  value={categoriaPesquisa}
                  onChange={(event) =>
                    setCategoriaPesquisa(event.target.value)
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

              {/* Campo */}
              <label>
                Filtrar por
                <select
                  value={campoPesquisa}
                  onChange={(event) =>
                    setCampoPesquisa(event.target.value)
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
                  <option value="tipo">Tipo</option>
                  <option value="status">Status</option>
                </select>
              </label>

              {/* Termo */}
              <label>
                Pesquisar
                <input
                  type="search"
                  value={termoPesquisa}
                  onChange={(event) =>
                    setTermoPesquisa(event.target.value)
                  }
                  placeholder="Digite nome ou ID..."
                />
              </label>
            </div>

            <p className="ct-admin-search-count">
              {resultadosPesquisa.length} resultado(s)
            </p>

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
                    resultadosPesquisa.map((item, indice) => (
                      <tr
                        key={`${item.categoria}-${item.id ?? indice}`}
                      >
                        <td>{item.id}</td>
                        <td>{item.origem}</td>
                        <td>
                          {item.nome ?? item.pet ?? "—"}
                        </td>
                        <td>
                          {item.email ??
                            item.tutor ??
                            item.cidade ??
                            "—"}
                        </td>
                        <td>{item.status ?? "—"}</td>
                      </tr>
                    ))
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

/* ======================================================
   FIM DO ADMIN.JSX
====================================================== */
