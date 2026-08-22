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

`test-consumer/` closes that. It is not a Vitest suite and it is never executed: the compile *is*
the test. `tsconfig.consumer.json` compiles it against the **built `lib/*.d.ts`**, reached through
the package's own `exports` map, with `strictNullChecks` and `noImplicitAny` **off**.

Conventions, which differ from `test/`:

- **Mirror the source path** as elsewhere: `src/interface/schema.ts` →
  `test-consumer/interface/schema.consumer-types.ts`. The `.consumer-types.ts` suffix keeps the
  files out of Vitest's collection globs.
- **Import by package name**, not by relative path:
  `import {type ParseResult} from '@furcata/core-node/interface';`. The self-name import resolves
  through `exports` to the shipped declaration. A relative import of `src/` would test a file
  consumers never receive. Verified with `tsc --listFiles`: only `lib/interface/*.d.ts` and the
  fixture are compiled, no file from `src/`.
- **Negative cases use `@ts-expect-error` with a description.** That makes them self-proving — if
  the guarantee breaks the expected error disappears, the directive goes unused, and `tsc` fails
  with `TS2578`. It fails when the guarantee breaks *and* when it stops being tested.
- **Every negative is paired with a narrowed positive**, so a type that is merely unusable cannot
  satisfy the negative.
- **Keep the inert same-shape controls.** They carry no directive and must compile clean; they are
  the proof the settings are genuinely permissive, and they make the config self-pinning.
- **Fixtures must be obviously synthetic.** This repository is public.

Mutation-validated as §4 requires, with a 2×2 rather than a single cell — because the obvious
one-cell experiment gives the wrong answer and would have been reported as a success:

| `ParseFailure` | strict assertion form in `test/` | `npm run typecheck` | `npm run typecheck:consumer` |
|---|---|---|---|
| property omitted (as shipped) | shallow `result.data` | green `0` | green `0` |
| `data?: undefined` | shallow `result.data` | **red `2`** | **red `2`** |
| property omitted (as shipped) | deep `result.data.amount` | green `0` | green `0` |
| `data?: undefined` | deep `result.data.amount` | **green `0`** | **red `2`** |

Row 2 is why "reintroduce the marker and watch only the new gate fail" does not work here: the
existing assertions read the **shallow** property, and `Property 'data' does not exist` fires under
every setting, so the strict gate catches that mutation too. Row 4 is the divergence. Deepening the
read to `result.data.amount` — the natural way to write it, and what the guarantee is actually
about — leaves the strict gate green under the marker, because `TS18048` keeps its directive used.
Only the consumer gate reports `TS2578`. Row 3 is the control that rules out "the deep test is
simply broken". The identical 2×2 on `member?: undefined` and `MemberMiss` behaves the same way,
failing the fixture's other two directives.

So the strict gate's coverage of this class is **incidental to how one line was phrased**; the
consumer gate's is structural. All four `@ts-expect-error` directives in the fixture have been
observed failing under the mutation they exist to catch — none of them is vacuous.

The rule this enforces is in
[`serialized-models.instructions.md`](serialized-models.instructions.md) §8.
