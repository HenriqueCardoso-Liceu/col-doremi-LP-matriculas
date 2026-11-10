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
                <h1 className="mb-5 text-5xl leading-[0.98] tracking-[-0.04em] sm:text-6xl lg:text-[72px]">
                  <span className="font-thin">
                    Escola de excelência,
                  </span>

                  <h1 className="font-medium bg-gradient-to-r from-[#3DA9E0] via-[#3445F4] to-[#BF0605] bg-clip-text text-transparent">perto de você.</h1>

                </h1>

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
                    {formFields.map((field) => (
                      <div className="mb-4" key={field.key}>
                        <label
                          htmlFor={field.key}
                          className="mb-2 block text-sm font-bold text-[#182A4A]"
                        >
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
                      </div>
                    ))}

                    <div className="mt-5 flex gap-3">
                      <button
                        type="submit"
                        disabled={isSubmitting || !isFormValid()}
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
