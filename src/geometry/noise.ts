/** Deterministic PRNG so textures (and therefore screenshots) are identical between runs. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const smooth = (t: number) => t * t * (3 - 2 * t);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smoothstep = (edge0: number, edge1: number, x: number) =>
  smooth(Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0))));

/**
 * Tileable multi-octave value noise field in [0, 1], size × size. Each period must divide
 * `size` so the pattern wraps seamlessly when used as a repeating texture.
 */
export function tileableNoiseField(
  size: number,
  rand: () => number,
  periods: readonly number[],
  persistence: number,
): Float32Array {
  const out = new Float32Array(size * size);
  let amplitude = 1;
  let total = 0;
  for (const period of periods) {
    const lattice = new Float32Array(period * period);
    for (let i = 0; i < lattice.length; i++) lattice[i] = rand();
    const cell = size / period;
    for (let y = 0; y < size; y++) {
      const gy = y / cell;
      const y0 = Math.floor(gy);
      const ty = smooth(gy - y0);
      const row0 = (y0 % period) * period;
      const row1 = ((y0 + 1) % period) * period;
      for (let x = 0; x < size; x++) {
        const gx = x / cell;
        const x0 = Math.floor(gx);
        const tx = smooth(gx - x0);
        const c0 = x0 % period;
        const c1 = (x0 + 1) % period;
        const top = lerp(lattice[row0 + c0], lattice[row0 + c1], tx);
        const bottom = lerp(lattice[row1 + c0], lattice[row1 + c1], tx);
        out[y * size + x] += amplitude * lerp(top, bottom, ty);
      }
    }
    total += amplitude;
    amplitude *= persistence;
  }
  for (let i = 0; i < out.length; i++) out[i] /= total;
  return out;
}

function hash2(ix: number, iy: number, seed: number): number {
  let h = Math.imul(ix, 374761393) ^ Math.imul(iy, 668265263) ^ Math.imul(seed, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** Non-repeating smooth value noise at any point in the plane, in [0, 1]. */
function valueNoise2D(x: number, y: number, seed: number): number {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const tx = smooth(x - x0);
  const ty = smooth(y - y0);
  const top = lerp(hash2(x0, y0, seed), hash2(x0 + 1, y0, seed), tx);
  const bottom = lerp(hash2(x0, y0 + 1, seed), hash2(x0 + 1, y0 + 1, seed), tx);
  return lerp(top, bottom, ty);
}

/** Fractal (multi-octave) version of valueNoise2D, in [0, 1]. */
export function fbm2D(x: number, y: number, seed: number, octaves = 3): number {
  let sum = 0;
  let amplitude = 1;
  let frequency = 1;
  let total = 0;
  for (let o = 0; o < octaves; o++) {
    sum += amplitude * valueNoise2D(x * frequency, y * frequency, seed + o * 101);
    total += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }
  return sum / total;
}
