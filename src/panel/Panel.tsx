import { useCallback, useEffect, useRef, useState } from 'react'

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
const todaySP = (): string => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
const shiftDay = (iso: string, delta: number): string => { const d = new Date(`${iso}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + delta); return d.toISOString().slice(0, 10) }
const zero: Counters = { visits: 0, visits_bio: 0, visits_paid: 0, visits_other: 0, checkout_clicks: 0, checkout_bio: 0, sales_qty: 0, sales_revenue: 0 }
const sumDays = (days: Day[]): Counters => days.reduce((acc, d) => ({
  visits: acc.visits + d.visits, visits_bio: acc.visits_bio + d.visits_bio, visits_paid: acc.visits_paid + d.visits_paid,
  visits_other: acc.visits_other + d.visits_other, checkout_clicks: acc.checkout_clicks + d.checkout_clicks,
  checkout_bio: acc.checkout_bio + d.checkout_bio, sales_qty: acc.sales_qty + d.sales_qty,
  sales_revenue: Math.round((acc.sales_revenue + d.sales_revenue) * 100) / 100,
}), { ...zero })
type RangeKey = 'hoje' | 'ontem' | '7d' | '30d' | 'tudo' | 'custom'
const RANGE_LABELS: Array<{ key: RangeKey; label: string }> = [
  { key: 'hoje', label: 'Hoje' }, { key: 'ontem', label: 'Ontem' }, { key: '7d', label: 'Últimos 7 dias' },
  { key: '30d', label: 'Últimos 30 dias' }, { key: 'tudo', label: 'Tudo' }, { key: 'custom', label: 'Personalizado' },
]


type ParsedSale = { id: string; date: string; revenue: number; product: string; kind: string }
type ImportPreview = {
  fileName: string; totalRows: number; sales: ParsedSale[]; revenue: number
  ignored: Array<{ reason: string; count: number }>
  byProduct: Array<{ label: string; qty: number; revenue: number }>
  columnsNote: string; hasId: boolean
}

const norm = (v: unknown): string => String(v ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
const findCol = (headers: string[], groups: string[][]): number => {
  for (const keys of groups) { const i = headers.findIndex(h => keys.some(k => h.includes(k))); if (i >= 0) return i }
  return -1
}
const parseMoney = (v: unknown): number => {
  if (typeof v === 'number') return v
  let t = String(v ?? '').replace(/r\$/gi, '').replace(/\s/g, '').replace(/[^\d.,-]/g, '')
  if (!t) return NaN
  if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.')
  return parseFloat(t)
}
const splitCsvLine = (line: string, delim: string): string[] => {
  const out: string[] = []; let cur = ''; let quoted = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (quoted) {
      if (ch === '"') { if (line[i + 1] === '"') { cur += '"'; i++ } else quoted = false }
      else cur += ch
    } else if (ch === '"') quoted = true
    else if (ch === delim) { out.push(cur); cur = '' }
    else cur += ch
  }
  out.push(cur)
  return out
}
const parseCsvText = (text: string): unknown[][] => {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter(l => l.trim() !== '')
  if (!lines.length) return []
  const first = lines[0]
  const delim = [';', ',', '\t'].map(d => ({ d, n: first.split(d).length })).sort((a, b) => b.n - a.n)[0].d
  return lines.map(l => splitCsvLine(l, delim))
}
const decodeCsv = async (file: File): Promise<string> => {
  const buf = await file.arrayBuffer()
  try { return new TextDecoder('utf-8', { fatal: true }).decode(buf) }
  catch { return new TextDecoder('windows-1252').decode(buf) }
}
const parseDateCell = (v: unknown): string => {
  if (v instanceof Date && !Number.isNaN(v.getTime())) { const p2 = (n: number) => String(n).padStart(2, '0'); return `${v.getFullYear()}-${p2(v.getMonth() + 1)}-${p2(v.getDate())}` }
  const t = String(v ?? '').trim()
  const br = t.match(/^(\d{2})\/(\d{2})\/(\d{4})/); if (br) return `${br[3]}-${br[2]}-${br[1]}`
  const iso = t.match(/^(\d{4})-(\d{2})-(\d{2})/); if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`
  return ''
}
const hashStr = (t: string): string => { let h = 5381; for (let i = 0; i < t.length; i++) h = ((h << 5) + h + t.charCodeAt(i)) | 0; return (h >>> 0).toString(16) }
const APPROVED = ['aprovada', 'aprovado', 'paga', 'pago', 'paid', 'approved', 'concluida', 'concluido', 'completa', 'completo', 'completed', 'sucesso', 'confirmada', 'confirmado']

async function parseSalesFile(file: File): Promise<ImportPreview> {
  let rows: unknown[][]
  if (/\.csv$/i.test(file.name)) {
    rows = parseCsvText(await decodeCsv(file))
  } else {
    const XLSX = await import('xlsx')
    const data = await file.arrayBuffer()
    const wb = XLSX.read(data, { cellDates: true })
    const ws = wb.Sheets[wb.SheetNames[0]]
    rows = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, raw: true, defval: '' })
  }
  const KEYWORDS = ['data', 'valor', 'status', 'produto', 'transacao', 'pedido', 'email', 'preco', 'total']
  let headerIdx = -1; let headers: string[] = []
  for (let i = 0; i < Math.min(rows.length, 15); i++) {
    const cells = (rows[i] || []).map(norm)
    if (cells.filter(c => KEYWORDS.some(k => c.includes(k))).length >= 2) { headerIdx = i; headers = cells; break }
  }
  if (headerIdx < 0) throw new Error('Não achei o cabeçalho da planilha. Me manda um print da primeira linha do arquivo exportado que eu ajusto o leitor.')
  const colDate = findCol(headers, [['data da venda', 'data de criacao', 'data do pagamento', 'data'], ['criado em', 'pago em']])
  const colValue = findCol(headers, [['valor total', 'valor da venda', 'valor bruto', 'valor', 'total'], ['preco', 'liquido']])
  const colStatus = findCol(headers, [['status', 'situacao']])
  let colId = findCol(headers, [['transacao', 'transaction', 'id da venda', 'id do pedido', 'codigo']])
  if (colId < 0) colId = headers.findIndex(h => h === 'id' || h.startsWith('id '))
  const colProduct = findCol(headers, [['produto', 'oferta', 'plano', 'item']])
  const colEmail = findCol(headers, [['email', 'comprador']])
  const colType = findCol(headers, [['tipo', 'origem']])
  if (colDate < 0 || colValue < 0) throw new Error(`Colunas encontradas: ${headers.filter(Boolean).join(', ')}. Não identifiquei a data ou o valor, me manda um print da planilha que eu ajusto.`)

  const sales: ParsedSale[] = []
  const ignoredMap = new Map<string, number>()
  const ignore = (reason: string) => ignoredMap.set(reason, (ignoredMap.get(reason) || 0) + 1)
  const byProductMap = new Map<string, { qty: number; revenue: number }>()
  const occurrences = new Map<string, number>()
  let totalRows = 0
  for (let r = headerIdx + 1; r < rows.length; r++) {
    const row = rows[r] || []
    if (row.every(c => String(c ?? '').trim() === '')) continue
    totalRows++
    if (colStatus >= 0) {
      const st = norm(row[colStatus])
      if (!APPROVED.some(a => st.includes(a))) { ignore(`status "${String(row[colStatus] ?? '').trim() || 'vazio'}"`); continue }
    }
    const date = parseDateCell(row[colDate])
    const revenue = parseMoney(row[colValue])
    if (!date || !Number.isFinite(revenue) || revenue < 0) { ignore('linha sem data ou valor legível'); continue }
    const product = colProduct >= 0 ? String(row[colProduct] ?? '').trim() : ''
    const typeText = `${colType >= 0 ? norm(row[colType]) : ''} ${norm(product)}`
    const kind = /bump/.test(typeText) ? 'Order bump' : /(upsell|up sell)/.test(typeText) ? 'Upsell' : 'Principal'
    const label = product || kind
    const email = colEmail >= 0 ? String(row[colEmail] ?? '').trim().toLowerCase() : ''
    const baseKey = [date, email, label, revenue.toFixed(2)].join('|')
    const occ = (occurrences.get(baseKey) || 0) + 1
    occurrences.set(baseKey, occ)
    const rawId = colId >= 0 ? String(row[colId] ?? '').trim() : ''
    const id = rawId ? `tx_${rawId}` : `h_${hashStr(`${baseKey}|${occ}`)}`
    sales.push({ id, date, revenue: Math.round(revenue * 100) / 100, product: label, kind })
    const agg = byProductMap.get(label) || { qty: 0, revenue: 0 }
    agg.qty++; agg.revenue = Math.round((agg.revenue + revenue) * 100) / 100
    byProductMap.set(label, agg)
  }
  const columnsNote = `Colunas usadas: data "${headers[colDate]}" e valor "${headers[colValue]}"${colStatus >= 0 ? `, status "${headers[colStatus]}"` : ', sem coluna de status, considerei todas as linhas como vendas'}${colId >= 0 ? `, ID "${headers[colId]}"` : ''}.`
  return {
    fileName: file.name, totalRows, sales,
    revenue: Math.round(sales.reduce((a, x) => a + x.revenue, 0) * 100) / 100,
    ignored: [...ignoredMap.entries()].map(([reason, count]) => ({ reason, count })),
    byProduct: [...byProductMap.entries()].map(([label, v]) => ({ label, qty: v.qty, revenue: v.revenue })),
    columnsNote, hasId: colId >= 0,
  }
}

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
  const [range, setRange] = useState<RangeKey>('tudo')
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<ImportPreview | null>(null)
  const [importError, setImportError] = useState('')
  const [importResult, setImportResult] = useState('')
  const [importing, setImporting] = useState(false)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

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

  const onFile = async (f: File | undefined) => {
    if (!f) return
    setImportError(''); setImportResult(''); setPreview(null)
    try { setPreview(await parseSalesFile(f)) }
    catch (e) { setImportError(e instanceof Error ? e.message : 'Não consegui ler esse arquivo.') }
  }

  const confirmImport = async () => {
    if (!preview) return
    setImporting(true); setImportError('')
    try {
      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-admin-key': key },
        body: JSON.stringify({ sales: preview.sales.map(x => ({ id: x.id, date: x.date, revenue: x.revenue })) }),
      })
      const data = await res.json().catch(() => ({})) as { added?: number; duplicates?: number; addedRevenue?: number; totals?: Counters }
      if (!res.ok || typeof data.added !== 'number') { setImportError('Não consegui importar agora. Tenta de novo.'); return }
      setImportResult(`Conferido: ${data.added} ${data.added === 1 ? 'venda nova entrou' : 'vendas novas entraram'} (${brl(data.addedRevenue || 0)}) e ${data.duplicates || 0} já estavam no painel e foram puladas, sem duplicar. Total do painel agora: ${data.totals?.sales_qty ?? 0} compras e ${brl(data.totals?.sales_revenue || 0)}.`)
      setPreview(null)
      await load(key)
    } catch { setImportError('Não consegui importar agora. Tenta de novo.') }
    finally { setImporting(false) }
  }

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

  const today = todaySP()
  const inRange = (date: string): boolean => {
    if (range === 'tudo') return true
    if (range === 'hoje') return date === today
    if (range === 'ontem') return date === shiftDay(today, -1)
    if (range === '7d') return date >= shiftDay(today, -6) && date <= today
    if (range === '30d') return date >= shiftDay(today, -29) && date <= today
    return (!from || date >= from) && (!to || date <= to)
  }
  const viewDays = stats.days.filter(d => inRange(d.date))
  const t = range === 'tudo' ? stats.totals : sumDays(viewDays)
  const funnelSteps = [
    { label: 'Entradas na LP', value: t.visits, color: '#22c55e', conv: '' },
    { label: 'Cliques no checkout', value: t.checkout_clicks, color: '#16a34a', conv: `${pct(t.checkout_clicks, t.visits)} de quem entrou` },
    { label: 'Compras', value: t.sales_qty, color: '#15803d', conv: `${pct(t.sales_qty, t.checkout_clicks)} de quem clicou no checkout` },
  ]
  return <main className="panel-wrap">
    <div className="panel-head">
      <h1>Painel da LP</h1>
      <button type="button" className="panel-refresh" onClick={() => void load(key)}>Atualizar</button>
    </div>
    {error && <p className="panel-error">{error}</p>}
    <section className="panel-card panel-filters-card">
      <div className="panel-filters">
        {RANGE_LABELS.map(r => <button key={r.key} type="button" className={`panel-chip${range === r.key ? ' active' : ''}`} onClick={() => setRange(r.key)}>{r.label}</button>)}
      </div>
      {range === 'custom' && <div className="panel-custom-range">
        <label>De <input type="date" value={from} onChange={e => setFrom(e.target.value)} /></label>
        <label>Até <input type="date" value={to} onChange={e => setTo(e.target.value)} /></label>
      </div>}
    </section>
    <section className="panel-grid">
      <div className="panel-card"><span>Entradas na LP</span><strong>{t.visits}</strong><small>Da bio: {t.visits_bio} • Pagas: {t.visits_paid} • Outras: {t.visits_other}</small></div>
      <div className="panel-card"><span>Cliques no checkout</span><strong>{t.checkout_clicks}</strong><small>Da bio: {t.checkout_bio} • {pct(t.checkout_clicks, t.visits)} das entradas</small></div>
      <div className="panel-card"><span>Compras lançadas</span><strong>{t.sales_qty}</strong><small>{pct(t.sales_qty, t.checkout_clicks)} dos cliques no checkout</small></div>
      <div className="panel-card"><span>Receita lançada</span><strong>{brl(t.sales_revenue)}</strong><small>Ticket médio: {t.sales_qty ? brl(t.sales_revenue / t.sales_qty) : brl(0)}</small></div>
    </section>
    <section className="panel-card">
      <h2>Funil do período</h2>
      {t.visits === 0 ? <p className="panel-hint">Ainda sem entradas no período selecionado.</p> : (
        <div className="funnel">
          {funnelSteps.map((step, i) => (
            <div className="funnel-row" key={step.label}>
              <div className="funnel-meta"><span>{step.label}</span><strong>{step.value}</strong><em>{i === 0 ? '100%' : pct(step.value, t.visits)}</em></div>
              <div className="funnel-track"><div className="funnel-fill" style={{ width: `${t.visits > 0 ? Math.max(step.value > 0 ? 3 : 0, (step.value / t.visits) * 100) : 0}%`, background: step.color }} /></div>
              {step.conv && <small className="funnel-conv">{step.conv}</small>}
            </div>
          ))}
          <p className="funnel-total">Conversão completa do período: {pct(t.sales_qty, t.visits)} das entradas viraram compra.</p>
        </div>
      )}
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
      <div className="panel-import">
        <h3>Importar vendas da Cakto</h3>
        <p className="panel-hint">Exporta as vendas na Cakto em XLS ou CSV e sobe o arquivo aqui. Entram só as vendas aprovadas, incluindo order bump e upsell. Venda que já foi importada não entra de novo.</p>
        <input ref={fileRef} type="file" accept=".csv,.xls,.xlsx" hidden onChange={e => { void onFile(e.target.files?.[0]); e.target.value = '' }} />
        <button type="button" onClick={() => fileRef.current?.click()}>Escolher arquivo</button>
        {importError && <p className="panel-error">{importError}</p>}
        {preview && <div className="panel-preview">
          <p><strong>{preview.fileName}</strong>: {preview.totalRows} linhas no arquivo, <strong>{preview.sales.length} vendas aprovadas somando {brl(preview.revenue)}</strong>.</p>
          {preview.byProduct.length > 0 && <ul>{preview.byProduct.map(b => <li key={b.label}>{b.label}: {b.qty} {b.qty === 1 ? 'venda' : 'vendas'}, {brl(b.revenue)}</li>)}</ul>}
          {preview.ignored.length > 0 && <p className="panel-hint">Fora da conta: {preview.ignored.map(i => `${i.count} com ${i.reason}`).join('; ')}.</p>}
          <p className="panel-hint">{preview.columnsNote}</p>
          {!preview.hasId && <p className="panel-error">Esse arquivo não tem ID de transação. A conferência usa data, e-mail, produto e valor, e funciona bem se você importar sempre o arquivo completo do período, sem editar as linhas.</p>}
          <div className="panel-form">
            <button type="button" onClick={() => void confirmImport()} disabled={importing || preview.sales.length === 0}>{importing ? 'Importando...' : `Importar ${preview.sales.length} vendas`}</button>
            <button type="button" className="panel-cancel" onClick={() => setPreview(null)}>Cancelar</button>
          </div>
        </div>}
        {importResult && <p className="panel-saved">{importResult}</p>}
      </div>
    </section>
    <section className="panel-card">
      <h2>Dias do período</h2>
      {viewDays.length === 0 ? <p className="panel-hint">Ainda sem movimento registrado.</p> : (
        <table className="panel-table">
          <thead><tr><th>Dia</th><th>Entradas</th><th>Bio</th><th>Checkout</th><th>Compras</th><th>Receita</th></tr></thead>
          <tbody>{viewDays.map(d => <tr key={d.date}><td>{fmtDate(d.date)}</td><td>{d.visits}</td><td>{d.visits_bio}</td><td>{d.checkout_clicks}</td><td>{d.sales_qty}</td><td>{brl(d.sales_revenue)}</td></tr>)}</tbody>
        </table>
      )}
    </section>
  </main>
}
