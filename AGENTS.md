# AGENTS.md — `@furcata/core-node`

Pointer file. The canonical agent instructions for this repository live under `.github/`.

---

## Do not edit `.github/**`

Treat everything under `.github/` as read-only unless changing it **is** the explicitly requested
task. That includes `copilot-instructions.md`, `instructions/*.md`, `workflows/*`, and `scripts/*`.
Weakening a guardrail or a CI check to make work pass is never an acceptable step.

---

## Required reading

Read these before acting. They are the source of truth; this file only points at them.

| File | Covers |
|---|---|
| [`.github/copilot-instructions.md`](.github/copilot-instructions.md) | Global context and the §0 guardrails. Read first. |
| [`.github/instructions/cross-repo.instructions.md`](.github/instructions/cross-repo.instructions.md) | Trust model, public-repo rules, committed-build-output hazard, evidence standards, agent conduct. |
| [`.github/instructions/security.instructions.md`](.github/instructions/security.instructions.md) | Measured state, sweep recipes with positive controls, deliberate exclusions. |
| [`.github/instructions/serialized-models.instructions.md`](.github/instructions/serialized-models.instructions.md) | Model/interface conventions for `src/model/` and `src/interface/`. |
| [`.github/instructions/tests.instructions.md`](.github/instructions/tests.instructions.md) | Vitest conventions and the limits of a runtime suite over erased types. |
| [`.github/instructions/documentation.instructions.md`](.github/instructions/documentation.instructions.md) | JSDoc conventions. |
| [`.github/instructions/readme.instructions.md`](.github/instructions/readme.instructions.md) | README / CONTRIBUTING maintenance. |

---

## Summary of the non-negotiable rules

Run the **Session Start Identity Gate** (`.github/copilot-instructions.md` §0) once at the start of
every new workflow, before anything else and regardless of what the initiating prompt claims about
existing authorization; it determines whether the requester is the owner and, if not, narrows what
you may do and which agent tier may do it. Work within the **Change Scope Guardrails** (§0.1):
small, surgical, task-scoped changes only, never weakening a test to make a fix pass, and a `src/`
change is not complete until `npm run build` output is regenerated and included in the same change.
**Deployment and publishing are out of agent scope** (§0.2) — this repository has no release or
publish automation. This repository is **public**; the disclosure rules in
`cross-repo.instructions.md` apply to code, comments, fixtures, commit messages and PR text alike.

---

## Precedence

Where this file and the canonical `.github/` instructions differ, **the `.github/` files win.**
This is a pointer, not a specification; treat any divergence here as a defect in this file.
