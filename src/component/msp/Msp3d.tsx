import React, { useRef, useState } from 'react'
import { Canvas, MeshProps, useFrame } from 'react-three-fiber'
import type { Mesh } from 'three'

function Box(props) {
  const mesh = useRef<Mesh>()
  useFrame(() => {
    mesh.current.rotation.x = mesh.current.rotation.y += 0.01
  })
  return (
    <mesh {...props} ref={mesh}>
      <boxBufferGeometry args={[1, 0.2, 1]} />
      <meshStandardMaterial color={'orange'} />
    </mesh>
  )
}

export const Msp3d = () => {
  return (
    <Canvas style={{ width: '100%', height: '600px' }}>
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      <pointLight position={[-10, -10, -10]} />
      <Box position={[0, 0, 0]} />
    </Canvas>
  )
}
