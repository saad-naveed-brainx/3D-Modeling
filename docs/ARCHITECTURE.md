# Architecture

Status: **Phase 1 built** (2026-09-29): scene shell, ground, slab, lighting, controls. Everything else is still planned. This describes the design in SCOPE §5 and §11, adjusted by [DECISIONS.md](DECISIONS.md). Rows marked _(planned)_ don't exist yet.

## Overview

A static single-page app with no backend. All 3D geometry is generated in code from config, and nothing is modelled by hand. The same builders feed the GLB export. A config switch lets the app load polished GLBs in place of the procedural geometry.

## Modules

| Layer            | Location                            | Role                                                                                                                                                                                                                              |
| ---------------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Config           | `src/config/`                       | `house.ts` (`HouseParams`), `scene.ts` (ground, sun, environment, render caps), `views.ts` (presets, camera, control limits), `materials.ts`; _(planned)_ `competitorSystem.ts`, `ourSystem.ts`. The only place dimensions live   |
| Geometry helpers | `src/geometry/`                     | `noise.ts` (seeded PRNG, tileable and world-space noise), `textures.ts` (canvas textures), `uv.ts` (UVs in metres for boxes), `materials.ts` (material factories), `site.ts` (ground disc, sky dome); _(planned)_ `instancing.ts` |
| House builders   | `src/geometry/house/`               | `slab.ts`; _(planned)_ wall frames, roof framing, roof cover, eaves, brickwork. Pure functions of `HouseParams`                                                                                                                   |
| Rules engine     | `src/systems/layout.ts` _(planned)_ | Perimeter lines at offset D, bays no longer than the max span, a post at x = 0 on front and back, shared corner posts, left/right tagging, component counts                                                                       |
| System builders  | `src/systems/` _(planned)_          | `competitor.ts`, `ours.ts`: turn the layout into instanced geometry per group                                                                                                                                                     |
| Scene            | `src/scene/`                        | `Scene`, `Lighting`, `Environment`, `Controls` (single OrbitControls, target clamp), `DebugBridge` + `debugApi.ts` (test hook), `device.ts`; _(planned)_ `SystemGroup` (fades), `Labels`                                          |
| UI               | `src/ui/` _(planned)_               | `StateSwitcher`, `ViewTools`, `InfoPanel`, `Loading`                                                                                                                                                                              |
| State            | `src/store.ts` _(planned)_          | zustand: current state and whether labels are on                                                                                                                                                                                  |
| Styles           | `src/styles/`                       | `tokens.css` (palette, sky gradient, light and dark), `app.css`                                                                                                                                                                   |
| Fonts            | `public/fonts/` _(planned)_         | Self-hosted Barlow and Barlow Condensed woff2 files                                                                                                                                                                               |
| Tests            | `tests/`, `playwright.config.ts`    | `controls.spec.ts` (zoom, orbit and pan limits; clean console), `screenshots.spec.ts` (every preset → `screenshots/<project>/`), `helpers.ts`                                                                                     |

## Data flow

```
config/*.ts ─► house builders ─────────────────────────────► instanced meshes ─► <Scene>
            └► layout.ts ─► competitor.ts / ours.ts ─► left / right groups ─► <SystemGroup> (fade)
                        └► component counts ─────────────────────────────────► <InfoPanel>
store (state, labels) ─► visibility matrix ─► SystemGroup opacity / visible
URL ?state= and keys 1/2/3 ─► store
```

The camera and OrbitControls are created once and are never driven by the store. Only view presets and the zoom and reset buttons move the camera.

## Groups and visibility

| State      | Competitor left             | Competitor right | Ours left | Ours right |
| ---------- | --------------------------- | ---------------- | --------- | ---------- |
| Competitor | shown                       | shown            | hidden    | hidden     |
| Comparison | shown (ends short of x = 0) | hidden           | hidden    | shown      |
| Ours       | hidden                      | hidden           | shown     | shown      |

- **Split handling:** our system owns x = 0. In Comparison, the competitor's left half ends about 0.15 m short, with its own end standards and end guardrail, so it needs an end variant that only Comparison shows. Its x = 0 standards appear only in the Competitor state.
- **Open (Phase 3):** how to stop x = 0 elements that belong to both groups from rendering twice (z-fighting during fades) while still putting them in both `*_Left` and `*_Right` for the GLB export. Log the answer in DECISIONS.

## Rendering

- One `InstancedMesh` per geometry/material pair per group. Each group has its own material instances so fades stay independent.
- `MeshStandardMaterial` PBR throughout. One directional sun casts shadows (PCF, shadow map 2048 on desktop and 1024 on touch devices), plus hemisphere fill.
- **Environment map:** drei `<Environment frames={1}>` renders a vertex-coloured sky dome plus a sun `Lightformer` into a cube map once. No HDR download.
- **Sky:** the visible sky is a CSS gradient (`--sky-top` and `--sky-bottom` tokens) behind a transparent canvas (`alpha: true`).
- **Ground:** a transparent disc with 60 m diameter. Vertex alpha fades its rim into the CSS sky, vertex RGB adds large soil patches that don't repeat, and `renderOrder = -1` draws it first among transparent objects.
- **Textures:** drawn on canvas from a seeded PRNG, so every run is pixel-identical. UVs are in "texture repeats" (world metres ÷ `tileSize`).
- Pixel ratio capped at 2 on desktop and 1.5 on touch devices (`device.ts` checks `pointer: coarse`).

## Testing

- `window.__viewer` (set up by `DebugBridge`) exposes `frame`, `getCamera`, `setCamera` and `renderInfo`. It's enabled in dev, or in production with `?e2e`. Tests wait on frame counts, not timeouts.
- Four Playwright projects: Chromium and WebKit, each on desktop (1440×900) and mobile (Pixel 7, iPhone 15). Mouse-driven control tests skip the mobile projects.
- Headless Chromium runs on the GPU via `--use-angle=metal` (macOS). Without that flag it drops to SwiftShader at about 6 fps.

## Asset pipeline

```
builders ─► dev-only export page (driven by Playwright) ─► GLTFExporter ─► gltf-transform (dedupe, EXT_mesh_gpu_instancing, Meshopt, KTX2/WebP) ─► models/*.glb
```

Outputs: `house.glb`, `competitor-system.glb` (nodes `Competitor_Left` and `Competitor_Right`), `our-system.glb` (nodes `Ours_Left` and `Ours_Right`). Materials use standard glTF PBR so they import cleanly into Blender.

## Environments and hosting

- **Local:** Node 26.8.1, npm 11.19.0, Vite 8 dev server.
- **Pinned toolchain:** React 19.3, three 0.186.1, R3F 9.8.1, drei 10.7.9, zustand 5.0.15, TypeScript 6.0.3 (not 7; see DECISIONS), ESLint 10, Playwright 1.63. Exact versions are in `package.json`.
- **Build:** `npm run build` produces a static `dist/`, with `base: './'`.
- **Hosting (documented in Phase 9):** S3 + CloudFront (recommended), any static host, or nginx on EC2. Serve `.glb` files as `model/gltf-binary` with long cache headers.
- **Embedding:** an iframe with `?state=competitor|comparison|ours`.

## Security and privacy

Static files only: no backend, no secrets, no accounts, no analytics. Fonts are self-hosted, so viewers never contact third parties at runtime.

## External services

None at runtime.
