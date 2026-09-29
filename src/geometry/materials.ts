import { MeshStandardMaterial, type MeshStandardMaterialParameters } from 'three';
import { materialSpecs, type MaterialSpec } from '../config/materials';
import { createConcreteTexture, createGroundTexture } from './textures';

function standard(spec: MaterialSpec, extra: MeshStandardMaterialParameters = {}) {
  return new MeshStandardMaterial({
    color: spec.color,
    roughness: spec.roughness,
    metalness: spec.metalness,
    ...extra,
  });
}

/**
 * Ground fades out at its rim through per-vertex alpha (see buildGround), so it is
 * transparent and blends into the CSS sky gradient behind the canvas.
 */
export function createGroundMaterial(): MeshStandardMaterial {
  return standard(materialSpecs.ground, {
    map: createGroundTexture(),
    vertexColors: true,
    transparent: true,
  });
}

export interface HouseMaterials {
  concrete: MeshStandardMaterial;
}

export function createHouseMaterials(): HouseMaterials {
  return {
    concrete: standard(materialSpecs.concrete, { map: createConcreteTexture() }),
  };
}
