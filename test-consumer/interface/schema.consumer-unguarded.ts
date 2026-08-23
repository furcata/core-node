/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */

/**
 * Consumer-conditions **assertions** for `src/interface/schema.ts`.
 *
 * ## What this file is
 *
 * Not a Vitest suite. It has no runtime assertions and is never executed — the
 * compile *is* the test, run by `npm run typecheck:consumer` against
 * `tsconfig.consumer.json`. Every read below **must be a compile error**. A
 * pass means each `@ts-expect-error` was needed; a failure means one stopped
 * being needed and `tsc` reported `TS2578`.
 *
 * Its positive control lives in `schema.consumer-guarded.ts`, which holds the
 * narrowed reads that must always compile. Read that file's header for why the
 * split exists — briefly: a negative result from a harness that cannot compile
 * at all looks identical to a confirmed guarantee, so the narrowed reads must
 * be observed exiting `0` in the same state that turns these red.
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
 * this file is what keeps them that way. Measured against the shipped
 * declaration rather than a reproduction: the un-narrowed read below reports
 * `TS2339`.
 *
 * ## Why the reads are deep
 *
 * `.data.amount`, not `.data`. The deep read is the runtime hazard being
 * modelled, and it is what makes this file disagree with the strict gate. The
 * mirror-image rule applies in `test/`: the equivalent assertions there are
 * deliberately **shallow**, because a deep read still errors under strict with
 * `TS18048` even once the marker is back, which keeps that directive used and
 * that gate green. See `.github/instructions/tests.instructions.md` §6 for the
 * full 2×2.
 *
 * ## Why the import is a package subpath
 *
 * `@furcata/core-node/interface` resolves through this package's own `exports`
 * map to the built `lib/interface/index.d.ts` — the declaration a consumer
 * receives — rather than to `src/`. Compiling `src/` here would test a file
 * that is not the published contract, and `lib/` is what consumers execute,
 * since it is committed and there is no `prepare` script. Deep paths such as
 * `@furcata/core-node/lib/interface/schema.js` are **not** resolvable: the map
 * exposes only `./model` and `./interface`, and a deep path fails with
 * `TS2307`, taking every read in the file down with it.
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
 * ParseResult — un-narrowed reads must not compile
 * ------------------------------------------------------------------------ */

declare const declaredParse: ParseResult<SyntheticDoc>;

// @ts-expect-error ParseFailure has no `data` property at all, so reading it off an un-narrowed ParseResult must not compile even with strictNullChecks off.
const unguardedParseRead: number = declaredParse.data.amount;

/**
 * A consumer reaches the guarded type through the helper's return type rather
 * than by naming it, so the inferred path is asserted separately. A generic
 * signature can lose a guarantee the alias still advertises.
 */
const syntheticShape = z.object({amount: z.number()});

const inferredParse = parseResult(syntheticShape, {amount: 1}, 'synthetic');

// @ts-expect-error The inferred return of parseResult carries the same closed failure branch, so the unguarded read must not compile here either.
const unguardedInferredRead: number = inferredParse.data.amount;

/* ------------------------------------------------------------------------ *
 * MemberResult — un-narrowed reads must not compile
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
const unguardedMemberRead: string = declaredMember.member.length ? 'x' : 'y';

const inferredMember = matchMember(syntheticMembers, 'alpha');

// @ts-expect-error The inferred return of matchMember carries the same closed miss branch, so the unguarded read must not compile here either.
const unguardedInferredMemberRead: string = inferredMember.member.length ? 'x' : 'y';

/**
 * Every binding above is referenced here so that none of them can be dropped
 * as unused by a future tool, and so the file has an export and is a module.
 * The array is never evaluated; this project compiles with `noEmit`.
 */
export const consumerAssertionsChecked: unknown[] = [
  unguardedParseRead,
  unguardedInferredRead,
  unguardedMemberRead,
  unguardedInferredMemberRead,
];
