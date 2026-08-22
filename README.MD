# Furcata Core Node

[![Node CI](https://github.com/furcata/core-node/actions/workflows/nodejs.yml/badge.svg)](https://github.com/furcata/core-node/actions/workflows/nodejs.yml)

`@furcata/core-node` is the shared **TypeScript data-model and interface library** for the
Furcata platform. It is consumed as a dependency by Furcata's Firebase Cloud Functions backends,
providing a single, strongly-typed source of truth for the Firestore document shapes, enums, and
queue contracts used across the system.

> **Repository:** <https://github.com/furcata/core-node.git>

> [!IMPORTANT]
> **This is a public repository.** The `"private": true` flag in `package.json` means *"never
> publish to the npm registry"* — it says nothing about GitHub visibility. Source, build output,
> commit messages and pull request descriptions here are all world-readable.
>
> This package is consumed by services that are not public. **Describe what is true about this
> package; never name where else it is used, its environments, its internal identifiers, or an
> unfixed weakness elsewhere.** That applies to code comments, test fixtures, commit messages and
> PR bodies, not just documentation. `.github/scripts/check-private-markers.sh` enforces it in CI —
> run it locally before pushing.


------

## Project Overview & Cloud Architecture

### What this package builds

This package is **not** a deployable service on its own. It ships the **domain models and
interfaces** that the Furcata serverless backend imports to read, validate, and persist data. It
builds a set of compiled ESM modules (plus `.d.ts` declarations) from the TypeScript sources in
`src/`:

- **Data models** (`src/model/`) — namespaced enums and Firestore document interfaces for the
  platform's core business entities: `Account`, `Block`, `EventData`, `MessagingEvent`, `Post`,
  and `Price`. These describe account lifecycle/status, social-media post metadata, messaging
  events, pricing records, and related domain data.
- **Shared interfaces** (`src/interface/`) — cross-cutting contracts including `BaseFirestore`
  (the base shape every Firestore document extends, with `id`, `created`, `updated`, `expiry`
  TTL, and `backup` fields), `MessageQueue` (queue state counters), and place/geo interfaces
  (`PlaceType`, `BasePlaceData`) carrying Google Places identifiers and coordinates.

Both folders expose a public **barrel export** (`index.ts`) so consumers import from the package's
`./model` and `./interface` entry points without deep relative paths.

### Target runtime

- **Language / runtime:** TypeScript (`^6`) compiled to native **ESM** JavaScript for **Node.js
  `>=22`** (`"type": "module"`, `engines.node` in `package.json`).
- **Compile target:** `ES2020` (`target`/`lib`) with `Node16` module resolution.

### How it hooks into the cloud ecosystem

The Furcata backend is a **serverless, Firebase-centric** architecture, and this library is the
data contract that ties it together:

- **Cloud Functions** import these models/interfaces to type their event handlers and business
  logic.
- **Firestore** is the persistence layer; `BaseFirestore` standardises identity, audit
  timestamps, and TTL (`expiry`) on every collection document, while `MessageQueue` models queue
  state and the `place` interfaces carry Google Places metadata.

There is intentionally **no** `firebase.json`, emulator config, or Cloud Functions runtime in this
repository, and **no** `firebase-admin` / `firebase-functions` dependency installed here. Firebase
and Google Cloud are **downstream consumers** of this package, not local dependencies.

## Tech Stack & Source Architecture Map

| Area              | Details                                                                                  |
| ----------------- | ---------------------------------------------------------------------------------------- |
| **Runtime**       | Node.js `>=22` (`engines` in `package.json`; CI matrix runs `22.x` and `24.x`).          |
| **Language**      | TypeScript `^6` compiled to `ES2020` (`target`/`lib`).                                   |
| **Module system** | Native ESM — `"type": "module"`, with `Node16` `module` and `moduleResolution`.          |
| **Data layer**    | Models describe **Firestore** documents. `BaseFirestore` standardises identity, audit timestamps, and TTL (`expiry`) fields for every collection document. |
| **Linting**       | ESLint `^10` flat config (`eslint.config.js`) via `typescript-eslint` (`recommended` + `stylistic`), scoped to `src/**/*.ts`; `max-len` is `200` (`ignoreComments`, `ignoreUrls`). |
| **Testing**       | Vitest `^4` (`node` environment) for runtime assertions, plus `npm run typecheck` (`tsc -p ./tsconfig.test.json`) for type-level checks. Both are required — see [Type-checking](#type-checking). |
| **Dependencies**  | `@fabricelements/shared-helpers` (public; e.g. the `User` type used by the `Account` model), pinned to an exact commit SHA, and `zod` `^4.4.3` for runtime schemas. |

### Active development source tree

All real development happens in `.ts` files under `src/` and `test/`:

```text
core-node/
├── src/
│   ├── model/              # Entity models (one namespace per file)
│   │   ├── Account.ts
│   │   ├── Block.ts
│   │   ├── EventData.ts
│   │   ├── MessagingEvent.ts
│   │   ├── Post.ts
│   │   ├── Price.ts
│   │   └── index.ts        # Barrel → "@furcata/core-node/model"
│   └── interface/          # Shared cross-cutting contracts
│       ├── base_db.ts      # BaseFirestore
│       ├── queue.ts        # MessageQueue
│       ├── place.ts        # PlaceType, BasePlaceData
│       └── index.ts        # Barrel → "@furcata/core-node/interface"
├── test/                   # Vitest tests, mirroring the src/ layout
│   ├── model/              # *.test.ts per model
│   └── interface/          # *.test.ts per interface
├── eslint.config.js        # ESLint flat config (typescript-eslint)
├── tsconfig.json           # Compiler config (ESM, Node16, outDir: lib)
├── tsconfig.test.json      # Type-check config used by Vitest
├── vitest.config.ts        # Vitest runner config (node env)
└── lib/                    # 🔴 GENERATED build output — never edit (see below)
```

> The `src/model/` ↔ `src/interface/` split mirrors the public `exports` map in `package.json`:
> `"./model" → "./lib/model/index.js"` and `"./interface" → "./lib/interface/index.js"`.

### 🔴 `/lib` is generated build output — AND it is committed

> [!CAUTION]
> **`/lib` is auto-generated. Never edit it by hand. But it *is* committed to git, and it is the
> code consumers actually execute — so it must be rebuilt and committed whenever `src/` changes.**
>
> `package.json` `exports` points directly at `./lib/model/index.js` and `./lib/interface/index.js`,
> and there is **no** `prepare` or `prepack` script. Installing this package straight from GitHub
> therefore performs **no build**: the consumer runs the committed `/lib`.
>
> **Reviewers read `src/`. Consumers execute `lib/`. Those are different files.** A change to
> `src/` can be authored, reviewed, approved and merged and still never run, because the compiled
> output was never regenerated. The pull request diff looks perfectly correct — `src/` is exactly
> what it claims to be — so nothing in the review surface can reveal it.
>
> The rules that follow:
>
> - `/lib` is produced **exclusively** by `tsc` (`outDir: lib`) and is wiped and regenerated on
>   every build by the `clear` script (`rm -rf ./lib`).
> - **Never** hand-edit any `.js` or `.d.ts` under `/lib`; the next build destroys it.
> - **Never** read `/lib` as a source of truth — use `src/`.
> - ✅ **After any change to `src/`, run `npm run build` and commit the regenerated `/lib` in the
>   same commit.** Source and output are one atomic unit.
> - Verify before pushing: `git status --porcelain -- lib/` must be empty after a build.
>   **CI fails the job on drift.**
> - ESLint ignores `lib/*` (alongside `node_modules/*`, `.github/*`, and `functions/*`).


## Local Setup & Firebase Emulation

Follow these steps for a fresh developer onboarding.

### 1. Install dependencies

```shell
$ npm install
```

> CI uses `npm ci` for clean, lockfile-faithful installs.

### 2. Build (clear → lint → compile)

Run a one-off build to lint `src/` and compile it into the generated `/lib` layout that consumers
import:

```shell
$ npm run build
```

`build` runs `clear` → `lint` → `compile`, i.e. it deletes `./lib`, lints `src/` with ESLint, then
runs `tsc -p ./tsconfig.json`.

### 3. Watch mode while developing

Use the TypeScript compilation watcher so `/lib` is regenerated automatically on every save:

```shell
$ npm run build:watch
```

`build:watch` runs `clear` → `lint` → `compile:watch` (`tsc --watch -p ./tsconfig.json`). You can
also compile without the clear/lint steps via `npm run compile` (one-off) or
`npm run compile:watch` (continuous).

### 4. Use within a Firebase emulator workflow

This repository is a **library, not a Firebase app** — it intentionally contains no
`firebase.json`, emulator configuration, or Cloud Functions runtime of its own. To exercise the
models against the local **Firebase Emulator Suite**, build this package (steps above) and link or
install it into the consuming Cloud Functions project, then start the emulators **from that
project**:

```shell
# run inside the consuming Firebase project, not this repo
$ firebase emulators:start
```

Leaving `npm run build:watch` running here keeps `/lib` in sync so the consuming emulator picks up
your model changes.

### Installing this package in a consumer

Reference it from GitHub:

```shell
$ npm i github:furcata/core-node --save
```

…or link a local checkout during development:

```json
{
  "dependencies": {
    "@furcata/core-node": "file:../core-node"
  }
}
```

Then import the models and interfaces you need from the package entry points:

```ts
import { Account, Post } from "@furcata/core-node/model";
import { BaseFirestore, MessageQueue } from "@furcata/core-node/interface";
```

## Testing & Verification Suite (Vitest)

Tests are written with **Vitest** and live under `test/`, mirroring the `src/` structure
(`test/model/Account.test.ts` ↔ `src/model/Account.ts`). They are **pure, offline unit tests**
that import models/interfaces directly from `src/` and assert on enum values and type shapes — they
make **no network calls and connect to no live Firestore, emulator, or production project**, so
running them cannot affect any real environment.

### Run the full suite

```shell
$ npm test          # runs `vitest run` — a single, non-watching pass (the mode used in CI)
```

Or invoke Vitest directly:

```shell
$ npx vitest run            # one-off run
$ npx vitest                # watch mode for local development
$ npx vitest run --coverage # coverage report
```

> Running with `--coverage` requires a Vitest coverage provider to be installed; add the
> appropriate provider package before enabling coverage if it is not already present. Coverage
> output directories (`coverage/`, `.nyc_output/`) are already excluded via `.gitignore`.

### Type-checking

> [!IMPORTANT]
> **`npm test` cannot fail on a type change, and `npm run typecheck` is a separate, required gate.**
>
> TypeScript interfaces are **erased at runtime**. A test that declares an object literal and reads
> a property back exercises JavaScript, not the source: deleting `pending?: number` outright from
> `src/interface/queue.ts` still leaves **480/480 tests passing, exit 0**. Only enum-backed
> assertions can fail at runtime, because an enum is a real runtime value.

```shell
$ npm run typecheck   # tsc -p ./tsconfig.test.json — type-checks test/ against src/
```

This catches what the suite cannot: a deleted interface field, a wrong-typed assignment, and a
removed enum member each make it exit non-zero.

> ⚠️ `npx vitest run --typecheck` is **not** this gate. Vitest's `typecheck.include` defaults to
> `**/*.test-d.ts` and this repository has no such files, so it type-checks **zero** files and
> reports `Type Errors  no errors` regardless of what is broken. Use `npm run typecheck`.


### Safe testing of Firebase-dependent code

This repository ships **only pure model/enum tests** and has **no Firebase dependency** installed,
so its own suite never touches the cloud. When a task introduces code that actually exercises
Firebase, keep tests fully isolated from live production resources:

- Harness Cloud Functions with **`firebase-functions-test`** (offline mode), and/or
- Run against the **local Firebase Emulator Suite** in the consuming project, and/or
- Stub `firebase-admin` with Vitest's native utilities — `vi.mock`, `vi.spyOn`, and `vi.fn`.

Add such tooling as a devDependency **only** when a task explicitly introduces Firebase-dependent
code. Tests must remain pure, offline, and safe to run against any environment — **zero** real
network requests, disk I/O, or live cloud/Firestore calls.

### Continuous Integration

Pushes and pull requests targeting `main` run the **Node CI** workflow
(`.github/workflows/nodejs.yml`) on Node `22.x` and `24.x`. Each job runs, in order:

| Step | Command | Fails when |
|---|---|---|
| Install | `npm ci` | lockfile and manifest disagree |
| Build | `npm run build` | lint or compile error |
| **Build-output drift** | `git status --porcelain -- lib/` | committed `/lib` is stale |
| **Private markers** | `.github/scripts/check-private-markers.sh` | a private marker or attribution trailer appears in a file, commit message or authorship |
| Test | `npm test` | a runtime assertion fails |
| **Typecheck** | `npm run typecheck` | a type-level regression |

Changes must keep all of these green.


## AI-Assisted Engineering Rules

This repository is **heavily optimized for AI-assisted workflows** with GitHub Copilot. A
permanent, repository-wide instruction file governs how both human developers and AI assistants
contribute:

> **Read [`.github/copilot-instructions.md`](.github/copilot-instructions.md) before contributing —
> with code or with an AI assistant.**

Task-scoped detail lives in [`.github/instructions/`](.github/instructions/):

| File | Covers |
|---|---|
| [`cross-repo.instructions.md`](.github/instructions/cross-repo.instructions.md) | **Read first.** Public-repository rules, why types are a security control here, the committed-output hazard, evidence standards, agent conduct. |
| [`security.instructions.md`](.github/instructions/security.instructions.md) | Measured current state, sweep recipes with positive controls, and what is deliberately left alone. |
| [`serialized-models.instructions.md`](.github/instructions/serialized-models.instructions.md) | Model and interface conventions — this package **is** the serialized model layer. |
| [`tests.instructions.md`](.github/instructions/tests.instructions.md) | Vitest conventions, and why the suite cannot fail on an erased type. |
| [`documentation.instructions.md`](.github/instructions/documentation.instructions.md) | JSDoc conventions. |
| [`readme.instructions.md`](.github/instructions/readme.instructions.md) | README / CONTRIBUTING maintenance. |

It is the source of truth for the standards summarised below:


- **Strict typing.** Use precise TypeScript types and explicit declarations; never rely on banned
  or unsafe types such as `Function` or `Object` — use a concrete signature, `unknown`, or the
  actual interface instead.
- **Google TypeScript JSDoc.** Document every definition with multi-line `/** ... */` blocks
  (never `//` or `///` for doc comments). Begin with a capitalized summary sentence ending in a
  period, explain the *why*, and map every parameter with `@param {type}` (preserving existing
  types and adding missing ones to match the declaration). Use **`@return`** (singular) — this
  repo's ESLint config rewrites `returns` → `return`. Avoid redundant native type strings, and
  **never** alter or remove existing markdown links, `{@link ...}` references, or external URLs.
  Preserve the `/** @license  Copyright Furcata. All Rights Reserved. */` banner.
- **Lint compliance, no escape hatches.** All `src/` and `test/` code must satisfy
  `typescript-eslint` `recommended` + `stylistic` rules **without** raw `// eslint-disable*`
  flags.
- **Separation of concerns.** Keep `src/model/` and `src/interface/` as pure, transport-agnostic
  data contracts — no trigger wiring, side effects, or I/O. Prefer `async`/`await` over raw
  `.then()/.catch()` chains.
- **Respect the `/lib` rules.** Implement only in `.ts` files under `src/`; never hand-edit `/lib`
  or compiled `.js` artifacts — **and rebuild and commit `/lib` in the same commit as any `src/`
  change** (see the caution above).
- **Evidence standards.** Positive-control every probe: a grep that cannot demonstrate a true
  positive is not evidence. Prove a test can fail by mutating what it checks and watching it go
  red. Record negative results rather than dropping them.
- **Never add a `Co-authored-by:` trailer** to any commit or pull request. Check both the messages
  and the **authorship** — a squash merge synthesises the trailer server-side from commit
  authorship, which no local hook can intercept.


**Before opening a Pull Request,** ensure your AI chat assistant is grounded in
`.github/copilot-instructions.md` so generated code, comments, and tests stay 100% consistent with
these guidelines.

## Contributing

Please check [CONTRIBUTING](CONTRIBUTING.md).

## License

Released under the [BSD 3-Clause License](LICENSE.md).
