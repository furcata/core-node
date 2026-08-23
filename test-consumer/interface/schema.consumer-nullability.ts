/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */

/**
 * The consumer-conditions gate's **second coverage boundary**: nullability.
 *
 * Companion to `base_db.consumer-boundary.ts`, which records the first one.
 * Both exist for the same reason — a green run of `npm run typecheck:consumer`
 * must never be read as blanket coverage — but they are **independent**, and
 * the difference matters:
 *
 * - **Index signature** (`base_db.consumer-boundary.ts`): the gate's mechanism
 *   cannot fire, because every property access is legal by construction.
 * - **Nullability** (this file): the gate's mechanism fires correctly, but
 *   `T | null` is not a *property-existence* fact. Under `strictNullChecks:
 *   false` — the condition this gate compiles under — `null` is assignable to
 *   every type, so the union collapses and there is nothing left to observe.
 *
 * These were measured **separately**, because the obvious reading conflates
 * them: the properties widened to `| null` mostly live on document types, which
 * extend {@link BaseFirestore} and so carry an index signature too. If the
 * index signature were doing the hiding, the nullability question would be moot.
 * It is not. `Idempotency.Response` has **no** index signature — proven in the
 * same compilation by the `REACHABLE` half below, where an undeclared key on
 * that exact type is still `TS2339` — and its `body: string | null` is *still*
 * invisible here. Two independent blind spots, not one.
 *
 * Measured under the two settings, same file, same declarations:
 *
 * | read | consumer settings | strict settings |
 * |---|---|---|
 * | `resp.body.toUpperCase()` where `body: string \| null` | **compiles** | `TS18047` |
 * | `led.consumed + 1` where `consumed?: number \| null` | **compiles** | `TS18049` |
 * | `resp.undeclaredKey` (no index signature) | `TS2339` | `TS2339` |
 *
 * The third row is the liveness control: the mechanism is demonstrably working
 * in the very run where the first two report nothing.
 *
 * ## This is a statement about the gate, not a defect in the types
 *
 * `T | null` is the correct way to model a field a document store genuinely
 * holds as `null`, and widening to it is a real, load-bearing improvement for
 * every consumer that compiles strictly. This file does not argue with that. It
 * records that **this gate cannot see it**, so nobody cites a green run as
 * evidence about nullability.
 *
 * ## The remedy, which is why the halves are paired
 *
 * A nullability guarantee that must survive a permissive consumer can be
 * **restated as presence/absence**: `{has: true; value: T} | {has: false}`
 * instead of `value: T | null`. Property existence is config-independent, so the
 * restated form is enforceable where the union form is not. The `REACHABLE`
 * half below is that restatement, and it compiles as a compile error exactly as
 * intended — so this file states the boundary *and* demonstrates the way across
 * it.
 *
 * That is not a recommendation to go re-encode existing fields. The honest fix
 * for a permissive consumer is for that consumer to enable `strictNullChecks`.
 * The restatement is for a guarantee that must hold *regardless*.
 *
 * Both directions are self-announcing. If a `BLIND SPOT` assertion starts
 * erroring, the collapse has stopped happening — the compiler changed, or the
 * project's flags drifted strict — and this file plus
 * `tests.instructions.md` §6.4 should be updated to say so.
 */

import type {Idempotency, Ledger} from '@furcata/core-node/model';

/* ------------------------------------------------------------------------ *
 * BLIND SPOT — `| null` collapses under the settings this gate compiles with.
 * Everything here must compile; that compiling IS the recorded limitation.
 * ------------------------------------------------------------------------ */

declare const shippedResponse: Idempotency.Response;

/**
 * `Idempotency.Response.body` is declared `string | null`. Reading a method off
 * it without a null check is `TS18047` under strict settings and **legal**
 * here.
 *
 * No `@ts-expect-error`, deliberately: this must compile, and it compiling is
 * the assertion. The type is right; the gate simply cannot observe it.
 */
const nullUnionIsInvisible: string = shippedResponse.body.toUpperCase();

declare const shippedLedger: Ledger.Interface;

/**
 * The same on an optional-and-nullable property of a document type
 * (`consumed?: number | null`), which is `TS18049` under strict settings —
 * `possibly 'null' or 'undefined'` — and legal here.
 *
 * This one carries an index signature as well, so it is doubly invisible. It is
 * kept because it is the shape most of the widened properties actually have,
 * and the single-cause case above is what proves the two causes are separable.
 */
const optionalNullUnionIsInvisible: number = shippedLedger.consumed + 1;

/* ------------------------------------------------------------------------ *
 * REACHABLE — the same guarantee restated as presence/absence, which the gate
 * can enforce. This half is the positive control AND the remedy.
 * ------------------------------------------------------------------------ */

/**
 * Synthetic payload. Deliberately meaningless: this repository is public.
 */
interface SyntheticPayload {
  /**
   * Arbitrary numeric field, present only so there is something to read.
   */
  amount: number;
}

/**
 * Present branch of the restated form.
 */
interface PayloadPresent {
  /**
   * Discriminant.
   */
  has: true;
  /**
   * The value, reachable only after narrowing.
   */
  value: SyntheticPayload;
}

/**
 * Absent branch. The property is **omitted**, not declared `value: null` and not
 * declared `value?: undefined` — omission is what makes the guarantee rest on
 * property existence and therefore hold under either null-checking setting.
 */
interface PayloadAbsent {
  /**
   * Discriminant.
   */
  has: false;
}

/**
 * The restated guarantee.
 */
type PayloadSlot = PayloadPresent | PayloadAbsent;

/**
 * Resolves to `true` when reading `K` off `T` type-checks, and `false` when it
 * is a compile error.
 *
 * Asserted in the must-compile direction, per `tests.instructions.md` §6.1: an
 * assertion that something *fails* can be satisfied by a substitute failure,
 * and a must-compile assertion cannot, because it is not satisfied by an error
 * at all.
 *
 * @template T The type whose key set is being examined.
 * @template K The key being tested for reachability.
 */
type KeyIsReachable<T, K extends PropertyKey> = K extends keyof T ? true : false;

declare const absentValueReachable: KeyIsReachable<PayloadAbsent, 'value'>;

/**
 * The load-bearing half: restated as presence/absence, the absent case genuinely
 * hides the value, and the gate can prove it under permissive settings.
 *
 * Change {@link PayloadAbsent} to carry `value: null` or `value?: undefined` and
 * this becomes `true` where `false` is required, so the gate goes red — which is
 * precisely the regression the union form cannot be made to report.
 */
const absentSlotHidesValue: false = absentValueReachable;

declare const slot: PayloadSlot;

// @ts-expect-error Deliberately SHALLOW per tests.instructions.md 6.1. The restated form makes the unhandled case a property-existence error, which fires regardless of the null-checking setting — unlike the `| null` form above.
const unguardedSlotRead: unknown = slot.value;

/**
 * The liveness control for the blind-spot half, and the proof that the two
 * boundaries are independent.
 *
 * `Idempotency.Response` carries **no** index signature, so an undeclared key on
 * it is a compile error — in the same compilation where its `body: string | null`
 * above reported nothing. Without this line, the blind-spot assertions could be
 * silent because the gate was broken rather than because it cannot see
 * nullability.
 */
// @ts-expect-error A type with no index signature rejects an undeclared key. If this stops erroring, this type has gained one and has left the gate's coverage entirely.
const responseRejectsUnknownKey: unknown = shippedResponse.thisKeyIsDeclaredNowhere;

/**
 * Every binding above is referenced here so that none of them can be dropped
 * as unused by a future tool, and so the file has an export and is a module.
 * The array is never evaluated; this project compiles with `noEmit`.
 */
export const nullabilityBoundaryChecked: unknown[] = [
  nullUnionIsInvisible,
  optionalNullUnionIsInvisible,
  absentSlotHidesValue,
  unguardedSlotRead,
  responseRejectsUnknownKey,
];
