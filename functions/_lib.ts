export interface Env {
  TRACK_KV?: KVNamespace
  ADMIN_KEY?: string
}

export interface Counters {
  visits: number
  visits_bio: number
  visits_paid: number
  visits_other: number
  checkout_clicks: number
  checkout_bio: number
  sales_qty: number
  sales_revenue: number
}

export const emptyCounters = (): Counters => ({
  visits: 0, visits_bio: 0, visits_paid: 0, visits_other: 0,
  checkout_clicks: 0, checkout_bio: 0, sales_qty: 0, sales_revenue: 0,
})

export const dayKey = (date = new Date()): string => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(date)
  return parts
}

export const json = (data: unknown, status = 200): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  })

export async function loadCounters(kv: KVNamespace, key: string): Promise<Counters> {
  try {
    const raw = await kv.get(key)
    if (!raw) return emptyCounters()
    return { ...emptyCounters(), ...(JSON.parse(raw) as Partial<Counters>) }
  } catch {
    return emptyCounters()
  }
}

export async function bump(kv: KVNamespace, fn: (c: Counters) => void, dateKey?: string): Promise<void> {
  const day = dateKey || dayKey()
  const [d, t] = await Promise.all([loadCounters(kv, `d:${day}`), loadCounters(kv, 'total')])
  fn(d); fn(t)
  await Promise.all([kv.put(`d:${day}`, JSON.stringify(d)), kv.put('total', JSON.stringify(t))])
}

export function checkKey(request: Request, env: Env): Response | null {
  if (!env.ADMIN_KEY) return json({ error: 'admin_key_missing' }, 503)
  const url = new URL(request.url)
  const provided = request.headers.get('x-admin-key') || url.searchParams.get('key') || ''
  if (provided !== env.ADMIN_KEY) return json({ error: 'unauthorized' }, 401)
  return null
}

export type PagesCtx = { request: Request; env: Env }
