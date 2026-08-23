# Copilot Instructions — `@furcata/core-node`

> **Permanent global context and source of truth for every GitHub Copilot session in this repository**
> (Documentation sweeps, Testing sessions, and Architecture Validation).
> These rules are non-negotiable. Follow them exactly. They are derived from the real
> `package.json`, `tsconfig.json`, `tsconfig.test.json`, `eslint.config.js`, `vitest.config.ts`,
> and `.github/workflows/nodejs.yml` of *this* repository — not from boilerplate.

> ## 🔴 THIS IS A PUBLIC REPOSITORY
>
> `"private": true` in `package.json` means **"never publish to the npm registry."** It says
> **nothing** about GitHub visibility, and misreading it as though it did is the single most
> expensive mistake available in this repository. Source, build output, commit messages, pull
> request titles and bodies are all world-readable.
>
> This package is consumed by services that are **not** public. **Describe what is true about this
> package. Never name where else it is used, never name environments or internal identifiers, and
> never describe an unfixed weakness in another system.** References may flow private → public,
> never the reverse.
>
> This applies to code comments, config comments, test fixtures, commit messages and PR
> descriptions — not just documentation. Enforced by
> `.github/scripts/check-private-markers.sh` in CI; run it locally before pushing.

## 📁 Detailed instructions live in `.github/instructions/`

This file is the global summary. The detailed, task-scoped rules are:

| File | Covers |
|---|---|
| [`cross-repo.instructions.md`](instructions/cross-repo.instructions.md) | **Read first.** Public-repo rules, the trust model, why types are a security control, the committed-output hazard, evidence standards, agent conduct. |
| [`security.instructions.md`](instructions/security.instructions.md) | This repo's actual measured state, sweep recipes with positive controls, and what is deliberately left alone. |
| [`serialized-models.instructions.md`](instructions/serialized-models.instructions.md) | Model/interface conventions. **This package *is* the serialized model layer.** |
| [`tests.instructions.md`](instructions/tests.instructions.md) | Vitest conventions, and why `npm test` alone cannot fail on a type change. |
| [`documentation.instructions.md`](instructions/documentation.instructions.md) | JSDoc conventions. |
| [`readme.instructions.md`](instructions/readme.instructions.md) | README / CONTRIBUTING maintenance. |

---


## 1. Project Stack Reality & Workspace Bounding

### Core Environment (detected in this repository)

| Aspect | Exact reality (do not invent other values) |
| ------ | ------------------------------------------- |
| **Package** | `@furcata/core-node` — `"private": true`, `"version": "1.0.0"`, `"type": "module"` (native ESM). |
| **What it is** | A shared **TypeScript data-model & interface library**. It is **not** a deployable service. It defines the strongly-typed Firestore document shapes, enums, and queue contracts consumed by Furcata's **Firebase Cloud Functions / Google Cloud** backends. |
| **Node.js** | `>=22` (`engines.node`). CI runs the matrix `22.x` and `24.x`. |
| **TypeScript** | `typescript@^6` (devDependency). Compiler target & lib: `ES2020`. `module` and `moduleResolution`: `Node16`. `strict: true`, `declaration: true` (emits `.d.ts`), `rootDir: src`, `outDir: lib`. |
| **Linting** | `eslint@^10` flat config (`eslint.config.js`) using `typescript-eslint@^8`, composing `eslint.configs.recommended` + `tseslint.configs.recommended` + `tseslint.configs.stylistic`. Scoped to `src/**/*.ts`. `max-len` is `200` (`ignoreComments`, `ignoreUrls`). |
| **Testing** | `vitest@^4` in the `node` environment, with type-checking via `tsconfig.test.json`. |
| **Cloud / Firebase context** | This package targets **Firebase Cloud Functions** and **Firestore** as its *consumers*. There is intentionally **no** `firebase.json`, emulator config, or Cloud Functions runtime in this repo, and **no** `firebase-admin` / `firebase-functions` dependency installed here. Firebase is downstream context, not a local dependency — do not add Firebase packages unless the task explicitly requires it. |
| **Runtime dependencies** | `@fabricelements/shared-helpers` (public; e.g. the `User` type used by the `Account` model), pinned to an exact commit SHA — and `zod` `^4.4.3` for runtime schemas. |
| **Public entry points** | `exports` map: `"./model" → "./lib/model/index.js"` and `"./interface" → "./lib/interface/index.js"`. |
| **Source layout** | `src/model/` (entity namespaces: `Account`, `Block`, `EventData`, `MessagingEvent`, `Post`, `Price`) and `src/interface/` (`base_db.ts`, `queue.ts`, `place.ts`). Each folder has a barrel `index.ts`. |

### 🔴 CRITICAL `/lib` RULES — it is COMMITTED, and consumers execute it

`/lib` is an auto-generated build target produced exclusively by the TypeScript compiler
(`tsc`, `outDir: lib`), wiped and regenerated on every build by the `clear` script (`rm -rf ./lib`).

**But it is also committed to git — 22 tracked files, not ignored — and it is what consumers
actually run.** `package.json` `exports` points straight at `./lib/model/index.js` and
`./lib/interface/index.js`, and there is **no** `prepare`/`prepack` script, so installing this
package directly from git performs **no build**.

> **Consequence: reviewers read `src/`, consumers execute `lib/`. Those are different files.**
> A change to `src/` can be authored, reviewed, approved and merged and still never run, because
> the compiled output was never regenerated. The PR diff looks perfectly correct — `src/` is
> exactly what it claims to be — so nothing in the review surface can expose it.

**System mandate — every AI agent MUST obey all of the following:**

- **NEVER read or take context from `/lib`.** It is generated output and is not a source of truth. Use `src/` for all understanding.
- **NEVER edit, create, or delete any file inside `/lib` by hand.** Any such change is destroyed by the next build.
- **NEVER edit compiled `.js` artifacts anywhere.** All development happens exclusively in `.ts` source files under `src/`.
- **After ANY change to `src/`, run `npm run build` and commit the regenerated `/lib` in the SAME
  commit.** A source change and its compiled output are one atomic unit. Splitting them lets a
  partial landing leave consumers executing code nobody reviewed.
- **Verify before you push:** `git status --porcelain -- lib/` must be empty after a build. CI
  enforces this and fails on drift.
- Tooling already enforces the read boundary: ESLint ignores `lib/*` (alongside `node_modules/*`, `.github/*`, `functions/*`).


---

## 2. JSDoc Code Style Standards (Phase 1)

All documentation in `src/**/*.ts` must follow **Google TypeScript JSDoc** standards and stay
fully aligned with `tseslint.configs.recommended` and `tseslint.configs.stylistic`. These are
absolute compliance requirements.

- **Block comments only.** Use multi-line `/** ... */` blocks for every definition (namespaces,
  enums, interfaces, properties, functions). Do **not** use triple-slash (`/// ...`) or
  single-line `//` layouts for documentation. (Plain `//` is allowed only for incidental inline
  notes, matching the existing inline notes in `src/model/Account.ts`, never as the doc comment.)
- **Summary sentence.** The first sentence must be a capitalized, clear summary that ends in a
  period.
- **Strict type preservation & insertion.**
  - Any existing `@param {type}` structure **must be preserved** exactly.
  - If a parameter lacks a type, accurately add it inside curly brackets, matching the TypeScript
    declaration.
  - Types must comply with strict `tseslint` preferences — **never** use banned/unsafe keywords
    such as `Function` or `Object`; use precise types (e.g. a concrete signature, `unknown`, or
    the actual interface) instead.
- **External URL protection.** **Never** clean up, alter, shorten, or remove markdown links,
  `{@link ...}` references, or external URL links found within existing comments. (`max-len` is
  configured with `ignoreUrls`, so long URLs are intentionally allowed.)
- **Document the "why."** Always explain intent/rationale, document parameters (`@param`), the
  return specification, and exception paths (`@throws`). For the return tag, **use `@return`
  (singular)**: this repo's ESLint config sets the JSDoc `tagNamePreference` to rewrite `returns`
  to `return`, so `@return` is the required form.
- **License header.** Preserve the existing top-of-file banner used across `src/`:
  `/** @license  Copyright Furcata. All Rights Reserved. */`.
- **Cross-references.** Prefer `{@link Name}` to connect related enums/interfaces, matching the
  established style in `src/model/Account.ts` and `src/interface/`.

---

## 3. Testing Protocols & Mocking Controls (Phase 2 — Vitest)

Test-generation sessions must keep the project compiling and the suite fully isolated.

- **Framework specification.** All test infrastructure uses **Vitest**:
  `import { describe, it, expect, vi } from 'vitest';`. (Globals are enabled in
  `vitest.config.ts`, but explicit imports remain the convention — see the existing tests.)
- **Directory mapping.** Every test file lives inside the isolated `test/` directory and
  **mirrors the identical path and name** of its source under `src/`
  (e.g. `src/model/Account.ts` → `test/model/Account.test.ts`,
  `src/interface/queue.ts` → `test/interface/queue.test.ts`). Files are suffixed `.test.ts` or
  `.spec.ts` (the only patterns `vitest.config.ts` includes). Import the unit under test from
  `src/` using the ESM `.js` specifier (e.g. `import { Account } from '../../src/model/Account.js';`).
- **Environment isolation.** **Zero** real network requests, **zero** disk I/O, **zero** live
  cloud/Firestore/emulator calls. Tests must be pure, offline, and safe to run against any
  environment, exactly like the current suite.
- **Firebase tooling.** When (and only when) code under test touches Firebase, use
  `firebase-functions-test` for function harnessing alongside **local Firebase Emulators** or a
  heavily stubbed `firebase-admin` wrapper built with Vitest's native utilities — `vi.mock`,
  `vi.spyOn`, and `vi.fn`. Never reach a real project. (Note: this repo currently ships pure
  model/enum tests and has no Firebase dependency; pull in such tooling as a devDependency only if
  a task explicitly introduces Firebase-dependent code.)
- **Structure.** Enforce the **Arrange–Act–Assert** pattern inside descriptive `describe()` and
  `it()` blocks, matching the nesting and naming already used in `test/`.
- **Lint compliance.** All test files must compile cleanly (type-checked through
  `tsconfig.test.json`, per `vitest.config.ts`'s `typecheck` setting) and satisfy `tseslint`
  rules **without** raw lint-disable escape flags (no `// eslint-disable*`).

---

## 4. Implementation Guardrails & README Requirements (Phase 3)

### Implementation guardrails

- **Async over chains.** Use clean `async`/`await` rather than raw `.then()/.catch()` Promise
  chains.
- **Separation of concerns.** Maintain strict separation between Firebase **event triggers** and
  **downstream business-logic** modules. In this repo specifically: keep `src/model/` and
  `src/interface/` as pure, transport-agnostic data contracts — do not embed trigger wiring, side
  effects, or I/O into the models.
- **Stay in source.** Implement only in `.ts` files under `src/`; never touch `/lib` or compiled
  `.js` (see §1).

### README requirements

Any update to the root `README.MD` must:

- **Preserve vital links.** Keep deployment URLs, the repository URL
  (`https://github.com/furcata/core-node.git`), diagram links, and any external references intact.
- **Comprehensively outline** these areas:
  - **Project Architecture** — the model/interface library role and its relationship to the
    consuming Firebase Cloud Functions backend; the `src/` ↔ `lib/` directory map.
  - **Tech Stack Core** — Node `>=22`, TypeScript `^6` (ESM `Node16`, `ES2020`), ESLint `^10`
    flat config (`typescript-eslint` recommended + stylistic), Vitest `^4`, Firestore data layer,
    and the `@fabricelements/shared-helpers` dependency.
  - **Local Emulation controls** — `npm run build` (runs `clear` → `lint` → `compile`, i.e.
    `rm -rf ./lib` → `eslint` → `tsc -p ./tsconfig.json`), `npm run build:watch`, and how the
    compiled `/lib` is linked into a consuming Firebase project where
    `firebase emulators:start` is run (this repo has no emulator of its own).
  - **Vitest Execution commands** — `npm test` (`vitest run`), `npx vitest run` (one-off),
    `npx vitest` (watch), and `npx vitest run --coverage`.

---

## Quick command reference (verified against `package.json`)

| Action | Command |
| ------ | ------- |
| Install | `npm install` (CI uses `npm ci`) |
| Lint | `npm run lint` (alias of `eslint`); auto-fix with `npm run lint:fix` |
| Build (clear + lint + compile) | `npm run build` |
| Build (watch) | `npm run build:watch` |
| Compile only | `npm run compile` (`tsc -p ./tsconfig.json`) |
| Test (CI mode) | `npm test` (`vitest run`) |
| **Typecheck (required)** | `npm run typecheck` (`tsc -p ./tsconfig.test.json`) |
| **Consumer-conditions typecheck (required)** | `npm run typecheck:consumer` (`tsc -p ./tsconfig.consumer.json`) — build first |
| **Consumer-conditions control (required)** | `npm run typecheck:consumer:control` (`tsc -p ./tsconfig.consumer-control.json`) — must always be `0` |
| Test (direct / watch / coverage) | `npx vitest run` · `npx vitest` · `npx vitest run --coverage` |
| Private-marker check | `./.github/scripts/check-private-markers.sh` |
| Build-output drift check | `npm run build && git status --porcelain -- lib/` (must be empty) |

> **`npm test` and `npm run typecheck` check different things and both are required.** TypeScript
> interfaces are erased at runtime, so the Vitest suite **cannot fail** on an interface change:
> deleting a field outright from `src/interface/queue.ts` leaves all 480 tests passing. Type-level
> regressions are caught only by `npm run typecheck`. Note also that `npx vitest run --typecheck`
> is **not** the gate — Vitest's `typecheck.include` defaults to `**/*.test-d.ts`, and this repo
> has none, so it checks zero files and always reports "no errors".

> **`npm run typecheck:consumer` is a third, non-overlapping gate.** The two above run under *this*
> package's settings, where `strict`, `strictNullChecks` and `noImplicitAny` are all on. Consumers
> need not set any of them, and a type-level guarantee can hold under one null-checking setting and
> be completely inert under the other — a failure branch marked `data?: undefined` errors correctly
> here and compiles clean where `strictNullChecks` is off. This gate compiles fixtures in
> `test-consumer/` against the **built `lib/*.d.ts`**, through the package's own `exports` map, with
> those flags off. Run `npm run build` first; it reads compiled output, not `src/`. The rule it
> enforces is in `.github/instructions/serialized-models.instructions.md` §8.
>
> Read it together with `npm run typecheck:consumer:control`, which compiles only the fixture whose
> every line must compile. A negative assertion is evidence only if the harness works, and a fixture
> that cannot compile at all fails its un-narrowed *and* narrowed reads alike — which reads as a
> confirmed guarantee. **Gate red + control green** means a guarantee regressed; **gate red + control
> red** means the harness broke and the gate proves nothing.
>
> **It is not blanket coverage.** Its mechanism is `TS2339`, which cannot fire on a type carrying an
> index signature — so on the 10 declarations extending `BaseFirestore`, green means "cannot be
> checked", not "is safe". A second, independent blind spot: `T | null` collapses where
> `strictNullChecks` is off, so the gate proves nothing about nullability either. Both boundaries are
> themselves encoded as tests in `test-consumer/interface/`; see
> `.github/instructions/tests.instructions.md` §6.3 and §6.4.

> **CI gate:** `.github/workflows/nodejs.yml` runs on `push`/`pull_request` to `main` across Node
> `22.x` and `24.x`, executing `npm ci` → `npm run build` → build-output drift check →
> private-marker check → `npm test` → `npm run typecheck` → `npm run typecheck:consumer` →
> `npm run typecheck:consumer:control`. Changes must keep all of these green.
