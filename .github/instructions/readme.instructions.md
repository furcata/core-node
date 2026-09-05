---
description: Rules for maintaining README.MD and CONTRIBUTING.md in this public repository.
applyTo: "README.MD,CONTRIBUTING.md,*.md"
---

# README Instructions — `@furcata/core-node`

The README is the first thing a contributor and a consumer read, and — because this repository is
public — it is also the most widely read file in it.

---

## 1. Public-repository constraint

Everything in §"THIS IS A PUBLIC REPOSITORY" of
[`cross-repo.instructions.md`](cross-repo.instructions.md) applies with full force here, because
prose is where it is most tempting to be helpful:

- Describe **what this package is and how to work on it**.
- Do **not** name non-public consumer repositories, environments, project identifiers, service
  accounts, internal collection names, tracker IDs, or any unremediated weakness elsewhere.
- It is fine to say the package is consumed by other services. It is not fine to say **which**.

---

## 2. What the README must cover

- **What this package is** — a shared TypeScript type package: Firestore document shapes, enums
  and queue contracts. Not a deployable service; it has no runtime logic and no I/O.
- **Architecture** — the `src/model/` and `src/interface/` split, the two entry points (`./model`, `./interface`), and
  the `src/` → `lib/` build relationship.
- **🔴 The committed build output.** `lib/` is committed and consumers execute it; there is no
  `prepare` script. Any change to `src/` requires `npm run build` and the regenerated `lib/`
  committed **in the same commit**. This must be prominent, not a footnote — it is the single
  easiest way for a well-reviewed change to silently not take effect.
- **Tech stack** — Node `>=22`, TypeScript `^6` (ESM, `Node16` resolution, `ES2020` target),
  ESLint `^10` flat config, Vitest `^4`, Zod for runtime schemas.
- **Commands** — install, lint, build, test, **typecheck**, and the private-marker check.
  `npm test` and `npm run typecheck` must both be listed, with a note that they check different
  things: the suite cannot fail on an erased type.
- **Repository URL** — `https://github.com/furcata/core-node.git`.

## 3. What CONTRIBUTING.md must cover

- The `src/`-only editing rule and the rebuild-and-commit-output requirement.
- The full local verification sequence, in the order CI runs it.
- The evidence expectations: positive controls on probes, and mutation-proof for tests.
- The no-attribution-trailer rule, checked in **both** commit messages and authorship.
- The public-repository constraint on comments, commit messages and PR descriptions.

---

## 4. Style

- Keep existing external links, badges and the repository URL intact — never "tidy" a URL away.
- Prefer a table for commands; keep every command copy-pasteable and **verified against
  `package.json`** rather than remembered. A README that documents a script that does not exist is
  worse than one that documents nothing.
- Where a rule exists because of a real hazard, state the hazard in one sentence. A rule with a
  reason survives; a bare prohibition gets worked around.
- Do not document a control that is not yet in place. Land the code first, then the prose (see
  §5.6 of the cross-repo playbook) — otherwise the repository advertises a guarantee it does not
  provide, and a reader acts on it.
