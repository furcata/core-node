/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */

/**
 * Consumer-conditions type test for `src/interface/schema.ts`.
 *
 * ## What this file is
 *
 * Not a Vitest suite. It has no assertions and it is never executed — the
 * whole test *is* the compile, run by `npm run typecheck:consumer` against
 * `tsconfig.consumer.json`. A pass means `tsc` reported zero errors; a failure
 * means it reported at least one, or that a `@ts-expect-error` below stopped
 * being needed.
 *
 * ## Why it exists
 *
 * This package compiles with `strict`, `strictNullChecks` and `noImplicitAny`
 * all on. Consumers need not. A type-level guarantee can hold under one
 * null-checking setting and be **completely inert** under the other, so a
 * repository that only ever compiles under its own settings is structurally
 * incapable of noticing that a guarantee it ships protects nobody.
 *
 * The two shapes that look interchangeable, and are not:
 *
 * ```ts
 * // Inert for a consumer with strictNullChecks off.
 * interface Failure { success: false; data?: undefined }
 *
 * // Holds either way.
 * interface Failure { success: false }
 * ```
 *
 * The first rests on **null-checking**: `T | undefined` reduces to `T` when
 * `strictNullChecks` is off, so the marker collapses and the unguarded read
 * compiles cleanly, then throws at runtime. The second rests on **property
 * existence** — `Property 'data' does not exist` — which fires under every
 * setting. `ParseFailure` and `MemberMiss` are deliberately the second shape;
 * this file is what keeps them that way.
 *
 * ## How each direction is covered
 *
 * - The `@ts-expect-error` directives carry descriptions, so they are subject
 *   to `ban-ts-comment` **and**, more importantly, they are self-proving: if a
 *   guarantee breaks, the expected error disappears, the directive becomes
 *   unused, and `tsc` fails with TS2578. The assertion therefore fails when
 *   the guarantee breaks *and* when it stops being tested.
 * - The `INERT CONTROL` blocks are the same-shape known-positive. They carry
 *   **no** directive and must compile clean. They are the proof that these
 *   settings really are permissive enough to miss the inert form — without
 *   them, a passing `@ts-expect-error` above could be passing for some
 *   unrelated reason. They also pin the config: restore `strictNullChecks`
 *   here and those lines start erroring, so the gate cannot be quietly
 *   defanged into a duplicate of the strict one.
 *
 * ## Why the import is a self-name import
 *
 * `@furcata/core-node/interface` resolves through this package's own `exports`
 * map to the built `lib/interface/index.d.ts` — the declaration a consumer
 * receives — rather than to `src/`. Compiling `src/` here would test a file
 * that is not the published contract.
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
 * ParseResult — declared form
 * ------------------------------------------------------------------------ */

declare const declaredParse: ParseResult<SyntheticDoc>;

// @ts-expect-error ParseFailure has no `data` property at all, so reading it off an un-narrowed ParseResult must not compile even with strictNullChecks off.
const unguardedParseRead: number = declaredParse.data.amount;

/**
 * Narrowing on the discriminant must still reach the payload. Without this the
 * negative case above could be satisfied by a type that is simply unusable.
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
 * types, so it is not asserted as a guarantee here — a future TypeScript could
 * legitimately change it. It is written the portable way and recorded, because
 * a caller who follows the "narrow on the discriminant" advice with the obvious
 * `else` gets a compile error that the advice does not predict.
 */
const guardedIssuesRead: number = declaredParse.success === false ? declaredParse.issues.length : 0;

/**
 * Documented asymmetry: `ParseSuccess` declares `issues?: undefined`, so the
 * key exists on both branches and an un-narrowed read is legal by design. This
 * is only benign in this direction — a caller learns there are no issues, which
 * is true. It doubles as a resolution check: if the self-name import silently
 * resolved to something else, this would not compile.
 */
const unguardedIssuesRead = declaredParse.issues;

/* ------------------------------------------------------------------------ *
 * ParseResult — inferred form
 * ------------------------------------------------------------------------ */

/**
 * A consumer reaches the guarded type through the helper's return type rather
 * than by naming it, so the inferred path is checked separately. A generic
 * signature can lose a guarantee the alias still advertises.
 */
const syntheticShape = z.object({amount: z.number()});

const inferredParse = parseResult(syntheticShape, {amount: 1}, 'synthetic');

// @ts-expect-error The inferred return of parseResult carries the same closed failure branch, so the unguarded read must not compile here either.
const unguardedInferredRead: number = inferredParse.data.amount;

const guardedInferredRead: number = inferredParse.success ? inferredParse.data.amount : 0;

/* ------------------------------------------------------------------------ *
 * MemberResult
 * ------------------------------------------------------------------------ */

/**
 * Synthetic enumeration standing in for a vocabulary owned elsewhere.
 */
const syntheticMembers = {
  alpha: 'alpha',
  beta: 'beta',
} as const;

declare const declaredMember: MemberResult<'alpha' | 'beta'>;

// @ts-expect-error MemberMiss has no `member` property at all, so reading it off an un-narrowed MemberResult must not compile even with strictNullChecks off.
const unguardedMemberRead: string = declaredMember.member;

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

// @ts-expect-error The inferred return of matchMember carries the same closed miss branch, so the unguarded read must not compile here either.
const unguardedInferredMemberRead: string = inferredMember.member;

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
 * config is no longer permissive, so the assertions above prove less than they
 * claim" — the control has failed, and a control that cannot be observed
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
 * The array is never evaluated; this project compiles with `noEmit`.
 */
export const consumerConditionsChecked: unknown[] = [
  unguardedParseRead,
  guardedParseRead,
  guardedIssuesRead,
  unguardedIssuesRead,
  unguardedInferredRead,
  guardedInferredRead,
  unguardedMemberRead,
  guardedMemberRead,
  guardedMissRead,
  unguardedInferredMemberRead,
  guardedInferredMemberRead,
  inertUnguardedRead,
  inertUnguardedMemberRead,
];
