import { useEffect, useState } from 'react'
import './styles/landing.css'
import './styles/success.css'
import Footer from './components/Footer'
import SuccessScreen from './components/SuccessScreen'

import ChildImage from './assets/images/child.png'
import Logo from './assets/logo.png'

import { IoLogoWhatsapp } from "react-icons/io"

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
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname)
  const [formData, setFormData] = useState({
    responsibleName: '',
    whatsapp: '',
    interestSeries: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')

  useEffect(() => {
    const handleLocationChange = () => setCurrentPath(window.location.pathname)

    window.addEventListener('popstate', handleLocationChange)

    return () => {
      window.removeEventListener('popstate', handleLocationChange)
    }
  }, [])

  if (currentPath === '/sucesso') {
    return <SuccessScreen />
  }

  const formFields = [
    {
      key: 'responsibleName',
      label: 'Nome do responsável',
      placeholder: 'Como podemos te chamar...',
      type: 'text',
      value: formData.responsibleName,
      minLength: 2,
    },
    {
      key: 'whatsapp',
      label: 'WhatsApp',
      placeholder: '(11) 99999-9999',
      type: 'tel',
      value: formData.whatsapp,
      minLength: 14,
      maxLength: 15,
    },
    {
      key: 'interestSeries',
      label: 'Série de interesse',
      placeholder: 'Ex.: 1º ano do ensino fundamental',
      type: 'text',
      value: formData.interestSeries,
      minLength: 2,
    },
  ] as const

  const isFormValid = () =>
    formData.responsibleName.trim().length >= 2
    && normalizeWhatsapp(formData.whatsapp).length >= 10
    && formData.interestSeries.trim().length >= 2

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === 'whatsapp' ? formatWhatsApp(value) : value,
    }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!isFormValid()) {
      return
    }

    if (!apiUrl) {
      setSubmitMessage('O formulário está temporariamente indisponível. Tente novamente mais tarde.')
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
      <section className="hero text-[#01205F]">
        <div className="hero-side-bg" />

        <div className="hero-content">
          <div className="relative mx-auto w-full max-w-7xl">

            {/* Topo */}
            <div className="hero-topbar">

              {/* Logo */}
              <div className="hero-logo">
                <img src={Logo} alt="Colégio Dó Ré Mi" />
              </div>

              {/* Matrículas abertas */}
              <div className="hero-enroll">
                <div className="leading-none text-white">
                  <span className="hero-enroll-top">MATRÍCULAS</span>
                  <span className="hero-enroll-bottom">ABERTAS</span>
                </div>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="hero-body">

              {/* Textos */}
              <div className="max-w-2xl text-center md:text-left">
                <h1 className="hero-title">
                  <span className="font-thin">
                    Escola de excelência,
                  </span>

                  <span className="hero-title-gradient">perto de você.</span>
                </h1>
              </div>

              {/* Formulário */}
              <div className="hero-form-wrap">
                <div className="hero-card">

                  <h2 className="hero-card-title">
                    Preencha e{" "}
                    <strong className="font-bold">
                      agende uma visita
                    </strong>
                  </h2>

                  <form className="hero-form" onSubmit={handleSubmit}>
                    <div className="hero-fields">
                      {formFields.map((field) => (
                        <div key={field.key}>
                          <label htmlFor={field.key} className="hero-label">
                            {field.label}
                          </label>

                          <input
                            id={field.key}
                            type={field.type}
                            value={field.value}
                            minLength={field.minLength}
                            maxLength={'maxLength' in field ? field.maxLength : undefined}
                            placeholder={field.placeholder}
                            required
                            onChange={(event) => handleInputChange(field.key, event.target.value)}
                            className="hero-input"
                          />
                        </div>
                      ))}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || !isFormValid()}
                      className="hero-submit"
                    >
                      <span>{isSubmitting ? 'Enviando...' : 'Enviar'}</span>
                      <span className="hero-submit-arrow">→</span>
                    </button>

                    {submitMessage && (
                      <p className="hero-message">{submitMessage}</p>
                    )}
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>

        <img src={ChildImage} alt="Alunos do Colégio Dó Ré Mi" className="hero-child" />

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
