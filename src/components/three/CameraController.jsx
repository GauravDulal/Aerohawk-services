import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useViewStore from '../../store/useViewStore'

// Narrative camera waypoints — cinematic drone-shot journey
const WAYPOINTS = [
  // Phase A — Hero Door: approach → pass through
  { at: 0.00, pos: [0, 1.6, 8],    lookAt: [0, 1.4, 0],     fov: 50 },
  { at: 0.10, pos: [0, 1.6, 5],    lookAt: [0, 1.4, 0],     fov: 50 },
  { at: 0.18, pos: [0, 1.6, 2.5],  lookAt: [0, 1.4, 0],     fov: 50 },
  { at: 0.25, pos: [0, 1.6, -1],   lookAt: [0, 1.4, -5],    fov: 55 }, // dolly-zoom through door

  // Phase B — Living Room & Drone
  { at: 0.30, pos: [0, 1.8, -5],   lookAt: [1.5, 1.5, -10], fov: 52 },
  { at: 0.40, pos: [1.5, 1.7, -7], lookAt: [0, 1.6, -11],   fov: 50 },
  { at: 0.50, pos: [1, 1.6, -9],   lookAt: [0, 1.5, -13],   fov: 50 },
  { at: 0.55, pos: [0, 1.6, -11],  lookAt: [0, 1.5, -14],   fov: 50 },
  { at: 0.60, pos: [0, 1.6, -14],  lookAt: [0, 1.5, -18],   fov: 55 }, // through glass

  // Phase C — Sunlit Room
  { at: 0.65, pos: [0, 1.8, -18],  lookAt: [1, 1.2, -22],   fov: 52 },
  { at: 0.75, pos: [2, 1.6, -20],  lookAt: [0, 1.0, -22],   fov: 50 },
  { at: 0.85, pos: [3, 1.5, -21],  lookAt: [-0.5, 1.0, -23], fov: 48 },
  { at: 1.00, pos: [3, 1.5, -21],  lookAt: [-0.5, 1.0, -23], fov: 48 }, // static for booking
]

function lerpWaypoints(progress, waypoints) {
  let i = 0
  for (; i < waypoints.length - 1; i++) {
    if (progress <= waypoints[i + 1].at) break
  }
  i = Math.min(i, waypoints.length - 2)

  const a = waypoints[i]
  const b = waypoints[i + 1]
  const range = b.at - a.at
  const t = range > 0 ? (progress - a.at) / range : 0

  // Smoothstep easing
  const st = t * t * (3 - 2 * t)

  return {
    pos: [
      a.pos[0] + (b.pos[0] - a.pos[0]) * st,
      a.pos[1] + (b.pos[1] - a.pos[1]) * st,
      a.pos[2] + (b.pos[2] - a.pos[2]) * st,
    ],
    lookAt: [
      a.lookAt[0] + (b.lookAt[0] - a.lookAt[0]) * st,
      a.lookAt[1] + (b.lookAt[1] - a.lookAt[1]) * st,
      a.lookAt[2] + (b.lookAt[2] - a.lookAt[2]) * st,
    ],
    fov: a.fov + (b.fov - a.fov) * st,
  }
}

// Check if we're in a transition zone (door or glass pass-through)
function getTransitionIntensity(progress) {
  // Door transition: 0.20 → 0.28
  if (progress > 0.20 && progress < 0.28) {
    const mid = 0.24
    return 1 - Math.abs(progress - mid) / 0.04
  }
  // Glass transition: 0.56 → 0.64
  if (progress > 0.56 && progress < 0.64) {
    const mid = 0.60
    return 1 - Math.abs(progress - mid) / 0.04
  }
  return 0
}

const DAMP_FACTOR = 4

export default function CameraController() {
  const currentLookAt = useRef(new THREE.Vector3(0, 1.4, 0))

  useFrame((state, delta) => {
    const { scrollProgress, mousePosition } = useViewStore.getState()
    const camera = state.camera

    // Interpolated waypoint
    const wp = lerpWaypoints(scrollProgress, WAYPOINTS)

    // Reduce mouse parallax during transitions to avoid jitter
    const transitionIntensity = getTransitionIntensity(scrollProgress)
    const parallaxScale = 1 - transitionIntensity * 0.8
    const px = mousePosition.x * 0.2 * parallaxScale
    const py = mousePosition.y * 0.1 * parallaxScale

    const targetX = wp.pos[0] + px
    const targetY = wp.pos[1] + py
    const targetZ = wp.pos[2]

    // Buttery-smooth damped position
    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX, DAMP_FACTOR, delta)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetY, DAMP_FACTOR, delta)
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, DAMP_FACTOR, delta)

    // Smooth lookAt
    currentLookAt.current.x = THREE.MathUtils.damp(currentLookAt.current.x, wp.lookAt[0], DAMP_FACTOR, delta)
    currentLookAt.current.y = THREE.MathUtils.damp(currentLookAt.current.y, wp.lookAt[1], DAMP_FACTOR, delta)
    currentLookAt.current.z = THREE.MathUtils.damp(currentLookAt.current.z, wp.lookAt[2], DAMP_FACTOR, delta)

    camera.lookAt(currentLookAt.current)

    // FOV animation — dolly-zoom feel during transitions
    camera.fov = THREE.MathUtils.damp(camera.fov, wp.fov, DAMP_FACTOR, delta)
    camera.updateProjectionMatrix()
  })

  return null
}
