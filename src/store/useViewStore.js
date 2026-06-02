import { create } from 'zustand'

// Scroll phase thresholds
const PHASE_THRESHOLDS = {
  heroEnd: 0.25,
  serviceEnd: 0.65,
}

// Character reaches for handle during scroll 0.12 → 0.18
const REACH_START = 0.12
const REACH_END = 0.18

// Door opens during scroll 0.18 → 0.25
const DOOR_OPEN_START = 0.18
const DOOR_OPEN_END = 0.25

// Room cleans during scroll 0.35 → 0.60
const CLEAN_START = 0.35
const CLEAN_END = 0.60

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

  // Derived: character reach progress (0 = idle, 1 = hand on handle)
  characterReachProgress: 0,

  // Derived: door opening progress (0 = closed, 1 = fully open)
  doorProgress: 0,

  // Derived: dirty-to-clean transition (0 = dirty, 1 = pristine)
  cleanProgress: 0,

  // Actions
  setScroll: (progress) => {
    const p = clamp01(progress)

    // Determine phase
    let scrollPhase = 'result'
    if (p <= PHASE_THRESHOLDS.heroEnd) scrollPhase = 'hero'
    else if (p <= PHASE_THRESHOLDS.serviceEnd) scrollPhase = 'service'

    // Character reach progress
    const characterReachProgress = p < REACH_START
      ? 0
      : p > REACH_END
        ? 1
        : clamp01((p - REACH_START) / (REACH_END - REACH_START))

    // Door progress
    const doorProgress = p < DOOR_OPEN_START
      ? 0
      : p > DOOR_OPEN_END
        ? 1
        : clamp01((p - DOOR_OPEN_START) / (DOOR_OPEN_END - DOOR_OPEN_START))

    // Clean progress
    const cleanProgress = p < CLEAN_START
      ? 0
      : p > CLEAN_END
        ? 1
        : clamp01((p - CLEAN_START) / (CLEAN_END - CLEAN_START))

    set({
      scrollProgress: p,
      scrollPhase,
      characterReachProgress,
      doorProgress,
      cleanProgress,
    })
  },

  setMouse: (pos) => set({ mousePosition: pos }),
}))

export default useViewStore
