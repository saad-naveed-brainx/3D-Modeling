# Decisions

Append only, oldest first. Never rewrite or delete an entry. If a decision changes, add a new dated entry that says which one it supersedes.

---

## 2026-09-29: Project root is the `3D-modeling/` folder

- **Decision (user):** Set up Vite directly in this folder next to SCOPE.md and run `git init` here, instead of creating an `edge-protection-viewer/` subfolder.
- **Consequence:** Paths in SCOPE §11 are relative to this folder.

## 2026-09-29: Extra dependencies limited to ESLint and Prettier

- **Decision (user):** Approved ESLint and Prettier as dev dependencies. Declined `@fontsource/*` and `tsx`.
- **Why:** SCOPE §1 requires approval for anything outside the §5 stack. Phase 1 needs lint and formatting.
- **Consequence:** Any other package still needs the user's approval.

## 2026-09-29: Self-host the Barlow fonts

- **Decision (user):** Commit the woff2 files for Barlow and Barlow Condensed under `public/fonts/` and load them with `@font-face`.
- **Why:** No npm package (`@fontsource` was declined), and no calls to Google from client sites that embed the viewer.

## 2026-09-29: GLB export through a dev-only page driven by Playwright

- **Decision:** Replace SCOPE §11's `tools/export-glb.ts` script with a dev-only export page that Playwright drives.
- **Why:** `tsx` was declined. Playwright is already in the stack, and the export needs a browser context for GLTFExporter and canvas textures.

## 2026-09-29: Playwright browsers are Chromium + WebKit

- **Decision (user):** Install and test with Chromium (Chrome, Edge) and WebKit (Safari, iOS).
- **Consequence:** Firefox isn't covered automatically, and mobile frame rates are only emulated. A real-device test is in BACKLOG.

## 2026-09-29: Our system owns the x = 0 split in Comparison

- **Decision (user):** In Comparison, the competitor's left half ends about 0.15 m short of x = 0, with its own end standards and end guardrail. Our bracket and post sit exactly at x = 0.
- **Why:** Otherwise our centre bracket arm (y ≈ 2.3 m, from the wall to 0.95 m out) runs through the competitor's centre inner standard (0.3 m out, up to 2.55 m).
- **Consequence:** The competitor needs an end variant shown only in Comparison. Its x = 0 standards appear only in the Competitor state.

## 2026-09-29: Set out front and back wall studs from the centre

- **Decision (Claude, told the user, no objection):** Lay out the studs on the front and back walls outward from x = 0 rather than from a corner.
- **Why:** SCOPE requires a post at x = 0 and brackets snapped to stud lines. A 450 mm set-out from a corner (L = 16 m) doesn't land on x = 0.

## 2026-09-29: Keep openings clear of bracket positions

- **Decision (Claude, told the user, no objection):** Position the placeholder openings so that no bracket lands on the short studs above a lintel.

## 2026-09-29: Dark mode follows the system setting

- **Decision (Claude, told the user, no objection):** Colour tokens switch on `prefers-color-scheme`, with no manual toggle.

## 2026-09-29: Repo docs are the project memory

- **Decision (user):** Keep project knowledge in `CLAUDE.md` and `docs/` (ARCHITECTURE, DECISIONS, WORKLOG, BACKLOG), not in the agent's private memory.
- **Consequence:** Decisions made earlier this session were moved here from agent memory.

## 2026-09-29: Pin TypeScript 6.0.3, not 7

- **Decision (Claude):** Use TypeScript 6.0.3 although 7.0.2 (the native compiler) is `latest`.
- **Why:** `typescript-eslint` 8.71 (latest) supports TypeScript `<6.1.0`. SCOPE asks for current stable versions and for linting; 6.0.3 is the newest version that satisfies both.
- **Revisit:** When `typescript-eslint` supports TypeScript 7.

## 2026-09-29: ESLint plugin set

- **Decision (Claude):** Alongside `eslint` and `prettier`: `@eslint/js`, `typescript-eslint` and `eslint-plugin-react-hooks`.
- **Why:** They're the minimum ESLint needs to parse TypeScript and check hook rules, so I counted them as part of the approved "ESLint". I left out `globals`, `eslint-plugin-react-refresh` and `eslint-config-prettier`.
- **Also:** `react-hooks/immutability` is off for `src/`, because R3F code mutates Three.js objects from `useThree()` by design.

## 2026-09-29: Procedural environment, CSS sky, fading ground disc

- **Decision (Claude):** Build the environment map from a vertex-coloured sky dome plus a sun `Lightformer`, rendered once by drei `<Environment frames={1}>`. Draw the visible sky as a CSS gradient behind a transparent canvas. The 60 m dirt disc fades to transparent at its rim through vertex alpha.
- **Why:** No HDR download or third-party request (drei presets fetch from a CDN). The sky follows the light and dark tokens with no WebGL work. A fading rim hides the edge of the 60 m ground from any camera distance up to the 60 m zoom limit.
- **Also:** Large soil patches come from world-space noise in vertex colours, and the repeating texture holds only fine grain. An earlier version put large blotches in the 4 m tile and the repetition was obvious.

## 2026-09-29: PCF shadows instead of PCF soft

- **Decision (Claude):** `shadows="percentage"` with `shadow.radius = 3`.
- **Why:** three r186 removed `PCFSoftShadowMap` and warns when it's requested, which is what R3F's default `shadows` does.

## 2026-09-29: Test hook, known-warning allowlist, Metal for headless Chromium

- **Decision (Claude):** Tests drive the scene through `window.__viewer` (dev, or `?e2e` in production) and wait on frame counts. Console warnings fail tests, except an allowlist in `tests/helpers.ts`: the R3F 9.8.1 `THREE.Clock` deprecation, and headless GL readback notices. Headless Chromium runs with `--use-angle=metal`.
- **Why:** The same hook will power the Phase 5 camera-preservation check and the Phase 8 budget checks (`renderInfo`). The allowed warnings come from upstream code or the test environment, not our code. SwiftShader managed 6 fps against 60 fps on Metal.

## 2026-09-29: Extra config file `src/config/scene.ts`

- **Decision (Claude):** Ground, sun, hemisphere, environment and pixel-ratio settings live in `src/config/scene.ts`. Control limits sit with the presets in `views.ts`.
- **Why:** They're config (SCOPE §1 wants every value in `src/config/`) but don't belong in `HouseParams`, which must stay a per-site house description.
