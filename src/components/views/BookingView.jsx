import { useState } from 'react'
import { motion } from 'framer-motion'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 40, filter: 'blur(8px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
}

const SERVICE_OPTIONS = [
  'Commercial Cleaning', 'Residential Cleaning', 'Window & Facade',
  'Post-Construction', 'Carpet & Upholstery', 'Specialized Sanitization',
]

export default function BookingSection() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', service: '', date: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setFormData({ name: '', email: '', phone: '', service: '', date: '', message: '' })
    }, 4000)
  }

  return (
    <motion.section
      id="booking"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.05 }}
      className="section-content"
    >
      {/* Header */}
      <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 48px' }}>
        <motion.span variants={itemVariants} style={{
          display: 'inline-block', padding: '6px 16px', borderRadius: '999px',
          fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase',
          color: '#00D4FF', border: '1px solid rgba(0, 212, 255, 0.2)',
          fontFamily: 'var(--font-accent)', marginBottom: '24px',
        }}>
          Get Started
        </motion.span>

        <motion.h2 variants={itemVariants} style={{
          fontSize: 'clamp(32px, 6vw, 56px)', fontWeight: 800, lineHeight: 1.1,
          fontFamily: 'var(--font-heading)', marginBottom: '24px',
        }}>
          <span className="gradient-text-white">Book Your </span>
          <span className="gradient-text">Service</span>
        </motion.h2>

        <motion.p variants={itemVariants} style={{
          color: '#94A3B8', fontSize: '17px', fontWeight: 300, lineHeight: 1.7,
          fontFamily: 'var(--font-body)',
        }}>
          Tell us about your space and we'll craft a custom cleaning plan.
          Free consultation, zero obligations.
        </motion.p>
      </div>

      {/* Success State */}
      {submitted ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="form-glass glow-cyan"
          style={{ padding: '48px', textAlign: 'center', maxWidth: '420px', margin: '0 auto' }}
        >
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
            style={{ fontSize: '60px', marginBottom: '24px' }}>✓</motion.div>
          <h3 className="gradient-text" style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-heading)', marginBottom: '16px' }}>
            Request Received!
          </h3>
          <p style={{ color: '#94A3B8', fontWeight: 300, fontFamily: 'var(--font-body)' }}>
            Our team will reach out within 24 hours to confirm your booking details.
          </p>
        </motion.div>
      ) : (
        /* Form */
        <motion.form variants={itemVariants} onSubmit={handleSubmit}
          className="form-glass"
          style={{ padding: '32px', maxWidth: '680px', margin: '0 auto', width: '100%', position: 'relative', overflow: 'hidden' }}
        >
          {/* Top gradient line */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, #00D4FF, #7C3AED, transparent)' }} />

          <div style={{ padding: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
              {/* Name */}
              <div>
                <label className="form-label">Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required
                  className="form-input" placeholder="John Doe" />
              </div>

              {/* Email */}
              <div>
                <label className="form-label">Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required
                  className="form-input" placeholder="john@example.com" />
              </div>

              {/* Phone */}
              <div>
                <label className="form-label">Phone Number</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                  className="form-input" placeholder="+61 4XX XXX XXX" />
              </div>

              {/* Service */}
              <div style={{ position: 'relative' }}>
                <label className="form-label">Service Type</label>
                <select name="service" value={formData.service} onChange={handleChange} required
                  className="form-input" style={{ appearance: 'none', cursor: 'pointer' }}>
                  <option value="" disabled style={{ background: '#0F1D32', color: '#94A3B8' }}>Select a service</option>
                  {SERVICE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt} style={{ background: '#0F1D32', color: '#F0F4F8' }}>{opt}</option>
                  ))}
                </select>
                <div style={{ position: 'absolute', right: 0, bottom: '14px', pointerEvents: 'none', color: '#94A3B8' }}>▾</div>
              </div>

              {/* Date - full width */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Preferred Date</label>
                <input type="date" name="date" value={formData.date} onChange={handleChange}
                  className="form-input" style={{ colorScheme: 'dark' }} />
              </div>

              {/* Message - full width */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Additional Details</label>
                <textarea name="message" value={formData.message} onChange={handleChange} rows={4}
                  className="form-input" style={{ resize: 'none' }}
                  placeholder="Tell us about your space, specific requirements, or any questions..." />
              </div>
            </div>

            {/* Submit */}
            <motion.button type="submit"
              style={{
                marginTop: '32px', width: '100%', padding: '16px', borderRadius: '16px',
                fontSize: '15px', fontWeight: 600, fontFamily: 'var(--font-accent)',
                background: 'linear-gradient(135deg, #00D4FF, #7C3AED)',
                color: '#fff', border: 'none', cursor: 'pointer',
              }}
              whileHover={{ scale: 1.02, boxShadow: '0 0 40px rgba(0, 212, 255, 0.4)' }}
              whileTap={{ scale: 0.98 }}>
              Submit Inquiry
            </motion.button>

            {/* Trust badges */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', marginTop: '24px', fontSize: '12px', color: '#94A3B8', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: '#00D4FF' }}>✓</span> Free Consultation</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: '#00D4FF' }}>✓</span> No Obligation</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: '#00D4FF' }}>✓</span> 24h Response</span>
            </div>
          </div>
        </motion.form>
      )}
    </motion.section>
  )
}
