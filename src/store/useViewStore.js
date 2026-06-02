import { create } from 'zustand'

// Scroll phase thresholds
const PHASE_THRESHOLDS = {
  heroEnd: 0.25,
  serviceEnd: 0.60,
}

// Door opens during scroll 0.18 → 0.25
const DOOR_OPEN_START = 0.18
const DOOR_OPEN_END = 0.25

// Glass wipes during scroll 0.55 → 0.60
const GLASS_WIPE_START = 0.55
const GLASS_WIPE_END = 0.60

function clamp01(v) {
  return Math.max(0, Math.min(1, v))
}

const useViewStore = create((set) => ({
  // Normalized scroll progress (0 to 1) across the whole page
  scrollProgress: 0,

  // Normalized mouse position (-1 to 1 on both axes)
  mousePosition: { x: 0, y: 0 },

  // Derived: which narrative phase
  scrollPhase: 'hero',

  // Derived: door opening progress (0 = closed, 1 = fully open)
  doorProgress: 0,

  // Derived: glass wipe progress (0 = opaque glass, 1 = fully clear)
  glassWipeProgress: 0,

  // Actions
  setScroll: (progress) => {
    const p = clamp01(progress)

    // Determine phase
    let scrollPhase = 'result'
    if (p <= PHASE_THRESHOLDS.heroEnd) scrollPhase = 'hero'
    else if (p <= PHASE_THRESHOLDS.serviceEnd) scrollPhase = 'service'

    // Door progress
    const doorProgress = p < DOOR_OPEN_START
      ? 0
      : p > DOOR_OPEN_END
        ? 1
        : clamp01((p - DOOR_OPEN_START) / (DOOR_OPEN_END - DOOR_OPEN_START))

    // Glass wipe progress
    const glassWipeProgress = p < GLASS_WIPE_START
      ? 0
      : p > GLASS_WIPE_END
        ? 1
        : clamp01((p - GLASS_WIPE_START) / (GLASS_WIPE_END - GLASS_WIPE_START))

    set({
      scrollProgress: p,
      scrollPhase,
      doorProgress,
      glassWipeProgress,
    })
  },

  setMouse: (pos) => set({ mousePosition: pos }),
}))

export default useViewStore
