import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { possuiSessaoAdministrador } from "../servicos/autenticacao";

/*
  Guarda visual das rotas administrativas.
  A validação real também deve existir no servidor em cada endpoint protegido.
*/
export default function ProtecaoAdmin({ children }) {
  const navigate = useNavigate();
  const sessaoValida = possuiSessaoAdministrador();

  /* Redireciona visitantes sem sessão para o login administrativo. */
  useEffect(() => {
    if (!sessaoValida) {
      navigate("/login", { replace: true });
    }
  }, [navigate, sessaoValida]);

  /* Não renderiza o painel enquanto a sessão não estiver autorizada. */
  if (!sessaoValida) {
    return null;
  }

  return children;
}
