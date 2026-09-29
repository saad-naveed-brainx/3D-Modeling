import { expect, test } from '@playwright/test';
import { viewPresets } from '../src/config/views';
import { collectConsole, openViewer, setCamera, waitFrames } from './helpers';

// One screenshot per camera preset per project, written to screenshots/<project>/<preset>.png
// for visual review (the folder is git-ignored).
for (const preset of viewPresets) {
  test(`preset: ${preset.label}`, async ({ page }, testInfo) => {
    const log = collectConsole(page);
    await openViewer(page);
    await setCamera(page, preset.position, preset.target);
    await waitFrames(page, 10);
    await page.screenshot({ path: `screenshots/${testInfo.project.name}/${preset.id}.png` });
    expect(log.errors).toEqual([]);
  });
}
