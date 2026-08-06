import { BrowserRouter, Routes, Route } from "react-router-dom";

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

export default function App() {
  return (
    <BrowserRouter>
      <Menu />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/adocao" element={<AdocaoDoacao />} />
        <Route path="/achados-perdidos" element={<AchadosPerdidos />} />
        <Route path="/favoritos" element={<Favoritos />} />
        <Route path="/perfil" element={<MeuPerfil />} />
        <Route path="/painel" element={<Painel />} />
        <Route path="/tinder-pet" element={<TinderPet />} />
        <Route path="/configuracoes" element={<Configuracoes />} />
      </Routes>
    </BrowserRouter>
  );
}