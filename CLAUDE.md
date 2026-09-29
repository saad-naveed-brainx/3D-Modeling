# Edge Protection Comparison Viewer

A 3D viewer that runs in the browser (Vite, React, TypeScript, React Three Fiber). It shows a partly built Australian hip-roof house fitted with two placeholder roof edge protection systems: a tube-and-coupler scaffold that stands on the ground ("Competitor") and a guardrail with mesh panels on brackets fixed below the eave ("Our System"). Users switch between three states (competitor, comparison, ours) and the camera never moves. Client: Erik. This is a prototype built on placeholder assumptions; no client data has been received.

[SCOPE.md](SCOPE.md) is the client's requirements spec. Where a logged decision departs from it, [docs/DECISIONS.md](docs/DECISIONS.md) wins. Don't edit SCOPE.md to record departures.

## Start of every session

1. Read this file, then [docs/WORKLOG.md](docs/WORKLOG.md). Its top entry is the current state.
2. Skim [docs/BACKLOG.md](docs/BACKLOG.md) for open items relevant to the request.
3. If a doc conflicts with the code, trust the code and fix the doc.

## Docs index

| File                                         | Holds                                                              | Update when                                                                    |
| -------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| [SCOPE.md](SCOPE.md)                         | Client requirements, phases, acceptance criteria                   | Only if the user asks                                                          |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Modules, data flow, groups and visibility, asset pipeline, hosting | A structural invariant changes                                                 |
| [docs/DECISIONS.md](docs/DECISIONS.md)       | The reasons behind non-obvious choices, dated                      | Any non-obvious choice. Append only; supersede with a new entry, never rewrite |
| [docs/WORKLOG.md](docs/WORKLOG.md)           | Status per task, newest first                                      | Every finished task or meaningful chunk                                        |
| [docs/BACKLOG.md](docs/BACKLOG.md)           | Ad-hoc requests, feedback and ideas, with status                   | A new ad-hoc request comes in; mark it done when shipped                       |
| `docs/<FEATURE>_SPEC.md`, reference docs     | Specs for individual features; single authoritative references     | Create only when the project needs one                                         |

## Hard invariants (do not violate)

- **Camera preservation.** One Canvas, one camera and one OrbitControls for the app's lifetime. Switching state never remounts them and never moves the camera or target (SCOPE §8.3).
- **No hard-coded dimensions.** Every dimension, spacing and rule lives in `src/config/*.ts`, and geometry reads from config.
- **Pure builders.** Geometry builders take parameters and return Three.js objects, with no side effects. The house builder takes a single `HouseParams` object that can be serialised to JSON.
- **Placeholders only.** No real brand, logo or product names. The UI labels both systems as placeholder designs.
- **Locked stack.** The SCOPE §5 stack, plus ESLint and Prettier. Ask before adding any other dependency or changing the architecture.
- **Instancing and budgets.** Repeated parts use `InstancedMesh`. Stay under 150 draw calls, 500k triangles and 1.5 MB of gzipped JS + CSS.
- **Independent fades.** Each system group has its own material instances.
- **Coordinates.** Metres with Y up. The origin is the centre of the footprint at ground level, the long axis runs along X, and the front faces +Z.

## Gotchas

- **The x = 0 split belongs to our system.** In Comparison, the competitor's left half ends about 0.15 m short of x = 0 with its own end standards and end guardrail. Otherwise our centre bracket arm runs straight through the competitor's centre inner standard.
- **Studs on the front and back walls are set out from the centre.** That puts a stud line at x = 0, where brackets snap to studs and a post must sit. Keep openings away from bracket positions.
- **Elements exactly at x = 0 belong to both left and right** but are counted once.
- **Finish every fade explicitly.** After a fade-out, set `visible = false`. After a fade-in, set `transparent = false`, or transparency sorting artefacts appear. With `prefers-reduced-motion`, switch instantly.
- **Competitor inner standards stop below the rafter tails** (about 2.55 m).
- **`vite.config.ts` needs `base: './'`** so the build works from any path and inside an iframe.
- **Never pass camera position or controls target as React props that change between renders.** R3F re-applies them and the camera jumps. The Canvas camera options are a module constant, and the OrbitControls target is set once in a layout effect.
- **three r186 removed `PCFSoftShadowMap`.** A bare `shadows` prop makes R3F pick it and three prints a warning. Use `shadows="percentage"` with `shadow-radius`.
- **drei's OrbitControls come from three-stdlib, not three/examples.** Each wheel event zooms a fixed 5% whatever the scroll size.
- **Tests allowlist known upstream console warnings** in `tests/helpers.ts` (the R3F `THREE.Clock` deprecation and headless GL readback notices). Don't widen the list without a reason in a comment.
- **Headless Chromium needs `--use-angle=metal`** (set in `playwright.config.ts`). Without it, WebGL falls back to SwiftShader at about 6 fps and tests time out.

## Commands

- `npm run dev`: Vite dev server
- `npm run build`: type check + production build to `dist/`
- `npm run lint`, `npm run format`, `npm run typecheck`
- `npm run test:e2e`: all Playwright tests (4 projects)
- `npm run screenshots`: one PNG per preset per project in `screenshots/` (git-ignored)

## Workflow

- Build the SCOPE §12 phases in order. After each phase: commit, take Playwright screenshots (Chromium + WebKit), post a short summary, then **stop and wait for the user's go-ahead**.
- Check the scene visually from several presets; type checks alone aren't enough.
- Git remote `origin` is `git@github.com:saad-naveed-brainx/3D-Modeling.git`. Claude commits but can't push; the user pushes.

## Response style

- Keep replies brief.
- When questions come up, say so first, then ask them one at a time when the user says to.
