import { useEffect, useCallback, useState, Suspense } from 'react'
import { useProgress } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import useViewStore from './store/useViewStore'
import ThreeScene from './components/three/ThreeScene'
import Navbar from './components/layout/Navbar'
import ScrollFadeWrapper from './components/layout/ScrollFadeWrapper'
import HeroSection from './components/views/HomeView'
import ServicesSection from './components/views/ServicesView'
import BookingSection from './components/views/BookingView'

/* ── Preloader ──────────────────────────────────────── */

function Preloader({ onComplete }) {
  const { progress, active } = useProgress()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (progress >= 100 && !active) {
      const timer = setTimeout(() => {
        setReady(true)
        onComplete?.()
      }, 400)
      return () => clearTimeout(timer)
    }
  }, [progress, active, onComplete])

  return (
    <AnimatePresence>
      {!ready && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: '#0A1628',
          }}
        >
          {/* Logo */}
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ marginBottom: '40px' }}
          >
            <img
              src="/aerohawk-logo.png"
              alt="Aerohawk"
              style={{
                width: '80px', height: '80px', objectFit: 'contain',
                filter: 'drop-shadow(0 0 20px rgba(0, 212, 255, 0.4))',
              }}
            />
          </motion.div>

          {/* Progress counter */}
          <div style={{
            fontFamily: 'var(--font-accent)', fontSize: '32px', fontWeight: 700,
            letterSpacing: '0.1em', marginBottom: '24px',
            background: 'linear-gradient(135deg, #00D4FF, #7C3AED)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            {Math.round(progress)}%
          </div>

          {/* Progress bar */}
          <div style={{
            width: '200px', height: '2px', borderRadius: '1px',
            background: 'rgba(0, 212, 255, 0.15)',
            overflow: 'hidden',
          }}>
            <motion.div
              style={{
                height: '100%', borderRadius: '1px',
                background: 'linear-gradient(90deg, #00D4FF, #7C3AED)',
              }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </div>

          {/* Label */}
          <div style={{
            marginTop: '16px', fontSize: '11px', letterSpacing: '0.2em',
            textTransform: 'uppercase', color: '#94A3B8',
            fontFamily: 'var(--font-accent)',
          }}>
            Loading Experience
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ── App ────────────────────────────────────────────── */

export default function App() {
  const setScroll = useViewStore((s) => s.setScroll)
  const setMouse = useViewStore((s) => s.setMouse)
  const [loaded, setLoaded] = useState(false)

  const handleScroll = useCallback(() => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
    const progress = scrollHeight > 0 ? window.scrollY / scrollHeight : 0
    setScroll(Math.min(Math.max(progress, 0), 1))
  }, [setScroll])

  const handleMouseMove = useCallback((e) => {
    const x = (e.clientX / window.innerWidth) * 2 - 1
    const y = -(e.clientY / window.innerHeight) * 2 + 1
    setMouse({ x, y })
  }, [setMouse])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [handleScroll, handleMouseMove])

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: '#0A1628' }}>
      {/* 3D Canvas — persistent fixed background */}
      <ThreeScene />

      {/* Preloader overlay — blocks until 3D assets are loaded */}
      <Preloader onComplete={() => setLoaded(true)} />

      {/* HTML Overlay — scroll-driven sections */}
      <div id="html-overlay" style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.5s ease' }}>
        <Navbar />

        {/* Scroll spacer — drives total scroll length for the narrative */}
        <div className="scroll-spacer" />

        {/* Hero section — visible at start, fades before door opens */}
        <ScrollFadeWrapper fadeIn={0} activeStart={0} activeEnd={0.14} fadeOut={0.20}>
          <HeroSection />
        </ScrollFadeWrapper>

        {/* Services section — visible during dirty→clean room phase */}
        <ScrollFadeWrapper fadeIn={0.30} activeStart={0.34} activeEnd={0.52} fadeOut={0.58}>
          <ServicesSection />
        </ScrollFadeWrapper>

        {/* Booking section — visible during pristine room phase */}
        <ScrollFadeWrapper fadeIn={0.68} activeStart={0.72} activeEnd={1.0} fadeOut={1.01}>
          <BookingSection />
        </ScrollFadeWrapper>

        {/* Footer */}
        <footer className="site-footer">
          <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src="/aerohawk-logo.png" alt="Aerohawk" style={{ width: '24px', height: '24px', borderRadius: '4px', objectFit: 'contain' }} />
              <span style={{ fontSize: '14px', color: '#94A3B8', fontFamily: 'var(--font-body)' }}>
                © 2024 Aerohawk Service. All rights reserved.
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', fontSize: '12px', color: '#94A3B8', flexWrap: 'wrap' }}>
              <span>NSW, Australia</span>
              <span>•</span>
              <span>info@aerohawk.com.au</span>
              <span>•</span>
              <span>+61 2 XXXX XXXX</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
