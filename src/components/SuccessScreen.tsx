import Logo from '../assets/logo2.png'
/* import ChildImage from '../assets/images/child.png' */
import { IoLogoWhatsapp } from "react-icons/io";
import { BsClipboardDataFill } from "react-icons/bs";
import { GrSchedule } from "react-icons/gr";
import Footer from './Footer';
import { useEffect } from 'react';

export default function SuccessScreen() {
  useEffect(() => {
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push({ event: "lead_sucesso" });
  }, []);

  return (
    <main className="success-screen">

      <div className="success-hero relative bg-black">
        <span className="hero-blur">
        </span>

        <div className="success-logo-wrap">
          <img src={Logo} alt="Colégio Itaqua" className="success-logo" />
        </div>

        <div className="success-content pb-10">
          <div className="success-copy">
            <div className="success-check" aria-label="Sucesso">
              <span>✓</span>
            </div>

            <h1>
              Obrigado pelo
              <br />
              seu interesse!
            </h1>

            <p>
              Recebemos seus dados com sucesso. Em breve, nossa equipe entrará em
              contato para orientar você sobre os próximos passos.
            </p>

            <p>
              Se preferir, você também pode falar com a nossa equipe agora mesmo.
            </p>
          </div>

        </div>
      </div>

      <section className="success-next-steps">
        <div className="success-next-header">
          <span className="success-pill">PRÓXIMOS PASSOS</span>
          <h2>Veja o que acontece agora:</h2>
        </div>

        <div className="success-steps-grid">
          <article className="success-step-card">
            <div className="success-step-number">1</div>
            <div className="success-step-icon"><BsClipboardDataFill /></div>
            <p>Nossa equipe vai analisar seu cadastro</p>
          </article>

          <article className="success-step-card">
            <div className="success-step-number">2</div>
            <div className="success-step-icon success-step-icon-alt"><IoLogoWhatsapp /></div>
            <p>Entraremos em contato pelo WhatsApp ou telefone</p>
          </article>

          <article className="success-step-card">
            <div className="success-step-number">3</div>
            <div className="success-step-icon success-step-icon-alt-2"><GrSchedule /></div>
            <p>Você poderá tirar dúvidas e agendar uma visita</p>
          </article>
        </div>
      </section>

      <Footer />
    </main>
  )
}
