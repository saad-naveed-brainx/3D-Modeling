import { OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useCallback, useLayoutEffect, useMemo, useRef, type ComponentRef } from 'react';
import { MathUtils, Vector3 } from 'three';
import { defaultHouse } from '../config/house';
import { controlsConfig, defaultViewId, getViewPreset } from '../config/views';

const offset = new Vector3();

/**
 * The app's single OrbitControls instance (SCOPE §8.3). The initial target is set once on
 * mount and never passed as a prop, so re-renders can't reset the camera.
 */
export function Controls() {
  const ref = useRef<ComponentRef<typeof OrbitControls>>(null);
  const camera = useThree((state) => state.camera);

  const bounds = useMemo(() => {
    const { length, width } = defaultHouse.footprint;
    const m = controlsConfig.targetMargin;
    return {
      min: new Vector3(-length / 2 - m, controlsConfig.targetMinY, -width / 2 - m),
      max: new Vector3(length / 2 + m, controlsConfig.targetMaxY, width / 2 + m),
    };
  }, []);

  useLayoutEffect(() => {
    const controls = ref.current;
    if (!controls) return;
    controls.target.set(...getViewPreset(defaultViewId).target);
    controls.update();
  }, []);

  // Keep the pan target inside a box around the house; shift the camera by the same amount
  // so clamping feels like hitting a wall rather than a sudden rotation.
  const clampTarget = useCallback(() => {
    const controls = ref.current;
    if (!controls) return;
    offset.copy(controls.target).clamp(bounds.min, bounds.max).sub(controls.target);
    if (offset.lengthSq() === 0) return;
    controls.target.add(offset);
    camera.position.add(offset);
  }, [bounds, camera]);

  return (
    <OrbitControls
      ref={ref}
      makeDefault
      enableDamping
      dampingFactor={controlsConfig.dampingFactor}
      minDistance={controlsConfig.minDistance}
      maxDistance={controlsConfig.maxDistance}
      maxPolarAngle={MathUtils.degToRad(controlsConfig.maxPolarAngleDeg)}
      onChange={clampTarget}
    />
  );
}
