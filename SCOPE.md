# Edge Protection Comparison Viewer: Project Scope

Client reference: Erik
Document purpose: single source of truth for building the project with the Claude Code agent.
Status: prototype build using placeholder assumptions (no client data received yet).

---

## 1. Instructions for the coding agent

Read this whole document before writing any code.

- Work through the phases in Section 12 in order. Do not start a phase until the previous phase meets its acceptance criteria. Commit after each phase with a clear message.
- There is no client data yet. Every dimension, spacing and rule in Sections 6 and 7 is a placeholder assumption. Put all of them in config files (`src/config/*.ts`). Geometry code must read from config and must never hard-code dimensions.
- Both edge-protection systems are generic placeholder designs. Do not use real brand names, logos or product names, and do not present either design as a real product. The UI must label them as placeholder designs.
- Use only the stack in Section 5. Ask the user before adding other dependencies or changing the architecture.
- Check your work visually. Run the dev server and, where possible, take screenshots with Playwright to confirm the scene looks right from several angles.
- Keep code typed, small and modular. Every geometry builder is a pure function: parameters in, Three.js objects out.

---

## 2. Project summary

Build a browser-based interactive 3D viewer showing a partially constructed Australian residential house fitted with temporary roof edge protection. Users orbit, zoom and inspect the house, and switch between three states:

1. **Competitor System**: house with the competitor's system only.
2. **Comparison**: house with both systems, one on each half of the house.
3. **Our System**: house with the client's system only.

Switching states must keep the camera exactly where it is, so users compare both systems from the same viewpoint.

The house is context. The edge-protection systems are the focus, and must be detailed enough to show differences in installation, posts and rails, brackets and attachment points, positioning around the building, and interaction with the building structure.

Audience: builders, roofers and site managers evaluating edge protection, plus the client's sales team.

---

## 3. Assumptions (in place of client data)

| Topic | Assumption |
|---|---|
| House type | Single-storey brick veneer, timber frame, hip roof, on concrete slab |
| Construction stage | Frames and roof framing complete, roofing and brickwork partly done (details in 6.3) |
| Competitor system | Generic ground-based perimeter scaffold, tube-and-coupler style |
| Our system | Generic eave-mounted bracket guardrail with mesh infill panels, no ground contact |
| Comparison layout | House split down the middle: competitor on the left half, ours on the right half |
| Standards | Designs loosely follow typical Australian practice for temporary roof edge protection (guardrail roughly 0.9 to 1.1 m above the roof edge, midrail or infill, toeboard or mesh to catch falling objects). Not a compliance tool. |
| Branding | None. Neutral UI with system colours only |

These two system types were chosen because they are genuinely different installation approaches, which makes the comparison meaningful. They will be replaced when real product data arrives (Section 16).

---

## 4. Scope

### In scope
- Parametric 3D house and both edge-protection systems, generated in code
- Interactive viewer: orbit, zoom, pan, zoom buttons, view presets
- Three states with smooth transitions and preserved camera
- Hotspot labels explaining key components
- Info panel with a short description and an automatic component count per system
- Realistic PBR materials, environment lighting and shadows
- Desktop browser support, with mobile and tablet support
- GLB export of the models, optimised for web
- Source code, model files, build and hosting/embedding instructions

### Out of scope (this phase)
- Real client or competitor product data (placeholders only)
- Full construction site simulation (only ground, slab and a few props at most)
- Per-site or user-configurable house generation (architecture must allow it later, see Section 17)
- Backend, database, user accounts, analytics
- Compliance or engineering calculations

---

## 5. Technical approach

### Stack
| Layer | Choice |
|---|---|
| Build tool | Vite |
| Language | TypeScript (strict) |
| UI | React |
| 3D | three.js via React Three Fiber |
| 3D helpers | @react-three/drei (OrbitControls, Html labels, Environment or custom env) |
| State | zustand (small store for view state) |
| Styling | Plain CSS with custom properties (no CSS framework) |
| Asset tooling | @gltf-transform/cli for GLB optimisation |
| Testing | Playwright for screenshot checks |

Use current stable versions. Record exact versions in `package.json`.

### Architecture decision: parametric geometry in code
All models are generated procedurally in TypeScript from config parameters, rather than modelled by hand and loaded as files.

Reasons:
- Dimensions live in config, so revisions are a number change, not a remodel.
- Tiny download and near-instant load.
- The same code can later build site-specific houses from new parameters.
- The systems are mostly tubes, box sections, plates and panels, which suit procedural geometry well.

The same builders also feed a GLB export (Section 13), which produces the model file deliverables and allows optional polishing in Blender. The app must support loading a polished GLB in place of the procedural version through a single config switch.

### Rendering approach
- Use `InstancedMesh` for all repeated parts (studs, rafters, battens, tubes, couplers, posts, bricks). One instanced mesh per geometry/material pair per group.
- Tubes: unit cylinder instanced between two points (position, orientation from direction, scale by length and radius).
- Box members: unit box instanced with a basis built from member direction plus an "up" hint.
- PBR materials (`MeshStandardMaterial`) with an environment map for believable metal.
- One directional sun light with shadows plus soft environment/hemisphere light.
- Procedural textures (canvas) for brick variation, concrete, ground and wire mesh. No external image files required.

---

## 6. Scene specification: the house

### 6.1 Coordinate system
- Units: metres. Y is up.
- Origin: centre of the house footprint at ground level.
- Long axis along X. Front of house faces +Z.
- Front wall outer face at z = +W/2, right wall outer face at x = +L/2.

### 6.2 House parameters (`src/config/house.ts`)
| Parameter | Value |
|---|---|
| Footprint length L (X) | 16.0 m |
| Footprint width W (Z) | 10.0 m |
| Slab thickness | 0.20 m, extends 0.10 m beyond frame |
| Wall frame height | 2.70 m (top plate top at y ≈ 2.90) |
| Studs | 90 × 45 mm at 450 mm centres |
| Plates | bottom plate single 45 mm, top plate double 90 mm |
| Noggins | one row at mid-height |
| Eave overhang | 0.60 m horizontal |
| Roof type / pitch | Hip, 22.5° |
| Roof framing | Trusses at 600 mm centres in the middle section, jack rafters and hip rafters at the ends, ridge beam |
| Truss members | 90 × 35 mm |
| Fascia | 190 × 25 mm on all four eaves |
| Gutter | Quad profile, approx. 115 mm wide × 100 mm deep, on all four eaves |
| Battens | Steel top-hat, 900 mm spacing up the slope, all roof planes |
| Roof sheeting | Corrugated steel, 76 mm pitch, dark charcoal |
| Brick veneer | 230 × 110 × 76 mm bricks, 10 mm joints, 40 mm cavity outside frame |

### 6.3 Construction stage
- Slab complete. Ground is a bare dirt plane (about 60 m across), no landscaping.
- All external wall frames complete, including openings with lintels, jamb studs and sill trimmers. One or two internal partition frames.
- Openings (placeholders): front wall has one entry door (0.9 × 2.1 m) and two windows (1.8 m wide, sill 0.9 m, head 2.1 m). Back wall has a 2.4 m sliding door and one window. Each side wall has one window.
- Roof framing complete. Battens on all planes.
- Roof sheeting fitted on the back plane and the right hip end, and on the right part of the front plane only. Left hip end is battens only. This shows a roof mid-installation.
- Fascia and gutter fitted all round.
- Brick veneer in progress: front and right walls to about 1.05 m, left wall to about 0.5 m, back wall not started. Skip bricks inside openings.
- Optional props: one brick pallet near the front. Keep props minimal.

### 6.4 Roof geometry (reference formulas)
- `t = tan(pitch)`, `Rw = W/2 + overhang`, `Rl = L/2 + overhang`
- Top-of-rafter height at the wall line = top plate top + 0.10 m
- Eave height at the outer edge: `eaveY = plateTop + 0.10 − overhang × t` (≈ 2.75 m)
- Ridge height: `ridgeY = eaveY + Rw × t` (≈ 5.07 m)
- Ridge runs along X from `−(L−W)/2` to `+(L−W)/2`
- Horizontal run of a rafter on a long (front/back) plane at position x: `min(Rw, Rl − |x|)`
- Horizontal run of a rafter on a hip-end plane at position z: `Rw − |z|`
- Hip rafters run from each eave corner `(±Rl, eaveY, ±Rw)` to the matching ridge end.
- Corrugated sheet on a plane is a strip of quads per corrugation column, clipped along the hip line, with a sine displacement along the plane normal.

---

## 7. Edge-protection systems (placeholder designs)

Both systems are placed by a rules engine (7.3) and configured in `src/config/competitorSystem.ts` and `src/config/ourSystem.ts`.

### 7.1 Competitor System: perimeter scaffold (tube and coupler)
A ground-based scaffold around the house with a working platform below the eave and guardrails extended above the roof edge.

| Component | Placeholder spec | Placement |
|---|---|---|
| Standards (vertical tubes) | 48.3 mm OD galvanised tube | Inner line 0.30 m from wall face, outer line 1.30 m from wall face. Bays up to 2.4 m long |
| Inner standards height | Ground to about 2.55 m | Must stop below rafter tails and soffit |
| Outer standards height | Ground to eave + 1.0 m (≈ 3.75 m) | Form the roof-edge guardrail posts |
| Base plates | 150 × 150 × 6 mm | Under every standard |
| Sole boards | Timber, 225 × 500 × 35 mm | Under every base plate |
| Ledgers | 48.3 mm tube | Along inner and outer lines at base lift (0.15 m) and platform lift |
| Transoms | 48.3 mm tube | Across the bay at every standard pair, at base and platform lifts |
| Working platform | Steel planks, 225 mm wide, 4 across the bay | At about eave − 1.0 m (≈ 1.75 m), wraps around corners |
| Toeboard | 150 mm high | Outer edge of platform |
| Guardrails | 48.3 mm tube | On outer standards at platform + 0.5 m and + 0.95 m, and roof-edge rails at eave + 0.5 m and eave + 1.0 m |
| Diagonal braces | 48.3 mm tube | Outer face, every second bay |
| Ties | 48.3 mm tube | Inner standard back to the wall frame, every second bay, about 0.5 m above the platform |
| Couplers | Small clamp shape, darker steel | At every tube-to-tube joint |

Materials: galvanised steel (metallic, medium roughness), darker steel couplers, galvanised planks, timber sole boards.

Key characteristics to make visible: ground footprint around the whole house, many separate components and joints, platform access for workers, ties into the building.

### 7.2 Our System: eave-mounted guardrail
A bracket-mounted guardrail fixed to the wall frame below the eave, with posts rising past the gutter and mesh panels between posts. Nothing touches the ground.

| Component | Placeholder spec | Placement |
|---|---|---|
| Wall bracket plate | 150 × 300 × 8 mm steel with 2 bolts | Fixed to a stud on the wall frame face at about y = 2.3 m. Bracket positions must align with a stud (snap to nearest 450 mm stud line) |
| Bracket arm | 50 × 50 mm square hollow section | Horizontal from the plate out to the post line, below the rafter tails |
| Bracket brace | 40 × 40 mm SHS | Diagonal from lower part of plate to the arm |
| Post line offset | 0.95 m from wall face | Clears fascia and gutter |
| Posts | 50 × 50 mm SHS | From arm to eave + 1.05 m (≈ 3.8 m). Max spacing 2.4 m |
| Corner brackets | Arm at 45° from the wall corner to the corner post | All four corners |
| Mesh panels | Tube frame (25 mm) with welded wire mesh infill | Between posts, from below the gutter line (≈ 2.45 m) to the top rail (≈ 3.75 m) |
| Panel clamps | Small clamp shape | Top and bottom of each panel at each post |

Materials: safety-yellow powder coat for posts, brackets and panel frames. Dark galvanised wire mesh using an alpha-tested procedural texture.

Key characteristics to make visible: fixes directly to the frame, no ground contact, continuous mesh below the gutter line, fewer components.

### 7.3 Placement rules engine (`src/systems/layout.ts`)
- Four sides: front (+Z), back (−Z), right (+X), left (−X).
- Each system line sits at a fixed offset D from the wall faces. Line corners are at `(±(L/2 + D), ±(W/2 + D))`.
- Divide each side into bays no longer than the max span, evenly spaced.
- Front and back sides must always have a post or standard at x = 0 (divide each half separately). This lets the split comparison state cut cleanly.
- Corners get a dedicated corner post or standard shared by the two sides.
- Every generated element is tagged `left` (x < 0) or `right` (x > 0) by its midpoint. Elements exactly at x = 0 are generated in both groups, but counted once.
- The engine returns both geometry and a component count for the info panel.

---

## 8. Comparison states

### 8.1 Groups and visibility
Each system is built as two groups: `left` and `right`. The house is always visible.

| State | Competitor left | Competitor right | Ours left | Ours right |
|---|---|---|---|---|
| Competitor System | shown | shown | hidden | hidden |
| Comparison | shown | hidden | hidden | shown |
| Our System | hidden | hidden | shown | shown |

In the Comparison state, show two floating tags above the roof, "Competitor" over the left half and "Our System" over the right half.

### 8.2 Transitions
- Fade groups in and out by animating material opacity over about 400 ms. Each group has its own material instances so groups fade independently.
- Set `visible = false` at the end of a fade-out, and restore opaque rendering (`transparent = false`) at the end of a fade-in to avoid sorting artefacts.
- Respect `prefers-reduced-motion`: switch instantly.

### 8.3 Camera preservation (hard requirement)
- One Canvas, one camera and one OrbitControls instance for the whole app lifetime.
- Changing state must never remount the Canvas, camera or controls, and must never move the camera or target.
- Acceptance test: switch through all three states repeatedly; camera position and target must be identical before and after.

---

## 9. Interaction and UI

### 9.1 Controls
- Orbit: click and drag (one-finger drag on touch).
- Zoom: mouse wheel and pinch. Limits 3 m to 60 m from target.
- Pan: right-drag or two-finger drag. Clamp the target to a box around the house.
- Stop the camera going below the ground (max polar angle just under 90°).
- Damping on.
- Zoom in and zoom out buttons (animate the distance by a factor, respecting limits).
- Reset view button.

### 9.2 View presets (animated camera moves, about 900 ms, ease in-out)
| Preset | Camera position | Target |
|---|---|---|
| Corner (default) | (18, 11, 20) | (0, 2.5, 0) |
| Front | (0, 5, 24) | (0, 2.5, 0) |
| Top | (0, 32, 0.01) | (0, 0, 0) |
| Close-up: our bracket | (7, 3.2, 8.5) | (4.5, 2.6, 5.9) |
| Close-up: competitor base | (−7, 1.6, 9.5) | (−4.5, 0.4, 6.3) |
| Split line | (0, 4, 12) | (0, 2.5, 5) |

Tune these after visual checks so each preset frames its subject well.

### 9.3 Hotspot labels
Small labels anchored to 3D points, toggled with a "Labels" button (on by default). Place competitor anchors on the left half and ours on the right half so they stay valid in every state. Hide a label when its anchor faces away from the camera.

Competitor labels:
- Base plate on timber sole board
- Coupler at every tube joint
- Working platform about 1 m below the eave
- Tie back to the wall frame
- Standards extended above the eave as roof guardrail

Our System labels:
- Wall bracket fixed to the stud frame
- Mesh panel runs below the gutter line
- Top rail about 1 m above the roof edge
- Corner bracket
- No ground contact: site access stays clear

### 9.4 Info panel
A collapsible panel showing, for the current state:
- System name, a one-line description, and "Placeholder design" note.
- Component count table generated by the rules engine (e.g. standards, couplers, planks, braces for the competitor; brackets, posts, panels, clamps for ours). Label it as an estimate for this house.
- In Comparison state, a side-by-side summary: total components, ground contact (yes/no), attachment method.

### 9.5 Other UI behaviour
- Keyboard shortcuts: 1, 2, 3 for the three states. Visible keyboard focus on all controls.
- URL parameter `?state=competitor|comparison|ours` sets the initial state (useful for embedding).
- Loading indicator until the first frame renders.
- If WebGL is unavailable, show a clear message explaining that the viewer needs a WebGL-capable browser.
- Mobile: state switcher full width at the bottom, tool buttons stacked on the right, info panel collapsed by default. Respect safe-area insets.

### 9.6 Visual direction
- The 3D model is the hero; UI chrome stays quiet and sits at the edges.
- Chrome loosely inspired by an architectural drawing title block: thin rules, tidy small type, compact layout.
- The state switcher is the one bold element: a large three-position segmented control using the system colours.
- Typefaces: Barlow Condensed (headings, switcher) and Barlow (body), with system sans-serif fallbacks.
- Palette tokens (define as CSS custom properties with light and dark variants):
  - Our system yellow `#F2B705`
  - Galvanised grey `#8C959C`
  - Charcoal text `#2B2F33`
  - Concrete panel `#E6E8EA` (semi-opaque over the scene)
  - Sky gradient behind the canvas, pale blue in light mode, dusk blue in dark mode
- Sentence case everywhere. No all-caps labels.

---

## 10. Performance and compatibility

| Target | Budget |
|---|---|
| Initial download (JS + CSS, gzipped) | under 1.5 MB |
| Time to first rendered frame (desktop, broadband) | under 3 s |
| Frame rate | 60 fps desktop, 30 fps or better on a mid-range phone |
| Draw calls | under 150 |
| Triangles | under 500k |
| Pixel ratio | cap at 2 on desktop, 1.5 on mobile |
| Shadow map | 2048 desktop, 1024 mobile |

Browsers: latest Chrome, Edge, Firefox and Safari on desktop; Safari on iOS/iPadOS; Chrome on Android.

---

## 11. Project structure

```
edge-protection-viewer/
  SCOPE.md                  this document
  README.md                 setup, build, hosting and embedding
  package.json
  vite.config.ts            base: './' so the build works from any path
  index.html
  src/
    main.tsx
    App.tsx
    store.ts                zustand store: state, labels on/off
    config/
      house.ts
      competitorSystem.ts
      ourSystem.ts
      views.ts              camera presets
      materials.ts
    geometry/
      instancing.ts         box/tube instancing helpers
      textures.ts           procedural canvas textures
      house/
        slab.ts
        wallFrames.ts
        roofFraming.ts
        roofCover.ts        battens, sheeting
        eaves.ts            fascia, gutter
        brickwork.ts
    systems/
      layout.ts             rules engine, left/right tagging, counts
      competitor.ts
      ours.ts
    scene/
      Scene.tsx
      Lighting.tsx
      Environment.tsx
      SystemGroup.tsx       fade logic
      Labels.tsx
    ui/
      StateSwitcher.tsx
      ViewTools.tsx
      InfoPanel.tsx
      Loading.tsx
    styles/
      tokens.css
      app.css
  tools/
    export-glb.ts           exports GLBs (see Section 13)
  models/                   exported and optimised GLB files
  blender/
    README.md               how to import, polish and re-export
  tests/
    screenshots.spec.ts     Playwright visual checks
```

---

## 12. Phases and acceptance criteria

### Phase 1: Project setup and empty scene
- Vite + React + TS + R3F project, lint and format configured.
- Ground, slab, sky, lighting, shadows, OrbitControls with limits.
- Accept when: dev server runs, slab visible, orbit/zoom/pan work within limits, no console errors.

### Phase 2: House
- Wall frames with openings, roof framing, battens, partial sheeting, fascia, gutter, partial brickwork, all from config.
- Accept when: house reads clearly as a partly built Australian hip-roof home from every preset; changing L, W or pitch in config rebuilds correctly; draw calls within budget.

### Phase 3: Our System
- Rules engine plus our system geometry, left/right groups, component counts.
- Accept when: brackets snap to stud lines, posts clear the gutter, mesh runs below gutter line, corners closed, post at x = 0 on front and back.

### Phase 4: Competitor System
- Scaffold geometry via the same rules engine.
- Accept when: inner standards clear the eave, platform wraps corners, guardrails extend above eave, couplers at joints, sole boards and base plates under every standard.

### Phase 5: States and transitions
- Store, visibility matrix, fades, comparison tags, keyboard shortcuts, URL parameter.
- Accept when: all three states correct, fades smooth, camera position and target unchanged across state switches (automated check).

### Phase 6: UI, labels and info panel
- State switcher, view tools, presets, labels, info panel, loading and WebGL fallback, responsive layout, dark mode.
- Accept when: usable on a 375 px wide screen and on desktop, all controls keyboard accessible, labels hide correctly when facing away.

### Phase 7: GLB export and optimisation
- Export script and optimised GLB files (Section 13). Loader switch to use GLBs instead of procedural geometry.
- Accept when: GLBs open in Blender and a glTF viewer with correct node names, and the app renders identically from GLBs.

### Phase 8: Testing and performance
- Playwright screenshots of each state from each preset, on desktop and mobile viewports.
- Accept when: budgets in Section 10 are met and screenshots look correct.

### Phase 9: Documentation and delivery
- README with setup, build, config guide, hosting and embedding (Section 14), and how to replace placeholders (Section 16).
- Accept when: a new developer can build and deploy from the README alone.

---

## 13. GLB export and asset pipeline

- Provide a way to export the scene groups as GLB files using three.js `GLTFExporter`: either a dev-only export page automated with Playwright, or an equivalent script. Choose the simplest reliable option.
- Output files in `models/`:
  - `house.glb`
  - `competitor-system.glb` (child nodes `Competitor_Left`, `Competitor_Right`)
  - `our-system.glb` (child nodes `Ours_Left`, `Ours_Right`)
- Optimise with gltf-transform: dedupe, keep instancing (EXT_mesh_gpu_instancing), Meshopt compression, textures to KTX2 or WebP.
- Materials must use standard glTF PBR so they import cleanly into Blender.
- `blender/README.md` explains how to import a GLB, polish it (materials, bevels, small details), and re-export it with the same node names so the app can load it.

---

## 14. Hosting and embedding

- `npm run build` produces a static `dist/` folder. No server-side code.
- Hosting options to document: AWS S3 + CloudFront (recommended), any static host, or an existing EC2 server via nginx.
- Serve `.glb` files with `model/gltf-binary` content type and long cache headers.
- Embedding snippet to document:

```html
<iframe
  src="https://YOUR-HOST/edge-protection-viewer/?state=comparison"
  title="Edge protection comparison viewer"
  style="width:100%;height:80vh;border:0"
  allow="fullscreen"
  loading="lazy">
</iframe>
```

- Include short notes for WordPress (Custom HTML block) and for a custom site.

---

## 15. Deliverables checklist

- [ ] Interactive browser-based 3D viewer
- [ ] Three comparison states with smooth switching and preserved camera
- [ ] Orbit, zoom, pan, zoom buttons, view presets
- [ ] Hotspot labels and info panel with component counts
- [ ] Realistic materials, lighting and shadows
- [ ] Desktop and mobile/tablet support
- [ ] Optimised GLB model files
- [ ] Full source code
- [ ] Blender import/polish guide
- [ ] README with build, hosting and embedding instructions

---

## 16. Replacing placeholders with real data (later)

When client or competitor data arrives:
1. Update dimensions and spacing in the system config files.
2. Replace or extend component builders in `src/systems/` to match real shapes (brackets, clamps, panels). If CAD files are supplied, convert them to GLB and load them as instanced components instead of procedural shapes.
3. Update placement rules in `layout.ts` (spacing, corner handling, attachment points).
4. Update labels and info panel copy.
5. Remove the "Placeholder design" notes only after the client signs off on accuracy, especially for the competitor system, since it will be used in marketing.

---

## 17. Future: site-specific models (not in this phase)

Keep the architecture ready for generating models per construction site:
- The house builder takes a single `HouseParams` object. Keep it serialisable to JSON.
- The rules engine works on any rectangular hip-roof footprint; gable roofs and L-shaped plans would be later extensions.
- If AI is used later, it should only convert user input (text or plans) into `HouseParams`. Geometry must always come from the tested builders, never from AI-generated code at runtime.
- The component counts can later become a parts list or quote.
