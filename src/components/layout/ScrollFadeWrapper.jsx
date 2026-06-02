import { useMemo } from 'react'
import { motion } from 'framer-motion'
import useViewStore from '../../store/useViewStore'

/**
 * Wraps a section in a fixed overlay that fades in/out based on scroll progress.
 *
 * @param {number} fadeIn      - Scroll progress where fade-in begins (opacity 0 → 1)
 * @param {number} activeStart - Scroll progress where section is fully visible
 * @param {number} activeEnd   - Scroll progress where fade-out begins
 * @param {number} fadeOut     - Scroll progress where section is fully invisible
 * @param {React.ReactNode} children
 */
export default function ScrollFadeWrapper({
  fadeIn = 0,
  activeStart = 0,
  activeEnd = 1,
  fadeOut = 1,
  children,
}) {
  const scrollProgress = useViewStore((s) => s.scrollProgress)

  const opacity = useMemo(() => {
    if (scrollProgress < fadeIn) return 0
    if (scrollProgress >= fadeOut) return 0
    if (scrollProgress >= activeStart && scrollProgress <= activeEnd) return 1

    // Fading in
    if (scrollProgress < activeStart) {
      const range = activeStart - fadeIn
      return range > 0 ? Math.min(1, (scrollProgress - fadeIn) / range) : 1
    }

    // Fading out
    if (scrollProgress > activeEnd) {
      const range = fadeOut - activeEnd
      return range > 0 ? Math.max(0, 1 - (scrollProgress - activeEnd) / range) : 0
    }

    return 1
  }, [scrollProgress, fadeIn, activeStart, activeEnd, fadeOut])

  const isInvisible = opacity <= 0.01

  return (
    <div
      className="scroll-fixed-overlay"
      style={{
        opacity,
        pointerEvents: isInvisible ? 'none' : 'auto',
        visibility: isInvisible ? 'hidden' : 'visible',
        transition: 'opacity 0.05s linear',
      }}
    >
      {children}
    </div>
  )
}
