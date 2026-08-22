---
description: JSDoc conventions for the model and interface sources.
applyTo: "src/**/*.ts"
---

# Documentation Instructions — `@furcata/core-node`

This package ships `.d.ts` declarations, so **its JSDoc is the documentation consumers read** in
their editor. A field whose meaning is only obvious from its name is undocumented.

---

## 1. Format

- **Block comments only.** Use `/** … */` for every namespace, enum, enum member, interface and
  property. Never use `///` triple-slash or a `//` line as the doc comment. Plain `//` is fine for
  an incidental trailing note (`area?: string; // AKA: region`), never as the documentation itself.
- **Summary sentence first**, capitalised, ending in a period.
- **License header** at the top of every file, in the established form:

  ```ts
  /**
   * @license
   * Copyright Furcata. All Rights Reserved.
   */
  ```

- **`@return`, not `@returns`.** `eslint.config.js` sets the JSDoc `tagNamePreference` to rewrite
  `returns` → `return`.
- `max-len` is 200 with `ignoreComments` and `ignoreUrls`, so long prose and long URLs are allowed.

---

## 2. Content

- **Document the *why*, not the syntax.** `/** The account id. */` on `accountId` adds nothing.
  Say what it points at, who writes it, and what happens when it is absent.
- **State units and formats explicitly.** Minutes vs seconds, ISO 8601 vs epoch, decimal degrees,
  minor currency units, `[longitude, latitude]` ordering. These are the details that cause real
  defects and they are invisible in the type.
- **Say who owns the field.** Server-authored, client-supplied, or derived. For a package whose
  whole purpose is to describe stored documents, provenance is the most valuable thing the comment
  can carry.
- **Document what "absent" means.** Optional (`?`) and nullable (`| null`) are different claims;
  say which applies and what the reader should assume when the value is missing.
- **Cross-reference with `{@link Name}`** to connect an interface to the enum that constrains it.
- **Never alter existing links or URLs.** Do not shorten, "tidy" or strip markdown links,
  `{@link …}` references or external URLs in existing comments.

---

## 3. Types in documentation

- Preserve any existing `@param {type}` structure exactly.
- If a parameter has no documented type, add the one that matches the TypeScript declaration.
- **Never document a banned type.** No `Function`, no `Object`, no bare `{}`. Use a concrete
  signature, a precise interface, `Record<string, unknown>` or `unknown`.
- Where a field is deliberately permissive, the comment must **say why**, because the type no
  longer explains itself. A bare `any` with no rationale is indistinguishable from an oversight —
  and this repository has fields where the permissiveness is a considered decision, so the comment
  is what preserves that distinction for the next reader.

---

## 4. Deprecation

Consumers compile against these declarations, so removal is a breaking change. To retire a field:

```ts
/** @deprecated Use `startTime` instead; removed in the next major. */
start?: string;
```

Keep the old field, mark it, add the replacement alongside, and let a major version remove it.

---

## DO NOT

- ❌ Write a doc comment that restates the field name.
- ❌ Use `///` or `//` as the documentation form.
- ❌ Drop or rewrite an existing URL or `{@link …}`.
- ❌ Document a type as `Function`, `Object` or `{}`.
- ❌ Put a realistic identifier, key, endpoint or internal collection name in an example — this
  repository is public, and an example that looks real is a leak if it is real. Use obviously
  synthetic values.
- ❌ Leave a permissive type undocumented.
