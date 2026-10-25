import { useEffect, useRef } from 'react'

const SLOTS = 6
const SPEED_PX_PER_SECOND = 75
const RESUME_DELAY_MS = 2500

// Carrossel de prova social da versão B: 6 espaços. Sem depoimento inventado:
// cada espaço vazio fica vazio até a Caroline subir a imagem real autorizada.
export default function TestimonialsCarousel({ items }: { items: string[] }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const pausedRef = useRef(false)
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dragRef = useRef({ startX: 0, startScroll: 0, active: false })

  const pause = () => {
    pausedRef.current = true
    if (resumeTimer.current) clearTimeout(resumeTimer.current)
  }
  const scheduleResume = () => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current)
    resumeTimer.current = setTimeout(() => { pausedRef.current = false }, RESUME_DELAY_MS)
  }

  useEffect(() => {
    let raf = 0
    let last = performance.now()
    const step = (now: number) => {
      const el = trackRef.current
      if (el && !pausedRef.current && !dragRef.current.active) {
        const dt = Math.min(now - last, 100)
        el.scrollLeft += (SPEED_PX_PER_SECOND * dt) / 1000
        if (el.scrollLeft >= el.scrollWidth / 2) el.scrollLeft -= el.scrollWidth / 2
      }
      last = now
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => {
      cancelAnimationFrame(raf)
      if (resumeTimer.current) clearTimeout(resumeTimer.current)
    }
  }, [])

  const slots = Array.from({ length: SLOTS }, (_, i) => items[i] || '')
  const doubled = [...slots, ...slots]

  return (
    <div
      ref={trackRef}
      className="testimonials-track"
      onPointerDown={e => {
        dragRef.current = { startX: e.clientX, startScroll: trackRef.current?.scrollLeft || 0, active: true }
        pause()
        try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* ok */ }
      }}
      onPointerMove={e => {
        if (!dragRef.current.active || !trackRef.current) return
        trackRef.current.scrollLeft = dragRef.current.startScroll - (e.clientX - dragRef.current.startX)
      }}
      onPointerUp={() => { dragRef.current.active = false; scheduleResume() }}
      onPointerCancel={() => { dragRef.current.active = false; scheduleResume() }}
      onTouchStart={pause}
      onTouchEnd={scheduleResume}
    >
      {doubled.map((src, i) => (
        <article className="testimonial-card" key={i} aria-label={src ? `Depoimento ${i % SLOTS + 1}` : 'Espaço reservado para depoimento'}>
          {src ? <img src={src} alt={`Depoimento ${i % SLOTS + 1}`} loading="lazy" /> : null}
        </article>
      ))}
    </div>
  )
}
