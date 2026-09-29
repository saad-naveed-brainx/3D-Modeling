export type Vec3 = [number, number, number];

export interface ViewPreset {
  id: ViewId;
  label: string;
  position: Vec3;
  target: Vec3;
}

export type ViewId = 'corner' | 'front' | 'top' | 'oursBracket' | 'competitorBase' | 'split';

/** Camera presets (SCOPE §9.2). Tune after visual checks. */
export const viewPresets: readonly ViewPreset[] = [
  { id: 'corner', label: 'Corner', position: [18, 11, 20], target: [0, 2.5, 0] },
  { id: 'front', label: 'Front', position: [0, 5, 24], target: [0, 2.5, 0] },
  { id: 'top', label: 'Top', position: [0, 32, 0.01], target: [0, 0, 0] },
  {
    id: 'oursBracket',
    label: 'Close-up: our bracket',
    position: [7, 3.2, 8.5],
    target: [4.5, 2.6, 5.9],
  },
  {
    id: 'competitorBase',
    label: 'Close-up: competitor base',
    position: [-7, 1.6, 9.5],
    target: [-4.5, 0.4, 6.3],
  },
  { id: 'split', label: 'Split line', position: [0, 4, 12], target: [0, 2.5, 5] },
];

export const defaultViewId: ViewId = 'corner';

export function getViewPreset(id: ViewId): ViewPreset {
  const preset = viewPresets.find((v) => v.id === id);
  if (!preset) throw new Error(`Unknown view preset: ${id}`);
  return preset;
}

export const cameraConfig = {
  fov: 40,
  near: 0.1,
  far: 400,
} as const;

/** OrbitControls limits (SCOPE §9.1). */
export const controlsConfig = {
  minDistance: 3,
  maxDistance: 60,
  /** Just under 90° so the camera never dips below the ground. */
  maxPolarAngleDeg: 88,
  dampingFactor: 0.08,
  /** Pan target is clamped to the house footprint grown by this margin (X/Z). */
  targetMargin: 4,
  targetMinY: 0,
  targetMaxY: 6,
} as const;
