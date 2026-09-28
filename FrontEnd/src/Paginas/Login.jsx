import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../assets/css/Login.css";

/*
  Página única de autenticação.
  O componente mantém os modos de usuário, cadastro e administrador
  dentro da mesma interface para evitar navegações desnecessárias.
*/
export default function Login() {
  /* Estados dos campos de autenticação e cadastro. */
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  /* Estados responsáveis pela aba, modo admin, senha visível e feedback. */
  const [abaAtiva, setAbaAtiva] = useState("entrar");
  const [modoAdmin, setModoAdmin] = useState(false);
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [confirmarSenhaVisivel, setConfirmarSenhaVisivel] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("");

  /* Hook usado para encaminhar o administrador ao painel após autenticação. */
  const navigate = useNavigate();

  /* Limpa os dados temporários quando o usuário troca o contexto da tela. */
  function limparFeedback() {
    setMensagem("");
    setTipoMensagem("");
  }

  /* Troca entre login e cadastro mantendo os campos digitados independentes. */
  function trocarAba(novaAba) {
    setAbaAtiva(novaAba);
    limparFeedback();
    setSenhaVisivel(false);
    setConfirmarSenhaVisivel(false);
  }

  /* Alterna entre a interface comum e o acesso administrativo textual. */
  function alternarModoAdmin() {
    setModoAdmin((modoAtual) => !modoAtual);
    setAbaAtiva("entrar");
    setNome("");
    setEmail("");
    setSenha("");
    setConfirmarSenha("");
    setSenhaVisivel(false);
    setConfirmarSenhaVisivel(false);
    limparFeedback();
  }

  /* Alterna a visualização da senha principal sem perder o conteúdo digitado. */
  function alternarSenha() {
    setSenhaVisivel((valorAtual) => !valorAtual);
  }

  /* Alterna a visualização da confirmação de senha no cadastro. */
  function alternarConfirmacaoSenha() {
    setConfirmarSenhaVisivel((valorAtual) => !valorAtual);
  }

  /*
    Valida e encaminha o login administrativo.
    Esta versão usa sessionStorage porque o projeto atual é frontend Vite;
    uma autenticação de produção deve validar os dados em um backend.
  */
  function autenticarAdministrador() {
    const credenciaisValidas =
      email.trim().toLowerCase() === "admin@cercatrova.com" &&
      senha === "Admin@2026";

    if (!credenciaisValidas) {
      setTipoMensagem("erro");
      setMensagem("E-mail ou senha de administrador inválidos.");
      return;
    }

    sessionStorage.setItem("cercaTrovaAdminAutenticado", "true");
    limparFeedback();
    navigate("/admin");
  }

  /* Processa login comum e cadastro com mensagens orientativas para o usuário. */
  function handleSubmit(event) {
    event.preventDefault();
    limparFeedback();

    if (modoAdmin) {
      autenticarAdministrador();
      return;
    }

    if (abaAtiva === "cadastrar") {
      if (senha !== confirmarSenha) {
        setTipoMensagem("erro");
        setMensagem("As senhas precisam ser iguais.");
        return;
      }

      setTipoMensagem("sucesso");
      setMensagem(
        "Cadastro preenchido. Conecte este formulário ao backend para salvar a conta.",
      );
      return;
    }

    setTipoMensagem("sucesso");
    setMensagem(
      "Login preenchido. Conecte este formulário ao backend para autenticar a conta.",
    );
  }

  /* Exibe uma orientação sem recarregar a página quando o link é acionado. */
  function handleEsqueciSenha(event) {
    event.preventDefault();
    setTipoMensagem("informacao");
    setMensagem(
      "Informe seu e-mail para receber as instruções de recuperação.",
    );
  }

  return (
    <main className={`login-page ${modoAdmin ? "admin-mode" : ""}`}>
      {/* Elementos decorativos posicionados atrás do conteúdo interativo. */}
      <div className="bg-decorations" aria-hidden="true">
        <span className="paw p1">🐾</span>
        <span className="paw p2">🐾</span>
        <span className="paw p3">🐾</span>
        <span className="paw p4">🐾</span>
        <span className="paw p5">🐾</span>
        <span className="paw p6">🐾</span>
      </div>

      {/* Identidade da página e indicação do contexto atual. */}
      <header className="login-header">
        <h1>
          Cerca <span className="highlight">Trova</span>
        </h1>
        <p className="slogan">
          {modoAdmin
            ? "Área restrita de administração"
            : '"Quem procura, acha"'}
        </p>
      </header>

      {/* Wrapper usado para manter a sombra decorativa deslocada do card. */}
      <section className="card-wrapper">
        <div className="card-shadow-pink" aria-hidden="true"></div>

        {/* Card central que contém todas as interações da autenticação. */}
        <div className="login-card">
          {/* Abas principais do fluxo comum de entrar e cadastrar. */}
          <div
            className="tab-container"
            role="tablist"
            aria-label="Acesso à conta"
          >
            <button
              type="button"
              role="tab"
              aria-selected={abaAtiva === "entrar"}
              className={`tab-btn ${abaAtiva === "entrar" ? "active" : ""}`}
              onClick={() => trocarAba("entrar")}
            >
              Entrar
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={abaAtiva === "cadastrar"}
              className={`tab-btn ${abaAtiva === "cadastrar" ? "active" : ""}`}
              onClick={() => trocarAba("cadastrar")}
            >
              Cadastrar
            </button>
          </div>

          {/* Aviso contextual do modo administrativo. */}
          {modoAdmin && (
            <div className="admin-notice" role="note">
              <strong>Acesso restrito</strong>
              <span>
                Somente contas administrativas autorizadas podem entrar.
              </span>
            </div>
          )}

          {/* Formulário controlado: todos os campos aceitam digitação normalmente. */}
          <form className="login-form" onSubmit={handleSubmit}>
            {/* Campo de nome exibido apenas durante o cadastro. */}
            {!modoAdmin && abaAtiva === "cadastrar" && (
              <div className="input-group">
                <span className="input-icon" aria-hidden="true">
                  👤
                </span>
                <input
                  type="text"
                  placeholder="Nome completo"
                  value={nome}
                  onChange={(event) => setNome(event.target.value)}
                  autoComplete="name"
                  required
                />
              </div>
            )}

            {/* Campo controlado de e-mail para login ou cadastro. */}
            <div className="input-group">
              <span className="input-icon" aria-hidden="true">
                ✉️
              </span>
              <input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </div>

            {/* Campo de senha com controle real de mostrar e ocultar conteúdo. */}
            <div className="input-group">
              <span className="input-icon" aria-hidden="true">
                🔒
              </span>
              <input
                type={senhaVisivel ? "text" : "password"}
                placeholder={modoAdmin ? "Senha administrativa" : "Senha"}
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                autoComplete={
                  abaAtiva === "cadastrar" ? "new-password" : "current-password"
                }
                required
              />
              <button
                type="button"
                className="btn-reveal"
                onClick={alternarSenha}
                aria-pressed={senhaVisivel}
                aria-label={senhaVisivel ? "Ocultar senha" : "Mostrar senha"}
              >
                {senhaVisivel ? "ocultar" : "ver"}
              </button>
            </div>

            {/* Confirmação de senha para evitar erros durante o cadastro. */}
            {!modoAdmin && abaAtiva === "cadastrar" && (
              <div className="input-group">
                <span className="input-icon" aria-hidden="true">
                  🔒
                </span>
                <input
                  type={confirmarSenhaVisivel ? "text" : "password"}
                  placeholder="Confirme sua senha"
                  value={confirmarSenha}
                  onChange={(event) => setConfirmarSenha(event.target.value)}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="btn-reveal"
                  onClick={alternarConfirmacaoSenha}
                  aria-pressed={confirmarSenhaVisivel}
                  aria-label={
                    confirmarSenhaVisivel
                      ? "Ocultar confirmação"
                      : "Mostrar confirmação"
                  }
                >
                  {confirmarSenhaVisivel ? "ocultar" : "ver"}
                </button>
              </div>
            )}

            {/* Link de recuperação somente no login comum. */}
            {!modoAdmin && abaAtiva === "entrar" && (
              <div className="forgot-password-container">
                <a
                  href="#esqueci"
                  className="forgot-password"
                  onClick={handleEsqueciSenha}
                >
                  Esqueci minha senha
                </a>
              </div>
            )}

            {/* Feedback visual acessível para erros, sucesso e orientações. */}
            {mensagem && (
              <p
                className={`login-message ${tipoMensagem}`}
                role={tipoMensagem === "erro" ? "alert" : "status"}
              >
                {mensagem}
              </p>
            )}

            {/* Ação principal contextualizada pelo modo selecionado. */}
            <button type="submit" className="btn-submit">
              {modoAdmin
                ? "Entrar como admin"
                : abaAtiva === "cadastrar"
                  ? "Criar minha conta"
                  : "Entrar"}
            </button>
          </form>

          {/* Rodapé do card com retorno claro ao fluxo comum ou admin. */}
          {modoAdmin ? (
            <p className="card-footer admin-footer">
              Área exclusiva para administradores.{" "}
              <button
                type="button"
                className="text-action"
                onClick={alternarModoAdmin}
              >
                Voltar ao acesso comum
              </button>
            </p>
          ) : (
            <p className="card-footer">
              Ainda não tem conta?{" "}
              <button
                type="button"
                className="text-action"
                onClick={() => trocarAba("cadastrar")}
              >
                Cadastre-se
              </button>
            </p>
          )}

          {/* Acesso administrativo textual, sem botão destacado na interface pública. */}
          {!modoAdmin && (
            <p className="admin-access-link">
              Acesso administrativo?{" "}
              <button
                type="button"
                className="text-action"
                onClick={alternarModoAdmin}
              >
                Entre por aqui
              </button>
            </p>
          )}
        </div>
      </section>

      {/* Rodapé institucional mantido na identidade original. */}
      <footer className="page-footer">
        ONG ou protetor?{" "}
        <a href="#cnpj" className="highlight-link">
          Cadastre com CNPJ
        </a>{" "}
        e ganhe o selo <span className="text-pink">verificado</span>
      </footer>
    </main>
  );
}
