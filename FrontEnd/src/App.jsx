import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";

import "./App.css";

/* ==========================================
   COMPONENTES
========================================== */

import Menu from "./Componentes/Menu";

/* ==========================================
   PÁGINAS
========================================== */

import Home from "./Paginas/Home";
import Login from "./Paginas/Login";
import AdocaoDoacao from "./Paginas/AdocaoDoacao";
import AchadosPerdidos from "./Paginas/AchadosPerdidos";
import Favoritos from "./Paginas/Favoritos";
import MeuPerfil from "./Paginas/MeuPerfil";
import TinderPet from "./Paginas/Tinder-pet";
import Configuracoes from "./Paginas/Configuracoes";
import Chat from "./Paginas/Chat";

/* ==========================================
   ADMIN
========================================== */

import Admin from "./PaginasAdmin/Admin";

/* ==========================================
   CONTEÚDO PRINCIPAL
========================================== */

function ConteudoApp() {
  const location = useLocation();

  const paginaAdmin =
    location.pathname === "/admin" ||
    location.pathname.startsWith("/admin/");

  return (
    <div className="app-container">

      {/* MENU PRINCIPAL */}
      {!paginaAdmin && <Menu />}

      {/* CONTEÚDO */}
      <div
        className={
          paginaAdmin
            ? "app-conteudo app-conteudo-admin"
            : "app-conteudo"
        }
      >
        <Routes>

          {/* HOME */}
          <Route
            path="/"
            element={<Home />}
          />

          {/* LOGIN */}
          <Route
            path="/login"
            element={<Login />}
          />

          {/* ADOÇÃO */}
          <Route
            path="/adocao"
            element={<AdocaoDoacao />}
          />

          {/* ACHADOS E PERDIDOS */}
          <Route
            path="/achados-perdidos"
            element={<AchadosPerdidos />}
          />

          {/* FAVORITOS */}
          <Route
            path="/favoritos"
            element={<Favoritos />}
          />

          {/* PERFIL */}
          <Route
            path="/perfil"
            element={<MeuPerfil />}
          />

          {/* TINDER PET */}
          <Route
            path="/tinder-pet"
            element={<TinderPet />}
          />

          {/* CONFIGURAÇÕES */}
          <Route
            path="/configuracoes"
            element={<Configuracoes />}
          />

          {/* CHAT */}
          <Route
            path="/chat"
            element={<Chat />}
          />

          {/* ADMIN */}
          <Route
            path="/admin"
            element={<Admin />}
          />

        </Routes>
      </div>

      {/* BOTÃO FLUTUANTE DO CHAT */}
      {!paginaAdmin && (
        <Link
          className="chat-floating-button"
          to="/chat"
          aria-label="Abrir chat"
          title="Abrir chat"
        >
          <span aria-hidden="true">
            ◌
          </span>

          <strong>
            Chat
          </strong>
        </Link>
      )}

    </div>
  );
}

/* ==========================================
   APP
========================================== */

function App() {
  return (
    <BrowserRouter>
      <ConteudoApp />
    </BrowserRouter>
  );
}

export default App;