# Worklog

Newest first. One dated entry per task: what changed, where, how it was verified, what's still open, and the branch.

---

## 2026-09-29: GitHub remote and README stub

- **Changed:** Added `origin` → `git@github.com:saad-naveed-brainx/3D-Modeling.git`. Added `README.md` with only the heading `# 3D-Modeling`; the full README is a Phase 9 deliverable.
- **Verified:** `git remote -v`.
- **Not done:** Push. The user pushes: `git push -u origin main`.
- **Branch:** `main`.

## 2026-09-29: Phase 1 — project setup and empty scene

- **Changed:** Vite + React + TS (strict) + R3F project with ESLint and Prettier. Config in `src/config/` (`house.ts`, `scene.ts`, `views.ts`, `materials.ts`). Procedural textures and noise, the slab builder, the ground disc and sky dome (`src/geometry/`). Scene with a procedural environment map, sun with PCF shadows, hemisphere fill, a single OrbitControls with limits and a target clamp, and the `window.__viewer` test hook (`src/scene/`). CSS tokens with light and dark sky gradients. Playwright with 4 projects.
- **Verified:** `tsc -b`, ESLint and Prettier all clean. `npm run test:e2e` passes 26 tests and skips 2 (mobile controls, by design): zoom stays within 3–60 m, the polar angle stays at or below 88°, the camera stays above ground, and the pan target stays inside the house box + 4 m. No console errors, and no warnings beyond the allowlist. Screenshots of all 6 presets in 4 projects, plus dark mode, reviewed by eye. Build is 325 KB gzipped JS + CSS (budget 1.5 MB). The scene is 3 draw calls and about 15k triangles.
- **Not done / next:** Phase 2 (house), waiting for the user's go-ahead. Phase 6 follow-ups in BACKLOG: portrait framing (B-004), dark-mode lighting (B-005), trackpad zoom speed (B-006).
- **Branch:** `main` (commit "Phase 1: project setup and empty scene").

## 2026-09-29: Scope review, open questions, docs system

- **Changed:** Added `CLAUDE.md` and `docs/` (ARCHITECTURE, DECISIONS, WORKLOG, BACKLOG). No app code yet.
- **Decided:** Settled the open questions about SCOPE.md. See the 2026-09-29 entries in [DECISIONS.md](DECISIONS.md).
- **Verified:** Not applicable (docs only).
- **Not done:** Phase 1 hadn't started; it was waiting for the user's go-ahead.
- **Branch:** None at the time. `git init` happened at the start of Phase 1.
