import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useViewStore from '../../store/useViewStore'

const ROOM_Z = -22 // center of the sunlit room
const PARTICLE_COUNT = 120

/* ── Dust Motes in Sunlight ──────────────────────────── */

function SunlightParticles() {
  const pointsRef = useRef()

  const { positions, sizes, offsets } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    const sizes = new Float32Array(PARTICLE_COUNT)
    const offsets = new Float32Array(PARTICLE_COUNT)

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Concentrate in the window light cone
      positions[i * 3] = 2 + Math.random() * 4 // right side (window side)
      positions[i * 3 + 1] = Math.random() * 3 // floor to ceiling
      positions[i * 3 + 2] = ROOM_Z + (Math.random() - 0.5) * 6

      sizes[i] = 0.8 + Math.random() * 2.0
      offsets[i] = Math.random() * Math.PI * 2
    }

    return { positions, sizes, offsets }
  }, [])

  const shaderMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new THREE.Color('#FFF8E7') },
          uOpacity: { value: 0.5 },
        },
        vertexShader: `
          attribute float aSize;
          attribute float aOffset;
          uniform float uTime;
          varying float vAlpha;

          void main() {
            vec3 pos = position;

            // Very gentle floating drift
            pos.y += sin(uTime * 0.15 + aOffset) * 0.3;
            pos.x += sin(uTime * 0.1 + aOffset * 1.3) * 0.15;
            pos.z += cos(uTime * 0.12 + aOffset * 0.7) * 0.1;

            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

            gl_PointSize = aSize * (120.0 / -mvPosition.z);
            gl_PointSize = max(gl_PointSize, 0.5);

            float dist = length(mvPosition.xyz);
            float twinkle = pow(sin(uTime * 1.5 + aOffset * 3.0) * 0.5 + 0.5, 2.0);
            vAlpha = smoothstep(18.0, 2.0, dist) * (0.2 + 0.8 * twinkle);

            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          uniform vec3 uColor;
          uniform float uOpacity;
          varying float vAlpha;

          void main() {
            float dist = length(gl_PointCoord - vec2(0.5));
            if (dist > 0.5) discard;

            float glow = smoothstep(0.5, 0.0, dist);
            float core = smoothstep(0.1, 0.0, dist) * 0.5;
            float alpha = (glow + core) * vAlpha * uOpacity;

            gl_FragColor = vec4(uColor, alpha);
          }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    []
  )

  useFrame((state) => {
    if (shaderMaterial) {
      shaderMaterial.uniforms.uTime.value = state.clock.elapsedTime
    }
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.005
    }
  })

  return (
    <points ref={pointsRef} material={shaderMaterial}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={PARTICLE_COUNT}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aSize"
          count={PARTICLE_COUNT}
          array={sizes}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aOffset"
          count={PARTICLE_COUNT}
          array={offsets}
          itemSize={1}
        />
      </bufferGeometry>
    </points>
  )
}

/* ── Plant ───────────────────────────────────────────── */

function Plant({ position }) {
  return (
    <group position={position}>
      {/* Pot */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.12, 0.1, 0.3, 12]} />
        <meshStandardMaterial color="#8B7355" roughness={0.8} metalness={0.05} />
      </mesh>
      {/* Dirt */}
      <mesh position={[0, 0.31, 0]}>
        <cylinderGeometry args={[0.11, 0.11, 0.02, 12]} />
        <meshStandardMaterial color="#3D2B1F" roughness={0.95} />
      </mesh>
      {/* Foliage — layered spheres */}
      <mesh position={[0, 0.6, 0]}>
        <sphereGeometry args={[0.2, 12, 12]} />
        <meshStandardMaterial
          color="#2D5A27"
          roughness={0.7}
          metalness={0.0}
        />
      </mesh>
      <mesh position={[0.08, 0.75, 0.05]}>
        <sphereGeometry args={[0.14, 10, 10]} />
        <meshStandardMaterial
          color="#3A7D32"
          roughness={0.65}
          metalness={0.0}
        />
      </mesh>
      <mesh position={[-0.06, 0.7, -0.04]}>
        <sphereGeometry args={[0.12, 10, 10]} />
        <meshStandardMaterial
          color="#4A8C3F"
          roughness={0.7}
          metalness={0.0}
        />
      </mesh>
      {/* Stem */}
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.2, 6]} />
        <meshStandardMaterial color="#2E4A1E" roughness={0.8} />
      </mesh>
    </group>
  )
}

/* ── Pendant Light ───────────────────────────────────── */

function PendantLight({ position, on = true }) {
  return (
    <group position={position}>
      {/* Rod */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 1.0, 6]} />
        <meshStandardMaterial color="#94A3B8" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Bulb */}
      <mesh>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshStandardMaterial
          color={on ? '#FFF8E7' : '#94A3B8'}
          emissive={on ? '#FFF0D4' : '#000000'}
          emissiveIntensity={on ? 2 : 0}
        />
      </mesh>
      {/* Shade ring */}
      <mesh position={[0, 0.04, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.1, 0.01, 8, 20]} />
        <meshStandardMaterial color="#2D3748" metalness={0.5} roughness={0.3} />
      </mesh>
      {on && (
        <pointLight
          color="#FFF0D4"
          intensity={1.2}
          distance={4}
          decay={2}
        />
      )}
    </group>
  )
}

/* ── Main Sunlit Room Scene ──────────────────────────── */

export default function SunlitRoomScene() {
  const groupRef = useRef()
  const windowLightRef = useRef()

  const floorMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#D4A574'),
        roughness: 0.35,
        metalness: 0.05,
      }),
    []
  )

  const wallMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#F5F0E8'),
        roughness: 0.9,
        metalness: 0.0,
      }),
    []
  )

  const sofaMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#F0EDE8'),
        roughness: 0.75,
        metalness: 0.02,
      }),
    []
  )

  const glassMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#FFFFFF'),
        roughness: 0.05,
        metalness: 0.0,
        transparent: true,
        opacity: 0.1,
        transmission: 0.9,
        thickness: 0.3,
        ior: 1.5,
      }),
    []
  )

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime
    const { scrollProgress } = useViewStore.getState()

    // Visible from scroll 0.55 onward
    const fade =
      scrollProgress < 0.55
        ? 0
        : scrollProgress < 0.65
          ? (scrollProgress - 0.55) / 0.10
          : 1

    groupRef.current.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.transparent = true
        if (child.material.transmission === undefined || child.material.transmission < 0.5) {
          child.material.opacity = fade
        }
      }
    })
    groupRef.current.visible = fade > 0.01

    // Golden hour light pulse
    if (windowLightRef.current) {
      windowLightRef.current.intensity = 3 + Math.sin(t * 0.3) * 0.5
    }
  })

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Floor — warm hardwood */}
      <mesh
        position={[0, -0.04, ROOM_Z]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={floorMat}
        receiveShadow
      >
        <planeGeometry args={[14, 14]} />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 1.5, ROOM_Z - 5]} material={wallMat} receiveShadow>
        <planeGeometry args={[14, 4]} />
      </mesh>

      {/* Left wall (with windows) */}
      <mesh
        position={[-6, 1.5, ROOM_Z]}
        rotation={[0, Math.PI / 2, 0]}
        material={wallMat}
        receiveShadow
      >
        <planeGeometry args={[14, 4]} />
      </mesh>

      {/* Right wall — the window wall */}
      <mesh
        position={[6, 1.5, ROOM_Z]}
        rotation={[0, -Math.PI / 2, 0]}
        material={wallMat}
        receiveShadow
      >
        <planeGeometry args={[14, 4]} />
      </mesh>

      {/* Window openings — emissive planes simulating sunlight */}
      {[-2, 0, 2].map((zOff, i) => (
        <mesh
          key={i}
          position={[5.95, 1.8, ROOM_Z + zOff]}
          rotation={[0, -Math.PI / 2, 0]}
        >
          <planeGeometry args={[1.8, 2.2]} />
          <meshStandardMaterial
            color="#FFF8E7"
            emissive="#FFF0D4"
            emissiveIntensity={3}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* Ceiling */}
      <mesh
        position={[0, 3.2, ROOM_Z]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#FAF8F5" roughness={0.95} />
      </mesh>

      {/* White sectional sofa */}
      <group position={[-1.5, 0, ROOM_Z + 1]}>
        {/* Seat base */}
        <mesh position={[0, 0.25, 0]} material={sofaMat} castShadow receiveShadow>
          <boxGeometry args={[2.8, 0.35, 1.0]} />
        </mesh>
        {/* Chaise extension */}
        <mesh position={[1.8, 0.25, 0.8]} material={sofaMat} castShadow>
          <boxGeometry args={[1.0, 0.35, 1.0]} />
        </mesh>
        {/* Back cushion */}
        <mesh position={[0, 0.55, -0.38]} material={sofaMat} castShadow>
          <boxGeometry args={[2.8, 0.4, 0.25]} />
        </mesh>
        {/* Chaise back */}
        <mesh position={[1.8, 0.55, 0.42]} material={sofaMat} castShadow>
          <boxGeometry args={[1.0, 0.4, 0.25]} />
        </mesh>
        {/* Pillow accents */}
        <mesh position={[-0.9, 0.55, -0.15]} rotation={[0, 0, 0.1]}>
          <boxGeometry args={[0.3, 0.3, 0.1]} />
          <meshStandardMaterial color="#00D4FF" roughness={0.6} metalness={0.05} />
        </mesh>
        <mesh position={[0.3, 0.55, -0.15]} rotation={[0, 0, -0.08]}>
          <boxGeometry args={[0.3, 0.3, 0.1]} />
          <meshStandardMaterial color="#7C3AED" roughness={0.6} metalness={0.05} />
        </mesh>
      </group>

      {/* Glass coffee table */}
      <group position={[-1, 0, ROOM_Z + 2.2]}>
        {/* Glass top */}
        <mesh position={[0, 0.38, 0]} material={glassMat}>
          <boxGeometry args={[1.4, 0.03, 0.7]} />
        </mesh>
        {/* Metal legs */}
        {[[-0.6, 0.19, -0.28], [0.6, 0.19, -0.28], [-0.6, 0.19, 0.28], [0.6, 0.19, 0.28]].map(
          (pos, i) => (
            <mesh key={i} position={pos}>
              <cylinderGeometry args={[0.012, 0.012, 0.36, 8]} />
              <meshStandardMaterial color="#C0C0C0" metalness={0.9} roughness={0.1} />
            </mesh>
          )
        )}
      </group>

      {/* Luxury Bed */}
      <group position={[2, 0, ROOM_Z - 2]}>
        {/* Headboard */}
        <mesh position={[0, 0.75, -0.65]} castShadow>
          <boxGeometry args={[2.2, 1.2, 0.08]} />
          <meshStandardMaterial color="#2D3748" roughness={0.6} metalness={0.1} />
        </mesh>
        {/* Mattress */}
        <mesh position={[0, 0.3, 0]} material={sofaMat} castShadow receiveShadow>
          <boxGeometry args={[2.0, 0.3, 1.4]} />
        </mesh>
        {/* Duvet */}
        <mesh position={[0, 0.48, 0.15]} castShadow>
          <boxGeometry args={[1.9, 0.08, 1.1]} />
          <meshStandardMaterial color="#F8F6F3" roughness={0.8} metalness={0.0} />
        </mesh>
        {/* Pillows */}
        <mesh position={[-0.45, 0.52, -0.45]} rotation={[0.1, 0, 0.05]} castShadow>
          <boxGeometry args={[0.5, 0.12, 0.35]} />
          <meshStandardMaterial color="#F0EDE8" roughness={0.75} />
        </mesh>
        <mesh position={[0.45, 0.52, -0.45]} rotation={[0.1, 0, -0.05]} castShadow>
          <boxGeometry args={[0.5, 0.12, 0.35]} />
          <meshStandardMaterial color="#F0EDE8" roughness={0.75} />
        </mesh>
        {/* Accent pillow */}
        <mesh position={[0, 0.55, -0.3]} rotation={[0.15, 0.1, 0]}>
          <boxGeometry args={[0.3, 0.1, 0.25]} />
          <meshStandardMaterial color="#00D4FF" roughness={0.6} metalness={0.05} />
        </mesh>
      </group>

      {/* Wall Art Frame */}
      <group position={[-4, 1.8, ROOM_Z - 4.9]}>
        {/* Frame */}
        <mesh castShadow>
          <boxGeometry args={[1.2, 0.9, 0.04]} />
          <meshStandardMaterial color="#1A1A2E" roughness={0.5} metalness={0.2} />
        </mesh>
        {/* Art canvas — gradient accent */}
        <mesh position={[0, 0, 0.025]}>
          <planeGeometry args={[1.0, 0.7]} />
          <meshStandardMaterial
            color="#0A1628"
            emissive="#00D4FF"
            emissiveIntensity={0.15}
          />
        </mesh>
      </group>

      {/* Plants */}
      <Plant position={[3.5, 0, ROOM_Z - 3]} />
      <Plant position={[-4, 0, ROOM_Z + 2]} />

      {/* Pendant lights */}
      <PendantLight position={[-1, 3.2, ROOM_Z + 1]} />
      <PendantLight position={[1, 3.2, ROOM_Z + 1]} />
      <PendantLight position={[0, 3.2, ROOM_Z - 1.5]} on={false} />

      {/* Dust motes */}
      <SunlightParticles />

      {/* Main directional sunlight */}
      <directionalLight
        ref={windowLightRef}
        position={[8, 5, ROOM_Z]}
        color="#FFF0D4"
        intensity={3}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* Soft fill from opposite side */}
      <pointLight
        position={[-5, 2, ROOM_Z]}
        color="#E8F0FF"
        intensity={0.8}
        distance={12}
        decay={2}
      />

      {/* Subtle brand cyan under-glow */}
      <pointLight
        position={[0, -0.5, ROOM_Z]}
        color="#00D4FF"
        intensity={0.3}
        distance={6}
        decay={2}
      />

      {/* Ambient */}
      <ambientLight intensity={0.25} color="#FFF8F0" />
    </group>
  )
}
