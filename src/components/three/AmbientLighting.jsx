import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useViewStore from '../../store/useViewStore'

const DAMP = 4

// Phase lighting presets
const PHASE_LIGHTING = {
  hero: {
    ambient: { color: '#FFF5E6', intensity: 0.2 },
    key: { color: '#FFF5E6', intensity: 2.5, pos: [2, 4, 6] },
    fill: { color: '#00D4FF', intensity: 1.0, pos: [-3, 2, 4] },
    accent: { color: '#7C3AED', intensity: 0.6, pos: [0, -1, 3] },
  },
  service: {
    ambient: { color: '#C8D8FF', intensity: 0.15 },
    key: { color: '#E2E8F0', intensity: 2.0, pos: [3, 4, -8] },
    fill: { color: '#00D4FF', intensity: 1.5, pos: [-2, 3, -10] },
    accent: { color: '#0891B2', intensity: 0.8, pos: [0, 0, -12] },
  },
  result: {
    ambient: { color: '#FFF8F0', intensity: 0.3 },
    key: { color: '#FFF0D4', intensity: 3.0, pos: [6, 5, -20] },
    fill: { color: '#E8F0FF', intensity: 1.0, pos: [-4, 2, -22] },
    accent: { color: '#00D4FF', intensity: 0.4, pos: [0, -1, -22] },
  },
}

function getPhaseBlend(scrollProgress) {
  if (scrollProgress <= 0.25) return { from: 'hero', to: 'hero', t: 0 }
  if (scrollProgress <= 0.30)
    return { from: 'hero', to: 'service', t: (scrollProgress - 0.25) / 0.05 }
  if (scrollProgress <= 0.65) return { from: 'service', to: 'service', t: 0 }
  if (scrollProgress <= 0.70)
    return { from: 'service', to: 'result', t: (scrollProgress - 0.65) / 0.05 }
  return { from: 'result', to: 'result', t: 0 }
}

function lerpColor(c1, c2, t) {
  const color = new THREE.Color(c1)
  color.lerp(new THREE.Color(c2), t)
  return color
}

function lerpValue(a, b, t) {
  return a + (b - a) * t
}

function lerpPos(a, b, t) {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ]
}

export default function AmbientLighting() {
  const ambientRef = useRef()
  const keyRef = useRef()
  const fillRef = useRef()
  const accentRef = useRef()

  useFrame((state, delta) => {
    const { scrollProgress } = useViewStore.getState()
    const time = state.clock.elapsedTime
    const blend = getPhaseBlend(scrollProgress)

    const fromPreset = PHASE_LIGHTING[blend.from]
    const toPreset = PHASE_LIGHTING[blend.to]

    // Smoothstep the blend
    const t = blend.t * blend.t * (3 - 2 * blend.t)

    // Ambient
    if (ambientRef.current) {
      const targetColor = lerpColor(fromPreset.ambient.color, toPreset.ambient.color, t)
      const targetIntensity = lerpValue(
        fromPreset.ambient.intensity,
        toPreset.ambient.intensity,
        t
      )
      ambientRef.current.color.lerp(targetColor, delta * DAMP)
      ambientRef.current.intensity = THREE.MathUtils.damp(
        ambientRef.current.intensity,
        targetIntensity,
        DAMP,
        delta
      )
    }

    // Key light
    if (keyRef.current) {
      const targetColor = lerpColor(fromPreset.key.color, toPreset.key.color, t)
      const targetIntensity =
        lerpValue(fromPreset.key.intensity, toPreset.key.intensity, t) +
        Math.sin(time * 0.8) * 0.2
      const targetPos = lerpPos(fromPreset.key.pos, toPreset.key.pos, t)

      keyRef.current.color.lerp(targetColor, delta * DAMP)
      keyRef.current.intensity = THREE.MathUtils.damp(
        keyRef.current.intensity,
        targetIntensity,
        DAMP,
        delta
      )
      keyRef.current.position.x = THREE.MathUtils.damp(keyRef.current.position.x, targetPos[0], DAMP, delta)
      keyRef.current.position.y = THREE.MathUtils.damp(keyRef.current.position.y, targetPos[1], DAMP, delta)
      keyRef.current.position.z = THREE.MathUtils.damp(keyRef.current.position.z, targetPos[2], DAMP, delta)
    }

    // Fill light
    if (fillRef.current) {
      const targetColor = lerpColor(fromPreset.fill.color, toPreset.fill.color, t)
      const targetIntensity = lerpValue(fromPreset.fill.intensity, toPreset.fill.intensity, t)
      const targetPos = lerpPos(fromPreset.fill.pos, toPreset.fill.pos, t)

      fillRef.current.color.lerp(targetColor, delta * DAMP)
      fillRef.current.intensity = THREE.MathUtils.damp(
        fillRef.current.intensity,
        targetIntensity,
        DAMP,
        delta
      )
      fillRef.current.position.x = THREE.MathUtils.damp(fillRef.current.position.x, targetPos[0], DAMP, delta)
      fillRef.current.position.y = THREE.MathUtils.damp(fillRef.current.position.y, targetPos[1], DAMP, delta)
      fillRef.current.position.z = THREE.MathUtils.damp(fillRef.current.position.z, targetPos[2], DAMP, delta)
    }

    // Accent light
    if (accentRef.current) {
      const targetColor = lerpColor(fromPreset.accent.color, toPreset.accent.color, t)
      const targetIntensity =
        lerpValue(fromPreset.accent.intensity, toPreset.accent.intensity, t) +
        Math.sin(time * 1.2) * 0.15
      const targetPos = lerpPos(fromPreset.accent.pos, toPreset.accent.pos, t)

      accentRef.current.color.lerp(targetColor, delta * DAMP)
      accentRef.current.intensity = THREE.MathUtils.damp(
        accentRef.current.intensity,
        targetIntensity,
        DAMP,
        delta
      )
      accentRef.current.position.x = THREE.MathUtils.damp(accentRef.current.position.x, targetPos[0], DAMP, delta)
      accentRef.current.position.y = THREE.MathUtils.damp(accentRef.current.position.y, targetPos[1], DAMP, delta)
      accentRef.current.position.z = THREE.MathUtils.damp(accentRef.current.position.z, targetPos[2], DAMP, delta)
    }
  })

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.2} color="#FFF5E6" />
      <pointLight
        ref={keyRef}
        color="#FFF5E6"
        intensity={2.5}
        position={[2, 4, 6]}
        distance={30}
        decay={2}
      />
      <pointLight
        ref={fillRef}
        color="#00D4FF"
        intensity={1.0}
        position={[-3, 2, 4]}
        distance={20}
        decay={2}
      />
      <pointLight
        ref={accentRef}
        color="#7C3AED"
        intensity={0.6}
        position={[0, -1, 3]}
        distance={15}
        decay={2}
      />
    </>
  )
}
