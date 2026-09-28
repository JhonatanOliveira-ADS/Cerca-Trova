import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/*
  Componente responsável por proteger visualmente a rota administrativa.
  Em um backend real, essa verificação também precisa existir no servidor.
*/
export default function ProtecaoAdmin({ children }) {
  // Hook utilizado para redirecionar visitantes não autenticados.
  const navigate = useNavigate();

  // A sessão é lida somente no navegador para manter o painel restrito no frontend.
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
