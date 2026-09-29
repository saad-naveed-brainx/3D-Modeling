import { useFrame, useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import type { Vector3 } from 'three';
import './debugApi';

interface OrbitLike {
  target: Vector3;
  enableDamping: boolean;
  update(): void;
}

const enabled = import.meta.env.DEV || new URLSearchParams(window.location.search).has('e2e');

/** Exposes `window.__viewer` in dev builds, or in production with `?e2e`. */
export function DebugBridge() {
  const camera = useThree((state) => state.camera);
  const controls = useThree((state) => state.controls) as OrbitLike | null;
  const gl = useThree((state) => state.gl);

  useEffect(() => {
    if (!enabled || !controls) return;
    window.__viewer = {
      frame: 0,
      getCamera: () => ({
        position: camera.position.toArray(),
        target: controls.target.toArray(),
      }),
      setCamera: (position, target) => {
        camera.position.set(...position);
        controls.target.set(...target);
        // A non-damped update applies the move exactly and clears leftover damping motion.
        const damping = controls.enableDamping;
        controls.enableDamping = false;
        controls.update();
        controls.enableDamping = damping;
      },
      renderInfo: () => ({ calls: gl.info.render.calls, triangles: gl.info.render.triangles }),
    };
    return () => {
      delete window.__viewer;
    };
  }, [camera, controls, gl]);

  useFrame(() => {
    if (window.__viewer) window.__viewer.frame++;
  });

  return null;
}
