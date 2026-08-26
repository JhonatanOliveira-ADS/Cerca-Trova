import { useState } from "react";
import '../assets/css/Login.css'

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [abaAtiva, setAbaAtiva] = useState("entrar");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login enviado:", { email, senha });
  };

  return (
    <div className="login-page">
      <div className="bg-decorations">
        <span className="paw p1">🐾</span>
        <span className="paw p2">🐾</span>
        <span className="paw p3">🐾</span>
        <span className="paw p4">🐾</span>
        <span className="paw p5">🐾</span>
        <span className="paw p6">🐾</span>
      </div>

      <header className="login-header">
        <h1>Cerca <span className="highlight">Trova</span></h1>
        <p className="slogan">"Quem procura, acha"</p>
      </header>

      <div className="card-wrapper">
        <div className="card-shadow-pink"></div>
        
        <div className="login-card">
          <div className="tab-container">
            <button 
              type="button"
              className={`tab-btn ${abaAtiva === "entrar" ? "active" : ""}`}
              onClick={() => setAbaAtiva("entrar")}
            >
              Entrar
            </button>
            <button 
              type="button"
              className={`tab-btn ${abaAtiva === "cadastrar" ? "active" : ""}`}
              onClick={() => setAbaAtiva("cadastrar")}
            >
              Cadastrar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <span className="input-icon">✉️</span>
              <input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <span className="input-icon">🔒</span>
              <input
                type="password"
                placeholder="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
              <button type="button" className="btn-reveal">ver</button>
            </div>

            <div className="forgot-password-container">
              <a href="#esqueci" className="forgot-password">Esqueci minha senha</a>
            </div>

            <button type="submit" className="btn-submit">
              Entrar
            </button>
          </form>

          <p className="card-footer">
            Ainda não tem conta? <a href="#cadastre" className="highlight-link">Cadastre-se</a>
          </p>
        </div>
      </div>

      <footer className="page-footer">
        ONG ou protetor? <a href="#cnpj" className="highlight-link">Cadastre com CNPJ</a> e ganhe o selo <span className="text-pink">verificado</span>
      </footer>
    </div>
  );
}
