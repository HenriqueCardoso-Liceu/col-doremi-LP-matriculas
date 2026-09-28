import Logo from './../assets/logo2.png'

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="brand-wordmark">
          <img src={Logo} alt="Colégio Itaqua" />
        </div>

        <nav className="footer-nav" aria-label="Navegação do rodapé">
          <a href="#diferenciais">A escola</a>
          <a href="#estrutura-experiencias">Estrutura</a>
          <a href="#localizacao">Localização</a>
          <a href="#faq">Dúvidas</a>
          <a href="#agendar-visita">Agendar uma visita</a>
        </nav>
      </div>

      <div className="footer-divider" />

      <div className="footer-copy">© 2026 Colégio Dó Ré Mi. Todos os direitos reservados.</div>
    </footer>
  )
}

export default Footer
