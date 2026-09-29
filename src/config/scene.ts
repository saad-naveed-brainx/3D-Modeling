import type { Vec3 } from './views';

/** Site, lighting and renderer settings. Distances in metres. */
export const sceneConfig = {
  ground: {
    /** Bare dirt disc, about 60 m across (SCOPE §6.3). */
    radius: 30,
    /** Fraction of the radius where the edge starts fading into the sky backdrop. */
    fadeStart: 0.45,
    /** Large, non-repeating soil patches (metres, brightness swing). */
    patchSize: 7,
    patchContrast: 0.14,
  },
  sun: {
    position: [14, 22, 12] as Vec3,
    color: '#fff3df',
    intensity: 2.4,
    shadow: {
      mapSizeDesktop: 2048,
      mapSizeMobile: 1024,
      /** Half-size of the orthographic shadow frustum; covers the house plus scaffold. */
      extent: 15,
      near: 1,
      far: 70,
      bias: -0.0004,
      normalBias: 0.03,
      radius: 3,
    },
  },
  hemisphere: {
    sky: '#d4e4f2',
    ground: '#8a7560',
    intensity: 0.5,
  },
  environment: {
    /** Procedural sky dome rendered once into a cube map for PBR reflections. */
    resolution: 256,
    intensity: 0.8,
    zenith: '#5d93c9',
    horizon: '#dfe8ef',
    below: '#7d6b58',
  },
  render: {
    maxDprDesktop: 2,
    maxDprMobile: 1.5,
  },
} as const;
