import { useEffect, useState } from 'react'
import { Check, Minus, Plus } from 'lucide-react'
import { pageContent as pageContentA, type MediaItem } from './config/content'
import { pageContentB } from './config/contentB'
import { links } from './config/links'
import { seo } from './config/seo'
import { theme } from './config/theme'
import { withAttributionParams } from './utils/attribution'
import { trackCheckout, trackVisitOnce } from './utils/panel'
import Panel from './panel/Panel'

type SituationItem = { eyebrow?: string; title: string; text: string; help?: string }
type SituationsData = { title: string; subtitle?: string; items: SituationItem[]; closing?: string }

// O mesmo bloco de situações da original. Na versão B ele ocupa, por enquanto,
// o lugar da prova social, até os depoimentos reais chegarem.
function SituationsSection({ s }: { s: SituationsData }) {
  return <section className="section section-muted"><div className="container"><h2>{s.title}</h2>{s.subtitle ? <p className="section-subtitle">{s.subtitle}</p> : null}<div className={`card-grid count-${s.items.length} situations-grid`}>{s.items.map(item => <article className="content-card situation" key={item.title}>{item.eyebrow ? <span className="eyebrow">{item.eyebrow}</span> : null}<h3>{item.title}</h3><p>{item.text}</p>{item.help ? <p className="situation-help"><strong>Como o protocolo ajuda:</strong> {item.help}</p> : null}</article>)}</div>{s.closing ? <p className="situations-closing">{s.closing}</p> : null}</div></section>
}

const placeholder = (item: MediaItem, priority = false) => item.src ? (
  <img src={item.src} alt={item.alt} loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'} />
) : <div className="placeholder" role="img" aria-label={item.alt}><span>{item.label}</span><small>{item.ratio === '3:2' ? '1200 × 800' : item.ratio === '3:4' ? '1200 × 1600' : item.ratio === '2:3' ? '1200 × 1800' : '1200 × 1200'} • {item.ratio}</small></div>

function Button({ children, onClick, href, kind = 'primary' }: { children: React.ReactNode; onClick?: () => void; href?: string; kind?: 'primary' | 'secondary' }) {
  const className = `button button-${kind}`
  return href ? <a className={className} href={href} onClick={onClick}>{children}</a> : <button className={className} type="button" onClick={onClick}>{children}</button>
}

const isCopyPage = () => window.location.pathname.replace(/\/$/, '').startsWith('/copy')
const currentContent = () => (isCopyPage() ? pageContentB : pageContentA)

function UrgencyBar() {
  const formatDate = () => new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date())
  const [localDate, setLocalDate] = useState(formatDate)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const scheduleNextDay = () => {
      const now = new Date()
      const nextDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
      timer = setTimeout(() => {
        setLocalDate(formatDate())
        scheduleNextDay()
      }, nextDay.getTime() - now.getTime() + 100)
    }
    scheduleNextDay()
    return () => clearTimeout(timer)
  }, [])

  if (!currentContent().urgencyBar.enabled) return null
  return <div className="urgency">{currentContent().urgencyBar.text} {localDate}</div>
}

function Price({ data }: { data: { previousPrice: string; installmentCount: number; installmentValue: string; cashValue: string } }) {
  const ready = data.previousPrice || data.installmentValue || data.cashValue
  return <div className="price" aria-label={ready ? 'Preço da oferta' : 'Preço a definir'}>
    <span className="price-before"><s>{data.previousPrice ? `De ${data.previousPrice}` : 'Preço anterior a definir'}</s> por apenas</span>
    {data.installmentCount && data.installmentValue ? <strong>{`${data.installmentCount}x de ${data.installmentValue}`}</strong> : null}
    <span>ou <b>{data.cashValue || 'valor a definir'}</b> à vista no PIX</span>
  </div>
}

function Modules() {
  const [open, setOpen] = useState<number[]>([])
  const toggle = (index: number) => setOpen(old => old.includes(index) ? old.filter(item => item !== index) : [...old, index])
  return <div className={`card-grid count-${currentContent().modules.length}`}>{currentContent().modules.map((item, index) => {
    const expanded = open.includes(index)
    return <article className="content-card" key={item.eyebrow}>
      <div className="square-media">{placeholder(item)}</div><span className="eyebrow">{item.eyebrow}</span><h3>{item.title}</h3>
      <button className="accordion-trigger" onClick={() => toggle(index)} aria-expanded={expanded} aria-controls={`module-${index}`}><span>Clique aqui</span>{expanded ? <Minus /> : <Plus />}</button>
      <div className="accordion-panel" id={`module-${index}`} hidden={!expanded}><p>{item.description}</p></div>
    </article>
  })}</div>
}

type FeatureItem = string | { label: string; value?: string }

const FeatureList = ({ items }: { items: readonly FeatureItem[] }) => <ul className="feature-list">{items.map(item => {
  const label = typeof item === 'string' ? item : item.label
  const value = typeof item === 'string' ? '' : item.value
  return <li key={label}><Check aria-hidden="true" /><span>{label}{value && <> <s className="bonus-value">{value}</s></>}</span></li>
})}</ul>

function App() {
  const [faqOpen, setFaqOpen] = useState<number | null>(0)
  const c = currentContent()
  const variant = isCopyPage() ? 'b' : 'a'
  useEffect(() => {
    trackVisitOnce(variant)
    document.title = seo.title
    const setMeta = (attribute: 'name' | 'property', key: string, content: string) => {
      if (!content) return
      let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
      if (!tag) { tag = document.createElement('meta'); tag.setAttribute(attribute, key); document.head.append(tag) }
      tag.content = content
    }
    setMeta('name', 'description', seo.description)
    setMeta('name', 'robots', seo.robots)
    setMeta('property', 'og:title', seo.ogTitle)
    setMeta('property', 'og:description', seo.ogDescription)
    setMeta('property', 'og:image', seo.ogImage)
    if (seo.canonical) {
      let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
      if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.append(canonical) }
      canonical.href = seo.canonical
    }
    Object.entries({ '--brand-primary': theme.brand.primary, '--brand-primary-dark': theme.brand.primaryDark, '--brand-primary-light': theme.brand.primaryLight, '--cta-color': theme.cta.color, '--cta-dark': theme.cta.dark, '--cta-light': theme.cta.light }).forEach(([key, value]) => document.documentElement.style.setProperty(key, value))
  }, [])
  if (window.location.pathname.replace(/\/$/, '') === '/painel') return <Panel />
  return <>
    <UrgencyBar />
    <main>
      <section className="hero"><div className="container hero-inner"><div className="hero-media">{placeholder({ src: c.hero.image, alt: c.hero.imageAlt, label: 'Mockup do Web App na tela do celular', ratio: '3:2' }, true)}</div>{'eyebrow' in c.hero && c.hero.eyebrow ? <span className="hero-eyebrow">{c.hero.eyebrow}</span> : null}<h1>{c.hero.headline}</h1><p className="lead">{c.hero.body}</p>{c.hero.bullets && <ul className="hero-bullets">{c.hero.bullets.map(b => <li key={b}><Check aria-hidden="true" /><span>{b}</span></li>)}</ul>}<div className="hero-action"><Button onClick={() => document.getElementById('ofertas')?.scrollIntoView({ behavior: 'smooth' })}>{c.hero.ctaLabel}</Button><img src={c.hero.securityImage} alt={c.hero.securityImageAlt} /></div></div></section>
      <SituationsSection s={c.situations} />
      <section className="section"><div className="container"><h2>{c.modulesSection.title}</h2>{'subtitle' in c.modulesSection && c.modulesSection.subtitle && <p className="section-subtitle">{c.modulesSection.subtitle}</p>}<Modules />{'closingLabel' in c.modulesSection && c.modulesSection.closingLabel ? <p className="modules-closing"><strong>{c.modulesSection.closingLabel}:</strong> {c.modulesSection.closingText}</p> : null}</div></section>
      {isCopyPage() ? <SituationsSection s={pageContentA.situations} /> : null}
      <section className="section section-muted"><div className="container"><h2>{c.bonusesSection.title}</h2><div className={`card-grid count-${c.bonuses.length}`}>{c.bonuses.map(item => <article className="content-card bonus" key={item.eyebrow}><div className="square-media">{placeholder(item)}</div><span className="eyebrow">🎁 {item.eyebrow}: incluso na oferta</span><h3>{item.title}</h3><p>{item.description}</p>{item.value && <s>{item.value}</s>}</article>)}</div></div></section>
      <section className="section section-light" id="ofertas"><div className="container"><h2>{c.offersSection.title}</h2><div className="offers offers-single">
        <article className="offer-card featured">{c.offers.complete.badge && <span className="offer-badge">{c.offers.complete.badge}</span>}<h3>{c.offers.complete.title}</h3>{'subtitle' in c.offers.complete && c.offers.complete.subtitle && <p className="offer-subtitle">{c.offers.complete.subtitle}</p>}<FeatureList items={c.offers.complete.items} /><Price data={c.offers.complete} /><div className="offer-action"><Button onClick={() => trackCheckout(variant)} href={(isCopyPage() ? links.checkoutCopy || links.checkoutComplete : links.checkoutComplete) ? withAttributionParams(isCopyPage() ? links.checkoutCopy || links.checkoutComplete : links.checkoutComplete) : links.checkoutSimple ? withAttributionParams(links.checkoutSimple) : undefined}>{c.offers.complete.ctaLabel}</Button><img src={c.offersSection.paymentSecurityImage} alt={c.offersSection.paymentSecurityAlt} loading="lazy" /></div></article>
      </div></div></section>
      <section className="section section-light"><div className="container guarantee"><img className="guarantee-seal" src={c.guarantee.image} alt={c.guarantee.imageAlt} loading="lazy" /><div><h2>{c.guarantee.title}</h2><p>{c.guarantee.body}</p></div></div></section>
      <section className="section"><div className="container narrow"><h2>{c.faqSection.title}</h2><div className="faq">{c.faq.map((item, index) => { const expanded = faqOpen === index; return <div className="faq-item" key={item.question}><button onClick={() => setFaqOpen(expanded ? null : index)} aria-expanded={expanded} aria-controls={`faq-${index}`}><span>{item.question}</span>{expanded ? <Minus /> : <Plus />}</button><div id={`faq-${index}`} hidden={!expanded}><p>{item.answer}</p></div></div> })}</div></div></section>
    </main>
    <footer><div className="container"><strong>{c.footer.brand}</strong><p>{c.footer.copyright}</p><nav aria-label="Links legais">{links.privacy && <a href={links.privacy}>Privacidade</a>}{links.terms && <a href={links.terms}>Termos</a>}{links.support && <a href={links.support}>Suporte</a>}</nav></div></footer>
  </>
}

export default App
