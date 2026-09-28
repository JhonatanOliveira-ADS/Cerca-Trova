import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import "./App.css";

// Componentes
import Menu from "./Componentes/Menu";

// Páginas
import Home from "./Paginas/Home";
import Login from "./Paginas/Login";
import AdocaoDoacao from "./Paginas/AdocaoDoacao";
import AchadosPerdidos from "./Paginas/AchadosPerdidos";
import Favoritos from "./Paginas/Favoritos";
import MeuPerfil from "./Paginas/MeuPerfil";
import Painel from "./Paginas/Painel";
import TinderPet from "./Paginas/Tinder-pet";
import Configuracoes from "./Paginas/Configuracoes";
// Acrescentado: página de chat inspirada na referência visual fornecida.
import Chat from "./Paginas/Chat";
// Acrescentado: proteção visual da área administrativa.
import ProtecaoAdmin from "./Componentes/ProtecaoAdmin";

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Menu />

        <div className="app-conteudo">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/adocao" element={<AdocaoDoacao />} />
            <Route path="/achados-perdidos" element={<AchadosPerdidos />} />
            <Route path="/favoritos" element={<Favoritos />} />
            <Route path="/perfil" element={<MeuPerfil />} />
            {/* A rota antiga do painel permanece disponível, agora protegida. */}
            <Route
              path="/painel"
              element={
                <ProtecaoAdmin>
                  <Painel />
                </ProtecaoAdmin>
              }
            />
            {/* Nova rota semântica para o acesso administrativo. */}
            <Route
              path="/admin"
              element={
                <ProtecaoAdmin>
                  <Painel />
                </ProtecaoAdmin>
              }
            />
            <Route path="/tinder-pet" element={<TinderPet />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
            {/* Acrescentado: rota reutilizável para a tela de conversas. */}
            <Route path="/chat" element={<Chat />} />
          </Routes>
        </div>

        {/* Acrescentado: botão fixo que permanece no canto inferior direito em qualquer página. */}
        <Link
          className="chat-floating-button"
          to="/chat"
          aria-label="Abrir chat"
          title="Abrir chat"
        >
          <span aria-hidden="true">◌</span>
          <strong>Chat</strong>
        </Link>
      </div>
    </BrowserRouter>
  );
}
