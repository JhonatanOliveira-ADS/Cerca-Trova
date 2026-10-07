/* Configuração da API e leitura do token usado nas requisições protegidas. */
import { API_BASE_URL, obterTokenAdministrador } from "./autenticacao";

/* Chave de fallback usada apenas enquanto a API ainda não estiver configurada. */
/* Nome da chave usada para manter o fallback local entre sessões do navegador. */
const CHAVE_PAGINAS_ADMIN = "cercaTrovaPaginasAdmin";

/* Conteúdo inicial editável para a demonstração do painel. */
/* Registros exibidos quando o backend não está configurado e não há dados locais. */
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
    titulo: "Conversas da comunidade",
    descricao: "Área de conversas entre usuários da plataforma.",
    status: "Publicada",
  },
];

/* Lê o fallback local sem interromper o painel quando o armazenamento estiver vazio. */
function lerPaginasLocais() {
  try {
    return (
      JSON.parse(localStorage.getItem(CHAVE_PAGINAS_ADMIN)) || PAGINAS_INICIAIS
    );
  } catch {
    return PAGINAS_INICIAIS;
  }
}

/* Salva alterações localmente enquanto a API não estiver disponível. */
function salvarPaginasLocais(paginas) {
  localStorage.setItem(CHAVE_PAGINAS_ADMIN, JSON.stringify(paginas));
  return paginas;
}

/* Faz uma requisição autenticada para endpoints administrativos. */
/* Centraliza método, cabeçalhos, autenticação e tratamento da resposta HTTP. */
async function requisicaoAdmin(endpoint, opcoes = {}) {
  /* Recupera a credencial atual antes de acessar qualquer endpoint administrativo. */
  const token = obterTokenAdministrador();
  /* Envia a requisição com JSON e autorização Bearer. */
  const resposta = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...opcoes,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(opcoes.headers || {}),
    },
  });

  /* Tenta interpretar a resposta mesmo quando o servidor não retorna JSON válido. */
  const dados = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    throw new Error(dados.message || "Erro na operação administrativa.");
  }

  return dados;
}

/* Lista as páginas da API ou retorna os registros locais da demonstração. */
/* Obtém a lista pelo backend ou usa o fallback local de demonstração. */
export async function listarPaginasAdmin() {
  if (import.meta.env.VITE_API_URL) {
    return requisicaoAdmin("/admin/pages");
  }

  return lerPaginasLocais();
}

/* Cria uma página nova usando POST quando o backend estiver configurado. */
/* Cria uma página e escolhe automaticamente entre API e localStorage. */
export async function criarPaginaAdmin(pagina) {
  if (import.meta.env.VITE_API_URL) {
    return requisicaoAdmin("/admin/pages", {
      method: "POST",
      body: JSON.stringify(pagina),
    });
  }

  const paginas = lerPaginasLocais();
  return salvarPaginasLocais([
    ...paginas,
    { ...pagina, id: `pagina-${Date.now()}`, status: "Rascunho" },
  ]);
}

/* Atualiza uma página existente usando PUT quando o backend estiver configurado. */
/* Atualiza os campos de uma página já existente. */
export async function atualizarPaginaAdmin(id, pagina) {
  if (import.meta.env.VITE_API_URL) {
    return requisicaoAdmin(`/admin/pages/${id}`, {
      method: "PUT",
      body: JSON.stringify(pagina),
    });
  }

  const paginas = lerPaginasLocais().map((item) =>
    item.id === id ? { ...item, ...pagina } : item,
  );

  return salvarPaginasLocais(paginas);
}

/* Remove uma página usando DELETE quando o backend estiver configurado. */
/* Remove uma página no backend ou no conjunto de dados local. */
export async function excluirPaginaAdmin(id) {
  if (import.meta.env.VITE_API_URL) {
    return requisicaoAdmin(`/admin/pages/${id}`, { method: "DELETE" });
  }

  return salvarPaginasLocais(
    lerPaginasLocais().filter((item) => item.id !== id),
  );
}

/* Retorna indicadores simples para preencher os cards do painel. */
/* Reúne números resumidos para os indicadores do dashboard. */
export async function carregarIndicadoresAdmin() {
  if (import.meta.env.VITE_API_URL) {
    return requisicaoAdmin("/admin/dashboard");
  }

  return {
    usuarios: Number(localStorage.getItem("cercaTrovaUsuariosTotal")) || 0,
    publicacoes: JSON.parse(localStorage.getItem("cercaTrovaMeusPosts") || "[]")
      .length,
    paginas: lerPaginasLocais().length,
  };
}
