import { motion } from 'framer-motion'

const services = [
  { icon: '🏢', title: 'Commercial Cleaning', description: 'Offices, retail spaces, and commercial facilities maintained to the highest standard with scheduled deep-cleaning programs.' },
  { icon: '🏠', title: 'Residential Cleaning', description: 'Regular maintenance and deep cleaning for homes. Move-in/move-out services with meticulous attention to every surface.' },
  { icon: '🪟', title: 'Window & Facade', description: 'High-rise and exterior cleaning using advanced equipment. Crystal-clear results for buildings of any height.' },
  { icon: '🔨', title: 'Post-Construction', description: 'Debris removal, dust extraction, and final polish after renovation or construction projects. Ready for immediate occupancy.' },
  { icon: '🛋️', title: 'Carpet & Upholstery', description: 'Professional steam cleaning and stain removal for carpets, rugs, and upholstered furniture. Allergen-free results.' },
  { icon: '🧬', title: 'Specialized Sanitization', description: 'Medical-grade disinfection for healthcare facilities, schools, and sensitive environments. COVID-safe certified protocols.' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
}

const headerVariants = {
  hidden: { opacity: 0, y: 30, filter: 'blur(8px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
}

export default function ServicesSection() {
  return (
    <motion.section
      id="services"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.05 }}
      className="section-content"
    >
      {/* Header */}
      <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 64px' }}>
        <motion.span variants={headerVariants} style={{
          display: 'inline-block', padding: '6px 16px', borderRadius: '999px',
          fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase',
          color: '#00D4FF', border: '1px solid rgba(0, 212, 255, 0.2)',
          fontFamily: 'var(--font-accent)', marginBottom: '24px',
        }}>
          What We Do
        </motion.span>

        <motion.h2 variants={headerVariants} style={{
          fontSize: 'clamp(32px, 6vw, 56px)', fontWeight: 800, lineHeight: 1.1,
          fontFamily: 'var(--font-heading)', marginBottom: '24px',
        }}>
          <span className="gradient-text-white">Our </span>
          <span className="gradient-text">Services</span>
        </motion.h2>

        <motion.p variants={headerVariants} style={{
          color: '#94A3B8', fontSize: '17px', fontWeight: 300, lineHeight: 1.7,
          fontFamily: 'var(--font-body)',
        }}>
          From daily office maintenance to specialized sanitization, we deliver
          precision cleaning solutions tailored to every environment.
        </motion.p>

        <motion.div variants={headerVariants} style={{
          width: '80px', height: '2px', borderRadius: '1px', margin: '24px auto 0',
          background: 'linear-gradient(90deg, transparent, #00D4FF, transparent)',
        }} />
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '24px',
        maxWidth: '1100px',
        margin: '0 auto',
        width: '100%',
      }}>
        {services.map((service) => (
          <motion.div key={service.title} variants={cardVariants} className="service-card" style={{ cursor: 'pointer' }}>
            {/* Hover glow */}
            <div style={{
              position: 'absolute', inset: 0, opacity: 0,
              background: 'radial-gradient(ellipse at 50% 0%, rgba(0, 212, 255, 0.08) 0%, transparent 70%)',
              transition: 'opacity 0.5s', pointerEvents: 'none',
            }}
              className="card-glow"
            />

            <div style={{ fontSize: '36px', marginBottom: '20px', position: 'relative', zIndex: 1 }}>{service.icon}</div>

            <h3 style={{
              fontSize: '20px', fontWeight: 700, color: '#F0F4F8',
              fontFamily: 'var(--font-heading)', marginBottom: '12px',
              position: 'relative', zIndex: 1, transition: 'color 0.3s',
            }}>
              {service.title}
            </h3>

            <p style={{
              color: '#94A3B8', fontSize: '14px', lineHeight: 1.7, fontWeight: 300,
              fontFamily: 'var(--font-body)', position: 'relative', zIndex: 1,
            }}>
              {service.description}
            </p>

            {/* Bottom accent */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, width: '0%', height: '2px',
              background: 'linear-gradient(90deg, #00D4FF, #7C3AED)',
              transition: 'width 0.5s ease',
            }}
              className="card-accent"
            />
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <motion.div variants={headerVariants} style={{ marginTop: '64px', textAlign: 'center' }}>
        <motion.a href="#booking"
          style={{
            padding: '16px 32px', borderRadius: '16px', fontSize: '15px', fontWeight: 600,
            fontFamily: 'var(--font-accent)', background: 'linear-gradient(135deg, #00D4FF, #7C3AED)',
            color: '#fff', textDecoration: 'none', display: 'inline-block',
          }}
          whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(0, 212, 255, 0.4)' }}
          whileTap={{ scale: 0.95 }}>
          Get Your Free Quote →
        </motion.a>
      </motion.div>

      <style>{`
        .service-card:hover .card-glow { opacity: 1 !important; }
        .service-card:hover .card-accent { width: 100% !important; }
        .service-card:hover h3 { color: #00D4FF !important; }
      `}</style>
    </motion.section>
  )
}
