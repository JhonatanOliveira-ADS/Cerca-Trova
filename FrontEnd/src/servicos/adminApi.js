import { requisicaoApi } from "./autenticacao";

/* Consulta usuários reais para indicadores administrativos autorizados. */
export async function listarUsuariosAdmin() {
  return requisicaoApi("/visualizarDadosGeral");
}

/* Consulta publicações persistidas para o painel administrativo. */
export async function listarPublicacoesAdmin() {
  return requisicaoApi("/visualizarPublicacao");
}

/* Monta indicadores a partir das respostas reais do backend. */
export async function obterResumoAdmin() {
  const [usuarios, publicacoes] = await Promise.all([
    listarUsuariosAdmin(),
    listarPublicacoesAdmin(),
  ]);

  return {
    usuarios: Array.isArray(usuarios) ? usuarios.length : 0,
    publicacoes: Array.isArray(publicacoes) ? publicacoes.length : 0,
  };
}

/* O backend atual ainda não possui uma entidade persistente de páginas. */
export async function listarPaginasAdmin() {
  throw new Error("O backend ainda não possui o recurso de páginas administrativas.");
}

export async function criarPaginaAdmin() {
  throw new Error("O backend ainda não possui o recurso de páginas administrativas.");
}

export async function atualizarPaginaAdmin() {
  throw new Error("O backend ainda não possui o recurso de páginas administrativas.");
}

export async function excluirPaginaAdmin() {
  throw new Error("O backend ainda não possui o recurso de páginas administrativas.");
}
