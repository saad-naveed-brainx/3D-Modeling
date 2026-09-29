import { sceneConfig } from '../config/scene';
import { isCoarsePointer } from './device';

/** One shadow-casting sun plus soft hemisphere fill (SCOPE §5). */
export function Lighting() {
  const { sun, hemisphere } = sceneConfig;
  const shadow = sun.shadow;
  const mapSize = isCoarsePointer ? shadow.mapSizeMobile : shadow.mapSizeDesktop;

  return (
    <>
      <hemisphereLight args={[hemisphere.sky, hemisphere.ground, hemisphere.intensity]} />
      <directionalLight
        position={sun.position}
        color={sun.color}
        intensity={sun.intensity}
        castShadow
        shadow-mapSize={[mapSize, mapSize]}
        shadow-bias={shadow.bias}
        shadow-normalBias={shadow.normalBias}
        shadow-radius={shadow.radius}
        shadow-camera-left={-shadow.extent}
        shadow-camera-right={shadow.extent}
        shadow-camera-top={shadow.extent}
        shadow-camera-bottom={-shadow.extent}
        shadow-camera-near={shadow.near}
        shadow-camera-far={shadow.far}
      />
    </>
  );
}
