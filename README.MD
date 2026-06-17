# Furcata Core Node

[![Node CI](https://github.com/furcata/core-node/actions/workflows/nodejs.yml/badge.svg)](https://github.com/furcata/core-node/actions/workflows/nodejs.yml)

`@furcata/core-node` is the shared **TypeScript data-model and interface library** for the
Furcata platform. It is consumed as a dependency by Furcata's Firebase Cloud Functions backends,
providing a single, strongly-typed source of truth for the Firestore document shapes, enums, and
queue contracts used across the system.

> **Repository:** <https://github.com/furcata/core-node.git>

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
| **Testing**       | Vitest `^4` (`node` environment) with type-checking through `tsconfig.test.json`.        |
| **Dependency**    | `@fabricelements/shared-helpers` — the sole runtime dependency (e.g., the `User` type used by the `Account` model). |

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

### 🔴 Strict blacklist notice — `/lib` is auto-generated build output

> [!CAUTION]
> **The `/lib` directory contains auto-generated build targets. NEVER edit it manually, and
> completely ignore it during development.**
>
> - `/lib` is produced **exclusively** by the TypeScript compiler (`tsc`, `outDir: lib`) and is
>   wiped and regenerated on every build by the `clear` script (`rm -rf ./lib`).
> - **Never** edit, create, or delete any file under `/lib` — including every `.js` and `.d.ts`
>   artifact. Any change there is silently overwritten on the next compile.
> - **Never** edit compiled `.js` artifacts anywhere. All development happens in `.ts` source
>   files under `src/`.
> - To change runtime behaviour, edit the matching `.ts` source in `src/` and recompile.
> - Tooling already enforces this boundary: ESLint ignores `lib/*` (alongside `node_modules/*`,
>   `.github/*`, and `functions/*`).

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

Vitest is configured to type-check the test tree using `tsconfig.test.json` (see `typecheck` in
`vitest.config.ts`), so type errors in tests surface during runs.

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
(`.github/workflows/nodejs.yml`) on Node `22.x` and `24.x`. Each job runs `npm ci`, then
`npm run build` (lint + compile), then `npm test`. Changes must keep all of these green.

## AI-Assisted Engineering Rules

This repository is **heavily optimized for AI-assisted workflows** with GitHub Copilot. A
permanent, repository-wide instruction file governs how both human developers and AI assistants
contribute:

> **Read [`.github/copilot-instructions.md`](.github/copilot-instructions.md) before contributing —
> with code or with an AI assistant.**

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
- **Respect the `/lib` blacklist.** Implement only in `.ts` files under `src/`; never edit `/lib`
  or compiled `.js` artifacts (see the blacklist notice above).

**Before opening a Pull Request,** ensure your AI chat assistant is grounded in
`.github/copilot-instructions.md` so generated code, comments, and tests stay 100% consistent with
these guidelines.

## Contributing

Please check [CONTRIBUTING](CONTRIBUTING.md).

## License

Released under the [BSD 3-Clause License](LICENSE.md).
