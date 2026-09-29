import { Environment as DreiEnvironment, Lightformer } from '@react-three/drei';
import { useMemo } from 'react';
import { Vector3 } from 'three';
import { materialSpecs } from '../config/materials';
import { sceneConfig } from '../config/scene';
import { createGroundMaterial } from '../geometry/materials';
import { buildGround, buildSkyDome } from '../geometry/site';

const SKY_RADIUS = 50;

/**
 * Procedural environment map (sky dome plus a sun disc, rendered once into a cube map) for
 * believable metal reflections without downloading an HDR, plus the dirt ground disc.
 * The visible sky is the CSS gradient behind the transparent canvas.
 */
export function SceneEnvironment() {
  const { environment: env, ground: groundConfig, sun } = sceneConfig;

  const skyDome = useMemo(() => buildSkyDome(env, SKY_RADIUS), [env]);
  const ground = useMemo(
    () => buildGround(groundConfig, createGroundMaterial(), materialSpecs.ground.tileSize),
    [groundConfig],
  );
  const sunDisc = useMemo(
    () =>
      new Vector3(...sun.position)
        .normalize()
        .multiplyScalar(SKY_RADIUS * 0.8)
        .toArray(),
    [sun],
  );

  return (
    <>
      <DreiEnvironment frames={1} resolution={env.resolution} environmentIntensity={env.intensity}>
        <primitive object={skyDome} />
        <Lightformer form="circle" color={sun.color} intensity={6} scale={5} position={sunDisc} />
      </DreiEnvironment>
      <primitive object={ground} />
    </>
  );
}
