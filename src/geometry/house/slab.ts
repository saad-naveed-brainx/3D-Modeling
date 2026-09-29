import { BoxGeometry, Mesh, type Material } from 'three';
import type { HouseParams } from '../../config/house';
import { scaleBoxUVs } from '../uv';

/** Concrete slab sitting on the ground, extending `slab.edge` beyond the wall frames. */
export function buildSlab(house: HouseParams, material: Material, uvTile: number): Mesh {
  const { length, width } = house.footprint;
  const { thickness, edge } = house.slab;
  const geometry = scaleBoxUVs(
    new BoxGeometry(length + 2 * edge, thickness, width + 2 * edge),
    uvTile,
  );
  const mesh = new Mesh(geometry, material);
  mesh.name = 'Slab';
  mesh.position.y = thickness / 2;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}
