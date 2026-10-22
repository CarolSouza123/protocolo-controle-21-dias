import { useCallback, useEffect, useState } from 'react'

type Counters = {
  visits: number; visits_bio: number; visits_paid: number; visits_other: number
  checkout_clicks: number; checkout_bio: number; sales_qty: number; sales_revenue: number
}
type Day = { date: string } & Counters
type Stats = { totals: Counters; days: Day[] }

const KEY_STORE = 'p21_admin_key'
const pct = (a: number, b: number) => (b > 0 ? `${((a / b) * 100).toFixed(1).replace('.', ',')}%` : '0%')
const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const fmtDate = (iso: string) => { const [y, m, d] = iso.split('-'); return `${d}/${m}/${y}` }

function errorMessage(status: number, error: string): string {
  if (error === 'kv_not_bound') return 'Armazenamento ainda não vinculado. No Cloudflare, vincule o KV como TRACK_KV e tente o deploy de novo.'
  if (error === 'admin_key_missing') return 'Chave do painel ainda não cadastrada. No Cloudflare, crie a variável ADMIN_KEY e tente o deploy de novo.'
  if (status === 401) return 'Chave errada. Tenta de novo.'
  return 'Não consegui carregar o painel agora. Tenta de novo em instantes.'
}

export default function Panel() {
  const [key, setKey] = useState(() => { try { return window.sessionStorage.getItem(KEY_STORE) || '' } catch { return '' } })
  const [input, setInput] = useState('')
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState('')
  const [qty, setQty] = useState('1')
  const [value, setValue] = useState('27,00')
  const [saved, setSaved] = useState('')

  const load = useCallback(async (k: string) => {
    if (!k) return
    setError('')
    try {
      const res = await fetch('/api/stats', { headers: { 'x-admin-key': k } })
      const data = await res.json().catch(() => ({})) as Stats & { error?: string }
      if (!res.ok) { setStats(null); setError(errorMessage(res.status, data.error || '')); return }
      setStats(data)
      try { window.sessionStorage.setItem(KEY_STORE, k) } catch { /* ok */ }
    } catch { setError('Não consegui carregar o painel agora. Tenta de novo em instantes.') }
  }, [])

  useEffect(() => { if (key) void load(key) }, [key, load])

  const submitKey = () => { const k = input.trim(); if (k) { setKey(k); void load(k) } }

  const submitSale = async () => {
    const q = parseInt(qty, 10) || 0
    const v = parseFloat(value.replace(/\./g, '').replace(',', '.')) || 0
    if (!q && !v) return
    setSaved('')
    try {
      const res = await fetch('/api/stats', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-admin-key': key },
        body: JSON.stringify({ qty: q, revenue: v }),
      })
      if (!res.ok) { setError('Não consegui salvar a venda. Confere a chave e tenta de novo.'); return }
      setSaved('Venda lançada.')
      await load(key)
    } catch { setError('Não consegui salvar a venda agora.') }
  }

  if (!stats) {
    return <main className="panel-wrap">
      <div className="panel-card panel-login">
        <h1>Painel da LP</h1>
        <p>Protocolo 21 Dias, números do funil.</p>
        <input type="password" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && submitKey()} placeholder="Sua chave" aria-label="Sua chave" />
        <button type="button" onClick={submitKey}>Entrar</button>
        {error && <p className="panel-error">{error}</p>}
      </div>
    </main>
  }

  const t = stats.totals
  return <main className="panel-wrap">
    <div className="panel-head">
      <h1>Painel da LP</h1>
      <button type="button" className="panel-refresh" onClick={() => void load(key)}>Atualizar</button>
    </div>
    {error && <p className="panel-error">{error}</p>}
    <section className="panel-grid">
      <div className="panel-card"><span>Entradas na LP</span><strong>{t.visits}</strong><small>Da bio: {t.visits_bio} • Pagas: {t.visits_paid} • Outras: {t.visits_other}</small></div>
      <div className="panel-card"><span>Cliques no checkout</span><strong>{t.checkout_clicks}</strong><small>Da bio: {t.checkout_bio} • {pct(t.checkout_clicks, t.visits)} das entradas</small></div>
      <div className="panel-card"><span>Compras lançadas</span><strong>{t.sales_qty}</strong><small>{pct(t.sales_qty, t.checkout_clicks)} dos cliques no checkout</small></div>
      <div className="panel-card"><span>Receita lançada</span><strong>{brl(t.sales_revenue)}</strong><small>Ticket médio: {t.sales_qty ? brl(t.sales_revenue / t.sales_qty) : brl(0)}</small></div>
    </section>
    <section className="panel-card">
      <h2>Lançar venda</h2>
      <p className="panel-hint">A plataforma de pagamento não avisa o site, então lança aqui as vendas do dia. Quantidade e valor total.</p>
      <div className="panel-form">
        <label>Qtd. <input inputMode="numeric" value={qty} onChange={e => setQty(e.target.value)} /></label>
        <label>Valor total (R$) <input inputMode="decimal" value={value} onChange={e => setValue(e.target.value)} /></label>
        <button type="button" onClick={() => void submitSale()}>Salvar</button>
      </div>
      {saved && <p className="panel-saved">{saved}</p>}
    </section>
    <section className="panel-card">
      <h2>Últimos dias</h2>
      {stats.days.length === 0 ? <p className="panel-hint">Ainda sem movimento registrado.</p> : (
        <table className="panel-table">
          <thead><tr><th>Dia</th><th>Entradas</th><th>Bio</th><th>Checkout</th><th>Compras</th><th>Receita</th></tr></thead>
          <tbody>{stats.days.map(d => <tr key={d.date}><td>{fmtDate(d.date)}</td><td>{d.visits}</td><td>{d.visits_bio}</td><td>{d.checkout_clicks}</td><td>{d.sales_qty}</td><td>{brl(d.sales_revenue)}</td></tr>)}</tbody>
        </table>
      )}
    </section>
  </main>
}
