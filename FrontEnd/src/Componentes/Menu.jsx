
/* ==================================================
   CERCA TROVA - MENU PRINCIPAL

   Funcionalidades:
   - Navegação entre as páginas
   - Identificação do usuário logado
   - Exibição do nome no lugar de "Entrar"
   - Atualização ao mudar de página
================================================== */

import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import "../assets/css/Menu.css";

import { obterUsuarioAtual } from "../servicos/autenticacao";

/* ==================================================
   COMPONENTE PRINCIPAL
================================================== */

export default function Menu() {
  /* Detecta mudanças de rota */
  const location = useLocation();

  /* Guarda o usuário autenticado */
  const [usuario, setUsuario] = useState(() =>
    obterUsuarioAtual()
  );

  /* ==================================================
     ATUALIZAR USUÁRIO

     Consulta os dados atuais da sessão.
  ================================================== */

  useEffect(() => {
    function atualizarUsuario() {
      setUsuario(obterUsuarioAtual());
    }

    // Atualiza ao navegar pelo site.
    atualizarUsuario();

    // Atualiza caso a sessão seja modificada
    // em outra aba do navegador.
    window.addEventListener("storage", atualizarUsuario);

    // Atualiza quando a janela recebe foco.
    window.addEventListener("focus", atualizarUsuario);

    return () => {
      window.removeEventListener(
        "storage",
        atualizarUsuario
      );

      window.removeEventListener(
        "focus",
        atualizarUsuario
      );
    };
  }, [location.pathname, location.search]);

  /* ==================================================
     IDENTIFICAR O NOME DO USUÁRIO

     Exibe o primeiro nome para não ocupar
     espaço excessivo no menu.
  ================================================== */

  const nomeUsuario = usuario?.nome
    ?.trim()
    .split(/\s+/)[0];

  /* ==================================================
     LINKS DO MENU
  ================================================== */

  return (
    <nav className="ct-menu">
      {/* HOME */}
      <Link to="/">
        Home
      </Link>

      {/* MAPA */}
      <Link to="/achados-perdidos">
        Mapa
      </Link>

      {/* ADOÇÃO */}
      <Link to="/adocao">
        Adoção
      </Link>

      {/* TINDER PET */}
      <Link to="/tinder-pet">
        Tinder Pet
      </Link>

      {/* FAVORITOS */}
      <Link to="/favoritos">
        Favoritos
      </Link>

      {/* MEU PERFIL */}
      <Link to="/perfil">
        Meu perfil
      </Link>

      {/* CHAT */}
      <Link to="/chat">
        Chat
      </Link>

      {/* ========================================
          ENTRAR / USUÁRIO LOGADO
      ======================================== */}

      {usuario ? (
        <Link
          to="/perfil"
          className="ct-menu-usuario"
          title={usuario.nome || "Meu perfil"}
        >
          <span aria-hidden="true">👤</span>
          <span>{nomeUsuario || "Meu perfil"}</span>
        </Link>
      ) : (
        <Link
          to="/login"
          className="ct-menu-entrar"
        >
          Entrar
        </Link>
      )}
    </nav>
  );
}

/* ==================================================
   FIM DO MENU.JSX
================================================== */
