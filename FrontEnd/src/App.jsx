import {
  BrowserRouter,
  Routes,
  Route,
  Link,
} from "react-router-dom";

import "./App.css";

/* ==========================================
   COMPONENTES
========================================== */

import Menu from "./Componentes/Menu";
import ProtecaoAdmin from "./Componentes/ProtecaoAdmin";


/* ==========================================
   PÁGINAS
========================================== */

import Home from "./Paginas/Home";
import Login from "./Paginas/Login";
import AdocaoDoacao from "./Paginas/AdocaoDoacao";
import AchadosPerdidos from "./Paginas/AchadosPerdidos";
import Favoritos from "./Paginas/Favoritos";
import MeuPerfil from "./Paginas/MeuPerfil";
import Painel from "./Paginas/Painel";
import TinderPet from "./Paginas/Tinder-pet";
import Configuracoes from "./Paginas/Configuracoes";
import Chat from "./Paginas/Chat";


/* ==========================================
   APP
========================================== */

export default function App() {
  return (
    <BrowserRouter>

      <div className="app-container">

        {/* MENU PRINCIPAL */}
        <Menu />


        {/* ==================================
            CONTEÚDO DAS PÁGINAS
        ================================== */}

        <div className="app-conteudo">

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


            {/* ACHADOS E PERDIDOS / MAPA */}
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


            {/* ==================================
                ADMINISTRAÇÃO
            ================================== */}

            <Route
              path="/painel"
              element={
                <ProtecaoAdmin>
                  <Painel />
                </ProtecaoAdmin>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtecaoAdmin>
                  <Painel />
                </ProtecaoAdmin>
              }
            />

          </Routes>

        </div>


        {/* ==================================
            BOTÃO FLUTUANTE DO CHAT
        ================================== */}

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

      </div>

    </BrowserRouter>
  );
}