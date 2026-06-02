import { useEffect, useCallback } from 'react'
import useViewStore from './store/useViewStore'
import ThreeScene from './components/three/ThreeScene'
import Navbar from './components/layout/Navbar'
import ScrollFadeWrapper from './components/layout/ScrollFadeWrapper'
import HeroSection from './components/views/HomeView'
import ServicesSection from './components/views/ServicesView'
import BookingSection from './components/views/BookingView'

export default function App() {
  const setScroll = useViewStore((s) => s.setScroll)
  const setMouse = useViewStore((s) => s.setMouse)

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

      {/* HTML Overlay — scroll-driven sections */}
      <div id="html-overlay">
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
