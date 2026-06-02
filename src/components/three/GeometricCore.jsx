import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useViewStore from '../../store/useViewStore'

const DAMP_FACTOR = 2.5

/* ---------- single bubble component ---------- */
function Bubble({ basePos, size, speed, phaseOffset }) {
  const ref = useRef()
  const mat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#88e0f3'),
        emissive: new THREE.Color('#00D4FF'),
        emissiveIntensity: 0.08,
        metalness: 0.05,
        roughness: 0,
        clearcoat: 1.0,
        clearcoatRoughness: 0,
        transparent: true,
        opacity: 0.35,
        side: THREE.FrontSide,
        envMapIntensity: 2,
      }),
    []
  )

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    const { scrollProgress } = useViewStore.getState()

    // floating bob
    ref.current.position.x = basePos[0] + Math.sin(t * speed * 0.6 + phaseOffset) * 0.3
    ref.current.position.y =
      basePos[1] + Math.sin(t * speed + phaseOffset) * 0.5 + scrollProgress * -1.5
    ref.current.position.z = basePos[2] + Math.cos(t * speed * 0.4 + phaseOffset) * 0.2

    // subtle wobble via non-uniform scale
    const wobble = 1 + Math.sin(t * 3 + phaseOffset) * 0.04
    ref.current.scale.set(size * wobble, size * (2 - wobble), size * wobble)

    // iridescence-like color shift via hue rotation
    const hue = (0.52 + Math.sin(t * 0.5 + phaseOffset) * 0.06) % 1
    mat.color.setHSL(hue, 0.6, 0.75)
    mat.emissive.setHSL(hue, 0.9, 0.4)
    mat.opacity = 0.25 + Math.sin(t * 1.5 + phaseOffset) * 0.1
  })

  return (
    <mesh ref={ref} position={basePos} material={mat}>
      <sphereGeometry args={[1, 48, 48]} />
    </mesh>
  )
}

/* ---------- water droplet component ---------- */
function WaterDrop({ basePos, size, speed, phaseOffset }) {
  const ref = useRef()
  const mat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#00bfff'),
        emissive: new THREE.Color('#005f80'),
        emissiveIntensity: 0.15,
        metalness: 0.0,
        roughness: 0.05,
        clearcoat: 1.0,
        clearcoatRoughness: 0.0,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
      }),
    []
  )

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    // slow fall + reset
    const cycle = ((t * speed * 0.3 + phaseOffset) % 6) / 6
    ref.current.position.x = basePos[0] + Math.sin(t * 0.4 + phaseOffset) * 0.15
    ref.current.position.y = basePos[1] + 3 - cycle * 6
    ref.current.position.z = basePos[2]
    // fade out near bottom
    mat.opacity = 0.5 * (1 - cycle)
    // Teardrop shape via scale
    ref.current.scale.set(size, size * 1.4, size)
  })

  return (
    <mesh ref={ref} position={basePos} material={mat}>
      <sphereGeometry args={[1, 32, 32]} />
    </mesh>
  )
}

/* ---------- main scene ---------- */
export default function GeometricCore() {
  // Large hero bubble
  const mainRef = useRef()
  const mainMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#a0e8ff'),
        emissive: new THREE.Color('#00D4FF'),
        emissiveIntensity: 0.12,
        metalness: 0.05,
        roughness: 0,
        clearcoat: 1.0,
        clearcoatRoughness: 0,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide,
      }),
    []
  )

  // inner refraction sphere
  const innerRef = useRef()
  const innerMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#ffffff'),
        emissive: new THREE.Color('#00D4FF'),
        emissiveIntensity: 0.2,
        metalness: 0.9,
        roughness: 0.05,
        clearcoat: 1,
        transparent: true,
        opacity: 0.15,
        side: THREE.BackSide,
      }),
    []
  )

  useFrame((state, delta) => {
    if (!mainRef.current) return
    const t = state.clock.elapsedTime
    const { scrollProgress } = useViewStore.getState()

    // Main bubble moves with scroll
    const targetX = Math.sin(scrollProgress * Math.PI) * -2
    const targetY = Math.sin(scrollProgress * Math.PI * 0.5) * 0.5
    const targetZ = scrollProgress * -1

    mainRef.current.position.x = THREE.MathUtils.damp(mainRef.current.position.x, targetX, DAMP_FACTOR, delta)
    mainRef.current.position.y = THREE.MathUtils.damp(mainRef.current.position.y, targetY, DAMP_FACTOR, delta)
    mainRef.current.position.z = THREE.MathUtils.damp(mainRef.current.position.z, targetZ, DAMP_FACTOR, delta)

    // breathe / wobble
    const breath = 1 + Math.sin(t * 1.2) * 0.06
    const scaleBase = 1.3 - scrollProgress * 0.3
    mainRef.current.scale.set(scaleBase * breath, scaleBase * (2 - breath), scaleBase * breath)
    mainRef.current.rotation.y += delta * 0.15
    mainRef.current.rotation.z = Math.sin(t * 0.4) * 0.05

    // hue shift
    const hue = (0.52 + Math.sin(t * 0.3) * 0.05) % 1
    mainMat.color.setHSL(hue, 0.5, 0.82)
    mainMat.emissive.setHSL(hue, 0.8, 0.35)
    mainMat.emissiveIntensity = 0.1 + Math.sin(t * 2) * 0.04

    // inner sphere
    if (innerRef.current) {
      innerRef.current.position.copy(mainRef.current.position)
      innerRef.current.scale.setScalar(scaleBase * 0.85)
      innerRef.current.rotation.y -= delta * 0.1
    }
  })

  // Surrounding smaller bubbles
  const smallBubbles = useMemo(
    () => [
      { pos: [1.8, 1.2, -0.5], size: 0.35, speed: 0.8, phase: 0 },
      { pos: [-1.5, 0.8, 0.5], size: 0.25, speed: 1.0, phase: 1.5 },
      { pos: [2.2, -0.5, -1], size: 0.2, speed: 1.2, phase: 3.0 },
      { pos: [-2, -0.8, 0], size: 0.3, speed: 0.7, phase: 4.5 },
      { pos: [0.5, 1.8, -0.8], size: 0.15, speed: 1.4, phase: 2.0 },
      { pos: [-0.8, -1.5, 0.3], size: 0.22, speed: 0.9, phase: 5.5 },
      { pos: [1.2, -1.2, 0.8], size: 0.18, speed: 1.1, phase: 1.0 },
      { pos: [-1.8, 1.5, -0.3], size: 0.28, speed: 0.65, phase: 3.5 },
      { pos: [0.3, 0.5, 1.2], size: 0.12, speed: 1.5, phase: 0.7 },
      { pos: [-0.5, 2.0, 0.5], size: 0.16, speed: 1.3, phase: 4.0 },
    ],
    []
  )

  // Water droplets
  const drops = useMemo(
    () => [
      { pos: [3, 2, -2], size: 0.08, speed: 1.0, phase: 0 },
      { pos: [-3, 2, -1], size: 0.06, speed: 1.3, phase: 1.5 },
      { pos: [2.5, 2, 0], size: 0.07, speed: 0.9, phase: 3 },
      { pos: [-2, 2, 1], size: 0.05, speed: 1.1, phase: 4.5 },
      { pos: [1, 2, -1.5], size: 0.06, speed: 1.4, phase: 2 },
    ],
    []
  )

  return (
    <group>
      {/* Main soap bubble */}
      <mesh ref={mainRef} material={mainMat}>
        <sphereGeometry args={[1, 64, 64]} />
      </mesh>

      {/* Inner reflection layer */}
      <mesh ref={innerRef} material={innerMat}>
        <sphereGeometry args={[1, 48, 48]} />
      </mesh>

      {/* Small surrounding bubbles */}
      {smallBubbles.map((b, i) => (
        <Bubble
          key={i}
          basePos={b.pos}
          size={b.size}
          speed={b.speed}
          phaseOffset={b.phase}
        />
      ))}

      {/* Water droplets falling */}
      {drops.map((d, i) => (
        <WaterDrop
          key={`drop-${i}`}
          basePos={d.pos}
          size={d.size}
          speed={d.speed}
          phaseOffset={d.phase}
        />
      ))}
    </group>
  )
}
