import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useViewStore from '../../store/useViewStore'

const DAMP = 4

/* ── helpers ─────────────────────────────────────────── */

function DoorPanel({ side, width, height, thickness }) {
  const ref = useRef()
  // Pivot offset: hinge at the outer edge
  const pivotSign = side === 'left' ? -1 : 1
  const pivotX = pivotSign * (width / 2)

  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#2B5A8C'),
        roughness: 0.4,
        metalness: 0.1,
        // clearcoat-like effect via env map intensity
      }),
    []
  )

  // Panel lines (decorative inset grooves)
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
      {/* Main panel */}
      <mesh
        position={[-pivotX, height / 2, 0]}
        material={mat}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[width, height, thickness]} />
      </mesh>

      {/* Decorative groove — upper */}
      <mesh position={[-pivotX, height * 0.72, thickness / 2 + 0.005]}>
        <boxGeometry args={[width * 0.7, 0.025, 0.01]} />
        <primitive object={grooveMat} attach="material" />
      </mesh>

      {/* Decorative groove — lower */}
      <mesh position={[-pivotX, height * 0.35, thickness / 2 + 0.005]}>
        <boxGeometry args={[width * 0.7, 0.025, 0.01]} />
        <primitive object={grooveMat} attach="material" />
      </mesh>

      {/* Decorative groove — mid vertical */}
      <mesh position={[-pivotX, height * 0.535, thickness / 2 + 0.005]}>
        <boxGeometry args={[0.025, height * 0.35, 0.01]} />
        <primitive object={grooveMat} attach="material" />
      </mesh>
    </group>
  )
}

function DoorHandle({ side, doorHeight }) {
  const handleMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#D4D4D4'),
        metalness: 1.0,
        roughness: 0.05,
      }),
    []
  )

  const xPos = side === 'left' ? 0.25 : -0.25
  const yPos = doorHeight * 0.48

  return (
    <group position={[xPos, yPos, 0.06]}>
      {/* Handle bar */}
      <mesh material={handleMat} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 0.22, 16]} />
      </mesh>

      {/* Handle ring */}
      <mesh
        position={[0, -0.12, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        material={handleMat}
        castShadow
      >
        <torusGeometry args={[0.04, 0.008, 12, 24]} />
      </mesh>

      {/* Backplate */}
      <mesh position={[0, 0, -0.03]}>
        <boxGeometry args={[0.06, 0.16, 0.01]} />
        <meshStandardMaterial
          color="#B8B8B8"
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
    </group>
  )
}

function AerohawkBadge({ doorHeight }) {
  const badgeMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#00D4FF'),
        emissive: new THREE.Color('#00D4FF'),
        emissiveIntensity: 0.6,
        metalness: 0.8,
        roughness: 0.2,
      }),
    []
  )

  return (
    <group position={[0, doorHeight * 0.82, 0.06]}>
      {/* Diamond / hawk shape — simplified to a rotated box + triangles */}
      <mesh rotation={[0, 0, Math.PI / 4]} material={badgeMat}>
        <boxGeometry args={[0.06, 0.06, 0.008]} />
      </mesh>
      {/* Outer ring */}
      <mesh rotation={[0, 0, 0]}>
        <ringGeometry args={[0.055, 0.065, 24]} />
        <meshStandardMaterial
          color="#00D4FF"
          emissive="#00D4FF"
          emissiveIntensity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

/* ── Main Door Scene ─────────────────────────────────── */

export default function DoorScene() {
  const groupRef = useRef()
  const doorWidth = 0.65
  const doorHeight = 2.6
  const doorThickness = 0.08
  const frameThickness = 0.12
  const frameDepth = 0.25

  const frameMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#1A1A2E'),
        roughness: 0.7,
        metalness: 0.05,
      }),
    []
  )

  const wallMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#0D1B2A'),
        roughness: 0.85,
        metalness: 0.0,
      }),
    []
  )

  const floorMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#141E30'),
        roughness: 0.6,
        metalness: 0.1,
      }),
    []
  )

  // Fade out as camera passes through
  useFrame(() => {
    if (!groupRef.current) return
    const { scrollProgress } = useViewStore.getState()
    // Start fading at 28%, gone by 35%
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
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Door Frame — left pillar */}
      <mesh
        position={[-(doorWidth + frameThickness / 2), doorHeight / 2, 0]}
        material={frameMat}
        castShadow
      >
        <boxGeometry args={[frameThickness, doorHeight + frameThickness, frameDepth]} />
      </mesh>

      {/* Door Frame — right pillar */}
      <mesh
        position={[doorWidth + frameThickness / 2, doorHeight / 2, 0]}
        material={frameMat}
        castShadow
      >
        <boxGeometry args={[frameThickness, doorHeight + frameThickness, frameDepth]} />
      </mesh>

      {/* Door Frame — top lintel */}
      <mesh
        position={[0, doorHeight + frameThickness / 2, 0]}
        material={frameMat}
        castShadow
      >
        <boxGeometry
          args={[doorWidth * 2 + frameThickness * 2, frameThickness, frameDepth]}
        />
      </mesh>

      {/* Threshold / step */}
      <mesh position={[0, -0.02, 0.05]} material={frameMat}>
        <boxGeometry args={[doorWidth * 2 + frameThickness * 2, 0.04, frameDepth + 0.1]} />
      </mesh>

      {/* Left door panel */}
      <group position={[0, 0, 0]}>
        <DoorPanel
          side="left"
          width={doorWidth}
          height={doorHeight}
          thickness={doorThickness}
        />
        <DoorHandle side="left" doorHeight={doorHeight} />
      </group>

      {/* Right door panel */}
      <group position={[0, 0, 0]}>
        <DoorPanel
          side="right"
          width={doorWidth}
          height={doorHeight}
          thickness={doorThickness}
        />
        <DoorHandle side="right" doorHeight={doorHeight} />
      </group>

      {/* Aerohawk badge centered above handle area */}
      <AerohawkBadge doorHeight={doorHeight} />

      {/* Surrounding wall */}
      <mesh position={[0, doorHeight / 2, -0.14]} material={wallMat}>
        <boxGeometry args={[8, doorHeight + 2, 0.05]} />
      </mesh>

      {/* Floor extending outward */}
      <mesh
        position={[0, -0.04, 2]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={floorMat}
        receiveShadow
      >
        <planeGeometry args={[10, 8]} />
      </mesh>

      {/* Overhead spotlight */}
      <spotLight
        position={[0, doorHeight + 1.5, 3]}
        target-position={[0, doorHeight * 0.5, 0]}
        color="#FFF5E6"
        intensity={4}
        angle={0.6}
        penumbra={0.8}
        distance={12}
        castShadow
      />

      {/* Flanking cyan accent lights */}
      <pointLight
        position={[-1.5, doorHeight * 0.6, 1.5]}
        color="#00D4FF"
        intensity={0.8}
        distance={5}
        decay={2}
      />
      <pointLight
        position={[1.5, doorHeight * 0.6, 1.5]}
        color="#00D4FF"
        intensity={0.8}
        distance={5}
        decay={2}
      />

      {/* Warm ground-bounce fill */}
      <pointLight
        position={[0, 0.3, 4]}
        color="#FFF0D4"
        intensity={0.5}
        distance={8}
        decay={2}
      />
    </group>
  )
}
