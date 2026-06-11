# Furcata Core Node

`@furcata/core-node` is the shared **TypeScript data-model and interface library** for the
Furcata platform. It is published as a dependency and consumed by Furcata's Firebase
Cloud Functions backends, providing a single, strongly-typed source of truth for the
Firestore document shapes, enums, and queue contracts used across the system.

> **Repository:** <https://github.com/furcata/core-node.git>

------

## Project Architecture & Cloud Blueprint

### What this package does

This package does **not** run as a deployable service on its own. Instead, it defines the
**domain models and interfaces** that the Furcata Firebase backend (Cloud Functions) imports
to read, validate, and persist data in Firestore. Concretely it ships:

- **Data models** (`src/model/`) — namespaced enums and Firestore document interfaces for the
  platform's core entities: `Account`, `Block`, `EventData`, `MessagingEvent`, `Post`, and
  `Price`. These describe account lifecycle/status, social-media post metadata, messaging
  events, pricing records, and related business data.
- **Shared interfaces** (`src/interface/`) — cross-cutting contracts including `BaseFirestore`
  (the base shape every Firestore document extends, with `id`, `created`, `updated`, `expiry`
  TTL, and `backup` fields), `MessageQueue` (queue state counters), and place/geo interfaces
  (`PlaceType`, `BasePlaceData`) carrying Google Places identifiers and coordinates.

Both folders expose a public **barrel export** (`index.ts`) so consumers can import from the
package's `./model` and `./interface` entry points without deep relative paths.

### Directory map

| Path                | Purpose                                                                                     |
| ------------------- | ------------------------------------------------------------------------------------------- |
| `src/model/`        | Source of truth for entity models (`Account`, `Block`, `EventData`, `MessagingEvent`, `Post`, `Price`) and their `index.ts` barrel. |
| `src/interface/`    | Shared interfaces (`base_db.ts`, `queue.ts`, `place.ts`) and their `index.ts` barrel.       |
| `test/`             | Vitest unit tests mirroring the `src/` layout (`test/model/`, `test/interface/`).           |
| `lib/`              | **Generated** compiled output (`.js` + `.d.ts`) produced by the TypeScript compiler.        |
| `tsconfig.json`     | Compiler configuration (ESM, `Node16` module resolution, `outDir: lib`, declarations on).   |
| `tsconfig.test.json`| Type-check configuration used by Vitest's `typecheck` integration for the `test/` tree.     |
| `vitest.config.ts`  | Vitest runner configuration (Node environment, `test/**/*.test.ts` includes).               |
| `eslint.config.js`  | ESLint flat config (`typescript-eslint`) applied to `src/**/*.ts`.                          |

### ⚠️ The `/lib` directory is generated — never edit it manually

`/lib` is **build output only**. It is produced by the TypeScript compiler (`tsc`), whose
`outDir` is set to `lib` in `tsconfig.json`, and it is wiped and regenerated on every build by
the `clear` script (`rm -rf ./lib`).

- **Never edit any file under `/lib` by hand** — your changes will be silently overwritten on
  the next compile.
- **Ignore `/lib` while editing.** All real work happens in `src/` (`.ts` files); the matching
  `.js`/`.d.ts` files in `/lib` are artifacts. Tooling such as ESLint already ignores `lib/*`.
- To change runtime behaviour, edit the corresponding `.ts` source in `src/` and recompile.

## Tech Stack Core

| Area              | Details                                                                                  |
| ----------------- | ---------------------------------------------------------------------------------------- |
| **Runtime**       | Node.js `>=22` (see `engines` in `package.json`; CI matrix runs `22.x` and `24.x`).      |
| **Language**      | TypeScript `^6` compiled to ECMAScript (`target`/`lib`: `ES2020`).                       |
| **Module system** | Native ESM — `"type": "module"`, with `Node16` `module` and `moduleResolution`.          |
| **Data layer**    | Models describe **Firestore** documents. `BaseFirestore` standardises identity, audit timestamps, and TTL (`expiry`) fields for every collection document. |
| **Linting**       | ESLint `^10` flat config via `typescript-eslint` (`recommended` + `stylistic`), scoped to `src/**/*.ts`. |
| **Testing**       | Vitest `^4` (`node` environment) with type-checking through `tsconfig.test.json`.        |
| **Dependency**    | `@fabricelements/shared-helpers` (e.g., the `User` type used by the `Account` model).    |

### Package entry points

Compiled exports are declared in `package.json`:

```jsonc
"exports": {
  "./model":     "./lib/model/index.js",
  "./interface": "./lib/interface/index.js"
}
```

### Configuration patterns

- **`tsconfig.json`** — `rootDir: src`, `outDir: lib`, `declaration: true` (emits `.d.ts`),
  `strict: true`, ESM (`module`/`moduleResolution`: `Node16`).
- **`tsconfig.test.json`** — extends the base config with `noEmit` and `vitest/globals` types
  for type-checking the `test/` tree.
- **`eslint.config.js`** — flat config that ignores `lib/*`, `node_modules/*`, `.github/*`, and
  `functions/*`, and enforces a `max-len` of 200.

## Installation

Install from npm:

```shell
$ npm i @furcata/core-node --save
```

or directly from GitHub:

```shell
$ npm i github:furcata/core-node --save
```

Or reference it locally for development against a checkout:

```json
{
  "dependencies": {
    "@furcata/core-node": "file:../core-node"
  }
}
```

### Basic usage

Import the models and interfaces you need from the package entry points:

```ts
import { Account, Post } from "@furcata/core-node/model";
import { BaseFirestore, MessageQueue } from "@furcata/core-node/interface";
```

## Local Emulation & Setup

Follow these steps for a fresh developer onboarding.

### 1. Install dependencies

```shell
$ npm install
```

### 2. Generate the operational layout (compiled `/lib`)

Run a one-off build to lint and compile `src/` into the generated `/lib` layout that consumers
import:

```shell
$ npm run build
```

`build` runs `clear` → `lint` → `compile`, i.e. it deletes `./lib`, lints `src/`, then runs
`tsc -p ./tsconfig.json`.

While actively developing, use the **TypeScript compilation watcher** so `/lib` is regenerated
automatically on every save:

```shell
$ npm run build:watch
```

`build:watch` runs `clear` → `lint` → `compile:watch` (`tsc --watch -p ./tsconfig.json`).

### 3. Use within a Firebase emulator workflow

This repository is a **library, not a Firebase app** — it intentionally contains no
`firebase.json`, emulator configuration, or Cloud Functions runtime of its own. To exercise the
models against the local Firebase Emulator Suite, build this package (steps above) and link or
install it into the consuming Cloud Functions project, then start the emulators **from that
project**:

```shell
# run inside the consuming Firebase project, not this repo
$ firebase emulators:start
```

Rebuilding here (or leaving `npm run build:watch` running) keeps `/lib` in sync so the consuming
emulator picks up your model changes.

## Testing Execution Map

Tests are written with **Vitest** and live under `test/`, mirroring the `src/` structure. They
are **pure, offline unit tests** that import models/interfaces directly from `src/` and assert
on enum values and type shapes — they make **no network calls and connect to no live Firestore,
emulator, or production project**, so running them cannot affect any real environment.

### Run the full suite

```shell
$ npm test
```

`npm test` runs `vitest run` (a single, non-watching pass — the mode used in CI).

You can also invoke Vitest directly:

```shell
$ npx vitest run     # one-off run
$ npx vitest         # watch mode for local development
```

### Type-checking

Vitest is configured to type-check the test tree using `tsconfig.test.json`
(see `typecheck` in `vitest.config.ts`), so type errors in tests surface during runs.

### Coverage reports

Coverage is produced by Vitest's `--coverage` flag:

```shell
$ npx vitest run --coverage
```

Because the suite is fully isolated from external services, coverage can be generated safely
without any risk of corrupting production data. Coverage output directories (`coverage/`,
`.nyc_output/`) are already excluded via `.gitignore`.

> **Note:** running with `--coverage` requires a Vitest coverage provider to be installed; add
> the appropriate provider package before enabling coverage if it is not already present.

## Continuous Integration

Pushes and pull requests targeting `main` run the **Node CI** workflow
(`.github/workflows/nodejs.yml`) on Node `22.x` and `24.x`. Each job runs `npm ci`, then
`npm run build` (lint + compile), then `npm test`.

## Contributing

Please check [CONTRIBUTING](CONTRIBUTING.md).

## License

Released under the [BSD 3-Clause License](LICENSE.md).
