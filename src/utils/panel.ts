const VISIT_KEY = 'p21_visit_tracked'

export type Origin = 'bio' | 'paid' | 'other'

export function classifyOrigin(): Origin {
  try {
    const current = new URLSearchParams(window.location.search)
    const stored = JSON.parse(window.localStorage.getItem('lowticket_attribution') || '{}') as Record<string, string>
    const get = (k: string) => current.get(k) || stored[k] || ''
    const medium = (get('utm_medium') || '').toLowerCase()
    const source = (get('utm_source') || '').toLowerCase()
    if (medium === 'bio' || source === 'bio') return 'bio'
    if (get('fbclid') || get('gclid') || get('ttclid') || ['cpc', 'paid', 'pago', 'ads'].includes(medium)) return 'paid'
    return 'other'
  } catch {
    return 'other'
  }
}

function send(event: 'visit' | 'checkout') {
  try {
    const payload = JSON.stringify({ event, origin: classifyOrigin() })
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/track', new Blob([payload], { type: 'application/json' }))
    } else {
      void fetch('/api/track', { method: 'POST', headers: { 'content-type': 'application/json' }, body: payload, keepalive: true })
    }
  } catch {
    // Rastreio nunca pode travar a página.
  }
}

export function trackVisitOnce() {
  try {
    if (window.sessionStorage.getItem(VISIT_KEY)) return
    window.sessionStorage.setItem(VISIT_KEY, '1')
  } catch { /* segue e conta */ }
  send('visit')
}

export function trackCheckout() {
  send('checkout')
}
