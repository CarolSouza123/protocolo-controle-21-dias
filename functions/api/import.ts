import { bump, checkKey, json, loadCounters, type PagesCtx } from '../_lib'

type SaleIn = { id?: unknown; date?: unknown; revenue?: unknown }

export const onRequestPost = async ({ request, env }: PagesCtx): Promise<Response> => {
  if (!env.TRACK_KV) return json({ error: 'kv_not_bound' }, 503)
  const denied = checkKey(request, env)
  if (denied) return denied
  let body: { sales?: SaleIn[] }
  try { body = await request.json() } catch { return json({ error: 'bad_json' }, 400) }
  const raw = Array.isArray(body.sales) ? body.sales.slice(0, 10000) : []

  const valid: Array<{ id: string; date: string; revenue: number }> = []
  let invalid = 0
  for (const s of raw) {
    const id = typeof s?.id === 'string' ? s.id.trim() : ''
    const date = typeof s?.date === 'string' ? s.date : ''
    const revenue = Number(s?.revenue)
    if (!id || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(revenue) || revenue < 0) { invalid++; continue }
    valid.push({ id, date, revenue: Math.round(revenue * 100) / 100 })
  }

  // Deduplica dentro do proprio lote
  const seen = new Set<string>()
  const unique = valid.filter(s => (seen.has(s.id) ? false : (seen.add(s.id), true)))
  const withinFileDuplicates = valid.length - unique.length

  // Confere o que ja foi importado antes (marcador por venda no KV)
  const fresh: typeof unique = []
  for (let i = 0; i < unique.length; i += 50) {
    const batch = unique.slice(i, i + 50)
    const marks = await Promise.all(batch.map(s => env.TRACK_KV!.get(`sale:${s.id}`)))
    batch.forEach((s, idx) => { if (!marks[idx]) fresh.push(s) })
  }

  // Grava os marcadores e soma as vendas novas nos contadores do dia e no total
  const byDay = new Map<string, { qty: number; revenue: number }>()
  for (const s of fresh) {
    await env.TRACK_KV!.put(`sale:${s.id}`, JSON.stringify({ date: s.date, revenue: s.revenue }))
    const agg = byDay.get(s.date) || { qty: 0, revenue: 0 }
    agg.qty += 1
    agg.revenue = Math.round((agg.revenue + s.revenue) * 100) / 100
    byDay.set(s.date, agg)
  }
  for (const [date, agg] of byDay) {
    await bump(env.TRACK_KV!, c => {
      c.sales_qty += agg.qty
      c.sales_revenue = Math.round((c.sales_revenue + agg.revenue) * 100) / 100
    }, date)
  }

  const totals = await loadCounters(env.TRACK_KV, 'total')
  return json({
    received: raw.length,
    added: fresh.length,
    duplicates: withinFileDuplicates + (unique.length - fresh.length),
    invalid,
    addedRevenue: Math.round(fresh.reduce((acc, s) => acc + s.revenue, 0) * 100) / 100,
    totals,
  })
}
