import { bump, checkKey, dayKey, emptyCounters, json, loadCounters, type Counters, type PagesCtx } from '../_lib'

export const onRequestGet = async ({ request, env }: PagesCtx): Promise<Response> => {
  if (!env.TRACK_KV) return json({ error: 'kv_not_bound' }, 503)
  const denied = checkKey(request, env)
  if (denied) return denied
  const totals = await loadCounters(env.TRACK_KV, 'total')
  const days: Array<{ date: string } & Counters> = []
  const totalsB = await loadCounters(env.TRACK_KV, 'total:b')
  const daysB: Array<{ date: string } & Counters> = []
  for (let i = 0; i < 30; i++) {
    const d = new Date(Date.now() - i * 86400000)
    const key = dayKey(d)
    const c = await loadCounters(env.TRACK_KV, `d:${key}`)
    if (Object.values(c).some(v => typeof v === 'number' && v > 0)) days.push({ date: key, ...c })
    const cb = await loadCounters(env.TRACK_KV, `d:${key}:b`)
    if (Object.values(cb).some(v => typeof v === 'number' && v > 0)) daysB.push({ date: key, ...cb })
  }
  return json({ totals, days, totalsB, daysB })
}

export const onRequestPost = async ({ request, env }: PagesCtx): Promise<Response> => {
  if (!env.TRACK_KV) return json({ error: 'kv_not_bound' }, 503)
  const denied = checkKey(request, env)
  if (denied) return denied
  let body: { qty?: number; revenue?: number; date?: string }
  try { body = await request.json() } catch { return json({ error: 'bad_json' }, 400) }
  const qty = Math.max(0, Math.floor(Number(body.qty) || 0))
  const revenue = Math.max(0, Number(body.revenue) || 0)
  if (!qty && !revenue) return json({ error: 'empty_sale' }, 400)
  const date = typeof body.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.date) ? body.date : undefined
  await bump(env.TRACK_KV, c => { c.sales_qty += qty; c.sales_revenue = Math.round((c.sales_revenue + revenue) * 100) / 100 }, date)
  const totals = await loadCounters(env.TRACK_KV, 'total')
  return json({ ok: true, totals, empty: emptyCounters() })
}
