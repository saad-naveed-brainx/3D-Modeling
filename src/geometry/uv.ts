import type { BoxGeometry } from 'three';

/**
 * Rescales BoxGeometry UVs in place so one texture repeat covers `tile` metres on every face,
 * instead of stretching the texture once across each face.
 */
export function scaleBoxUVs(geometry: BoxGeometry, tile: number): BoxGeometry {
  const { width, height, depth } = geometry.parameters;
  const uv = geometry.getAttribute('uv');
  const normal = geometry.getAttribute('normal');
  for (let i = 0; i < uv.count; i++) {
    const nx = Math.abs(normal.getX(i));
    const ny = Math.abs(normal.getY(i));
    // Face spans (u, v): ±X → (depth, height), ±Y → (width, depth), ±Z → (width, height).
    const [su, sv] = nx > 0.5 ? [depth, height] : ny > 0.5 ? [width, depth] : [width, height];
    uv.setXY(i, (uv.getX(i) * su) / tile, (uv.getY(i) * sv) / tile);
  }
  uv.needsUpdate = true;
  return geometry;
}
