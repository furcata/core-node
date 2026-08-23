/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */

/**
 * Consumer-conditions **positive control** for `src/interface/schema.ts`.
 *
 * ## What this file is for
 *
 * Everything here **must compile**. It is the liveness proof for its sibling
 * `schema.consumer-unguarded.ts`, which asserts the opposite — that certain
 * reads must *not* compile.
 *
 * ## Why a separate file with its own project
 *
 * A negative assertion is only evidence if the harness that produced it works.
 * "The un-narrowed read failed to compile" is produced just as readily by a
 * fixture that cannot compile *at all* — an unresolved import, a bad flag, a
 * config that was never loaded. Every one of those makes the un-narrowed **and**
 * narrowed reads fail together, which reads as a confirmed guarantee and is in
 * fact a dead harness.
 *
 * Both failure modes are live here and both were measured:
 *
 * - `TS5112` — *"tsconfig.json is present but will not be loaded if files are
 *   specified on commandline"* — fires **before any type analysis**, so nothing
 *   is checked at all. Verified: `tsc --noEmit somefile.ts` in this repository
 *   exits `1` with exactly that error. **This is why the gate is a `-p` project
 *   rather than a file list**, and why it must stay one. `--ignoreConfig` is the
 *   other way out; the project form needs no escape hatch.
 * - `TS2307` — the package's `exports` map exposes only `./model` and
 *   `./interface`, so a deep path such as
 *   `@furcata/core-node/lib/interface/schema.js` does not resolve. Verified:
 *   exits `2`, and every read in the file fails alike because the type is
 *   unresolvable. The subpath import used here is the one real consumer code
 *   uses, so the fixture exercises the genuine path.
 *
 * `tsconfig.consumer-control.json` compiles **only this file**, so its exit code
 * is observable on its own. The required evidence is three observations, not
 * two: under the mutation the assertions file must go red **while this file
 * still exits `0`**. Both red means the harness died and the run proves nothing.
 *
 * That project `extends` the gate's own `tsconfig.consumer.json` and overrides
 * nothing but `include`, so the two cannot drift apart in compiler settings —
 * a control compiled under different flags from the thing it controls is not a
 * control.
 *
 * ## The inert controls
 *
 * The `INERT CONTROL` blocks at the bottom pin the settings themselves. They
 * model the shape that must never be used — a sibling `data?: undefined` marker
 * — and they must compile clean here, which is only true because
 * `strictNullChecks` is off. Force it on and exactly those lines error. Without
 * them a passing assertion next door could be passing because the gate had
 * quietly become a duplicate of the strict one.
 */

import {z} from 'zod';
import {
  matchMember,
  parseResult,
  type MemberResult,
  type ParseResult,
} from '@furcata/core-node/interface';

/**
 * Synthetic document shape. Deliberately meaningless: a fixture that looks
 * like a real record is a leak in a public repository.
 */
interface SyntheticDoc {
  /**
   * Arbitrary numeric field, present only so there is something to read.
   */
  amount: number;
}

/* ------------------------------------------------------------------------ *
 * ParseResult — narrowed reads must reach the payload
 * ------------------------------------------------------------------------ */

declare const declaredParse: ParseResult<SyntheticDoc>;

/**
 * The narrowed read. This is the observation that proves the harness is alive:
 * it must exit `0` both with the guarantee intact and with it deliberately
 * broken, so that the difference the assertions file reports is attributable to
 * the type rather than to the fixture.
 */
const guardedParseRead: number = declaredParse.success ? declaredParse.data.amount : 0;

/**
 * The failure branch must remain reachable and carry its issues.
 *
 * The explicit `=== false` is not a style choice. Measured under this project's
 * settings: with `strictNullChecks` off, **negative** narrowing of a boolean
 * discriminant does not happen. Because every type includes `null` and
 * `undefined` when the flag is off, the success branch cannot be excluded by a
 * falsy test, so `r.success ? … : r.issues` and `if (r.success) {} else { … }`
 * both leave the value un-narrowed. `=== false`, `=== true` and the `in`
 * operator narrow correctly under both settings; truthiness and `!` narrow only
 * the positive branch when the flag is off.
 *
 * That is a property of the consumer's compiler rather than of this package's
 * types, so it is not asserted as a guarantee — a future TypeScript could
 * legitimately change it. It is written the portable way and recorded, because
 * a caller who follows the "narrow on the discriminant" advice with the obvious
 * `else` gets a compile error that the advice does not predict.
 */
const guardedIssuesRead: number = declaredParse.success === false ? declaredParse.issues.length : 0;

/**
 * Documented asymmetry: `ParseSuccess` declares `issues?: undefined`, so the
 * key exists on both branches and an un-narrowed read is legal by design. This
 * is only benign in this direction — a caller learns there are no issues, which
 * is true. It doubles as a resolution check: if the subpath import silently
 * resolved to something else, this would not compile.
 */
const unguardedIssuesRead = declaredParse.issues;

/**
 * A consumer reaches the guarded type through the helper's return type rather
 * than by naming it, so the inferred path is checked separately. A generic
 * signature can lose a guarantee the alias still advertises.
 */
const syntheticShape = z.object({amount: z.number()});

const inferredParse = parseResult(syntheticShape, {amount: 1}, 'synthetic');

const guardedInferredRead: number = inferredParse.success ? inferredParse.data.amount : 0;

/* ------------------------------------------------------------------------ *
 * MemberResult — narrowed reads must reach the member
 * ------------------------------------------------------------------------ */

/**
 * Synthetic enumeration standing in for a vocabulary owned elsewhere.
 */
const syntheticMembers = {
  alpha: 'alpha',
  beta: 'beta',
} as const;

declare const declaredMember: MemberResult<'alpha' | 'beta'>;

const guardedMemberRead: string = declaredMember.matched ? declaredMember.member : 'alpha';

/**
 * The miss branch must remain reachable and carry the offending value. Same
 * `=== false` reasoning as {@link guardedIssuesRead}, and here it is load-bearing
 * rather than merely portable: `MemberMatch` declares no mirroring
 * `value?: undefined`, so unlike `issues` on a parse result there is no second
 * route to this property when negative narrowing does not fire.
 */
const guardedMissRead: unknown = declaredMember.matched === false ? declaredMember.value : undefined;

const inferredMember = matchMember(syntheticMembers, 'alpha');

const guardedInferredMemberRead: string = inferredMember.matched ? inferredMember.member : 'beta';

/* ------------------------------------------------------------------------ *
 * INERT CONTROL — the shape that must never be used, proving these settings
 * genuinely fail to catch it.
 * ------------------------------------------------------------------------ */

/**
 * Success branch of the inert mirror.
 */
interface InertSuccess {
  /**
   * Discriminant.
   */
  success: true;
  /**
   * The payload.
   */
  data: SyntheticDoc;
}

/**
 * Failure branch written the wrong way: the sibling marker `data?: undefined`
 * instead of omitting the property.
 */
interface InertFailure {
  /**
   * Discriminant.
   */
  success: false;
  /**
   * The marker that collapses. Declared `undefined`, which reduces away
   * entirely when `strictNullChecks` is off, leaving the union's `data`
   * indistinguishable from the success branch's.
   */
  data?: undefined;
}

/**
 * The inert union. Structurally identical to a correctly closed result apart
 * from that one marker.
 */
type InertResult = InertSuccess | InertFailure;

declare const inertResult: InertResult;

/**
 * No `@ts-expect-error` on the next line, deliberately.
 *
 * Under these consumer settings this read **must compile**, which is the whole
 * point: the marker guarantee is worth nothing here. If this line ever starts
 * erroring, `tsc` fails and the message is not "the code regressed" but "this
 * config is no longer permissive, so the assertions next door prove less than
 * they claim" — the control has failed, and a control that cannot be observed
 * failing is not a control.
 */
const inertUnguardedRead: number = inertResult.data.amount;

/**
 * Match branch of the inert mirror.
 */
interface InertMatch {
  /**
   * Discriminant.
   */
  matched: true;
  /**
   * The narrowed member.
   */
  member: 'alpha' | 'beta';
}

/**
 * Miss branch of the inert mirror, for the member-narrowing equivalent.
 */
interface InertMiss {
  /**
   * Discriminant.
   */
  matched: false;
  /**
   * The marker that collapses, as above.
   */
  member?: undefined;
}

declare const inertMember: InertMatch | InertMiss;

/**
 * Same control, same reasoning: this must compile under consumer settings.
 */
const inertUnguardedMemberRead: string = inertMember.member;

/**
 * Every binding above is referenced here so that none of them can be dropped
 * as unused by a future tool, and so the file has an export and is a module.
 * The array is never evaluated; these projects compile with `noEmit`.
 */
export const consumerControlChecked: unknown[] = [
  guardedParseRead,
  guardedIssuesRead,
  unguardedIssuesRead,
  guardedInferredRead,
  guardedMemberRead,
  guardedMissRead,
  guardedInferredMemberRead,
  inertUnguardedRead,
  inertUnguardedMemberRead,
];
