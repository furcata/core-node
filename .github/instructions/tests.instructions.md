---
description: Vitest conventions, positive controls, and the limits of a runtime suite over erased types.
applyTo: "test/**/*.ts,test-consumer/**/*.ts,vitest.config.ts,tsconfig.test.json,tsconfig.consumer.json"
---

# Testing Instructions — `@furcata/core-node`

Companion to [`cross-repo.instructions.md`](cross-repo.instructions.md) §5 (evidence standards).

---

## 1. The thing you must understand before writing a test here

> 🔴 **TypeScript interfaces are erased at runtime. A Vitest assertion cannot see them.**

This package is almost entirely interfaces and enums. That splits the suite into two kinds of
test with completely different value, and they look identical on the page:

```ts
// ❌ CANNOT FAIL. This declares a literal in the test file and reads it back.
// It exercises JavaScript object semantics, not the source. Deleting `pending`
// from MessageQueue entirely leaves this green.
it('should accept a positive integer', () => {
  const queue: MessageQueue = { pending: 5 };
  expect(queue.pending).toBe(5);
});

// ✅ CAN FAIL. An enum is a real runtime value, so this compares against the source.
it('should map country to its stored value', () => {
  expect(PlaceType.country).toBe('country');
});
```

This is measured, not theoretical. Deleting `pending?: number` outright from
`src/interface/queue.ts` and running `npm test` produced **480 passed, exit 0**. Changing one enum
member's value produced **3 failed, exit 1**.

### What follows from that

- **Runtime tests over an interface are documentation, not verification.** They are still worth
  having — they record intent and catch a barrel-export mistake — but never cite one as evidence
  that a type is correct.
- **Type-level correctness is enforced by `npm run typecheck`, not by `npm test`.** Both must pass.
  `npm test` proves runtime values; `npm run typecheck` proves the shapes.
- **When you change a type, the test that proves it is a compile error, not an assertion.**

---

## 2. Commands

| Purpose | Command |
|---|---|
| Run the suite once (CI mode) | `npm test` → `vitest run` |
| Watch | `npx vitest` |
| Coverage | `npx vitest run --coverage` |
| **Type-level check (required)** | `npm run typecheck` → `tsc -p ./tsconfig.test.json` |
| **Consumer-conditions check (required)** | `npm run typecheck:consumer` → `tsc -p ./tsconfig.consumer.json` |

> ⚠️ `npx vitest run --typecheck` is **not** the type gate. Vitest's `typecheck.include` defaults
> to `**/*.test-d.ts`, and this repository has no such files, so it type-checks **zero files** and
> reports "no errors" no matter what is broken. Verified: with an interface field deleted it still
> reported `Type Errors  no errors` and exited `0`. Use `npm run typecheck`.

> ⚠️ `npm run typecheck:consumer` reads the **built** `lib/*.d.ts`, so run `npm run build` first.
> Against a stale `lib/` it reports on declarations that no longer match `src/`. CI orders it after
> the build and the drift check for exactly that reason.

---

## 3. Conventions

- **Framework.** Vitest, `node` environment. `globals: true` is set, but the convention is to
  import explicitly: `import { describe, it, expect } from 'vitest';`. Two existing files rely on
  the implicit globals, which is why `tsconfig.test.json` still needs the `vitest/globals` types.
- **Directory mapping.** Every test mirrors its source path and name:
  `src/model/Account.ts` → `test/model/Account.test.ts`,
  `src/interface/queue.ts` → `test/interface/queue.test.ts`.
  Only `.test.ts` and `.spec.ts` under `test/` are collected.
- **Import with the ESM `.js` specifier**, matching `Node16` resolution:
  `import type { MessageQueue } from '../../src/interface/queue.js';`
- **Structure.** Arrange–Act–Assert inside descriptive nested `describe()` / `it()` blocks.
- **Isolation.** Zero network, zero disk I/O, zero cloud or emulator access. The suite must be
  safe to run anywhere, against anything. It currently is; keep it that way.
- **No lint escape hatches.** No `// eslint-disable*`. `eslint.config.js` `files` covers both
  `src/**/*.ts` and `test/**/*.ts`, so test files are linted with type-aware rules —
  `parserOptions.project` lists both `tsconfig.json` and `tsconfig.test.json` so they resolve.

---

## 4. Positive controls and mutation testing

> **A suite nobody has watched fail is a hypothesis about a suite.**

Before claiming a test protects something, prove it can go red:

1. Mutate the thing the test checks — delete the field, change the enum value, remove the export.
2. Run the relevant command and **observe the failure**, including the exit code.
3. Revert, and confirm green again.
4. **Report the mutation and what you saw.** "Tests pass" is not evidence; "deleting X turned N
   assertions red, reverting restored them" is.

Choose the mutation to match the gate you are validating:

| Mutation | Caught by `npm test`? | Caught by `npm run typecheck`? |
|---|---|---|
| Change an enum member's **value** | ✅ yes | no |
| Remove an enum member | ✅ yes | ✅ yes |
| Delete an **interface field** | ❌ **no** | ✅ yes |
| Assign a wrong type in a test | ❌ no | ✅ yes |
| Remove a barrel `export *` | ✅ yes | ✅ yes |

The two ❌ rows are precisely why both commands are required, and why a green `npm test` on its own
must never be reported as proof that a type change is safe.

---

## 5. Writing a test that can actually fail

When the thing under test is a type, assert against something with runtime existence:

- **Enums** — assert member values and the full member set. An **inventory test** over
  `Object.keys(SomeEnum)` is the capability equivalent of a positive control: it fails loudly when
  a member is quietly dropped, which a per-member test cannot do.
- **Barrel exports** — import the barrel and assert the expected names are present. This catches a
  dropped `export *`, which is otherwise invisible until a consumer breaks.
- **Runtime schemas**, once present — assert that a valid object parses, that an invalid one is
  **rejected**, and that an unknown key is **rejected rather than silently dropped**. A schema test
  asserting only the happy path is vacuous in the most dangerous way: it passes identically whether
  the schema is strict or wide open. Always include the rejection case, and positive-control it by
  confirming the valid case still parses.

---

## 6. The third gate: `test-consumer/`

`npm test` proves runtime values. `npm run typecheck` proves the shapes **under this package's own
compiler settings**. Neither can see how a published declaration behaves for a consumer who
compiles more permissively — and a type-level guarantee can hold under one null-checking setting
and be completely inert under the other.

`test-consumer/` closes that. It is not a Vitest suite and is never executed: the compile *is* the
test. Two projects, two jobs:

| project | script | fixture | must |
|---|---|---|---|
| `tsconfig.consumer.json` | `npm run typecheck:consumer` | `*.consumer-unguarded.ts` (and everything else) | exit `0`, meaning every `@ts-expect-error` was needed |
| `tsconfig.consumer-control.json` | `npm run typecheck:consumer:control` | `*.consumer-guarded.ts` only | exit `0` **always** |

Both compile against the **built `lib/*.d.ts`**, reached through the package's own `exports` map,
with `strictNullChecks` and `noImplicitAny` **off**. The control project `extends` the gate's own
project and overrides nothing but `include`, so their settings cannot drift apart.

### Why there are two projects

**A negative assertion is evidence only if the harness that produced it works.** "The un-narrowed
read failed to compile" is produced just as readily by a fixture that cannot compile *at all*, and
both ways of getting there are live in this repository — measured, not supposed:

- **`TS5112`** — *"tsconfig.json is present but will not be loaded if files are specified on
  commandline"* — fires **before any type analysis**. `tsc --noEmit somefile.ts` here exits `1`
  with exactly that and checks nothing. This is why the gate is a `-p` project and must stay one;
  `--ignoreConfig` is the other way out, and the project form needs no escape hatch.
- **`TS2307`** — the `exports` map exposes only `./model` and `./interface`, so a deep path like
  `@furcata/core-node/lib/interface/schema.js` does not resolve. Exits `2`, and every read in the
  file fails alike because the type is unresolvable.

Either one makes the un-narrowed **and** narrowed reads fail together, which reads as a confirmed
guarantee. So the required evidence is **three observations, not two**, and the two exit codes are
read together:

- gate red, control green → **a guarantee regressed.** Fix the type.
- gate red, control red → **the harness broke.** The gate proves nothing until it is repaired.

### Conventions, which differ from `test/`

- **Mirror the source path**, as elsewhere: `src/interface/schema.ts` →
  `test-consumer/interface/schema.consumer-{guarded,unguarded}.ts`. The suffixes keep the files out
  of Vitest's collection globs.
- **Import by package subpath**, never a relative path:
  `import {type ParseResult} from '@furcata/core-node/interface';`. That resolves through `exports`
  to the shipped declaration, and it is what real consumer code writes. Verified with
  `tsc --listFiles`: only `lib/interface/*.d.ts` and the fixture compile, no file from `src/`.
- **Negative cases use `@ts-expect-error` with a description**, and each is answered by a narrowed
  positive in the guarded file, so a type that is merely unusable cannot satisfy the negative.
- **Read shallow when the guarantee is property absence** — see §6.1, this is the subtle one.
- **Keep the inert same-shape controls.** They carry no directive and must compile clean. They are
  what makes the config self-pinning: a permissive gate's failure mode is quietly **becoming a
  duplicate of the gate it was meant to complement**, and two green gates look exactly like two
  passes. A control that breaks when the config drifts strict makes that divergence
  self-announcing.
- **Fixtures must be obviously synthetic.** This repository is public.

### 6.1 `@ts-expect-error` is satisfied by *any* error, including the wrong one

This is the trap one layer above the harness-liveness rule, and it is easy to walk into because the
wrong form looks like the better assertion.

> When the guarantee is **property absence**, read **shallow** (`r.data`). A deep read
> (`r.data.amount`) admits a **substitute error**: as the type weakens, the error merely changes
> identity — `TS2339` → `TS18048` — the directive stays *used*, and the gate passes while protecting
> nobody.

The assertion silently degrades from *"the property is absent"* to *"the property is possibly
undefined"*, and nothing can tell. Absences and failures are both cheap to manufacture, so neither
is a finish condition on its own: check **which** error you are suppressing, not merely that one
occurred. Verified for the four directives here by stripping them and reading the diagnostics — all
four are `TS2339`.

The consumer fixture reads deep on purpose, because there `TS18048` cannot arise: with
`strictNullChecks` off there is no possibly-undefined error to substitute in, so a weakened type
produces no error at all and the directive goes unused. That asymmetry is the whole divergence.

### 6.2 Mutation validation, measured

Validated with a 2×2 rather than a single cell, because **the obvious one-cell experiment gives the
wrong answer and would have been reported as a success**:

| `ParseFailure` | strict assertion form in `test/` | `npm run typecheck` | `typecheck:consumer` | `typecheck:consumer:control` |
|---|---|---|---|---|
| property omitted (as shipped) | shallow `result.data` | green `0` | green `0` | green `0` |
| `data?: undefined` | shallow `result.data` | **red `2`** | **red `2`** | green `0` |
| property omitted (as shipped) | deep `result.data.amount` | green `0` | green `0` | green `0` |
| `data?: undefined` | deep `result.data.amount` | **green `0`** | **red `2`** | green `0` |

Row 2 is why "reintroduce the marker and watch only the new gate fail" does not work: the existing
assertions read the **shallow** property, and `Property 'data' does not exist` fires under every
setting, so the strict gate catches that mutation too. **Row 4 is the divergence** — and the control
column is what makes it evidence rather than a coincidence, since a dead harness would have shown
red there too. Row 3 rules out "the deep test is simply broken". The identical 2×2 on
`member?: undefined` and `MemberMiss` behaves the same way and fails the fixture's other two
directives.

So the strict gate's coverage of this class is **incidental to how one line was phrased**; the
consumer gate's is structural. All four `@ts-expect-error` directives have been observed failing
under the mutation they exist to catch, each with the control green in the same state — none is
vacuous.

The rule this enforces is in
[`serialized-models.instructions.md`](serialized-models.instructions.md) §8.
