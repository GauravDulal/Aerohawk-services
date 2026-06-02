import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useViewStore from '../../store/useViewStore'

const DAMP = 4
const ROOM_Z = -10 // center of the living room along Z

/* ── Cleaning Drone ──────────────────────────────────── */

function CleaningDrone() {
  const droneRef = useRef()
  const beamRef = useRef()
  const trailRef = useRef()

  const bodyMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#1A2332'),
        roughness: 0.2,
        metalness: 0.7,
      }),
    []
  )

  const trimMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#00D4FF'),
        emissive: new THREE.Color('#00D4FF'),
        emissiveIntensity: 0.8,
        metalness: 0.5,
        roughness: 0.2,
      }),
    []
  )

  const beamMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color('#00D4FF'),
        transparent: true,
        opacity: 0.25,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      }),
    []
  )

  const trailMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new THREE.Color('#00D4FF') },
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uTime;
          uniform vec3 uColor;
          varying vec2 vUv;
          void main() {
            float alpha = smoothstep(1.0, 0.0, vUv.x) * 0.4;
            alpha *= sin(vUv.y * 6.2832 + uTime * 3.0) * 0.3 + 0.7;
            alpha *= smoothstep(0.0, 0.1, vUv.y) * smoothstep(1.0, 0.9, vUv.y);
            gl_FragColor = vec4(uColor, alpha);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    []
  )

  // Rotor refs
  const rotorRefs = [useRef(), useRef(), useRef(), useRef()]
  const rotorPositions = [
    [0.35, 0.08, 0.2],
    [-0.35, 0.08, 0.2],
    [0.35, 0.08, -0.2],
    [-0.35, 0.08, -0.2],
  ]

  useFrame((state) => {
    if (!droneRef.current) return
    const t = state.clock.elapsedTime
    const { scrollProgress } = useViewStore.getState()

    // Drone sweeps across the glass partition
    const sweepRange = 2.5
    const sweepX = Math.sin(t * 0.6) * sweepRange
    const bobY = 1.8 + Math.sin(t * 1.5) * 0.08
    const droneZ = ROOM_Z - 1.5

    droneRef.current.position.set(sweepX, bobY, droneZ)
    droneRef.current.rotation.z = Math.sin(t * 0.8) * 0.03
    droneRef.current.rotation.x = Math.cos(t * 0.5) * 0.02

    // Spin rotors
    rotorRefs.forEach((r) => {
      if (r.current) r.current.rotation.y = t * 15
    })

    // Beam pulse
    if (beamRef.current) {
      beamRef.current.material.opacity = 0.15 + Math.sin(t * 4) * 0.1
    }

    // Trail shader time
    if (trailRef.current) {
      trailMat.uniforms.uTime.value = t
    }

    // Fade drone visibility based on phase
    const fade =
      scrollProgress < 0.22
        ? 0
        : scrollProgress < 0.28
          ? (scrollProgress - 0.22) / 0.06
          : scrollProgress > 0.62
            ? Math.max(0, 1 - (scrollProgress - 0.62) / 0.08)
            : 1

    droneRef.current.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.transparent = true
        child.material.opacity =
          child.material === beamMat
            ? fade * (0.15 + Math.sin(t * 4) * 0.1)
            : child.material === trailMat
              ? fade
              : fade
      }
    })
    droneRef.current.visible = fade > 0.01
  })

  return (
    <group ref={droneRef}>
      {/* Body — sleek ellipsoid */}
      <mesh scale={[0.5, 0.15, 0.3]} material={bodyMat} castShadow>
        <sphereGeometry args={[1, 24, 16]} />
      </mesh>

      {/* Trim ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.38, 0.015, 8, 32]} />
        <primitive object={trimMat} attach="material" />
      </mesh>

      {/* Rotors */}
      {rotorPositions.map((pos, i) => (
        <group key={i} position={pos}>
          {/* Rotor arm */}
          <mesh>
            <cylinderGeometry args={[0.008, 0.008, 0.05, 8]} />
            <meshStandardMaterial color="#2D3748" metalness={0.5} roughness={0.3} />
          </mesh>
          {/* Rotor disc */}
          <mesh ref={rotorRefs[i]} position={[0, 0.04, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.005, 16]} />
            <meshStandardMaterial
              color="#94A3B8"
              metalness={0.6}
              roughness={0.2}
              transparent
              opacity={0.5}
            />
          </mesh>
        </group>
      ))}

      {/* Cleaning beam — cone pointing down */}
      <mesh ref={beamRef} position={[0, -0.5, 0]} material={beamMat}>
        <coneGeometry args={[0.6, 1.0, 16, 1, true]} />
      </mesh>

      {/* Glowing trail plane behind drone */}
      <mesh
        ref={trailRef}
        position={[-0.8, 0, 0]}
        rotation={[0, 0, 0]}
        material={trailMat}
      >
        <planeGeometry args={[1.5, 0.3]} />
      </mesh>

      {/* Drone light emitting downward */}
      <pointLight
        position={[0, -0.3, 0]}
        color="#00D4FF"
        intensity={2}
        distance={4}
        decay={2}
      />
    </group>
  )
}

/* ── Glass Partition ─────────────────────────────────── */

function GlassPartition() {
  const glassRef = useRef()
  const flashRef = useRef()

  const glassMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#FFFFFF'),
        roughness: 0.05,
        metalness: 0.0,
        transparent: true,
        opacity: 0.15,
        transmission: 0.85,
        thickness: 0.5,
        ior: 1.5,
        side: THREE.DoubleSide,
      }),
    []
  )

  useFrame((_, delta) => {
    if (!glassRef.current) return
    const { glassWipeProgress, scrollProgress } = useViewStore.getState()

    // Wipe the glass as progress increases
    glassMat.opacity = THREE.MathUtils.damp(
      glassMat.opacity,
      0.15 * (1 - glassWipeProgress),
      DAMP,
      delta
    )
    glassMat.transmission = THREE.MathUtils.damp(
      glassMat.transmission,
      0.85 + glassWipeProgress * 0.15,
      DAMP,
      delta
    )

    // Flash effect at the wipe moment
    if (flashRef.current) {
      const flashIntensity =
        glassWipeProgress > 0.3 && glassWipeProgress < 0.8
          ? Math.sin((glassWipeProgress - 0.3) * Math.PI / 0.5) * 5
          : 0
      flashRef.current.intensity = flashIntensity
    }

    // Hide completely after wipe
    glassRef.current.visible = scrollProgress < 0.65
  })

  return (
    <group position={[0, 1.3, ROOM_Z - 3]}>
      <mesh ref={glassRef} material={glassMat} receiveShadow>
        <planeGeometry args={[5, 2.8]} />
      </mesh>

      {/* Glass edges — thin frame */}
      <mesh position={[0, 1.42, 0]}>
        <boxGeometry args={[5.1, 0.04, 0.02]} />
        <meshStandardMaterial color="#94A3B8" metalness={0.7} roughness={0.2} />
      </mesh>
      <mesh position={[0, -0.02, 0]}>
        <boxGeometry args={[5.1, 0.04, 0.02]} />
        <meshStandardMaterial color="#94A3B8" metalness={0.7} roughness={0.2} />
      </mesh>

      {/* Flash light for the wipe moment */}
      <pointLight
        ref={flashRef}
        position={[0, 0, 0.5]}
        color="#FFFFFF"
        intensity={0}
        distance={8}
        decay={2}
      />
    </group>
  )
}

/* ── Furniture ───────────────────────────────────────── */

function Sofa() {
  const sofaMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#1A2940'),
        roughness: 0.8,
        metalness: 0.05,
      }),
    []
  )

  return (
    <group position={[-2, 0.35, ROOM_Z + 0.5]}>
      {/* Seat */}
      <mesh material={sofaMat} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.35, 0.9]} />
      </mesh>
      {/* Back */}
      <mesh position={[0, 0.35, -0.35]} material={sofaMat} castShadow>
        <boxGeometry args={[2.2, 0.4, 0.2]} />
      </mesh>
      {/* Left arm */}
      <mesh position={[-1.0, 0.18, 0]} material={sofaMat} castShadow>
        <boxGeometry args={[0.2, 0.55, 0.9]} />
      </mesh>
      {/* Right arm */}
      <mesh position={[1.0, 0.18, 0]} material={sofaMat} castShadow>
        <boxGeometry args={[0.2, 0.55, 0.9]} />
      </mesh>
    </group>
  )
}

function CoffeeTable() {
  const tableMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#2D3748'),
        roughness: 0.3,
        metalness: 0.2,
      }),
    []
  )
  const legMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#94A3B8'),
        roughness: 0.2,
        metalness: 0.8,
      }),
    []
  )

  return (
    <group position={[0, 0, ROOM_Z + 0.5]}>
      {/* Top */}
      <mesh position={[0, 0.4, 0]} material={tableMat} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.04, 0.6]} />
      </mesh>
      {/* Legs */}
      {[[-0.5, 0.2, -0.22], [0.5, 0.2, -0.22], [-0.5, 0.2, 0.22], [0.5, 0.2, 0.22]].map(
        (pos, i) => (
          <mesh key={i} position={pos} material={legMat}>
            <cylinderGeometry args={[0.015, 0.015, 0.38, 8]} />
          </mesh>
        )
      )}
    </group>
  )
}

function FloorLamp() {
  return (
    <group position={[2.5, 0, ROOM_Z - 0.5]}>
      {/* Pole */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.015, 0.02, 2, 8]} />
        <meshStandardMaterial color="#94A3B8" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Base */}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.04, 16]} />
        <meshStandardMaterial color="#1A2940" roughness={0.5} metalness={0.3} />
      </mesh>
      {/* Head — emissive sphere */}
      <mesh position={[0, 2.05, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial
          color="#FFF8E7"
          emissive="#FFF0D4"
          emissiveIntensity={1.5}
        />
      </mesh>
      {/* Light source */}
      <pointLight
        position={[0, 2.05, 0]}
        color="#FFF0D4"
        intensity={2}
        distance={6}
        decay={2}
      />
    </group>
  )
}

/* ── Main Living Room Scene ──────────────────────────── */

export default function LivingRoomScene() {
  const groupRef = useRef()

  const floorMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#A0A0A0'),
        roughness: 0.15,
        metalness: 0.2,
      }),
    []
  )

  const wallMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#1E293B'),
        roughness: 0.9,
        metalness: 0.0,
      }),
    []
  )

  useFrame(() => {
    if (!groupRef.current) return
    const { scrollProgress } = useViewStore.getState()

    // Visible from scroll 0.15 to 0.70
    const fade =
      scrollProgress < 0.15
        ? 0
        : scrollProgress < 0.22
          ? (scrollProgress - 0.15) / 0.07
          : scrollProgress > 0.65
            ? Math.max(0, 1 - (scrollProgress - 0.65) / 0.07)
            : 1

    groupRef.current.traverse((child) => {
      if (child.isMesh && child.material && !child.userData.skipFade) {
        child.material.transparent = true
        // Don't override glass opacity (handled separately)
        if (child.material.transmission === undefined || child.material.transmission < 0.5) {
          child.material.opacity = fade
        }
      }
    })
    groupRef.current.visible = fade > 0.01
  })

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Floor */}
      <mesh
        position={[0, -0.04, ROOM_Z]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={floorMat}
        receiveShadow
      >
        <planeGeometry args={[12, 14]} />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 1.5, ROOM_Z - 5]} material={wallMat} receiveShadow>
        <planeGeometry args={[12, 4]} />
      </mesh>

      {/* Left wall */}
      <mesh
        position={[-5, 1.5, ROOM_Z]}
        rotation={[0, Math.PI / 2, 0]}
        material={wallMat}
        receiveShadow
      >
        <planeGeometry args={[14, 4]} />
      </mesh>

      {/* Right wall */}
      <mesh
        position={[5, 1.5, ROOM_Z]}
        rotation={[0, -Math.PI / 2, 0]}
        material={wallMat}
        receiveShadow
      >
        <planeGeometry args={[14, 4]} />
      </mesh>

      {/* Ceiling */}
      <mesh
        position={[0, 3.2, ROOM_Z]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[12, 14]} />
        <meshStandardMaterial color="#0F1D32" roughness={0.95} />
      </mesh>

      {/* Furniture */}
      <Sofa />
      <CoffeeTable />
      <FloorLamp />

      {/* Glass Partition */}
      <GlassPartition />

      {/* Cleaning Drone */}
      <CleaningDrone />

      {/* Ambient fill light */}
      <ambientLight intensity={0.15} color="#E2E8F0" />

      {/* Cool overhead wash */}
      <pointLight
        position={[0, 3, ROOM_Z]}
        color="#C8D8FF"
        intensity={1.5}
        distance={10}
        decay={2}
      />
    </group>
  )
}
