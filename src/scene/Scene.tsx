import { useMemo } from 'react';
import { defaultHouse } from '../config/house';
import { materialSpecs } from '../config/materials';
import { buildSlab } from '../geometry/house/slab';
import { createHouseMaterials } from '../geometry/materials';
import { Controls } from './Controls';
import { DebugBridge } from './DebugBridge';
import { SceneEnvironment } from './Environment';
import { Lighting } from './Lighting';

export function Scene() {
  const materials = useMemo(() => createHouseMaterials(), []);
  const slab = useMemo(
    () => buildSlab(defaultHouse, materials.concrete, materialSpecs.concrete.tileSize),
    [materials],
  );

  return (
    <>
      <SceneEnvironment />
      <Lighting />
      <primitive object={slab} />
      <Controls />
      <DebugBridge />
    </>
  );
}
