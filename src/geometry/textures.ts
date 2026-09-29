import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three';
import { mulberry32, tileableNoiseField } from './noise';

/** Writes a greyscale luminance field (0–1 per pixel) into a repeating sRGB canvas texture. */
function luminanceTexture(size: number, luminance: Float32Array): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas context unavailable');
  const image = ctx.createImageData(size, size);
  for (let i = 0; i < luminance.length; i++) {
    const v = Math.round(Math.min(1, Math.max(0, luminance[i])) * 255);
    image.data[i * 4] = v;
    image.data[i * 4 + 1] = v;
    image.data[i * 4 + 2] = v;
    image.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.anisotropy = 8;
  return texture;
}

/** Adds soft-edged light and dark pebbles to a luminance field, wrapping at the edges. */
function scatterPebbles(field: Float32Array, size: number, rand: () => number, count: number) {
  for (let n = 0; n < count; n++) {
    const cx = rand() * size;
    const cy = rand() * size;
    const r = 1.2 + rand() * 1.8;
    const shift = (rand() - 0.5) * 0.3;
    const reach = Math.ceil(r);
    for (let dy = -reach; dy <= reach; dy++) {
      for (let dx = -reach; dx <= reach; dx++) {
        const px = Math.floor(cx) + dx;
        const py = Math.floor(cy) + dy;
        const d2 = ((px + 0.5 - cx) ** 2 + (py + 0.5 - cy) ** 2) / (r * r);
        if (d2 >= 1) continue;
        const x = (px + size) % size;
        const y = (py + size) % size;
        field[y * size + x] += shift * (1 - d2) ** 1.5;
      }
    }
  }
}

/**
 * Bare dirt grain and pebbles. Only fine detail lives here because it repeats; the large,
 * non-repeating patches come from vertex colours in buildGround.
 */
export function createGroundTexture(seed = 11): CanvasTexture {
  const size = 512;
  const rand = mulberry32(seed);
  const noise = tileableNoiseField(size, rand, [16, 32, 64, 128], 0.6);
  const field = new Float32Array(size * size);
  for (let i = 0; i < field.length; i++) field[i] = 0.78 + 0.22 * noise[i] + (rand() - 0.5) * 0.05;
  scatterPebbles(field, size, rand, 900);
  return luminanceTexture(size, field);
}

/** Concrete: subtle mottling plus fine speckle. Tinted by the material colour. */
export function createConcreteTexture(seed = 23): CanvasTexture {
  const size = 512;
  const rand = mulberry32(seed);
  const noise = tileableNoiseField(size, rand, [16, 32, 64, 128], 0.65);
  const field = new Float32Array(size * size);
  for (let i = 0; i < field.length; i++) field[i] = 0.9 + 0.1 * noise[i] + (rand() - 0.5) * 0.04;
  return luminanceTexture(size, field);
}
