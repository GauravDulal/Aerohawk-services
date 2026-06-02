import { motion } from 'framer-motion'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.3 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 40, filter: 'blur(10px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
}

const letterVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: 0.5 + i * 0.04, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  }),
}

export default function HeroSection() {
  const line1 = 'PRECISION'
  const line2 = 'CLEANING'

  return (
    <motion.section
      id="hero"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      className="section-hero"
    >
      <div style={{ textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}>
        {/* Badge */}
        <motion.div variants={itemVariants} style={{ marginBottom: '24px' }}>
          <span style={{
            display: 'inline-block', padding: '6px 16px', borderRadius: '999px',
            fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase',
            color: '#00D4FF', border: '1px solid rgba(0, 212, 255, 0.2)',
            fontFamily: 'var(--font-accent)',
          }}>
            Next-Gen Cleaning Solutions
          </span>
        </motion.div>

        {/* Heading */}
        <div style={{ fontFamily: 'var(--font-heading)', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
            {line1.split('').map((ch, i) => (
              <motion.span key={`a${i}`} custom={i} variants={letterVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="gradient-text-white"
                style={{ fontSize: 'clamp(48px, 10vw, 128px)', fontWeight: 800, lineHeight: 1.05, display: 'inline-block' }}>
                {ch}
              </motion.span>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', marginTop: '4px' }}>
            {line2.split('').map((ch, i) => (
              <motion.span key={`b${i}`} custom={i + line1.length} variants={letterVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="gradient-text"
                style={{ fontSize: 'clamp(48px, 10vw, 128px)', fontWeight: 800, lineHeight: 1.05, display: 'inline-block' }}>
                {ch}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Subtitle */}
        <motion.p variants={itemVariants} style={{
          fontSize: '18px', color: '#94A3B8', maxWidth: '600px', margin: '0 auto 40px',
          fontWeight: 300, lineHeight: 1.7, fontFamily: 'var(--font-body)',
        }}>
          Premium commercial & residential cleaning across Australia.
          Redefining spotless with cutting-edge precision.
        </motion.p>

        {/* CTA */}
        <motion.div variants={itemVariants} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
          <motion.button
            className="animate-pulse-glow"
            onClick={() => {
              const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
              window.scrollTo({ top: scrollHeight * 0.74, behavior: 'smooth' })
            }}
            style={{
              padding: '16px 32px', borderRadius: '16px', fontSize: '15px', fontWeight: 600,
              fontFamily: 'var(--font-accent)', background: 'linear-gradient(135deg, #00D4FF, #7C3AED)',
              color: '#fff', border: 'none', cursor: 'pointer',
            }}
            whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(0, 212, 255, 0.5)' }}
            whileTap={{ scale: 0.95 }}>
            Book Your Service
          </motion.button>
          <motion.button
            className="glass glass-hover"
            onClick={() => {
              const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
              window.scrollTo({ top: scrollHeight * 0.34, behavior: 'smooth' })
            }}
            style={{
              padding: '16px 32px', borderRadius: '16px', fontSize: '15px', fontWeight: 600,
              fontFamily: 'var(--font-accent)', color: '#F0F4F8', border: 'none', cursor: 'pointer',
              background: 'transparent',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}>
            Explore Services →
          </motion.button>
        </motion.div>
      </div>

      {/* Stats */}
      <motion.div variants={itemVariants}
        className="glass-overlay"
        style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '48px', marginTop: '80px', padding: '24px 40px', borderRadius: '20px' }}>
        {[
          { value: '500+', label: 'Projects Completed' },
          { value: '99%', label: 'Client Satisfaction' },
          { value: '24/7', label: 'Support Available' },
        ].map((stat) => (
          <div key={stat.label} style={{ textAlign: 'center' }}>
            <div className="gradient-text" style={{ fontSize: '32px', fontWeight: 700, fontFamily: 'var(--font-heading)', marginBottom: '4px' }}>{stat.value}</div>
            <div style={{ fontSize: '11px', letterSpacing: '0.15em', color: '#94A3B8', textTransform: 'uppercase' }}>{stat.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Scroll indicator */}
      <motion.div variants={itemVariants} style={{ position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '11px', color: '#94A3B8', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Scroll</span>
        <div style={{ width: '20px', height: '32px', borderRadius: '999px', border: '1px solid rgba(0, 212, 255, 0.3)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '4px' }}>
          <motion.div style={{ width: '4px', height: '8px', borderRadius: '999px', background: '#00D4FF' }} animate={{ y: [0, 12, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} />
        </div>
      </motion.div>
    </motion.section>
  )
}
