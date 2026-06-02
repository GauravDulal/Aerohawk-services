import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const PARTICLE_COUNT = 400

export default function ParticleField() {
  const pointsRef = useRef()

  const { positions, sizes, offsets } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    const sizes = new Float32Array(PARTICLE_COUNT)
    const offsets = new Float32Array(PARTICLE_COUNT)

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // spread particles in a large sphere
      const radius = 4 + Math.random() * 14
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = radius * Math.cos(phi)

      // sparkle / bubble-like size variation
      sizes[i] = 0.3 + Math.random() * 2.5
      offsets[i] = Math.random() * Math.PI * 2
    }

    return { positions, sizes, offsets }
  }, [])

  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor1: { value: new THREE.Color('#00D4FF') },
        uColor2: { value: new THREE.Color('#ffffff') },
        uOpacity: { value: 0.7 },
      },
      vertexShader: `
        attribute float aSize;
        attribute float aOffset;
        uniform float uTime;
        varying float vAlpha;
        varying float vMix;

        void main() {
          vec3 pos = position;

          // gentle floating drift (like dust / sparkles in clean air)
          pos.y += sin(uTime * 0.25 + aOffset) * 0.6;
          pos.x += sin(uTime * 0.15 + aOffset * 1.3) * 0.4;
          pos.z += cos(uTime * 0.2 + aOffset * 0.7) * 0.3;

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

          gl_PointSize = aSize * (180.0 / -mvPosition.z);
          gl_PointSize = max(gl_PointSize, 0.5);

          float dist = length(mvPosition.xyz);
          // sparkle: sharp twinkle effect
          float twinkle = pow(sin(uTime * 2.5 + aOffset * 4.0) * 0.5 + 0.5, 3.0);
          vAlpha = smoothstep(22.0, 2.0, dist) * (0.15 + 0.85 * twinkle);
          vMix = sin(aOffset) * 0.5 + 0.5;

          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform float uOpacity;
        varying float vAlpha;
        varying float vMix;

        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;

          // soft glow with bright center (like a sparkle / clean gleam)
          float glow = smoothstep(0.5, 0.0, dist);
          float core = smoothstep(0.15, 0.0, dist) * 0.6;
          float alpha = (glow + core) * vAlpha * uOpacity;

          vec3 color = mix(uColor1, uColor2, vMix);
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  }, [])

  useFrame((state) => {
    if (shaderMaterial) {
      shaderMaterial.uniforms.uTime.value = state.clock.elapsedTime
    }
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.015
    }
  })

  return (
    <points ref={pointsRef} material={shaderMaterial}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={PARTICLE_COUNT} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-aSize" count={PARTICLE_COUNT} array={sizes} itemSize={1} />
        <bufferAttribute attach="attributes-aOffset" count={PARTICLE_COUNT} array={offsets} itemSize={1} />
      </bufferGeometry>
    </points>
  )
}
