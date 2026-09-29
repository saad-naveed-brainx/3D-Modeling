import {
  BackSide,
  BufferAttribute,
  Color,
  Mesh,
  MeshBasicMaterial,
  RingGeometry,
  SphereGeometry,
  type Material,
} from 'three';

import { fbm2D, smoothstep } from './noise';

export interface GroundParams {
  radius: number;
  /** Fraction of the radius where the rim starts fading out. */
  fadeStart: number;
  /** Typical size in metres of the large light/dark soil patches. */
  patchSize: number;
  /** Brightness swing of those patches (0 = none). */
  patchContrast: number;
}

/**
 * Flat dirt disc at y = 0. UVs are in texture repeats (world metres / `uvTile`). Vertex colours
 * add large non-repeating soil patches, and vertex alpha fades the rim into the sky backdrop.
 */
export function buildGround(params: GroundParams, material: Material, uvTile: number): Mesh {
  const { radius, fadeStart, patchSize, patchContrast } = params;
  const geometry = new RingGeometry(0, radius, 160, 48);
  geometry.rotateX(-Math.PI / 2);
  const position = geometry.getAttribute('position');
  const uv = geometry.getAttribute('uv');
  const colors = new Float32Array(position.count * 4);
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const z = position.getZ(i);
    uv.setXY(i, x / uvTile, -z / uvTile);
    const patch = fbm2D(x / patchSize, z / patchSize, 7);
    const lum = 1 - patchContrast + patchContrast * 2 * patch;
    const alpha = 1 - smoothstep(fadeStart, 1, Math.hypot(x, z) / radius);
    // Darker patches read slightly redder, like damp clay.
    colors.set([lum * (1.04 - 0.04 * patch), lum, lum * (0.96 + 0.04 * patch), alpha], i * 4);
  }
  geometry.setAttribute('color', new BufferAttribute(colors, 4));

  const mesh = new Mesh(geometry, material);
  mesh.name = 'Ground';
  mesh.receiveShadow = true;
  // Draw first among transparent objects so fading system groups sort over it cleanly.
  mesh.renderOrder = -1;
  return mesh;
}

export interface SkyColors {
  zenith: string;
  horizon: string;
  below: string;
}

/** Inside-out sphere with a vertical colour gradient, used only to light the environment map. */
export function buildSkyDome(colors: SkyColors, radius: number): Mesh {
  const geometry = new SphereGeometry(radius, 32, 16);
  const zenith = new Color(colors.zenith);
  const horizon = new Color(colors.horizon);
  const below = new Color(colors.below);
  const position = geometry.getAttribute('position');
  const vertexColors = new Float32Array(position.count * 3);
  const c = new Color();
  for (let i = 0; i < position.count; i++) {
    const h = position.getY(i) / radius;
    if (h >= 0) c.lerpColors(horizon, zenith, Math.pow(h, 0.6));
    else c.lerpColors(horizon, below, smoothstep(0, 0.15, -h));
    vertexColors.set([c.r, c.g, c.b], i * 3);
  }
  geometry.setAttribute('color', new BufferAttribute(vertexColors, 3));
  const material = new MeshBasicMaterial({ vertexColors: true, side: BackSide, toneMapped: false });
  const mesh = new Mesh(geometry, material);
  mesh.name = 'SkyDome';
  return mesh;
}
