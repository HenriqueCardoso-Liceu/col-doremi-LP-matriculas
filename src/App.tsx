import { useEffect, useState } from 'react'
import './styles/landing.css'
import './styles/success.css'
import Footer from './components/Footer'
import SuccessScreen from './components/SuccessScreen'

import ChildImage from './assets/images/child.png'
import Logo from './assets/logo.png'
import SchoolImage from './assets/images/school.jpg'
import SchoolImage2 from './assets/images/school2.jpg'
import School3Image from './assets/images/school3.png'
import School4Image from './assets/images/school4.png'
import JiuJitsuImage from './assets/images/jiu-jitsu.png'
import Child2Image from './assets/images/child2.png'
import StudentImage from './assets/images/student.jpg'
import Student2Image from './assets/images/ingles.jpg'
import BalleteImage from './assets/images/ballet.png'
import QuadraImage from './assets/images/quadra.jpg'
import RoboImage from './assets/images/robo.png'
import LabImage from './assets/images/lab.png'
import ParkImage from './assets/images/park.jpg'
import ClassImage from './assets/images/libras.png'

import { IoLogoWhatsapp } from "react-icons/io"


const features = [
  {
    title: 'Ensino de qualidade',
    description: 'Uma proposta pedagógica que acompanha cada etapa do desenvolvimento.',
    image:StudentImage,
  },
  {
    title: 'Acompanhamento próximo',
    description: 'Uma equipe presente, que conhece e acompanha cada aluno de verdade.',
    image:
      SchoolImage,
  },
  {
    title: 'Formação completa',
    description: 'Balé, Jiu Jitsu, libras e inglês, sem precisar pagar escolinha à parte.',
    image:
      JiuJitsuImage,
  },
  {
    title: 'No Caiuby, pertinho de você',
    description: 'Mais praticidade para a rotina e mais tranquilidade para a família.',
    image:
      SchoolImage2,
  },
]

const slides = [
  { title: 'Quadra', image: QuadraImage },
  { title: 'Balé', image: BalleteImage },
  { title: 'Jiu Jitsu', image: JiuJitsuImage },
  { title: 'Inglês', image: Student2Image },
  { title: 'Robótica', image: RoboImage },
  { title: 'Laboratório', image: LabImage },
  { title: 'Libras', image: ClassImage },
  { title: 'Parquinho', image: ParkImage },
]

const faqItems = [
  {
    question: 'Quais séries o colégio atende?',
    answer: 'Atendemos desde a educação infantil até o ensino médio, com uma proposta completa de formação e acolhimento para cada etapa escolar.',
  },
  {
    question: 'Qual o período? Tem integral?',
    answer: 'Sim. Oferecemos turnos e opções de integral para atender as necessidades da sua família, com acompanhamento pedagógico e atividades complementares.',
  },
  {
    question: 'Como funcionam a mensalidade e as condições pra 2027?',
    answer: 'As condições e valores são divulgados conforme o ciclo letivo e podem ser conversados diretamente com nossa equipe durante a visita.',
  },
  {
    question: 'Meu filho está em outra escola. Dá pra trocar agora?',
    answer: 'Sim. O processo de transferência é bem simples e nosso time pode orientar você passo a passo sobre matrícula, documentação e adaptação.',
  },
  {
    question: 'Onde fica e tem transporte?',
    answer: 'Estamos em Itaquaquecetuba e também contamos com informações sobre acesso e transporte escolar. Fale com a nossa equipe para mais detalhes.',
  },
]

const apiUrl = import.meta.env.VITE_API_URL as string | undefined

const webhookUrl = import.meta.env.VITE_WEBHOOK_URL

const formatWhatsApp = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11)

  if (digits.length <= 2) return digits
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

const normalizeWhatsapp = (value: string) => value.replace(/\D/g, '').slice(0, 11)

const getUtmData = () => {
  if (typeof window === 'undefined') {
    return {}
  }

  const currentUrl = new URL(window.location.href)
  const currentPage = currentUrl.origin
  const params = new URLSearchParams(currentUrl.search)
  const fields = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
    'utm_id',
    'utm_name',
    'utm_placement',
    'gclid',
  ] as const

  const utmData: Record<string, string> = {}

  for (const field of fields) {
    const value = params.get(field)

    if (value && value.trim()) {
      utmData[field] = value.trim()
    }
  }

  if (document.referrer) {
    try {
      const referrerUrl = new URL(document.referrer)
      utmData.referrer = referrerUrl.origin
    } catch {
      utmData.referrer = document.referrer
    }
  }

  utmData.landing_page = currentPage

  return utmData
}

function App() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 768 : false)
  const [currentStep, setCurrentStep] = useState(0)
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname)
  const [formData, setFormData] = useState({
    responsibleName: '',
    whatsapp: '',
    interestSeries: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    const handleLocationChange = () => setCurrentPath(window.location.pathname)

    handleResize()
    window.addEventListener('resize', handleResize)
    window.addEventListener('popstate', handleLocationChange)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('popstate', handleLocationChange)
    }
  }, [])

  if (currentPath === '/sucesso') {
    return <SuccessScreen />
  }

  const visibleSlides = isMobile
    ? [slides[activeIndex]]
    : [
        slides[(activeIndex - 1 + slides.length) % slides.length],
        slides[activeIndex],
        slides[(activeIndex + 1) % slides.length],
      ]

  const steps = [
    {
      key: 'responsibleName',
      label: 'Nome do responsável',
      placeholder: 'Como podemos te chamar...',
      type: 'text',
      value: formData.responsibleName,
      maxLength: undefined,
    },
    {
      key: 'whatsapp',
      label: 'WhatsApp',
      placeholder: '(11) 99999-9999',
      type: 'tel',
      value: formData.whatsapp,
      maxLength: 15,
    },
    {
      key: 'interestSeries',
      label: 'Série de interesse',
      placeholder: 'Ex.: 1º ano do ensino fundamental',
      type: 'text',
      value: formData.interestSeries,
      maxLength: undefined,
    },
  ] as const

  const isCurrentStepValid = () => {
    const currentField = steps[currentStep].key

    if (currentField === 'responsibleName') {
      return formData.responsibleName.trim().length >= 2
    }

    if (currentField === 'whatsapp') {
      return normalizeWhatsapp(formData.whatsapp).length >= 10
    }

    return formData.interestSeries.trim().length >= 2
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === 'whatsapp' ? formatWhatsApp(value) : value,
    }))
  }

  const handleNextStep = () => {
    if (!isCurrentStepValid()) {
      return
    }

    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
  }

  const handlePreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!isCurrentStepValid()) {
      return
    }

    if (!apiUrl) {
      return
    }

    const payload = {
      responsible_name: formData.responsibleName.trim(),
      mobile_phone: normalizeWhatsapp(formData.whatsapp),
      interest: formData.interestSeries.trim(),
      ...getUtmData(),
    }

    setIsSubmitting(true)
    setSubmitMessage('')

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      })

      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: formData.responsibleName.trim(),
          phone: normalizeWhatsapp(formData.whatsapp),
          tags: ['landing-page'],
        }),
      });

      const result = await response.json().catch(() => null) as {
        success?: boolean
        message?: string
        lead?: unknown
        data?: unknown
        errors?: Record<string, string[]>
      } | null

      if (!response.ok || result?.success === false) {
        const fieldErrors = result?.errors
        const errorMessage = fieldErrors
          ? Object.values(fieldErrors)
              .flat()
              .join(' ')
          : result?.message || 'Não foi possível enviar os dados neste momento.'

        throw new Error(errorMessage)
      }

      const successMessage = typeof result?.message === 'string' && result.message.trim()
        ? result.message
        : 'Dados enviados com sucesso!'

      setSubmitMessage(successMessage)
      setCurrentStep(0)
      setFormData({
        responsibleName: '',
        whatsapp: '',
        interestSeries: '',
      })
      window.history.pushState({}, '', '/sucesso')
      setCurrentPath('/sucesso')
    } catch (error) {
      console.error('Erro ao enviar lead:', error)
      setSubmitMessage(error instanceof Error ? error.message : 'Não foi possível enviar os dados neste momento. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <section className="hero-section px-2 xl:flex items-center justify-center relative overflow-hidden min-h-screen text-[#01205F]">
        <div className="hero-side-bg hidden xl:block"/>
        <div className="xl:shrink-0 xl:block z-20 overflow-hidden px-2 sm:px-10 lg:px-16 py-5">
        
          <div className="relative mx-auto max-w-7xl">
            
            {/* Topo */}
            <div className="flex flex-wrap md:items-center gap-3 ">
              
              {/* Logo */}
              <div className="mr-3 flex items-center gap-2 text-white">
                <img src={Logo} alt="" />
              </div>

              {/* Matrículas abertas */}
              <div className="flex h-[72px] items-center rounded-xl px-5 bg-gradient-to-r from-[#3DA9E0] via-[#3445F4] to-[#BF0605]">
                <div className="leading-none text-white">
                  <span className="block text-[19px] font-bold tracking-wide">
                    MATRÍCULAS
                  </span>

                  <span className="block text-[28px] font-extrabold leading-7">
                    ABERTAS
                  </span>
                </div>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="mt-5 items-center grid gap-14">
              
              {/* Textos */}
              <div className="max-w-2xl text-center md:text-left">
                <h1 className="text-5xl leading-[0.98] tracking-[-0.04em] sm:text-6xl lg:text-[72px] mb-5">
                  <span className="font-thin">
                    Escola de excelência,
                  </span>

                  <h1 className="font-medium bg-gradient-to-r from-[#3DA9E0] via-[#3445F4] to-[#BF0605] bg-clip-text text-transparent">perto de você.</h1>

                </h1>

                <p className="max-w-xl text-2xl leading-relaxed text-[#02277E]">
                  <b>Qualidade de ensino, acolhimento </b>e uma formação completa para seu filho, <b>aqui mesmo no Caiuby.</b>
                </p>
              </div>

              {/* Formulário */}
              <div className="relative">
                
                <div className="rounded-[30px] bg-white p-7 shadow-2xl sm:p-9 mb-10">
                  
                  <h2 className="text-2xl font-light leading-tight text-[#21458A] sm:text-[28px]">
                    Preencha e{" "}
                    <strong className="font-bold">
                      agende uma visita
                    </strong>
                  </h2>

                  <form className="mt-7" onSubmit={handleSubmit}>
                    <div className="mb-4 flex items-center justify-between text-xs font-bold uppercase tracking-[0.14em] text-[#21458A]/70">
                      <span>Etapa {currentStep + 1}</span>
                      <span>{currentStep + 1}/{steps.length}</span>
                    </div>

                    <label
                      htmlFor={steps[currentStep].key}
                      className="mb-2 block text-sm font-bold text-[#182A4A]"
                    >
                      {steps[currentStep].label}
                    </label>

                    <input
                      id={steps[currentStep].key}
                      type={steps[currentStep].type}
                      value={steps[currentStep].value}
                      maxLength={steps[currentStep].maxLength}
                      placeholder={steps[currentStep].placeholder}
                      onChange={(event) => handleInputChange(steps[currentStep].key as keyof typeof formData, event.target.value)}
                      className="
                        h-[62px]
                        w-full
                        rounded-2xl
                        border
                        border-[#D9E2F2]
                        bg-[#F1F5FC]
                        px-5
                        text-base
                        text-[#182A4A]
                        outline-none
                        transition
                        placeholder:text-[#9EADCA]
                        focus:border-[#21458A]
                        focus:ring-2
                        focus:ring-[#21458A]/10
                      "
                    />

                    <div className="mt-5 flex gap-3">
                      {currentStep > 0 && (
                        <button
                          type="button"
                          onClick={handlePreviousStep}
                          className="flex h-[62px] flex-1 items-center justify-center rounded-full border border-[#D9E2F2] bg-white text-lg font-bold text-[#162F63] transition hover:bg-gray-300 hover:text-white"
                        >
                          Voltar
                        </button>
                      )}

                      {currentStep < steps.length - 1 ? (
                        <button
                          type="button"
                          onClick={handleNextStep}
                          disabled={!isCurrentStepValid()}
                          className="
                            flex
                            h-[62px]
                            flex-1
                            items-center
                            justify-center
                            gap-4
                            rounded-full
                            bg-gradient-to-r from-[#3DA9E0] via-[#3445F4] to-[#BF0605]
                            text-lg
                            font-bold
                            text-white
                            shadow-[0_8px_20px_rgba(255,229,0,0.18)]
                            transition
                            hover:-translate-y-0.5
                            hover:bg-[#ffea33]
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                            active:translate-y-0
                          "
                        >
                          <span>Avançar</span>

                          <span className="text-2xl font-light">
                            →
                          </span>
                        </button>
                      ) : (
                        <button
                          type="submit"
                          disabled={isSubmitting || !isCurrentStepValid()}
                          className="
                            flex
                            h-[62px]
                            flex-1
                            items-center
                            justify-center
                            gap-4
                            rounded-full
                            bg-gradient-to-r from-[#3DA9E0] via-[#3445F4] to-[#BF0605]
                            text-lg
                            font-bold
                            text-white
                            shadow-[0_8px_20px_rgba(255,229,0,0.18)]
                            transition
                            hover:-translate-y-0.5
                            hover:bg-[#ffea33]
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                            active:translate-y-0
                          "
                        >
                          <span>{isSubmitting ? 'Enviando...' : 'Enviar'}</span>

                          <span className="text-2xl font-light">
                            →
                          </span>
                        </button>
                      )}
                    </div>

                    {submitMessage && (
                      <p className="mt-4 text-sm font-medium text-[#21458A]">{submitMessage}</p>
                    )}
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>

        <span className="xl:-ml-24 xl:min-w-0 xl:self-end z-10">
          <img src={ChildImage} alt="Child" className='xl:w-full object-cover object-left'/>
        </span>

      </section>



      {/* faixa */}
      <div className="bg-[#0B1E3F] py-5">
        <div className="mx-auto flex justify-around max-w-screen text-[0.60rem] sm:text-xs font-medium tracking-[0.25em] text-white">
          <div className="text-center py-5 sm:flex-1 ml-5 sm:ml-0">
            INFANTIL
          </div>

          <div className="text-center px-8 border-x sm:px-none sm:flex-1 border-[#344565] py-5">
            FUND. I e II
          </div>

          <div className="text-center py-5 sm:flex-1 pr-5 md:pr-0">
            ENSINO MÉDIO
          </div>
        </div>
      </div>

      {/* diferenciais */}
      <section className="diff-section relative overflow-hidden bg-[#F3F3F1] px-4 py-20 sm:px-6 lg:px-8" id="diferenciais">

        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="flex justify-center">
            <span className="inline-flex rounded-xl px-5 py-2 text-sm uppercase tracking-[0.1em] bg-[#0571F9] text-[#FFF] shadow-sm">
              Diferenciais
            </span>
          </div>

          <h2 className="mt-7 text-center text-3xl font-semibold leading-tight tracking-[-0.05em] text-[#0E2F67] sm:text-5xl lg:text-[64px]">
            Tudo o que seu filho precisa,
            <br />
            <span className='bg-gradient-to-r from-[#3DA9E0] via-[#3445F4] to-[#BF0605] bg-clip-text text-transparent'>mais perto da sua família.</span>
          </h2>

          <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-[28px] bg-[#eaf1ff]/80 shadow-[0_10px_30px_rgba(19,50,113,0.08)] ring-1 ring-[#e3ecff] backdrop-blur-sm"
              >
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="h-40 w-full rounded-t-[22px] object-cover"
                />

                <div className="mt-5 text-[#0E2F67] p-4">
                  <h3 className="text-2xl font-black leading-snug tracking-[-0.05em] whitespace-pre-line">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-base leading-relaxed text-[#21458A]/80 whitespace-pre-line">
                    {feature.description}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <a href="#">
              <button
                type="button"
                className="inline-flex items-center gap-4 rounded-full bg-gradient-to-r from-[#3DA9E0] via-[#3445F4] to-[#BF0605] px-9 py-4 text-md text-white shadow-[0_18px_35px_rgba(14,47,103,0.25)] transition hover:-translate-y-0.5 hover:bg-[#123d87]"
              >
                QUERO AGENDAR UMA VISITA
                <span className="text-2xl leading-none">→</span>
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* proposta */}
      <section className="proposal-section relative overflow-hidden px-4 py-20 sm:px-6 lg:px-10 text-[#01205F]">
        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.08fr_1fr]">
          <div className="max-w-[570px]">
            <span className="inline-flex rounded-full px-5 py-2 text-[11px] uppercase tracking-[0.18em] bg-[#0571F9] text-white shadow-sm">
              Proposta
            </span>

            <h2 className="mt-7 text-4xl font-semibold leading-[0.95] tracking-[-0.04em] text-white sm:text-5xl">
              <span className="block text-[#01205F]">Excelência que você</span>
              <span className="bg-gradient-to-r from-[#3DA9E0] via-[#3445F4] to-[#BF0605] bg-clip-text text-transparent">
                percebe de perto.
              </span>
            </h2>

            <div className="mt-8 space-y-4 text-[17px] leading-relaxed text-[#01205F] sm:text-[22px] mb-12">
              <div className="flex items-center gap-3">
                <span className="h-5 w-[1.5px] bg-[#0571F9]" />
                <p className="m-0 font-bold">Uma boa formação vai muito além do conteúdo.</p>
              </div>

              <p className="max-w-xl leading-relaxed sm:text-xl text-[#01205F]">
                No Dó Ré Mi, cada aluno é estimulado <b>a aprender, participar, desenvolver autonomia</b> e se preparar para os próximos desafios, sempre com o <b className='text-[#0571F9]'>acompanhamento próximo</b> de professores e equipe pedagógica.
                <br />
                <br />
                Aqui, <b>acolhimento e qualidade de ensino</b> caminham juntos.
              </p>
            </div>

            <a href="#">
              <button
                type="button"
                className="inline-flex items-center gap-4 rounded-full bg-gradient-to-r from-[#3DA9E0] via-[#3445F4] to-[#BF0605] px-9 py-4 text-md text-white shadow-[0_18px_35px_rgba(14,47,103,0.25)] transition hover:-translate-y-0.5 hover:bg-[#123d87]"
              >
                QUERO CONHECER A ESCOLA
                <span className="text-2xl leading-none">→</span>
              </button>
            </a>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="proposal-collage">
              <div className="proposal-card proposal-card-main">
                <img src={Child2Image} alt="Aluno sorrindo em sala de aula" />
              </div>

              <div className="proposal-card proposal-card-top">
                <img src={School3Image} alt="Área para crianças." />
              </div>

              <div className="proposal-card proposal-card-bottom">
                <img src={School4Image} alt="Banco temático em formato de lápis" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* carousel */}
      <section className="relative overflow-hidden bg-[#f4f4f2] px-4 py-16 sm:px-6 lg:px-8" id="estrutura-experiencias">
        <div className="mx-auto max-w-6xl">
          <div className="flex justify-center">
            <span className="inline-flex rounded-full bg-[#0571F9] px-4 py-2 text-[12px] font-normal uppercase tracking-[0.16em] text-white shadow-sm">
              Estrutura & Experiências
            </span>
          </div>

          <h2 className="mt-8 text-center text-4xl font-medium leading-[0.95] tracking-[-0.05em] text-[#102E6B] sm:text-5xl lg:text-[50px]">
            Um ambiente preparado para
            <br />
            <span className="bg-gradient-to-r from-[#3DA9E0] via-[#3445F4] to-[#BF0605] bg-clip-text text-transparent">
              aprender, conviver e crescer
            </span>
          </h2>

          <div className="mt-12 flex items-center justify-center gap-4 md:gap-6">
            <button
              type="button"
              aria-label="Voltar"
              onClick={() => setActiveIndex((current) => (current - 1 + slides.length) % slides.length)}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1C5CA8] text-2xl font-light text-white shadow-[0_12px_24px_rgba(28,92,168,0.25)] transition hover:-translate-y-0.5 md:h-16 md:w-16"
            >
              ←
            </button>

            <div className="grid w-full max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
              {visibleSlides.map((slide, index) => {
                const isCenter = isMobile ? true : index === 1

                return (
                  <article
                    key={`${slide.title}-${index}`}
                    className={`carousel-card ${isCenter ? 'carousel-card--center' : 'carousel-card--side'} relative overflow-hidden rounded-[30px] shadow-[0_20px_40px_rgba(1,18,45,0.18)]`}
                  >
                    <img src={slide.image} alt={slide.title} className="h-[260px] w-full object-cover sm:h-[320px] md:h-[420px]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 px-5 pb-5">
                      <span className="text-2xl font-black tracking-[-0.04em] text-white sm:text-3xl">{slide.title}</span>
                    </div>
                  </article>
                )
              })}
            </div>

            <button
              type="button"
              aria-label="Próximo"
              onClick={() => setActiveIndex((current) => (current + 1) % slides.length)}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1C5CA8] text-2xl font-light text-white shadow-[0_12px_24px_rgba(28,92,168,0.25)] transition hover:-translate-y-0.5 md:h-16 md:w-16"
            >
              →
            </button>
          </div>

          <div className="mt-12 flex justify-center">
            <a href="#">
              <button
                type="button"
                className="inline-flex items-center gap-4 rounded-full bg-gradient-to-r from-[#3DA9E0] via-[#3445F4] to-[#BF0605] px-9 py-4 text-md text-white shadow-[0_18px_35px_rgba(14,47,103,0.25)] transition hover:-translate-y-0.5 hover:bg-[#123d87]"
              >
                QUERO AGENDAR UMA VISITA
                <span className="text-2xl leading-none">→</span>
              </button>
            </a>
          </div>
        </div>
      </section>

      <section className="location-section relative overflow-hidden bg-[#F4F4F2] px-4 pb-20 sm:px-6 lg:px-8" id="localizacao">
        <div className="location-scroll-indicator">
          <span>↓</span>
        </div>

        <div className="relative z-10 mx-auto max-w-5xl text-center mt-16">
          <div className="flex justify-center">
            <span className="inline-flex rounded-full bg-[#0571F9] px-4 py-2 text-[12px] font-normal uppercase tracking-[0.16em] text-white shadow-sm">
              Localização
            </span>
          </div>

          <h2 className="mt-8 text-2xl md:text-4xl font-semibold leading-[0.95] tracking-[-0.05em] text-[#102E6B] sm:text-5xl lg:text-[40px]">
            Uma escola de qualidade
            <br />
            <span className="bg-gradient-to-r from-[#3DA9E0] via-[#3445F4] to-[#BF0605] bg-clip-text text-transparent">
              sem precisar ir longe.
            </span>
          </h2>

          <div className="location-map-wrap mt-10">
            <div className="location-map-card">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3660.616895811047!2d-46.3255666!3d-23.438202399999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce7dae34be9afb%3A0x159956d739df733d!2zQ09Mw4lHSU8gRMOTIFLDiSBNSQ!5e0!3m2!1spt-BR!2sbr!4v1790601840590!5m2!1spt-BR!2sbr"
                loading="lazy"
                className="location-map-iframe"
                referrerPolicy="no-referrer-when-downgrade"
              />

              <div className="location-address-bar">
                Rod. Alberto Hinoto, 6468 - Jardim Mossapyra, Itaquaquecetuba - SP, 08588-001
              </div>
            </div>
          </div>

          <div className="relative z-10 mx-auto max-w-3xl text-center mt-6 text-[#102E6B]">
            <p>
              <b>Estudar perto de casa</b> significa uma <b>rotina mais prática para os pais</b> e mais qualidade de vida para os alunos. E quando essa proximidade vem acompanhada de <b>ensino de qualidade, acolhimento</b> e uma equipe presente, a escolha fica ainda mais completa.
            </p>
          </div>


          <div className="mt-10 flex justify-center">
            <a href="#">
              <button
                type="button"
                className="inline-flex items-center gap-4 rounded-full bg-gradient-to-r from-[#3DA9E0] via-[#3445F4] to-[#BF0605] px-9 py-4 text-md text-white shadow-[0_18px_35px_rgba(14,47,103,0.25)] transition hover:-translate-y-0.5 hover:bg-[#123d87]"
              >
                QUERO AGENDAR UMA VISITA
                <span className="text-2xl leading-none">→</span>
              </button>
            </a>
          </div>
        </div>
      </section>

      <div className="divisor flex justify-center text-center">
        <div className="bg-[#0B1E3F]/75 w-full h-full py-[20vh] text-white">
          <p className='font-semibold'>VENHA CONHECER DE PERTO</p>
          <h1 className='text-5xl sm:text-6xl lg:text-[72px]'>
            Escola de Excelência,
            <br />
            <span className='font-semibold'>
              perto de você.
            </span>
          </h1>
        </div>
      </div>

      <section className="faq-section" id="faq">
        <div className="faq-wrap">
          <div className="faq-left">
            <span className="faq-badge bg-[#0571F9] text-white">FAQ</span>
            <p className='text-3xl md:text-5xl font-semibold text-[#102E6B] mb-10'>Perguntas que toda mãe e pai faz</p>
            <a href="#">
              <button
                type="button"
                className="inline-flex items-center gap-4 rounded-full bg-gradient-to-r from-[#3DA9E0] via-[#3445F4] to-[#BF0605] px-9 py-4 text-md text-white shadow-[0_18px_35px_rgba(14,47,103,0.25)] transition hover:-translate-y-0.5 hover:bg-[#123d87]"
              >
                AGENDAR UMA VISITA
                <span className="text-2xl leading-none">→</span>
              </button>
            </a>
          </div>

          <div className="faq-right">
            {faqItems.map((item, index) => {
              const isOpen = openFaq === index

              return (
                <div key={item.question} className={`faq-item ${isOpen ? 'is-open' : ''}`}>
                  <button
                    type="button"
                    className="faq-question"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    aria-expanded={isOpen}
                  >
                    <span>{item.question}</span>
                    <span className="faq-icon">{isOpen ? '−' : '+'}</span>
                  </button>

                  {isOpen && <p className="faq-answer">{item.answer}</p>}
                </div>
              )
            })}
          </div>
        </div>
      </section>


      {/* float wpp button */}
      <a
        href="https://wa.me/5511922225421?text=Ol%C3%A1%2C%20gostaria%20de%20saber%20mais%20sobre%20as%20matr%C3%ADculas."
        target="_blank"
        rel="noopener noreferrer"
        className="text-3xl fixed bottom-5 right-5 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105"
      >
        <IoLogoWhatsapp/>
      </a>

      <Footer />
    </>
  )
}

export default App
