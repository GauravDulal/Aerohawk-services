import { Canvas } from '@react-three/fiber'
import CameraController from './CameraController'
import DoorScene from './DoorScene'
import LivingRoomScene from './LivingRoomScene'
import SunlitRoomScene from './SunlitRoomScene'
import AmbientLighting from './AmbientLighting'

export default function ThreeScene() {
  return (
    <div id="three-canvas-container">
      <Canvas
        camera={{ position: [0, 1.6, 8], fov: 50, near: 0.1, far: 200 }}
        dpr={[1, 1.5]}
        shadows
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
      >
        <fog attach="fog" args={['#0A1628', 15, 50]} />

        {/* Camera driven by scroll + mouse */}
        <CameraController />

        {/* Phase-aware dynamic lighting */}
        <AmbientLighting />

        {/* Phase A: Premium front door */}
        <DoorScene />

        {/* Phase B: Living room with cleaning drone */}
        <LivingRoomScene />

        {/* Phase C: Immaculate sunlit room */}
        <SunlitRoomScene />
      </Canvas>
    </div>
  )
}
