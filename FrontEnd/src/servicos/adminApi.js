
/* =====================================================
   CERCA TROVA - API ADMINISTRATIVA

   Centraliza as requisições do painel Admin.

   Todas as rotas administrativas devem ser
   protegidas no backend por um JWT válido
   e uma conta do tipo ADMIN.
===================================================== */

import { requisicaoApi } from "./autenticacao";

/* =====================================================
   1. RESUMO DO SISTEMA
===================================================== */

export async function obterResumoAdmin(desde) {
  const query = desde
    ? `?desde=${encodeURIComponent(desde)}`
    : "";

  return requisicaoApi(`/admin/resumo${query}`, {
    cache: "no-store",
  });
}

/* =====================================================
   2. LISTAR USUÁRIOS
===================================================== */

export async function listarUsuariosAdmin() {
  return requisicaoApi("/admin/usuarios", {
    cache: "no-store",
  });
}

/* =====================================================
   3. LISTAR PUBLICAÇÕES
===================================================== */

export async function listarPublicacoesAdmin() {
  return requisicaoApi("/admin/publicacoes", {
    cache: "no-store",
  });
}

/* =====================================================
   4. LISTAGENS EXISTENTES
===================================================== */

export async function obterListagensAdmin() {
  const [usuarios, publicacoes] = await Promise.all([
    listarUsuariosAdmin(),
    listarPublicacoesAdmin(),
  ]);

  return {
    usuarios,
    publicacoes,
  };
}

/* =====================================================
   5. ATUALIZAR STATUS DE PUBLICAÇÃO
===================================================== */

export async function atualizarStatusPublicacaoAdmin(
  id,
  status
) {
  return requisicaoApi(
    `/admin/publicacoes/${encodeURIComponent(id)}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }
  );
}

/* =====================================================
   6. CARREGAR TODOS OS DADOS DISPONÍVEIS

   Nova função:
   - Usuários
   - Publicações
   - Adoções
   - Achados e perdidos
   - Tinder Pet
   - Metadados das conversas

   Não utiliza dados mockados.
===================================================== */

export async function listarDadosPainelAdmin() {
  return requisicaoApi("/admin/dados", {
    cache: "no-store",
  });
}
