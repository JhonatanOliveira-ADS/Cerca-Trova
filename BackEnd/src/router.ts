
/* ==========================================================
   CERCA TROVA - ROTAS DO BACKEND

   Arquivo: src/router.ts

   Responsabilidades:
   - Cadastro e login de usuários
   - Gerenciamento de ONGs
   - Publicações
   - Favoritos
   - Tinder Pet
   - Conversas e mensagens
   - Perfil e imagens
   - Painel administrativo

   Todas as rotas administrativas devem ser protegidas
   pelo middleware adminEstaAutenticado.
========================================================== */

/* ==========================================================
   1. IMPORTAÇÕES PRINCIPAIS
========================================================== */

import { Router } from "express";
import multer from "multer";

import { estaAutenticado } from "./middleware/Autenticado";
import { adminEstaAutenticado } from "./middleware/AdminAutenticado";

import uploadConfig from "./config/multer";

/* ==========================================================
   2. IMPORTAÇÃO DOS CONTROLLERS
========================================================== */

import usuariosControllers from "./Controllers/usuariosControllers";
import ongsControllers from "./Controllers/ongsControllers";

import publicacoesControllers from "./Controllers/publicacoesControllers";
import favoritosControllers from "./Controllers/favoritosControllers";

import loginUsuariosControllers from "./Controllers/loginUsuariosControllers/loginUsuariosControllers";
import loginONGsControllers from "./Controllers/loginONGsControllers/loginONGsControllers";

import PetsTinderControllers from "./Controllers/petsTinderControllers";

import AdminControllers from "./Controllers/adminControllers/adminCotrollers";

import chatControllers from "./Controllers/chatControllers";

/* ==========================================================
   3. CONFIGURAÇÃO DO ROUTER E UPLOAD

   Mantém sua configuração atual do Multer.
========================================================== */

const router = Router();

const uploead = multer(
  uploadConfig.uploead("./tmp")
);

/* ==========================================================
   4. ROTAS DE USUÁRIOS

   Cadastro, consulta, atualização e exclusão.
========================================================== */

// Cadastrar usuário.
router.post(
  "/CadastrarUsuarios",
  uploead.single("file"),
  new usuariosControllers().criarUsuarios
);

// Buscar dados de um usuário autenticado.
router.get(
  "/visualizarDadosUnico",
  estaAutenticado,
  new usuariosControllers().visualizarDadosUnico
);

// Listar usuários pela rota existente.
// A autorização desta rota deve ser revisada
// separadamente, pois pode expor dados pessoais.
router.get(
  "/visualizarDadosGeral",
  estaAutenticado,
  new usuariosControllers().visualizarDadosGeral
);

// Atualizar informações pessoais.
router.put(
  "/atualizarDadosUsuario",
  estaAutenticado,
  new usuariosControllers().atualizarDadosUsuario
);

// Atualizar foto de perfil.
router.put(
  "/atualizarFotoPerfil",
  uploead.single("file"),
  estaAutenticado,
  new usuariosControllers().atualizarFotoPerfil
);

// Atualizar foto de capa.
router.put(
  "/atualizarFotoCapa",
  uploead.single("file"),
  estaAutenticado,
  new usuariosControllers().atualizarFotoCapa
);

// Excluir usuário.
router.delete(
  "/deletarUsuarios",
  estaAutenticado,
  new usuariosControllers().deletarUsuario
);

/* ==========================================================
   5. ROTAS DE LOGIN

   Mantém os endpoints utilizados pelo frontend.
========================================================== */

// Login de usuários.
router.post(
  "/logarUsuario",
  new loginUsuariosControllers().logarUsuario
);

// Login de ONGs.
router.post(
  "/logarONGs",
  new loginONGsControllers().logarONG
);

/* ==========================================================
   6. ROTAS DAS ONGS
========================================================== */

// Cadastrar ONG.
router.post(
  "/CadastrarONG",
  uploead.single("file"),
  new ongsControllers().criarOng
);

// Consultar ONGs.
router.get(
  "/visualizarONG",
  estaAutenticado,
  new ongsControllers().visualizarONG
);

// Atualizar ONG.
router.put(
  "/atualizarDadosONG",
  uploead.single("file"),
  estaAutenticado,
  new ongsControllers().atualizarONG
);

// Excluir ONG.
router.delete(
  "/deletarONG",
  estaAutenticado,
  new ongsControllers().deletarOng
);

/* ==========================================================
   7. ROTAS DE PUBLICAÇÕES

   O feed pode ser consultado publicamente.
   Publicar, editar e excluir exigem login.
========================================================== */

// Criar publicação.
router.post(
  "/CriarPublicacao",
  uploead.single("file"),
  estaAutenticado,
  new publicacoesControllers().publicarPost
);

// Listar publicações.
router.get(
  "/visualizarPublicacao",
  new publicacoesControllers().visualizarPublicacoes
);

// Atualizar publicação.
router.put(
  "/atualizarDadosPublicacao",
  uploead.single("file"),
  estaAutenticado,
  new publicacoesControllers().atualizarPublicacao
);

// Excluir publicação.
router.delete(
  "/deletarPublicacao",
  estaAutenticado,
  new publicacoesControllers().deletarPublicacao
);

/* ==========================================================
   8. ROTAS DE FAVORITOS
========================================================== */

// Adicionar favorito.
router.post(
  "/CriarFavorito",
  estaAutenticado,
  new favoritosControllers().criarFavorito
);

// Visualizar favoritos.
router.get(
  "/visualizarFavorito",
  estaAutenticado,
  new favoritosControllers().visualizarFavorito
);

// Excluir favorito.
router.delete(
  "/deletarFavorito",
  estaAutenticado,
  new favoritosControllers().deletarFavorito
);

/* ==========================================================
   9. ROTAS DO TINDER PET
========================================================== */

// Cadastrar pet.
router.post(
  "/CriarPetTinder",
  uploead.single("file"),
  estaAutenticado,
  new PetsTinderControllers().criarPet
);

// Listar pets.
router.get(
  "/visualizarPetsTinder",
  new PetsTinderControllers().listarPets
);

/* ==========================================================
   10. ROTAS DO CHAT

   Conversas e mensagens são vinculadas ao
   usuário autenticado.
========================================================== */

// Criar ou recuperar conversa.
router.post(
  "/conversas/interesse",
  estaAutenticado,
  new chatControllers().criarOuObterConversa
);

// Listar conversas.
router.get(
  "/conversas",
  estaAutenticado,
  new chatControllers().listarConversas
);

// Listar mensagens de uma conversa.
router.get(
  "/conversas/:id/mensagens",
  estaAutenticado,
  new chatControllers().listarMensagens
);

// Enviar mensagem.
router.post(
  "/conversas/:id/mensagens",
  estaAutenticado,
  new chatControllers().criarMensagem
);

/* ==========================================================
   11. ROTAS ADMINISTRATIVAS

   Todas exigem:
   - JWT válido
   - Usuário do tipo ADMIN

   O próprio middleware valida as permissões.
========================================================== */

// Resumo administrativo.
router.get(
  "/admin/resumo",
  adminEstaAutenticado,
  new AdminControllers().obterResumo
);

// Listar usuários reais no painel.
router.get(
  "/admin/usuarios",
  adminEstaAutenticado,
  new AdminControllers().listarUsuarios
);

// Listar publicações reais.
router.get(
  "/admin/publicacoes",
  adminEstaAutenticado,
  new AdminControllers().listarPublicacoes
);

// NOVA ROTA: carregar todos os dados do Admin.
router.get(
  "/admin/dados",
  adminEstaAutenticado,
  new AdminControllers().listarDadosPainel
);

// Ativar ou desativar publicação.
router.patch(
  "/admin/publicacoes/:id/status",
  adminEstaAutenticado,
  new AdminControllers().atualizarStatusPublicacao
);

/* ==========================================================
   12. CADASTRO ADMINISTRATIVO

   A rota pública /CadastrarAdmin foi retirada para
   impedir novos cadastros administrativos por HTTP.

   Esta alteração pressupõe que o administrador
   autorizado já tenha sido cadastrado.

   O método criarAdministrador permanece no controller,
   mas não fica exposto por uma rota pública.
========================================================== */

/* ==========================================================
   13. EXPORTAÇÃO
========================================================== */

export default router;
