import { Canvas } from '@react-three/fiber';
import { sceneConfig } from './config/scene';
import { cameraConfig, defaultViewId, getViewPreset } from './config/views';
import { isCoarsePointer } from './scene/device';
import { Scene } from './scene/Scene';

// Module-level constants: re-renders must never hand the Canvas new camera options, or R3F
// would re-apply them and move the camera (camera preservation, SCOPE §8.3).
const CAMERA = { ...cameraConfig, position: getViewPreset(defaultViewId).position };
const DPR: [number, number] = [
  1,
  isCoarsePointer ? sceneConfig.render.maxDprMobile : sceneConfig.render.maxDprDesktop,
];
const GL = { antialias: true, alpha: true, powerPreference: 'high-performance' } as const;

export function App() {
  return (
    <div className="viewer">
      <Canvas className="viewer-canvas" shadows="percentage" dpr={DPR} camera={CAMERA} gl={GL}>
        <Scene />
      </Canvas>
    </div>
  );
}
