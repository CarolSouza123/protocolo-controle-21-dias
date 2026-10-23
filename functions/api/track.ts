import { bump, json, type Env, type PagesCtx } from '../_lib'

export const onRequestPost = async ({ request, env }: PagesCtx): Promise<Response> => {
  if (!env.TRACK_KV) return json({ error: 'kv_not_bound' }, 503)
  let body: { event?: string; origin?: string }
  try { body = await request.json() } catch { return json({ error: 'bad_json' }, 400) }
  const origin = body.origin === 'bio' || body.origin === 'paid' ? body.origin : 'other'
  if (body.event === 'visit') {
    await bump(env.TRACK_KV, c => {
      c.visits += 1
      if (origin === 'bio') c.visits_bio += 1
      else if (origin === 'paid') c.visits_paid += 1
      else c.visits_other += 1
    })
    return json({ ok: true })
  }
  if (body.event === 'checkout') {
    await bump(env.TRACK_KV, c => {
      c.checkout_clicks += 1
      if (origin === 'bio') c.checkout_bio += 1
      else if (origin === 'paid') c.checkout_paid += 1
      else c.checkout_other += 1
    })
    return json({ ok: true })
  }
  return json({ error: 'unknown_event' }, 400)
}
