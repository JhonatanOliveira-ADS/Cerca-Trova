/* Hook usado para executar o redirecionamento após a renderização. */
import { useEffect } from "react";
/* Hook que permite encaminhar visitantes não autorizados ao login. */
import { useNavigate } from "react-router-dom";

/*
  Componente responsável por proteger visualmente a rota administrativa.
  Em um backend real, essa verificação também precisa existir no servidor.
*/
/* Recebe o conteúdo protegido que só deve aparecer para administradores. */
export default function ProtecaoAdmin({ children }) {
  // Hook utilizado para redirecionar visitantes não autenticados.
  /* A navegação é mantida dentro do componente para não expor a rota protegida. */
  const navigate = useNavigate();

  // A sessão é lida somente no navegador para manter o painel restrito no frontend.
  /* O valor é uma confirmação simples criada pelo fluxo de login administrativo. */
  const sessaoAdmin =
    sessionStorage.getItem("cercaTrovaAdminAutenticado") === "true";

  // O redirecionamento ocorre após a renderização, conforme a boa prática do React.
  useEffect(() => {
    if (!sessaoAdmin) {
      navigate("/login", { replace: true });
    }
  }, [navigate, sessaoAdmin]);

  // Evita exibir o conteúdo administrativo durante uma sessão inválida.
  if (!sessaoAdmin) {
    return null;
  }

  // Renderiza o painel apenas quando a sessão administrativa foi reconhecida.
  return children;
}
