import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useViewStore from '../../store/useViewStore'

const NAV_ITEMS = [
  { id: 'hero', label: 'Home' },
  { id: 'services', label: 'Services' },
  { id: 'booking', label: 'Book Now' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')
  const scrollProgress = useViewStore((s) => s.scrollProgress)

  useEffect(() => {
    if (scrollProgress < 0.3) setActiveSection('hero')
    else if (scrollProgress < 0.7) setActiveSection('services')
    else setActiveSection('booking')
  }, [scrollProgress])

  const scrollToSection = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
    setMobileOpen(false)
  }

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50 nav-glass"
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '80px' }}>
            {/* Logo */}
            <motion.button
              onClick={() => scrollToSection('hero')}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'none', border: 'none', cursor: 'pointer' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden' }}>
                <img
                  src="/aerohawk-logo.png"
                  alt="Aerohawk Logo"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
              <div>
                <span style={{ fontFamily: 'var(--font-accent)', fontSize: '20px', fontWeight: 700, letterSpacing: '0.08em', display: 'block', lineHeight: 1 }}>
                  <span className="gradient-text">AERO</span>
                  <span style={{ color: '#F0F4F8' }}>HAWK</span>
                </span>
                <span style={{ fontSize: '10px', letterSpacing: '0.3em', color: '#94A3B8', textTransform: 'uppercase', display: 'block' }}>
                  Service
                </span>
              </div>
            </motion.button>

            {/* Desktop Nav */}
            <div className="hidden md:flex" style={{ alignItems: 'center', gap: '4px' }}>
              {NAV_ITEMS.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  style={{
                    position: 'relative',
                    padding: '10px 20px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: 500,
                    fontFamily: 'var(--font-accent)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: activeSection === item.id ? '#00D4FF' : '#94A3B8',
                    transition: 'color 0.3s ease',
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onMouseEnter={(e) => { if (activeSection !== item.id) e.target.style.color = '#F0F4F8' }}
                  onMouseLeave={(e) => { if (activeSection !== item.id) e.target.style.color = '#94A3B8' }}
                >
                  {item.label}
                  {activeSection === item.id && (
                    <motion.div
                      layoutId="navIndicator"
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '32px',
                        height: '2px',
                        borderRadius: '1px',
                        background: '#00D4FF',
                        boxShadow: '0 0 12px rgba(0, 212, 255, 0.6)',
                      }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </motion.button>
              ))}

              <motion.button
                onClick={() => scrollToSection('booking')}
                style={{
                  marginLeft: '16px',
                  padding: '10px 24px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 600,
                  fontFamily: 'var(--font-accent)',
                  background: 'linear-gradient(135deg, #00D4FF, #7C3AED)',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                }}
                whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0, 212, 255, 0.4)' }}
                whileTap={{ scale: 0.95 }}
              >
                Get a Quote
              </motion.button>
            </div>

            {/* Mobile Hamburger */}
            <motion.button
              className="md:hidden"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', gap: '6px', background: 'none', border: 'none', cursor: 'pointer' }}
              onClick={() => setMobileOpen(!mobileOpen)}
              whileTap={{ scale: 0.9 }}
            >
              <motion.span style={{ width: '24px', height: '2px', background: '#F0F4F8', borderRadius: '1px', display: 'block' }} animate={mobileOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }} transition={{ duration: 0.3 }} />
              <motion.span style={{ width: '24px', height: '2px', background: '#F0F4F8', borderRadius: '1px', display: 'block' }} animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }} transition={{ duration: 0.3 }} />
              <motion.span style={{ width: '24px', height: '2px', background: '#F0F4F8', borderRadius: '1px', display: 'block' }} animate={mobileOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }} transition={{ duration: 0.3 }} />
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 40,
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              background: 'rgba(10, 22, 40, 0.92)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '32px',
            }}
          >
            {NAV_ITEMS.map((item, i) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                onClick={() => scrollToSection(item.id)}
                style={{
                  fontSize: '30px', fontWeight: 700, fontFamily: 'var(--font-heading)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: activeSection === item.id ? '#00D4FF' : '#F0F4F8',
                }}
              >
                {item.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
