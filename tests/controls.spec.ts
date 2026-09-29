import { expect, test } from '@playwright/test';
import { defaultHouse } from '../src/config/house';
import { controlsConfig, getViewPreset } from '../src/config/views';
import {
  collectConsole,
  distance,
  getCamera,
  openViewer,
  polarAngleDeg,
  setCamera,
  waitFrames,
} from './helpers';

const EPS = 1e-3;
// Enough frames for damping (factor 0.08) to die out.
const SETTLE_FRAMES = 90;

test.describe('camera controls', () => {
  test.skip(({ isMobile }) => isMobile, 'mouse-driven checks run on desktop projects');

  test('zoom, orbit and pan stay within limits, with a clean console', async ({ page }) => {
    const log = collectConsole(page);
    await openViewer(page);

    const box = await page.locator('canvas').boundingBox();
    if (!box) throw new Error('Canvas not found');
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    await page.mouse.move(cx, cy);

    // Zoom out past the limit.
    for (let i = 0; i < 30; i++) await page.mouse.wheel(0, 400);
    await waitFrames(page, SETTLE_FRAMES);
    let cam = await getCamera(page);
    expect(distance(cam.position, cam.target)).toBeLessThanOrEqual(
      controlsConfig.maxDistance + EPS,
    );
    expect(distance(cam.position, cam.target)).toBeGreaterThan(controlsConfig.maxDistance - 1);

    // Zoom in past the limit. drei's OrbitControls zooms a fixed 5% per wheel event,
    // so 60 m → 3 m needs about 60 events.
    for (let i = 0; i < 80; i++) await page.mouse.wheel(0, -400);
    await waitFrames(page, SETTLE_FRAMES);
    cam = await getCamera(page);
    expect(distance(cam.position, cam.target)).toBeGreaterThanOrEqual(
      controlsConfig.minDistance - EPS,
    );
    expect(distance(cam.position, cam.target)).toBeLessThan(controlsConfig.minDistance + 1);

    // Orbit down towards the ground: dragging upwards increases the polar angle.
    const corner = getViewPreset('corner');
    await setCamera(page, corner.position, corner.target);
    for (let i = 0; i < 3; i++) {
      await page.mouse.move(cx, cy + 250);
      await page.mouse.down();
      await page.mouse.move(cx, cy - 250, { steps: 10 });
      await page.mouse.up();
    }
    await waitFrames(page, SETTLE_FRAMES);
    cam = await getCamera(page);
    expect(polarAngleDeg(cam.position, cam.target)).toBeLessThanOrEqual(
      controlsConfig.maxPolarAngleDeg + 0.01,
    );
    expect(cam.position[1]).toBeGreaterThan(0);

    // Pan far away with right-drags: the target must stay inside the clamp box.
    await setCamera(page, corner.position, corner.target);
    for (let i = 0; i < 5; i++) {
      await page.mouse.move(cx, cy);
      await page.mouse.down({ button: 'right' });
      await page.mouse.move(cx - 600, cy + 300, { steps: 10 });
      await page.mouse.up({ button: 'right' });
    }
    await waitFrames(page, SETTLE_FRAMES);
    cam = await getCamera(page);
    const { length, width } = defaultHouse.footprint;
    const m = controlsConfig.targetMargin;
    const [tx, ty, tz] = cam.target;
    expect(Math.abs(tx)).toBeLessThanOrEqual(length / 2 + m + EPS);
    expect(Math.abs(tz)).toBeLessThanOrEqual(width / 2 + m + EPS);
    expect(ty).toBeGreaterThanOrEqual(controlsConfig.targetMinY - EPS);
    expect(ty).toBeLessThanOrEqual(controlsConfig.targetMaxY + EPS);
    // The drags really did push against the box, not just drift a little.
    expect(Math.max(Math.abs(tx), Math.abs(tz))).toBeGreaterThan(width / 2);

    expect(log.errors).toEqual([]);
    expect(log.warnings).toEqual([]);
  });
});
