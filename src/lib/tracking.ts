type TrackingWindow = Window & {
  fbq?: (...args: unknown[]) => void
  dataLayer?: unknown[]
}

const createEventId = () =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`

/**
 * Conversão de lead da LP: chamar só depois do envio confirmado pela API.
 * - Meta Pixel: evento padrão `Lead`, com `eventID` para deduplicar com a API de Conversões.
 * - GTM: evento `lead_matricula` no dataLayer (gatilho de Evento personalizado).
 * Retorna o event_id, que deve ser reutilizado se o lead for enviado à Meta pelo servidor.
 */
export function trackLead(serie: string): string {
  const w = window as TrackingWindow
  const eventId = createEventId()
  const category = serie.trim() || undefined

  try {
    w.fbq?.(
      'track',
      'Lead',
      { content_name: 'Matrícula 2027', content_category: category },
      { eventID: eventId },
    )

    w.dataLayer = w.dataLayer || []
    w.dataLayer.push({ event: 'lead_matricula', serie: category, event_id: eventId })
  } catch (error) {
    console.error('Erro ao registrar conversão de lead:', error)
  }

  return eventId
}
