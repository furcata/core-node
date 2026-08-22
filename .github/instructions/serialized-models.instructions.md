---
description: Conventions for the serialized model layer — this package IS that layer.
applyTo: "src/model/**/*.ts,src/interface/**/*.ts"
---

# Serialized Models Instructions — `@furcata/core-node`

Most repositories have a serialized model layer somewhere inside them. **This repository *is* that
layer.** Everything in `src/model/` and `src/interface/` crosses a serialization boundary: these
types describe documents at rest in Firestore, payloads on a queue, and the `.d.ts` contract that
consumers compile against.

That makes the rules below load-bearing rather than stylistic. A mistake here is not a local bug;
it is a wrong shape replicated into every consumer.

---

## 1. Where models live

- **Entity namespaces** → `src/model/` — `Account`, `Block`, `EventData`, `MessagingEvent`,
  `Post`, `Price`. Each is a `namespace` containing its `Interface` and its associated enums.
- **Cross-cutting shared interfaces** → `src/interface/` — `BaseFirestore` (`base_db.ts`),
  `MessageQueue` (`queue.ts`), place types (`place.ts`).
- Each folder has a barrel `index.ts` that re-exports with `export * from './X.js'`.
- **Never duplicate a model.** Import and reuse. A shape defined twice will drift, and the two
  copies will disagree in production before anyone notices in review.

---

## 2. Conventions

- **Namespace-scoped naming.** The canonical entity per namespace is `Interface`
  (`Account.Interface`). Enums sit beside it in the same namespace.
- **Fields are optional (`?`) by default** for stored entities. Firestore documents are sparse and
  partially populated; a required field in the type is a promise the datastore does not keep.
- **`?` and `| null` mean different things.** Use `?` for "may not be present" and `| null` for
  "explicitly absent and must survive a JSON round-trip" — `undefined` keys are dropped by
  `JSON.stringify`, `null` keys are not. `place.ts` uses `| null` deliberately; match the
  surrounding convention rather than mixing.
- **Constrain string enumerations with an enum or a union.** Where a raw stored value must be
  tolerated, use `T | string` — **never `T | any`**, which collapses to `any` and silently stops
  discriminating while still reading as though it constrains something.
- **Document every field** with a `/** … */` block: meaning, units, provenance, and what absent
  means. See [`documentation.instructions.md`](documentation.instructions.md).
- **No banned types.** No `Function`, `Object` or bare `{}`.

---

## 3. Timestamps

Timestamp fields are the hardest shape in this package and the reason most of its remaining `any`
types exist. A Firestore timestamp is genuinely three things depending on direction:

| Direction | Runtime value |
|---|---|
| Read from the datastore | a `Timestamp` / `Date` |
| Written to the datastore | a server sentinel (`serverTimestamp()`) |
| Serialized for transport | an ISO 8601 `string` |

Writing that union precisely requires the server SDK's `FieldValue` type, which **is not a
dependency of this package and must not become one** — a pure type package should not pull a
server SDK into every consumer's dependency closure.

**Consequently several timestamp fields are typed `any` on purpose.** That is a considered
trade-off, not an oversight. Do not "fix" them by reflex:

- Narrowing a published field is a **breaking change** for consumers.
- The honest resolution is a **runtime schema** that validates the shape at the boundary, where the
  constraint can actually be enforced, rather than a type that merely asserts it.

Whatever you do, keep the JSDoc that explains the permissiveness. The comment is the only thing
distinguishing a deliberate decision from an accident.

---

## 4. The index signature on `BaseFirestore`

`BaseFirestore` carries `[x: string]: any`, which means **no extra property is ever a type error on
any document that extends it**. That is a deliberate accommodation of a sparse, evolving document
store, and it is also the single most permissive line in the package.

Know what it costs: it disables excess-property checking for every extending interface, so a typo
in a field name is not a compile error anywhere in any consumer. Treat it as the reason a **runtime
schema** is necessary rather than optional — the type system has been explicitly told to stop
helping here.

---

## 5. JSON and queue payload safety

Anything that crosses the wire must be plain-JSON-serializable:

- ❌ No `Date` objects (use ISO strings), `undefined`, `Map`/`Set`, `BigInt`, class instances or
  functions in a transported payload.
- ✅ Prefer `null` over `undefined` for values that must survive a round-trip.
- Keep secrets and PII out of transported shapes entirely. A field that exists in a type is a field
  someone will populate and log.

---

## 6. Compatibility

These declarations are a published contract:

- **Additive is safe** — new optional fields, appended enum members, new exports.
- **Never remove or rename** a published field, type or export casually. Mark `@deprecated` with
  the replacement, add the new field alongside, and remove only in a major version.
- **Widen inputs, keep outputs stable.** Narrowing a union breaks readers; widening one breaks
  writers. Know which side you are moving before you move it.
- **Tolerate unknown fields on read.** Do not design a shape that must throw on an extra property —
  stored documents predate every change you are about to make.

---

## 7. When you add a runtime schema

Schemas are the intended resolution to §3 and §4, so they will arrive. When they do:

- A schema must **reject unknown keys, not silently drop them.** A silent drop leaves the caller
  believing their input was honoured and the recipient believing it was filtered — both wrong, in
  opposite directions.
- Keep the schema and the interface **in the same file as the type they describe**, so they cannot
  drift apart unnoticed.
- The schema is a runtime artifact, so it compiles into `lib/` — which means it is subject to the
  committed-output rule. **A schema that is never rebuilt into `lib/` is a validation layer that
  passes review and never runs.**
- Test the rejection path, not only the happy path, and positive-control it: a schema test that
  only asserts a valid object parses passes identically whether the schema is strict or wide open.

---

## 8. A type-level guarantee must not depend on a compiler flag the consumer might not set

This package compiles with `strict`, `strictNullChecks` and `noImplicitAny` all on. **Consumers
need not**, and the same declaration can enforce something here and enforce nothing for them.

The canonical pair — identical in intent, not in effect:

```ts
// ❌ Rests on NULL-CHECKING. Inert wherever strictNullChecks is off:
//    `T | undefined` reduces to `T`, the marker vanishes, and the unguarded
//    read compiles clean and throws at runtime.
interface Failure { success: false; data?: undefined }

// ✅ Rests on PROPERTY EXISTENCE. `Property 'data' does not exist` fires
//    under every setting.
interface Failure { success: false }
```

**Prefer the construction that holds either way.** Omitting a property beats marking it
`?: undefined`; a required discriminant beats an optional one; `unknown` beats `any` regardless of
flags. When you must depend on a flag, say so in the JSDoc so the next reader knows the guarantee
has a precondition they do not control.

The trap is not the rule, it is that **nothing in a strict repository can show you the difference**.
The strict gate passes identically for both shapes above, so the precondition — "the consumer
shares our settings" — stays unspoken until it silently stops being true.

`npm run typecheck:consumer` is what closes that. It compiles fixtures in `test-consumer/` against
the **built `lib/*.d.ts`**, reached through the package's own `exports` map, with `strictNullChecks`
and `noImplicitAny` **off**. Add a case there whenever you add a type-level guarantee:

- express the negative with `@ts-expect-error` **plus a description** — if the guarantee breaks, the
  expected error stops occurring, the directive goes unused, and the compile fails with `TS2578`;
- **in the strict gate (`test/`), read shallow, not deep, when the guarantee is property absence.**
  `r.data` fails with `Property 'data' does not exist`, which fires under every setting;
  `r.data.amount` fails with `TS18048` under strict, so a re-added marker keeps that directive used
  and the strict gate stays green while protecting nobody. In the consumer fixture either form
  works — it reads deep because that is the runtime hazard being modelled. Measured both ways; see
  [`tests.instructions.md`](tests.instructions.md) §6;
- pair it with the narrowed positive, so a type that is merely unusable cannot satisfy the negative;
- keep the inert same-shape control that carries no directive and must compile clean. It is the
  proof the settings are genuinely permissive, and it makes the config self-pinning: restore
  strictness and the control errors rather than quietly turning the gate into a copy of the strict
  one.

One consumer-visible consequence worth knowing, measured rather than assumed: where
`strictNullChecks` is off, **negative narrowing of a boolean discriminant does not fire** — every
type includes `undefined` there, so the truthy branch cannot be excluded. `r.ok ? … : r.err` and
`if (r.ok) {} else { … }` leave the value un-narrowed for such a consumer; `r.ok === false`,
`r.ok === true` and `in` narrow under both settings. Design discriminated results so the failure
branch is reachable with the explicit comparison, and say so in the JSDoc.
