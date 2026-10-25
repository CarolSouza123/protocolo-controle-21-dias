const VISIT_KEY = 'p21_visit_tracked'

export type Origin = 'bio' | 'paid' | 'other'
export type Variant = 'a' | 'b'

export function currentVariant(): Variant {
  try {
    return window.location.pathname.replace(/\/$/, '').startsWith('/copy') ? 'b' : 'a'
  } catch {
    return 'a'
  }
}

export function classifyOrigin(): Origin {
  try {
    if (window.location.pathname.replace(/\/$/, '') === '/copy/bio') return 'bio'
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

function send(event: 'visit' | 'checkout', variant: Variant) {
  try {
    const payload = JSON.stringify({ event, origin: classifyOrigin(), variant })
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/track', new Blob([payload], { type: 'application/json' }))
    } else {
      void fetch('/api/track', { method: 'POST', headers: { 'content-type': 'application/json' }, body: payload, keepalive: true })
    }
  } catch {
    // Rastreio nunca pode travar a página.
  }
}

export function trackVisitOnce(variant: Variant = currentVariant()) {
  try {
    const key = `${VISIT_KEY}_${variant}`
    if (window.sessionStorage.getItem(key)) return
    window.sessionStorage.setItem(key, '1')
  } catch { /* segue e conta */ }
  send('visit', variant)
}

export function trackCheckout(variant: Variant = currentVariant()) {
  send('checkout', variant)
}
