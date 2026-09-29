import type { Page } from '@playwright/test';
import type { Vec3 } from '../src/config/views';
import '../src/scene/debugApi';

export interface ConsoleLog {
  errors: string[];
  warnings: string[];
}

/**
 * Known upstream warnings we can't fix from app code. Keep this list short and explain each.
 * - R3F 9.8.1 creates a THREE.Clock in its store; three r186 deprecates Clock in favour of Timer.
 * - Headless Chromium's GL driver logs a performance notice when the browser reads frames back.
 */
const KNOWN_WARNINGS = [
  /THREE\.Clock: This module has been deprecated/,
  /GL Driver Message .*GPU stall due to ReadPixels/,
];

/** Records console errors/warnings and uncaught page errors for later assertions. */
export function collectConsole(page: Page): ConsoleLog {
  const log: ConsoleLog = { errors: [], warnings: [] };
  page.on('console', (msg) => {
    if (msg.type() === 'error') log.errors.push(msg.text());
    if (msg.type() === 'warning' && !KNOWN_WARNINGS.some((re) => re.test(msg.text()))) {
      log.warnings.push(msg.text());
    }
  });
  page.on('pageerror', (err) => log.errors.push(err.message));
  return log;
}

export async function waitFrames(page: Page, count: number): Promise<void> {
  const start = await page.evaluate(() => window.__viewer?.frame ?? 0);
  await page.waitForFunction((target) => (window.__viewer?.frame ?? 0) >= target, start + count, {
    timeout: 60_000,
  });
}

/** Opens the viewer and waits until it has rendered a few frames. */
export async function openViewer(page: Page, query = ''): Promise<void> {
  await page.goto(`/${query}`);
  await page.waitForFunction(() => (window.__viewer?.frame ?? 0) > 3, undefined, {
    timeout: 60_000,
  });
}

export async function getCamera(page: Page): Promise<{ position: Vec3; target: Vec3 }> {
  return page.evaluate(() => {
    if (!window.__viewer) throw new Error('Viewer debug API not available');
    return window.__viewer.getCamera();
  });
}

export async function setCamera(page: Page, position: Vec3, target: Vec3): Promise<void> {
  await page.evaluate(
    ([p, t]) => {
      if (!window.__viewer) throw new Error('Viewer debug API not available');
      window.__viewer.setCamera(p, t);
    },
    [position, target] as const,
  );
}

export function distance(a: Vec3, b: Vec3): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

/** Angle between the camera direction from the target and straight up, in degrees. */
export function polarAngleDeg(position: Vec3, target: Vec3): number {
  return (Math.acos((position[1] - target[1]) / distance(position, target)) * 180) / Math.PI;
}
