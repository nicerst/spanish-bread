// ponytail: box placeholder with Pixar head proportions; swap for GLTF asset in v2
export function NPCModel() {
  return (
    <group>
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[0.6, 0.8, 0.3]} />
        <meshStandardMaterial color="#e88b4a" />
      </mesh>
      <mesh position={[0, 1.2, 0]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="#f4c28a" />
      </mesh>
    </group>
  )
}