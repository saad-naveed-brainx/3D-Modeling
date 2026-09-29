import type { Vec3 } from '../config/views';

/** Test hook for Playwright: read/set the camera and read renderer stats. */
export interface ViewerDebugApi {
  /** Frames rendered since mount; tests wait on this instead of fixed timeouts. */
  frame: number;
  getCamera(): { position: Vec3; target: Vec3 };
  setCamera(position: Vec3, target: Vec3): void;
  renderInfo(): { calls: number; triangles: number };
}

declare global {
  interface Window {
    __viewer?: ViewerDebugApi;
  }
}
