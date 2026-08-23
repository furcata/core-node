/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */

/**
 * The consumer-conditions gate's **coverage boundary**, written as a test.
 *
 * ## Why this file exists
 *
 * `npm run typecheck:consumer` rests entirely on one mechanism: `TS2339`,
 * *"Property 'x' does not exist"*. That is what makes its guarantees hold
 * regardless of the consumer's null-checking setting.
 *
 * **Where a type carries an index signature, that mechanism cannot fire.**
 * Every property access is legal by construction, so the gate is structurally
 * unable to report anything. A green run over such a type means *"cannot be
 * checked"*, not *"is safe"* — and the two are indistinguishable from outside,
 * which is the exact shape of failure this gate was built to detect, aimed at
 * the gate itself.
 *
 * {@link BaseFirestore} declares `[x: string]: any` deliberately, so that stored
 * documents predating any given change still type-check. That is a defensible
 * decision for a sparse document store and this file does not argue with it.
 * What it does is stop the consequence from being something a reader has to
 * already know. Measured on the shipped declarations at the time of writing:
 * **10** declarations in `lib/` extend {@link BaseFirestore} (control on a
 * nonsense base name: 0), and all of them are outside the gate's reach.
 *
 * The boundary is **not** "nullable fields cannot be protected" — any
 * nullability guarantee can be restated as a presence union,
 * `{has: true; x: T} | {has: false}`, and property existence is
 * config-independent. It is **"types that admit arbitrary keys cannot be
 * protected."**
 *
 * ## Why the assertions are predicates, not `@ts-expect-error`
 *
 * The first draft of this file asserted the reachable half with
 * `@ts-expect-error` over a deep read, and **it did not work**. Adding an index
 * signature to a protected type left the gate **green**: `data` became reachable
 * as `unknown`, and the deep read then failed on `.amount` instead. The
 * directive stayed used, so nothing was reported.
 *
 * That is `tests.instructions.md` §6.1 in a sharper form than §6.1 itself
 * describes. The substitute error was not merely *an* error — it carried the
 * **same code**, `TS2339`, on a **different subject**: *"Property 'data' does
 * not exist on type 'ClosedResult'"* became *"Property 'amount' does not exist
 * on type 'unknown'"*. Pinning the error code would not have caught it either.
 *
 * So the assertions below are written in the **must-compile direction** instead,
 * over {@link KeyIsReachable}, which evaluates property reachability directly as
 * a type. A must-compile assertion cannot be satisfied by a substitute error,
 * because it is not satisfied by an error at all. Both directions are then
 * self-announcing:
 *
 * - a **REACHABLE** assertion breaks → someone gave a protected type an index
 *   signature, and it has just left the gate's coverage silently;
 * - a **BLIND SPOT** assertion breaks → the index signature was removed, or the
 *   compiler changed; the blind spot has closed, and this file plus
 *   `tests.instructions.md` §6.3 should be updated to say so.
 */

import type {BaseFirestore} from '@furcata/core-node/interface';
import type {Idempotency, Ledger} from '@furcata/core-node/model';

/**
 * Resolves to `true` when reading `K` off `T` type-checks, and `false` when it
 * is a compile error.
 *
 * This is the gate's own mechanism expressed as a type, which is what makes it
 * assertable in the must-compile direction. An index signature puts `string`
 * into `keyof T`, so every key satisfies the constraint and the result is
 * `true` for anything.
 *
 * @template T The type whose key set is being examined.
 * @template K The key being tested for reachability.
 */
type KeyIsReachable<T, K extends PropertyKey> = K extends keyof T ? true : false;

/**
 * Synthetic payload. Deliberately meaningless: this repository is public.
 */
interface SyntheticPayload {
  /**
   * Arbitrary numeric field, present only so there is something to read.
   */
  amount: number;
}

/* ------------------------------------------------------------------------ *
 * BLIND SPOT — the gate's construction, defeated by an inherited index
 * signature. Everything here must compile; that is the recorded limitation.
 * ------------------------------------------------------------------------ */

/**
 * Success branch of a correctly closed union, built on a base that admits
 * arbitrary keys.
 */
interface OpenSuccess extends BaseFirestore {
  /**
   * Discriminant.
   */
  ok: true;
  /**
   * The payload.
   */
  data: SyntheticPayload;
}

/**
 * Failure branch of the same union. `data` is **omitted**, which is the shape
 * this gate exists to require — and which buys nothing here, because the
 * inherited index signature supplies the property anyway.
 */
interface OpenFailure extends BaseFirestore {
  /**
   * Discriminant.
   */
  ok: false;
}

/**
 * The union. Identical in construction to a correctly closed parse result,
 * differing only in extending a type with an index signature.
 */
type OpenResult = OpenSuccess | OpenFailure;

declare const openFailureDataReachable: KeyIsReachable<OpenFailure, 'data'>;

/**
 * The limitation, stated as a proposition: omitting `data` from the failure
 * branch does not hide it, because the index signature reaches it anyway.
 *
 * This assignment compiling **is** the assertion. If it ever fails to compile,
 * the blind spot has closed and this file is out of date.
 */
const openFailureExposesData: true = openFailureDataReachable;

declare const openResult: OpenResult;

/**
 * The same thing as a value read, to show the practical consequence rather than
 * only the proposition. On any type without an index signature this is a
 * compile error and the gate catches it; here it is legal.
 */
const openUnguardedRead: number = openResult.data.amount;

declare const shippedOpenReachable: KeyIsReachable<Ledger.Interface, 'thisKeyIsDeclaredNowhere'>;

/**
 * The same limitation on a real shipped document type rather than a local
 * model: a key declared nowhere is still reachable, so no absence-based
 * guarantee can be enforced on a document interface.
 */
const shippedOpenExposesAnyKey: true = shippedOpenReachable;

/* ------------------------------------------------------------------------ *
 * REACHABLE — the positive control: the same shapes without an index
 * signature, where the gate's mechanism does work.
 * ------------------------------------------------------------------------ */

/**
 * Success branch of the identical union, on a plain base.
 */
interface ClosedSuccess {
  /**
   * Discriminant.
   */
  ok: true;
  /**
   * The payload.
   */
  data: SyntheticPayload;
}

/**
 * Failure branch, `data` omitted exactly as above.
 */
interface ClosedFailure {
  /**
   * Discriminant.
   */
  ok: false;
}

/**
 * The union the gate can actually see.
 */
type ClosedResult = ClosedSuccess | ClosedFailure;

declare const closedFailureDataReachable: KeyIsReachable<ClosedFailure, 'data'>;

/**
 * The control, and the load-bearing half of this file: without an index
 * signature the omitted property is genuinely unreachable.
 *
 * Give {@link ClosedFailure} an index signature and this assignment becomes
 * `true` where `false` is required, so the gate goes red. That is the mutation
 * the `@ts-expect-error` form silently missed, and it is why this is written as
 * an assignment rather than as a directive over a read.
 */
const closedFailureHidesData: false = closedFailureDataReachable;

declare const closedResult: ClosedResult;

// @ts-expect-error The read form of the assertion above. Deliberately SHALLOW per tests.instructions.md 6.1: a deep read admits a substitute error on the resolved value instead.
const closedUnguardedRead: unknown = closedResult.data;

declare const shippedClosedReachable: KeyIsReachable<Idempotency.Response, 'thisKeyIsDeclaredNowhere'>;

/**
 * The same control on a real shipped type. `Idempotency.Response` does **not**
 * extend {@link BaseFirestore}, so it sits on the protectable side of the
 * boundary, while `Idempotency.Interface` does extend it and does not. The
 * boundary runs between two types in the same namespace, which is why it is
 * worth asserting rather than describing.
 */
const shippedClosedHidesUnknownKey: false = shippedClosedReachable;

declare const shippedClosed: Idempotency.Response;

// @ts-expect-error Shallow read on a type with no index signature: an undeclared key is rejected, which is what makes the gate's mechanism work at all.
const shippedClosedRead: unknown = shippedClosed.thisKeyIsDeclaredNowhere;

/**
 * Every binding above is referenced here so that none of them can be dropped
 * as unused by a future tool, and so the file has an export and is a module.
 * The array is never evaluated; this project compiles with `noEmit`.
 */
export const consumerBoundaryChecked: unknown[] = [
  openFailureExposesData,
  openUnguardedRead,
  shippedOpenExposesAnyKey,
  closedFailureHidesData,
  closedUnguardedRead,
  shippedClosedHidesUnknownKey,
  shippedClosedRead,
];
