/* URL base configurável para desenvolvimento e produção. */
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3333";

/* Chaves de sessão usadas para manter o token sem armazenar senha no navegador. */
const CHAVE_TOKEN = "cercaTrovaToken";
const CHAVE_USUARIO = "cercaTrovaUsuario";
const CHAVE_TOKEN_ADMIN = "cercaTrovaAdminToken";

/* Recupera o token comum salvo após o login. */
export function obterToken() {
  return sessionStorage.getItem(CHAVE_TOKEN);
}

/* Alias mantido para os serviços administrativos já existentes. */
export function obterTokenAdministrador() {
  return (
    sessionStorage.getItem(CHAVE_TOKEN_ADMIN) ||
    sessionStorage.getItem(CHAVE_TOKEN)
  );
}

/* Retorna o usuário autenticado salvo na sessão atual. */
export function obterUsuarioAtual() {
  try {
    return JSON.parse(sessionStorage.getItem(CHAVE_USUARIO) || "null");
  } catch {
    return null;
  }
}

/* Persiste somente token e dados públicos devolvidos pelo backend. */
function salvarSessao(dados) {
  sessionStorage.setItem(CHAVE_TOKEN, dados.token);
  sessionStorage.setItem(
    CHAVE_USUARIO,
    JSON.stringify({
      id: dados.id,
      nome: dados.nome,
      email: dados.email,
      tipo: dados.tipo,
    }),
  );
}

/* Encerra a sessão sem manter credenciais ou senhas no armazenamento. */
export function encerrarSessao() {
  sessionStorage.removeItem(CHAVE_TOKEN);
  sessionStorage.removeItem(CHAVE_TOKEN_ADMIN);
  sessionStorage.removeItem(CHAVE_USUARIO);
  sessionStorage.removeItem("cercaTrovaAdminAutenticado");
}

/* Monta os headers comuns e adiciona autorização somente quando houver token. */
export function obterHeadersComAutenticacao(headers = {}) {
  const token = obterTokenAdministrador();

  return {
    ...headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/* Executa requisições JSON e transforma erros HTTP em mensagens compreensíveis. */
export async function requisicaoApi(endpoint, opcoes = {}) {
  const resposta = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...opcoes,
    headers: obterHeadersComAutenticacao({
      ...(opcoes.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...(opcoes.headers || {}),
    }),
  });

  const dados = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    throw new Error(
      dados.error || dados.mensagem || dados.message || "Não foi possível concluir a operação.",
    );
  }

  return dados;
}

/* Realiza o login comum e guarda o token JWT devolvido pelo backend. */
export async function loginUsuario(email, senha) {
  const dados = await requisicaoApi("/logarUsuario", {
    method: "POST",
    body: JSON.stringify({ email, senha }),
  });

  salvarSessao(dados);
  return dados;
}

/* Envia o cadastro como multipart, formato exigido pelo multer no backend. */
export async function cadastrarUsuario({ nome, email, senha, telefone, arquivo }) {
  const formulario = new FormData();
  formulario.append("nome", nome);
  formulario.append("email", email);
  formulario.append("senha", senha);
  formulario.append("telefone", telefone || "");

  if (arquivo) {
    formulario.append("file", arquivo);
  }

  return requisicaoApi("/CadastrarUsuarios", {
    method: "POST",
    body: formulario,
  });
}

/* Busca o feed ativo do backend para substituir os dados mockados da Home. */
export async function listarPublicacoes() {
  return requisicaoApi("/visualizarPublicacao");
}

/* Envia uma nova publicação como multipart para suportar imagem e campos textuais. */
export async function criarPublicacao(publicacao) {
  const formulario = new FormData();
  const campos = [
    "tipo",
    "nome_pet",
    "especie",
    "raca",
    "idade_pet",
    "porte",
    "sexo",
    "descricao",
    "cidade",
    "estado",
  ];

  campos.forEach((campo) => {
    formulario.append(campo, publicacao[campo] || "");
  });

  if (publicacao.arquivo) {
    formulario.append("file", publicacao.arquivo);
  }

  return requisicaoApi("/CriarPublicacao", {
    method: "POST",
    body: formulario,
  });
}

/* Busca os favoritos do usuário autenticado com as publicações completas. */
export async function listarFavoritos() {
  return requisicaoApi("/visualizarFavorito", {
    method: "GET",
  });
}

/* Remove um favorito enviando apenas o identificador do vínculo no body. */
export async function removerFavorito(id) {
  return requisicaoApi("/deletarFavorito", {
    method: "DELETE",
    body: JSON.stringify({ id }),
  });
}

/* Cria um favorito sem aceitar id de usuário vindo da interface. */
export async function criarFavorito(idPublicacao) {
  return requisicaoApi("/CriarFavorito", {
    method: "POST",
    body: JSON.stringify({ id_publicacoes: idPublicacao }),
  });
}

/* Consulta os dados públicos do usuário autenticado. */
export async function obterPerfil() {
  return requisicaoApi("/visualizarDadosUnico");
}

/* Atualiza os dados textuais e os arquivos de avatar/capa do perfil. */
export async function atualizarPerfil(dados) {
  return requisicaoApi("/atualizarDadosUsuario", {
    method: "PUT",
    body: JSON.stringify({
      nome: dados.nome || "",
      email: dados.email || "",
      telefone: dados.telefone || "",
    }),
  });
}

/* Envia uma imagem no campo file usando exatamente o padrão das outras rotas. */
export async function atualizarFotoPerfil(arquivo) {
  const formulario = new FormData();
  formulario.append("file", arquivo);

  return requisicaoApi("/atualizarFotoPerfil", {
    method: "PUT",
    body: formulario,
  });
}

/* Envia a capa individualmente para o endpoint Multer da capa. */
export async function atualizarFotoCapa(arquivo) {
  const formulario = new FormData();
  formulario.append("file", arquivo);

  return requisicaoApi("/atualizarFotoCapa", {
    method: "PUT",
    body: formulario,
  });
}

/* Atualiza uma publicação existente usando multipart para permitir nova imagem. */
export async function atualizarPublicacao(publicacao) {
  const formulario = new FormData();
  const campos = [
    "id",
    "tipo",
    "nome_pet",
    "especie",
    "raca",
    "idade_pet",
    "porte",
    "sexo",
    "descricao",
    "cidade",
    "estado",
    "status",
  ];

  campos.forEach((campo) => {
    formulario.append(campo, publicacao[campo] ?? "");
  });

  if (publicacao.arquivo) {
    formulario.append("file", publicacao.arquivo);
  }

  return requisicaoApi("/atualizarDadosPublicacao", {
    method: "PUT",
    body: formulario,
  });
}

/* Exclui uma publicação pertencente ao usuário autenticado. */
export async function excluirPublicacao(id) {
  return requisicaoApi("/deletarPublicacao", {
    method: "DELETE",
    body: JSON.stringify({ id }),
  });
}

/* Busca os pets ativos cadastrados no banco para o TinderPet. */
export async function listarPetsTinder() {
  return requisicaoApi("/visualizarPetsTinder");
}

/* Abre ou recupera a conversa com o proprietário da publicação selecionada. */
export async function criarConversaPorInteresse(idPublicacao) {
  return requisicaoApi("/conversas/interesse", {
    method: "POST",
    body: JSON.stringify({ id_publicacao: idPublicacao }),
  });
}

/* Recupera as conversas persistidas do usuário autenticado. */
export async function listarConversas() {
  return requisicaoApi("/conversas");
}

/* Busca as mensagens reais de uma conversa autorizada. */
export async function listarMensagensConversa(idConversa) {
  return requisicaoApi(`/conversas/${idConversa}/mensagens`);
}

/* Persiste uma nova mensagem na conversa selecionada. */
export async function enviarMensagemConversa(idConversa, texto) {
  return requisicaoApi(`/conversas/${idConversa}/mensagens`, {
    method: "POST",
    body: JSON.stringify({ texto }),
  });
}

/* Mantém uma função explícita para autenticação administrativa futura. */
export async function loginAdministrador(email, senha) {
  throw new Error(
    "O backend atual ainda não possui uma rota administrativa separada.",
  );
}
