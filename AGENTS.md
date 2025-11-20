# Repository Guidelines

## Project Structure & Module Organization

- Yarn 4 monorepo; core editor modules live in `blocksuite/`, app shells in
  `packages/frontend/apps/*`, back-end services in `packages/backend/*`, and
  shared utilities in `packages/common/*`.
- Tests and fixtures reside in `tests/` grouped by target (e.g.,
  `tests/affine-desktop`, `tests/affine-cloud`); smaller unit tests may live
  beside source files.
- Documentation is under `docs/`; developer tooling and automation sit in
  `scripts/` and `tools/`.

## Build, Test, and Development Commands

- `yarn install` (Node <23) initializes workspaces, runs `affine init`, and
  configures Husky.
- `yarn dev` starts local development via the Affine CLI; check terminal output
  for served URLs.
- `yarn build` produces production bundles for the workspace targets.
- `yarn typecheck` runs `tsc -b` across all configured projects.
- `yarn lint` / `yarn lint:fix` run ESLint + Prettier; `yarn lint:ox` provides
  a fast static pass.
- `yarn test` executes Vitest suites; `yarn test:coverage` reports coverage;
  `yarn test:ui` opens the Vitest UI runner.

## Coding Style & Naming Conventions

- Prettier enforces formatting (2-space indent, trailing commas, etc.) and is
  wired through lint-staged; keep files formatted before committing.
- ESLint and oxlint guard TS/JS/React; favor typed exports, `PascalCase` for
  React components, and `camelCase` for hooks/utilities.
- Rust modules (see `Cargo.toml`, `rustfmt.toml`) should pass `cargo fmt`; TOML
  files use `taplo format`.
- Organize feature code by domain within each app; expose entry points via
  concise barrel files rather than deep relative imports.

## Testing Guidelines

- Place new specs as `*.test.ts(x)`/`*.spec.ts(x)` near the code or inside the
  matching `tests/<target>` suite.
- Target meaningful coverage for new modules using `yarn test:coverage`; prefer
  mocked network/IO in unit tests.
- Browser-oriented scenarios rely on Playwright helpers under `tests/`; keep
  shared fixtures in `tests/fixtures`.

## Commit & Pull Request Guidelines

- Use Conventional Commits as seen in history (`feat:`, `fix:`, `chore:`,
  optional scopes like `fix: blocksuite undo`); keep bodies concise and
  imperative.
- PRs should summarize intent, list major changes, and link issues; include
  before/after screenshots for UI changes and note which commands were run (lint,
  typecheck, tests).
- Run `yarn lint`, `yarn typecheck`, and relevant tests locally before
  requesting review.

## Security & Configuration Tips

- Never commit secrets; keep environment values in local `.env` files and scrub
  logs before sharing.
- Follow `SECURITY.md` for vulnerability reporting; Yarn resolutions pin
  critical dependencies—avoid unreviewed upgrades.

# Coding Guidelines

- You must not add any comments unless they are absolutely necessary for
  understanding the code.
- Use clear and descriptive names for variables, functions, classes, and other
  identifiers.
