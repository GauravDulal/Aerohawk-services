import { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useViewStore from '../../store/useViewStore'

const DAMP = 4
const ROOM_Z = -10

/* ── Mannequin Worker Character ──────────────────────── */

function CleanerCharacter({ position, task, activeRange = [0, 1], facingAngle = 0 }) {
  const groupRef = useRef()
  const rUpperArmRef = useRef()
  const rForearmRef = useRef()
  const lUpperArmRef = useRef()
  const lForearmRef = useRef()
  const torsoRef = useRef()

  const skinMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#D4A574', roughness: 0.7, metalness: 0.05 }),
    []
  )
  const uniformMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#2B4A6E', roughness: 0.6, metalness: 0.1 }),
    []
  )
  const bootMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#1A1A2E', roughness: 0.7, metalness: 0.15 }),
    []
  )
  const toolMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#94A3B8', roughness: 0.3, metalness: 0.6 }),
    []
  )
  const cyanMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#00D4FF',
        emissive: '#00D4FF',
        emissiveIntensity: 0.3,
        metalness: 0.5,
        roughness: 0.3,
      }),
    []
  )

  useFrame((state, delta) => {
    if (!groupRef.current) return
    const { cleanProgress, scrollProgress } = useViewStore.getState()
    const t = state.clock.elapsedTime

    // Worker visibility based on active range
    const workerActive =
      cleanProgress >= activeRange[0] && cleanProgress <= activeRange[1]
    const fadeIn = cleanProgress < activeRange[0] + 0.05
      ? Math.max(0, (cleanProgress - activeRange[0]) / 0.05)
      : 1
    const fadeOut = cleanProgress > activeRange[1] - 0.1
      ? Math.max(0, (activeRange[1] - cleanProgress) / 0.1)
      : 1
    const roomFade = scrollProgress > 0.62
      ? Math.max(0, 1 - (scrollProgress - 0.62) / 0.08)
      : scrollProgress < 0.22
        ? 0
        : scrollProgress < 0.28
          ? (scrollProgress - 0.22) / 0.06
          : 1

    const opacity = Math.min(fadeIn, fadeOut, roomFade)

    groupRef.current.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.transparent = true
        child.material.opacity = opacity
      }
    })
    groupRef.current.visible = opacity > 0.01

    // Animate based on task
    if (task === 'wipe') {
      // Wiping motion: right arm sweeps left-right
      if (rUpperArmRef.current) {
        rUpperArmRef.current.rotation.x = -1.2 + Math.sin(t * 3) * 0.15
        rUpperArmRef.current.rotation.z = Math.sin(t * 3) * 0.4
      }
      if (rForearmRef.current) {
        rForearmRef.current.rotation.x = -0.3
      }
      if (torsoRef.current) {
        torsoRef.current.rotation.z = Math.sin(t * 3) * 0.05
      }
    } else if (task === 'vacuum') {
      // Vacuuming: both arms extended, push/pull
      const pushPull = Math.sin(t * 2) * 0.25
      if (rUpperArmRef.current) {
        rUpperArmRef.current.rotation.x = -0.9 + pushPull * 0.15
      }
      if (lUpperArmRef.current) {
        lUpperArmRef.current.rotation.x = -0.9 + pushPull * 0.15
      }
      if (rForearmRef.current) rForearmRef.current.rotation.x = -0.4
      if (lForearmRef.current) lForearmRef.current.rotation.x = -0.4
      if (torsoRef.current) {
        torsoRef.current.rotation.x = -0.1 + pushPull * 0.03
      }
    } else if (task === 'dust') {
      // Dusting: right arm reaches up cyclically
      if (rUpperArmRef.current) {
        rUpperArmRef.current.rotation.x = -2.5 + Math.sin(t * 2.5) * 0.3
        rUpperArmRef.current.rotation.z = 0.2
      }
      if (rForearmRef.current) {
        rForearmRef.current.rotation.x = -0.5 + Math.sin(t * 2.5 + 0.5) * 0.2
      }
      if (torsoRef.current) {
        torsoRef.current.rotation.z = 0.05
      }
    }
  })

  return (
    <group ref={groupRef} position={position} rotation={[0, facingAngle, 0]}>
      {/* Legs */}
      {[-0.1, 0.1].map((xOff, i) => (
        <group key={i} position={[xOff, 0.45, 0]}>
          <mesh material={uniformMat} castShadow>
            <capsuleGeometry args={[0.055, 0.32, 6, 10]} />
          </mesh>
          <mesh position={[0, -0.38, 0]} material={uniformMat} castShadow>
            <capsuleGeometry args={[0.05, 0.28, 6, 10]} />
          </mesh>
          <mesh position={[0, -0.68, 0.03]} material={bootMat} castShadow>
            <boxGeometry args={[0.11, 0.09, 0.16]} />
          </mesh>
        </group>
      ))}

      {/* Torso */}
      <group ref={torsoRef} position={[0, 0.92, 0]}>
        <mesh material={uniformMat} castShadow>
          <capsuleGeometry args={[0.13, 0.32, 6, 12]} />
        </mesh>
        {/* Badge */}
        <mesh position={[-0.07, 0.04, 0.13]} material={cyanMat}>
          <boxGeometry args={[0.05, 0.05, 0.006]} />
        </mesh>

        {/* Head */}
        <group position={[0, 0.35, 0]}>
          <mesh position={[0, -0.07, 0]} material={skinMat}>
            <cylinderGeometry args={[0.035, 0.045, 0.09, 8]} />
          </mesh>
          <mesh position={[0, 0.07, 0]} material={skinMat} castShadow>
            <sphereGeometry args={[0.09, 12, 12]} />
          </mesh>
          <mesh position={[0, 0.13, 0]} material={uniformMat}>
            <sphereGeometry args={[0.095, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
          </mesh>
        </group>

        {/* Left Arm */}
        <group position={[-0.18, 0.1, 0]} ref={lUpperArmRef}>
          <mesh material={uniformMat} castShadow>
            <capsuleGeometry args={[0.035, 0.22, 6, 10]} />
          </mesh>
          <group position={[0, -0.18, 0]} ref={lForearmRef}>
            <mesh material={uniformMat} castShadow>
              <capsuleGeometry args={[0.03, 0.18, 6, 10]} />
            </mesh>
            <mesh position={[0, -0.16, 0]} material={skinMat}>
              <boxGeometry args={[0.04, 0.05, 0.025]} />
            </mesh>
          </group>
        </group>

        {/* Right Arm */}
        <group position={[0.18, 0.1, 0]} ref={rUpperArmRef}>
          <mesh material={uniformMat} castShadow>
            <capsuleGeometry args={[0.035, 0.22, 6, 10]} />
          </mesh>
          <group position={[0, -0.18, 0]} ref={rForearmRef}>
            <mesh material={uniformMat} castShadow>
              <capsuleGeometry args={[0.03, 0.18, 6, 10]} />
            </mesh>
            <mesh position={[0, -0.16, 0]} material={skinMat}>
              <boxGeometry args={[0.04, 0.05, 0.025]} />
            </mesh>

            {/* Tool based on task */}
            {task === 'wipe' && (
              <mesh position={[0, -0.22, 0.02]} material={toolMat}>
                <boxGeometry args={[0.15, 0.02, 0.1]} />
              </mesh>
            )}
            {task === 'dust' && (
              <group position={[0, -0.22, 0]}>
                <mesh material={toolMat}>
                  <cylinderGeometry args={[0.01, 0.01, 0.4, 6]} />
                </mesh>
                <mesh position={[0, 0.22, 0]}>
                  <sphereGeometry args={[0.06, 8, 8]} />
                  <meshStandardMaterial color="#FFD700" roughness={0.9} />
                </mesh>
              </group>
            )}
          </group>
        </group>

        {/* Vacuum tool — attached to body, not arm */}
        {task === 'vacuum' && (
          <group position={[0, -0.65, 0.5]}>
            {/* Handle */}
            <mesh rotation={[0.3, 0, 0]} material={toolMat}>
              <cylinderGeometry args={[0.015, 0.015, 0.8, 8]} />
            </mesh>
            {/* Head */}
            <mesh position={[0, -0.35, 0.15]} material={toolMat}>
              <boxGeometry args={[0.25, 0.06, 0.15]} />
            </mesh>
          </group>
        )}
      </group>
    </group>
  )
}

/* ── Dirty Overlay Elements ──────────────────────────── */

function DirtyOverlays() {
  const groupRef = useRef()

  const dustMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color('#8B7355'),
        transparent: true,
        opacity: 0.12,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    []
  )

  const stainMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color('#3D2B1F'),
        transparent: true,
        opacity: 0.25,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    []
  )

  // Scattered items with staggered fade thresholds
  const scatteredItems = useMemo(
    () => [
      { pos: [1.5, 0.05, ROOM_Z + 1.5], size: [0.1, 0.12, 0.1], fadeAt: 0.1, type: 'cup' },
      { pos: [-0.5, 0.02, ROOM_Z + 2], size: [0.2, 0.01, 0.15], fadeAt: 0.2, type: 'paper' },
      { pos: [0.8, 0.04, ROOM_Z - 0.5], size: [0.15, 0.08, 0.25], fadeAt: 0.3, type: 'shoe' },
      { pos: [-1.8, 0.03, ROOM_Z + 1.8], size: [0.18, 0.01, 0.12], fadeAt: 0.4, type: 'paper' },
      { pos: [2, 0.05, ROOM_Z + 0.5], size: [0.08, 0.15, 0.08], fadeAt: 0.5, type: 'cup' },
      { pos: [-0.3, 0.02, ROOM_Z - 1], size: [0.12, 0.01, 0.18], fadeAt: 0.6, type: 'paper' },
      { pos: [1.2, 0.04, ROOM_Z - 1.5], size: [0.15, 0.08, 0.22], fadeAt: 0.7, type: 'shoe' },
      { pos: [-2.5, 0.05, ROOM_Z - 0.3], size: [0.1, 0.1, 0.1], fadeAt: 0.8, type: 'cup' },
    ],
    []
  )

  const itemMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#6B5B4F', roughness: 0.8, metalness: 0.05, transparent: true }),
    []
  )

  useFrame(() => {
    if (!groupRef.current) return
    const { cleanProgress, scrollProgress } = useViewStore.getState()

    const roomFade = scrollProgress > 0.62
      ? Math.max(0, 1 - (scrollProgress - 0.62) / 0.08)
      : scrollProgress < 0.22
        ? 0
        : scrollProgress < 0.28
          ? (scrollProgress - 0.22) / 0.06
          : 1

    // Dust layers
    dustMat.opacity = 0.12 * (1 - cleanProgress) * roomFade
    stainMat.opacity = 0.25 * Math.max(0, 1 - (cleanProgress - 0.4) / 0.4) * roomFade

    // Scattered items
    groupRef.current.children.forEach((child) => {
      if (child.userData.fadeAt !== undefined) {
        const fadeRange = 0.15
        const itemFade =
          cleanProgress < child.userData.fadeAt
            ? 1
            : cleanProgress > child.userData.fadeAt + fadeRange
              ? 0
              : 1 - (cleanProgress - child.userData.fadeAt) / fadeRange
        child.visible = itemFade * roomFade > 0.01
        child.traverse((c) => {
          if (c.isMesh && c.material) {
            c.material.transparent = true
            c.material.opacity = itemFade * roomFade
          }
        })
      }
    })

    groupRef.current.visible = roomFade > 0.01
  })

  return (
    <group ref={groupRef}>
      {/* Dust layers on furniture surfaces */}
      <mesh position={[-2, 0.56, ROOM_Z + 0.5]} rotation={[-Math.PI / 2, 0, 0]} material={dustMat}>
        <planeGeometry args={[2.0, 0.8]} />
      </mesh>
      <mesh position={[0, 0.44, ROOM_Z + 0.5]} rotation={[-Math.PI / 2, 0, 0]} material={dustMat}>
        <planeGeometry args={[1.1, 0.5]} />
      </mesh>
      <mesh position={[0, -0.02, ROOM_Z - 0.5]} rotation={[-Math.PI / 2, 0, 0]} material={dustMat}>
        <planeGeometry args={[3, 3]} />
      </mesh>

      {/* Stain near coffee table */}
      <mesh position={[0.3, -0.02, ROOM_Z + 1.2]} rotation={[-Math.PI / 2, 0, 0]} material={stainMat}>
        <circleGeometry args={[0.3, 16]} />
      </mesh>

      {/* Cobweb in corner */}
      <mesh position={[-4.9, 2.8, ROOM_Z - 4.8]}>
        <planeGeometry args={[0.6, 0.6]} />
        <meshBasicMaterial
          color="#CCCCCC"
          transparent
          opacity={0.08 * 1}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Scattered items */}
      {scatteredItems.map((item, i) => (
        <group key={i} position={item.pos} userData={{ fadeAt: item.fadeAt }}>
          {item.type === 'cup' && (
            <mesh material={itemMat} castShadow>
              <cylinderGeometry args={[item.size[0] / 2, item.size[0] / 2.5, item.size[1], 8]} />
            </mesh>
          )}
          {item.type === 'paper' && (
            <mesh rotation={[-Math.PI / 2, 0, Math.random() * 2]} material={itemMat}>
              <planeGeometry args={[item.size[0], item.size[2]]} />
            </mesh>
          )}
          {item.type === 'shoe' && (
            <mesh material={itemMat} castShadow>
              <boxGeometry args={item.size} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  )
}

/* ── Furniture (kept from original) ──────────────────── */

function Sofa() {
  const sofaMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: new THREE.Color('#1A2940'), roughness: 0.8, metalness: 0.05 }),
    []
  )
  return (
    <group position={[-2, 0.35, ROOM_Z + 0.5]}>
      <mesh material={sofaMat} castShadow receiveShadow><boxGeometry args={[2.2, 0.35, 0.9]} /></mesh>
      <mesh position={[0, 0.35, -0.35]} material={sofaMat} castShadow><boxGeometry args={[2.2, 0.4, 0.2]} /></mesh>
      <mesh position={[-1.0, 0.18, 0]} material={sofaMat} castShadow><boxGeometry args={[0.2, 0.55, 0.9]} /></mesh>
      <mesh position={[1.0, 0.18, 0]} material={sofaMat} castShadow><boxGeometry args={[0.2, 0.55, 0.9]} /></mesh>
    </group>
  )
}

function CoffeeTable() {
  const tableMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: new THREE.Color('#2D3748'), roughness: 0.3, metalness: 0.2 }),
    []
  )
  const legMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: new THREE.Color('#94A3B8'), roughness: 0.2, metalness: 0.8 }),
    []
  )
  return (
    <group position={[0, 0, ROOM_Z + 0.5]}>
      <mesh position={[0, 0.4, 0]} material={tableMat} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.04, 0.6]} />
      </mesh>
      {[[-0.5, 0.2, -0.22], [0.5, 0.2, -0.22], [-0.5, 0.2, 0.22], [0.5, 0.2, 0.22]].map((pos, i) => (
        <mesh key={i} position={pos} material={legMat}>
          <cylinderGeometry args={[0.015, 0.015, 0.38, 8]} />
        </mesh>
      ))}
    </group>
  )
}

function FloorLamp() {
  return (
    <group position={[2.5, 0, ROOM_Z - 0.5]}>
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.015, 0.02, 2, 8]} />
        <meshStandardMaterial color="#94A3B8" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.04, 16]} />
        <meshStandardMaterial color="#1A2940" roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[0, 2.05, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#FFF8E7" emissive="#FFF0D4" emissiveIntensity={1.5} />
      </mesh>
      <pointLight position={[0, 2.05, 0]} color="#FFF0D4" intensity={2} distance={6} decay={2} />
    </group>
  )
}

/* ── Hallway Partition with Archway ──────────────────── */

function HallwayPartition() {
  const wallMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: new THREE.Color('#1E293B'), roughness: 0.9, metalness: 0.0 }),
    []
  )
  const archZ = ROOM_Z - 5

  return (
    <group>
      {/* Left wall section */}
      <mesh position={[-3.5, 1.5, archZ]} material={wallMat} receiveShadow>
        <boxGeometry args={[5, 3.2, 0.2]} />
      </mesh>
      {/* Right wall section */}
      <mesh position={[3.5, 1.5, archZ]} material={wallMat} receiveShadow>
        <boxGeometry args={[5, 3.2, 0.2]} />
      </mesh>
      {/* Top section above archway */}
      <mesh position={[0, 2.8, archZ]} material={wallMat} receiveShadow>
        <boxGeometry args={[2, 0.6, 0.2]} />
      </mesh>
      {/* Arch trim */}
      <mesh position={[-1, 1.25, archZ - 0.11]}>
        <boxGeometry args={[0.06, 2.5, 0.02]} />
        <meshStandardMaterial color="#00D4FF" emissive="#00D4FF" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[1, 1.25, archZ - 0.11]}>
        <boxGeometry args={[0.06, 2.5, 0.02]} />
        <meshStandardMaterial color="#00D4FF" emissive="#00D4FF" emissiveIntensity={0.2} />
      </mesh>
    </group>
  )
}

/* ── Main Living Room Scene ──────────────────────────── */

export default function LivingRoomScene() {
  const groupRef = useRef()
  const [unmounted, setUnmounted] = useState(false)

  const floorMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: new THREE.Color('#A0A0A0'), roughness: 0.08, metalness: 0.3, envMapIntensity: 0.6 }),
    []
  )
  const wallMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: new THREE.Color('#1E293B'), roughness: 0.9, metalness: 0.0 }),
    []
  )

  useFrame((_, delta) => {
    const { scrollProgress, cleanProgress } = useViewStore.getState()

    // Conditional unmount outside active phase
    if ((scrollProgress < 0.10 || scrollProgress > 0.75) && !unmounted) setUnmounted(true)
    if (scrollProgress >= 0.10 && scrollProgress <= 0.75 && unmounted) setUnmounted(false)

    if (!groupRef.current) return

    const fade = scrollProgress < 0.15 ? 0
      : scrollProgress < 0.22 ? (scrollProgress - 0.15) / 0.07
      : scrollProgress > 0.68 ? Math.max(0, 1 - (scrollProgress - 0.68) / 0.07)
      : 1

    // Walls get slightly brighter as room cleans
    const wallBrightness = 0.11 + cleanProgress * 0.04
    wallMat.color.setRGB(wallBrightness, wallBrightness * 1.15, wallBrightness * 1.35)

    groupRef.current.traverse((child) => {
      if (child.isMesh && child.material && !child.userData.fadeAt && child.userData.skipRoomFade !== true) {
        if (child.material.transmission === undefined || child.material.transmission < 0.5) {
          child.material.transparent = true
          child.material.opacity = fade
        }
      }
    })
    groupRef.current.visible = fade > 0.01
  })

  if (unmounted) return null

  return (
    <group ref={groupRef}>
      {/* Floor */}
      <mesh position={[0, -0.04, ROOM_Z]} rotation={[-Math.PI / 2, 0, 0]} material={floorMat} receiveShadow>
        <planeGeometry args={[12, 14]} />
      </mesh>

      {/* Walls */}
      <mesh position={[0, 1.5, ROOM_Z - 5.1]} material={wallMat} receiveShadow>
        <planeGeometry args={[12, 3.4]} />
      </mesh>
      <mesh position={[-5, 1.5, ROOM_Z]} rotation={[0, Math.PI / 2, 0]} material={wallMat} receiveShadow>
        <planeGeometry args={[14, 3.4]} />
      </mesh>
      <mesh position={[5, 1.5, ROOM_Z]} rotation={[0, -Math.PI / 2, 0]} material={wallMat} receiveShadow>
        <planeGeometry args={[14, 3.4]} />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, 3.2, ROOM_Z]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 14]} />
        <meshStandardMaterial color="#0F1D32" roughness={0.95} />
      </mesh>

      {/* Furniture */}
      <Sofa />
      <CoffeeTable />
      <FloorLamp />

      {/* Hallway partition with archway */}
      <HallwayPartition />

      {/* Dirty overlay elements */}
      <DirtyOverlays />

      {/* Worker characters */}
      <CleanerCharacter
        position={[-1.5, 0, ROOM_Z + 2]}
        task="wipe"
        activeRange={[0.0, 0.6]}
        facingAngle={Math.PI}
      />
      <CleanerCharacter
        position={[1, 0, ROOM_Z - 0.5]}
        task="vacuum"
        activeRange={[0.1, 0.8]}
        facingAngle={-Math.PI / 4}
      />
      <CleanerCharacter
        position={[2, 0, ROOM_Z - 2]}
        task="dust"
        activeRange={[0.2, 0.9]}
        facingAngle={-Math.PI / 2}
      />

      {/* Lighting */}
      <ambientLight intensity={0.15} color="#E2E8F0" />
      <pointLight position={[0, 3, ROOM_Z]} color="#C8D8FF" intensity={1.5} distance={10} decay={2} />
    </group>
  )
}
