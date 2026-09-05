---
description: Repository-specific security rules, current known state, and sweep recipes for @furcata/core-node.
applyTo: "src/**/*.ts,test/**/*.ts,package.json,.github/**"
---

# Security Instructions — `@furcata/core-node`

Companion to [`cross-repo.instructions.md`](cross-repo.instructions.md), which holds the generic
playbook and the public-repository rules. This file holds what is true about **this** repository:
its actual current state, the sweeps that establish it, and the decisions behind what is
deliberately left alone.

> **This repository is public.** Everything below describes this package only. Do not add findings
> about consumers here — see the boxed rule at the top of the cross-repo playbook.

---

## 1. Threat model in one paragraph

This package has no runtime logic, no I/O and no network access, so it cannot itself be exploited
at runtime. Its security surface is **the contract it publishes**: the types every consumer
compiles against, the build output consumers actually execute, and the dependency closure it drags
into every consumer. Attacks land through *permissiveness* (a type that stops warning anyone),
through *supply chain* (an unpinned dependency, a stale committed artifact), and through *disclosure* (this repository
is public and its consumers are not).

---

## 2. Current known state

Measured on this branch. **Re-measure rather than re-quoting** — every figure here carries an
implicit timestamp, and a claim about a dependency or a count is stale the moment something moves.

### 2.1 Type permissiveness

| Class                             | Count in `src/` | Status                                                          |
|-----------------------------------|-----------------|-----------------------------------------------------------------|
| `T \| any` union                  | **0**           | Clean. A previous change removed these; verified not regressed. |
| bare `any`                        | **8**           | Known and accepted for now — see below.                         |
| `Function` / `Object` / bare `{}` | **0**           | Clean.                                                          |
| spread after a literal key        | **0**           | Not applicable — this package has no object literals.           |
| `eval` / `new Function`           | **0**           | Clean.                                                          |
| `process.env` access              | **0**           | Clean — the package reads no environment.                       |
| secret-like field names           | **0**           | Clean.                                                          |

The 8 bare `any` are **not** arbitrary. Six are timestamp fields (`base_db.ts` `created`/`updated`/`expiry`,
`Account.ts` `domainTimestamp`,
`EventData.ts` `startTime`/`endTime`), whose honest type is a three-way union of "read value",
"write sentinel" and "serialized string". Writing that precisely requires the server SDK's
`FieldValue` type, which **is not a dependency of this package and should not become one** — a
pure type package should not pull a server SDK into every consumer's closure. The remaining two
are `queue.ts` `counted` (an untyped diagnostic snapshot) and the deliberate catch-all index
signature `base_db.ts` `[x: string]: any`.

> **Do not "fix" these by reflex.** Narrowing a published type is a breaking change for consumers
> (§4 of the cross-repo playbook), and the index signature is a deliberate choice for a sparse
> document store. The right resolution is a runtime schema layer that validates these shapes at
> the boundary, where the constraint can be enforced rather than merely asserted. Until then they
> are documented, not hidden.

### 2.2 Tooling that does not enforce what it appears to

Three settings previously meant the compiler and linter were **more permissive than they looked**.
Two have since been corrected; the remaining one is recorded so nobody mistakes a green build for a
strictness guarantee:

- `eslint.config.js` sets `@typescript-eslint/no-explicit-any: ['off']` — an explicit `any` is **not** a lint error
  here. Still current.
- `tsconfig.json` sets `"strict": true`, and **no longer overrides it**: `noImplicitAny` and
  `strictNullChecks` are both `true`. They were previously `false`, which meant `strict: true` was
  not the final word — the later, narrower keys won. Any claim about this repository written before
  that change may assume the old behaviour.
- `eslint.config.js` `files` now covers **both** `src/**/*.ts` and `test/**/*.ts`, with
  `parserOptions.project` listing both tsconfigs so type-aware rules resolve. `test/` was
  previously unlinted.

Any claim that "strict mode would have caught it" must be checked against these three lines first.

### 2.3 Dependencies

- The single runtime dependency is a **public** package, declared as a `github:` dependency **without a `#ref`**. It
  therefore floats to whatever the default branch points at when someone
  runs `npm install`. `package-lock.json` pins the resolved commit, so `npm ci` — which is what CI
  runs — is reproducible and green. **That is exactly what makes the float easy to miss:** nothing
  surfaces it until a plain `npm install` silently moves the dependency.
- The lockfile resolves that dependency over **SSH** (`git+ssh://`), which requires every consumer
  and CI runner to hold a key with access.
- `npm audit` reports vulnerabilities that are **entirely transitive** through that one dependency
  and through dev tooling. This package's own code introduces none. Several have no fix available
  upstream, so they are recorded rather than suppressed.

---

## 3. Sweep recipes

Run these before claiming a class is clean. **Each one is written to be positive-controlled** —
run it against a synthetic file containing the defect first and confirm a non-zero result, because
a zero from an untested probe is not evidence.

```bash
# Bare `any` in type position
grep -rEn ':[[:space:]]*any\b' src --include='*.ts'

# `T | any` — collapses to `any` while looking constrained
grep -rEn '\|[[:space:]]*any\b|\bany[[:space:]]*\|' src --include='*.ts'

# Banned escape-hatch types
grep -rEn ':[[:space:]]*(Function|Object)\b|:[[:space:]]*\{[[:space:]]*\}' src --include='*.ts'

# Dynamic execution and environment reads (should be empty in a pure type package)
grep -rEn '\beval[[:space:]]*\(|new Function[[:space:]]*\(|process\.env' src --include='*.ts'
```

Positive control for any of the above:

```bash
printf 'interface Z { a: any; b: Foo | any; c: Function; d: Object; e: {}; }\n' > /tmp/ctrl.ts
grep -Ec ':[[:space:]]*any\b' /tmp/ctrl.ts     # MUST be non-zero before you trust a zero
```

Common way to get this wrong: `grep -rc` prefixes each line with a filename, so arithmetic on its
output silently misbehaves and every control appears to fail (or, worse, appears to pass). Use
`grep -Ec` on a single file, and read the control's output rather than only its exit status.

---

## 4. Build-output integrity

See §2 of the cross-repo playbook for the full explanation. Operationally:

```bash
npm run build                      # clear -> lint -> compile; rm -rf ./lib happens first
git status --porcelain -- lib/     # MUST be empty; anything here is uncommitted drift
```

`git status --porcelain` rather than `git diff --exit-code`: `git diff` sees only tracked files, so
a newly added module under `src/` produces **untracked** files under `lib/` that `git diff` reports
as clean. Verified by adding a module and observing `git diff` exit `0` while two untracked output
files existed.

CI enforces this after every build.

---

## 5. Disclosure hygiene

`.github/scripts/check-private-markers.sh` scans tracked files, commit messages and commit
authorship. Run it locally before pushing:

```bash
./.github/scripts/check-private-markers.sh              # defaults to origin/main..HEAD
./.github/scripts/check-private-markers.sh --self-test  # prove the patterns still detect
```

It self-tests on every run, so a pass means the patterns were demonstrated rather than trusted. **It holds no exemption
for itself** — a marker written inside the script is caught like any other,
verified by planting one and watching the check cite the script's own line number. Keep it that
way: an exempted path is a place a real marker can hide.

Commit messages are scanned because they never appear in a file diff, which makes them the vector
least likely to be caught by review.

---

## 6. Deliberately not done

Recorded because a refuted or deferred finding is a real deliverable, and a silently dropped one
becomes someone's rediscovery:

- **The 8 bare `any` are left in place.** Rationale in §2.1: precise typing needs a server SDK type
  this package must not depend on, and narrowing a published type breaks consumers. The resolution
  is a runtime schema layer, not a type edit.
- **`noImplicitAny` / `strictNullChecks` are now both `true`.** Enabling them produced **0** errors
  in `src/` and 5 in `test/`, all of the same shape (a test reading a deliberately-undeclared key
  to assert unknown-key preservation), resolved with an explicit `unknown`-first cast rather than
  by weakening a type. Note that enabling `noImplicitAny` *alone* produces two additional errors
  that both flags together do not: `null` literals infer as `any` without `strictNullChecks`, so
  the half-configuration is strictly worse than either end. Enable them together or not at all.
- **`@typescript-eslint/no-explicit-any` is left `off`.** Turning it on would fail the build on the
  8 known fields above before there is anywhere for them to go.
- **Transitive advisories with no upstream fix are not suppressed.** An `overrides` entry that
  forces an unrelated version can break the consumer's runtime in a way this package cannot test.
