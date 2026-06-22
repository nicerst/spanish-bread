import { Canvas } from '@react-three/fiber'
import { Environment, PerspectiveCamera } from '@react-three/drei'
import { EffectComposer, Vignette } from '@react-three/postprocessing'
import { HUD } from './HUD'
import { DialogueOverlay } from './DialogueOverlay'
import { NPCModel } from './NPCModel'

export function SceneView() {
  return (
    <div className="relative w-full h-screen">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 1.5, 4]} fov={50} />
        <Environment preset="sunset" />
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <NPCModel />
        <EffectComposer>
          <Vignette eskil={false} offset={0.1} darkness={0.7} />
        </EffectComposer>
      </Canvas>
      <HUD />
      <DialogueOverlay />
    </div>
  )
}