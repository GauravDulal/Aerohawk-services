import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useViewStore from '../../store/useViewStore'

const DAMP = 4

/* ── Mannequin Character ─────────────────────────────── */

function DoorCharacter() {
  const groupRef = useRef()
  const rUpperArmRef = useRef()
  const rForearmRef = useRef()
  const rHandRef = useRef()
  const torsoRef = useRef()
  const bodyRef = useRef()

  const skinMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#D4A574', roughness: 0.7, metalness: 0.05 }),
    []
  )
  const uniformMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#1A2940', roughness: 0.6, metalness: 0.1 }),
    []
  )
  const bootMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#1A1A2E', roughness: 0.7, metalness: 0.15 }),
    []
  )
  const badgeMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#00D4FF',
        emissive: '#00D4FF',
        emissiveIntensity: 0.4,
        metalness: 0.5,
        roughness: 0.3,
      }),
    []
  )

  useFrame((state, delta) => {
    if (!groupRef.current) return
    const { characterReachProgress, doorProgress, scrollProgress } = useViewStore.getState()
    const t = state.clock.elapsedTime

    // Idle body sway when not reaching
    const idleSway = (1 - characterReachProgress) * Math.sin(t * 1.2) * 0.015

    // Torso leans slightly toward door during reach
    if (torsoRef.current) {
      const targetLean = characterReachProgress * -0.08 + doorProgress * -0.12
      torsoRef.current.rotation.z = THREE.MathUtils.damp(
        torsoRef.current.rotation.z,
        targetLean + idleSway,
        DAMP,
        delta
      )
    }

    // Right upper arm — reaches forward
    if (rUpperArmRef.current) {
      // Pitch forward (rotate around X to extend arm forward)
      const targetPitch = characterReachProgress * -1.3 + doorProgress * -0.3
      rUpperArmRef.current.rotation.x = THREE.MathUtils.damp(
        rUpperArmRef.current.rotation.x,
        targetPitch,
        DAMP,
        delta
      )
      // Slight outward rotation
      rUpperArmRef.current.rotation.z = THREE.MathUtils.damp(
        rUpperArmRef.current.rotation.z,
        characterReachProgress * 0.2,
        DAMP,
        delta
      )
    }

    // Right forearm — extends
    if (rForearmRef.current) {
      const targetBend = characterReachProgress * -0.6
      rForearmRef.current.rotation.x = THREE.MathUtils.damp(
        rForearmRef.current.rotation.x,
        targetBend,
        DAMP,
        delta
      )
    }

    // Whole body follows door slightly when pushing
    if (bodyRef.current) {
      const targetRotY = doorProgress * -0.3
      bodyRef.current.rotation.y = THREE.MathUtils.damp(
        bodyRef.current.rotation.y,
        targetRotY,
        DAMP,
        delta
      )
      // Step forward slightly during push
      bodyRef.current.position.z = THREE.MathUtils.damp(
        bodyRef.current.position.z,
        0.5 - doorProgress * 0.3,
        DAMP,
        delta
      )
    }

    // Fade out with door scene
    const fade = scrollProgress < 0.28
      ? 1
      : scrollProgress > 0.35
        ? 0
        : 1 - (scrollProgress - 0.28) / 0.07

    groupRef.current.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.transparent = true
        child.material.opacity = fade
      }
    })
    groupRef.current.visible = fade > 0.01
  })

  return (
    <group ref={groupRef} position={[1.8, 0, 0.5]}>
      <group ref={bodyRef}>
        {/* ── Legs ── */}
        {/* Left leg */}
        <group position={[-0.1, 0.45, 0]}>
          {/* Upper leg */}
          <mesh position={[0, 0, 0]} material={uniformMat} castShadow>
            <capsuleGeometry args={[0.06, 0.35, 6, 12]} />
          </mesh>
          {/* Lower leg */}
          <mesh position={[0, -0.4, 0]} material={uniformMat} castShadow>
            <capsuleGeometry args={[0.055, 0.3, 6, 12]} />
          </mesh>
          {/* Boot */}
          <mesh position={[0, -0.72, 0.04]} material={bootMat} castShadow>
            <boxGeometry args={[0.12, 0.1, 0.18]} />
          </mesh>
        </group>

        {/* Right leg */}
        <group position={[0.1, 0.45, 0]}>
          <mesh position={[0, 0, 0]} material={uniformMat} castShadow>
            <capsuleGeometry args={[0.06, 0.35, 6, 12]} />
          </mesh>
          <mesh position={[0, -0.4, 0]} material={uniformMat} castShadow>
            <capsuleGeometry args={[0.055, 0.3, 6, 12]} />
          </mesh>
          <mesh position={[0, -0.72, 0.04]} material={bootMat} castShadow>
            <boxGeometry args={[0.12, 0.1, 0.18]} />
          </mesh>
        </group>

        {/* ── Torso ── */}
        <group ref={torsoRef} position={[0, 0.95, 0]}>
          {/* Main torso */}
          <mesh material={uniformMat} castShadow>
            <capsuleGeometry args={[0.14, 0.35, 6, 12]} />
          </mesh>

          {/* Chest badge */}
          <mesh position={[-0.08, 0.05, 0.14]} material={badgeMat}>
            <boxGeometry args={[0.06, 0.06, 0.008]} />
          </mesh>

          {/* ── Head ── */}
          <group position={[0, 0.38, 0]}>
            {/* Neck */}
            <mesh position={[0, -0.08, 0]} material={skinMat}>
              <cylinderGeometry args={[0.04, 0.05, 0.1, 8]} />
            </mesh>
            {/* Head */}
            <mesh position={[0, 0.08, 0]} material={skinMat} castShadow>
              <sphereGeometry args={[0.1, 12, 12]} />
            </mesh>
            {/* Cap */}
            <mesh position={[0, 0.14, 0]} material={uniformMat}>
              <sphereGeometry args={[0.105, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
            </mesh>
            {/* Cap brim */}
            <mesh position={[0, 0.1, 0.05]} rotation={[0.2, 0, 0]} material={uniformMat}>
              <boxGeometry args={[0.2, 0.01, 0.1]} />
            </mesh>
          </group>

          {/* ── Left Arm (idle at side) ── */}
          <group position={[-0.2, 0.12, 0]}>
            <mesh material={uniformMat} castShadow>
              <capsuleGeometry args={[0.04, 0.25, 6, 10]} />
            </mesh>
            <mesh position={[0, -0.22, 0]} material={uniformMat} castShadow>
              <capsuleGeometry args={[0.035, 0.2, 6, 10]} />
            </mesh>
            <mesh position={[0, -0.38, 0]} material={skinMat}>
              <boxGeometry args={[0.05, 0.06, 0.03]} />
            </mesh>
          </group>

          {/* ── Right Arm (animated — reaches for handle) ── */}
          <group position={[0.2, 0.12, 0]} ref={rUpperArmRef}>
            {/* Upper arm */}
            <mesh material={uniformMat} castShadow>
              <capsuleGeometry args={[0.04, 0.25, 6, 10]} />
            </mesh>

            {/* Forearm pivot */}
            <group position={[0, -0.2, 0]} ref={rForearmRef}>
              <mesh material={uniformMat} castShadow>
                <capsuleGeometry args={[0.035, 0.2, 6, 10]} />
              </mesh>
              {/* Hand */}
              <mesh ref={rHandRef} position={[0, -0.18, 0]} material={skinMat}>
                <boxGeometry args={[0.05, 0.06, 0.03]} />
              </mesh>
            </group>
          </group>
        </group>
      </group>
    </group>
  )
}

/* ── Door Panel ──────────────────────────────────────── */

function DoorPanel({ side, width, height, thickness }) {
  const ref = useRef()
  const pivotSign = side === 'left' ? -1 : 1
  const pivotX = pivotSign * (width / 2)

  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#2B5A8C'),
        roughness: 0.4,
        metalness: 0.1,
      }),
    []
  )

  const grooveMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#1E4068'),
        roughness: 0.5,
        metalness: 0.15,
      }),
    []
  )

  useFrame((_, delta) => {
    if (!ref.current) return
    const { doorProgress } = useViewStore.getState()
    const targetAngle = doorProgress * pivotSign * (Math.PI / 2)
    ref.current.rotation.y = THREE.MathUtils.damp(
      ref.current.rotation.y,
      targetAngle,
      DAMP,
      delta
    )
  })

  return (
    <group ref={ref} position={[pivotX, 0, 0]}>
      <mesh position={[-pivotX, height / 2, 0]} material={mat} castShadow receiveShadow>
        <boxGeometry args={[width, height, thickness]} />
      </mesh>
      {/* Decorative grooves */}
      <mesh position={[-pivotX, height * 0.72, thickness / 2 + 0.005]}>
        <boxGeometry args={[width * 0.7, 0.03, 0.01]} />
        <primitive object={grooveMat} attach="material" />
      </mesh>
      <mesh position={[-pivotX, height * 0.35, thickness / 2 + 0.005]}>
        <boxGeometry args={[width * 0.7, 0.03, 0.01]} />
        <primitive object={grooveMat} attach="material" />
      </mesh>
      <mesh position={[-pivotX, height * 0.535, thickness / 2 + 0.005]}>
        <boxGeometry args={[0.03, height * 0.35, 0.01]} />
        <primitive object={grooveMat} attach="material" />
      </mesh>
    </group>
  )
}

/* ── Door Handle ─────────────────────────────────────── */

function DoorHandle({ side, doorHeight }) {
  const handleMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#E0E0E0'),
        metalness: 0.95,
        roughness: 0.12,
        envMapIntensity: 1.5,
      }),
    []
  )

  const xPos = side === 'left' ? 0.35 : -0.35
  const yPos = doorHeight * 0.48

  return (
    <group position={[xPos, yPos, 0.07]}>
      <mesh material={handleMat} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.28, 16]} />
      </mesh>
      <mesh position={[0, -0.15, 0]} rotation={[Math.PI / 2, 0, 0]} material={handleMat} castShadow>
        <torusGeometry args={[0.05, 0.01, 12, 24]} />
      </mesh>
      <mesh position={[0, 0, -0.04]}>
        <boxGeometry args={[0.08, 0.2, 0.015]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.95} roughness={0.12} envMapIntensity={1.5} />
      </mesh>
    </group>
  )
}

/* ── Aerohawk Badge ──────────────────────────────────── */

function AerohawkBadge({ doorHeight }) {
  const badgeMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#00D4FF'),
        emissive: new THREE.Color('#00D4FF'),
        emissiveIntensity: 0.8,
        metalness: 0.85,
        roughness: 0.15,
        envMapIntensity: 1.2,
      }),
    []
  )

  return (
    <group position={[0, doorHeight * 0.85, 0.07]}>
      <mesh rotation={[0, 0, Math.PI / 4]} material={badgeMat}>
        <boxGeometry args={[0.08, 0.08, 0.01]} />
      </mesh>
      <mesh>
        <ringGeometry args={[0.07, 0.085, 24]} />
        <meshStandardMaterial color="#00D4FF" emissive="#00D4FF" emissiveIntensity={0.3} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

/* ── Main Door Scene ─────────────────────────────────── */

export default function DoorScene() {
  const groupRef = useRef()

  // SCALED UP dimensions
  const doorWidth = 1.2
  const doorHeight = 3.0
  const doorThickness = 0.1
  const frameThickness = 0.15
  const frameDepth = 0.3

  const frameMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: new THREE.Color('#1A1A2E'), roughness: 0.7, metalness: 0.05 }),
    []
  )
  const wallMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: new THREE.Color('#0D1B2A'), roughness: 0.85, metalness: 0.0 }),
    []
  )
  const floorMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: new THREE.Color('#141E30'), roughness: 0.4, metalness: 0.15, envMapIntensity: 0.4 }),
    []
  )

  // Fade out as camera passes through
  useFrame(() => {
    if (!groupRef.current) return
    const { scrollProgress } = useViewStore.getState()
    const fade = scrollProgress < 0.28 ? 1 : scrollProgress > 0.35 ? 0 : 1 - (scrollProgress - 0.28) / 0.07

    groupRef.current.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.transparent = true
        child.material.opacity = fade
      }
    })
    groupRef.current.visible = fade > 0.01
  })

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Door Frame — left pillar */}
      <mesh position={[-(doorWidth + frameThickness / 2), doorHeight / 2, 0]} material={frameMat} castShadow>
        <boxGeometry args={[frameThickness, doorHeight + frameThickness, frameDepth]} />
      </mesh>

      {/* Door Frame — right pillar */}
      <mesh position={[doorWidth + frameThickness / 2, doorHeight / 2, 0]} material={frameMat} castShadow>
        <boxGeometry args={[frameThickness, doorHeight + frameThickness, frameDepth]} />
      </mesh>

      {/* Door Frame — top lintel */}
      <mesh position={[0, doorHeight + frameThickness / 2, 0]} material={frameMat} castShadow>
        <boxGeometry args={[doorWidth * 2 + frameThickness * 2, frameThickness, frameDepth]} />
      </mesh>

      {/* Threshold */}
      <mesh position={[0, -0.02, 0.05]} material={frameMat}>
        <boxGeometry args={[doorWidth * 2 + frameThickness * 2, 0.04, frameDepth + 0.1]} />
      </mesh>

      {/* Left door panel */}
      <DoorPanel side="left" width={doorWidth} height={doorHeight} thickness={doorThickness} />
      <DoorHandle side="left" doorHeight={doorHeight} />

      {/* Right door panel */}
      <DoorPanel side="right" width={doorWidth} height={doorHeight} thickness={doorThickness} />
      <DoorHandle side="right" doorHeight={doorHeight} />

      {/* Aerohawk badge */}
      <AerohawkBadge doorHeight={doorHeight} />

      {/* Surrounding wall — wider to fill frame */}
      <mesh position={[0, doorHeight / 2, -0.16]} material={wallMat}>
        <boxGeometry args={[12, doorHeight + 2, 0.05]} />
      </mesh>

      {/* Floor */}
      <mesh position={[0, -0.04, 3]} rotation={[-Math.PI / 2, 0, 0]} material={floorMat} receiveShadow>
        <planeGeometry args={[14, 10]} />
      </mesh>

      {/* Character — stands to the right of the door */}
      <DoorCharacter />

      {/* Overhead spotlight */}
      <spotLight
        position={[0, doorHeight + 2, 4]}
        target-position={[0, doorHeight * 0.5, 0]}
        color="#FFF5E6"
        intensity={5}
        angle={0.6}
        penumbra={0.8}
        distance={15}
        castShadow
      />

      {/* Flanking cyan accent lights */}
      <pointLight position={[-2, doorHeight * 0.6, 2]} color="#00D4FF" intensity={1.0} distance={6} decay={2} />
      <pointLight position={[2, doorHeight * 0.6, 2]} color="#00D4FF" intensity={1.0} distance={6} decay={2} />

      {/* Warm ground-bounce fill */}
      <pointLight position={[0, 0.3, 5]} color="#FFF0D4" intensity={0.6} distance={10} decay={2} />
    </group>
  )
}
