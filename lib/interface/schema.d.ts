/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */
import { z } from 'zod';
/**
 * Shared runtime-validation primitives for every schema in this package.
 *
 * ## Why this module exists
 *
 * A TypeScript type is erased before a single byte of stored data is read, so
 * it constrains what a consumer *writes* and never what *arrives*. The gap is
 * routinely closed with a cast:
 *
 * ```ts
 * const amount = Number(data['amount'] ?? 0);
 * ```
 *
 * A cast is worse than an unchecked read, because it does not merely skip the
 * check — it *suppresses the diagnostic that would have reported the mistake*.
 * Everything downstream is then correctly typed against a value that was never
 * verified, and a non-numeric input becomes `NaN` that propagates silently
 * through arithmetic instead of failing at the boundary where it entered.
 *
 * The schemas built on this module are the parse boundary that closes it: they
 * turn `unknown` into a declared interface **or** a typed failure, with no third
 * outcome in which a caller holds a typed value that was never validated.
 *
 * ## Unknown keys are preserved, not dropped and not rejected
 *
 * Every document schema in this package is built with `z.looseObject`, which
 * **passes unknown keys through unchanged**. That is a deliberate three-way
 * choice, and the two rejected alternatives fail in opposite directions:
 *
 * | Mode | Behaviour on an undeclared key | Why it is wrong here |
 * |---|---|---|
 * | `z.object` (strip) | silently deleted | The caller believes their input was honoured and the recipient believes it was filtered. Both are wrong, and nothing reports it. A read-modify-write through such a schema **destroys stored fields**. |
 * | `z.strictObject` | rejected | Stored documents predate every change made here, and {@link BaseFirestore} explicitly declares `[x: string]: any`. A strict schema would reject valid production data and contradict the published type. |
 * | `z.looseObject` | preserved | Matches the declared index signature, tolerates older documents, and loses nothing on a round-trip. |
 *
 * ## Identity preservation
 *
 * `z.looseObject` returns a new plain object, so the top-level container is a
 * copy. Values validated with {@link timestampLike} or `z.unknown()` are passed
 * through **by reference**, which matters: validating a Firestore `Timestamp`
 * with `z.object({seconds, nanoseconds})` would return a plain object and
 * destroy the class instance, breaking any TTL policy that the field feeds.
 */
/**
 * Structural shape of a Firestore timestamp, declared without depending on a
 * server SDK.
 *
 * This package is a pure type and schema library; pulling `firebase-admin` in
 * would add a server SDK to every consumer's dependency closure just to name one
 * class. The two numeric components below are the public surface of a Firestore
 * `Timestamp`, so an actual `Timestamp` instance satisfies this interface
 * structurally and can be validated without importing it.
 *
 * The `toMillis` and `toDate` members are optional because a timestamp that has
 * survived a JSON round-trip keeps its numeric fields but loses its prototype,
 * and such a value is still a legitimate stored shape.
 */
export interface TimestampLike {
    /**
     * Whole seconds since the Unix epoch, UTC.
     */
    seconds: number;
    /**
     * Fractional part of the timestamp in nanoseconds, in the range `0` to
     * `999,999,999`.
     */
    nanoseconds: number;
    /**
     * Converts the timestamp to epoch milliseconds. Present on a live SDK
     * instance, absent after a JSON round-trip.
     *
     * @return {number} Epoch milliseconds.
     */
    toMillis?(): number;
    /**
     * Converts the timestamp to a JavaScript `Date`. Present on a live SDK
     * instance, absent after a JSON round-trip.
     *
     * @return {Date} The equivalent date.
     */
    toDate?(): Date;
}
/**
 * Narrows an arbitrary value to {@link TimestampLike}.
 *
 * Checks only the two numeric components, so it accepts both a live SDK
 * `Timestamp` (where they are prototype getters) and a plain object recovered
 * from JSON. It deliberately does not require `toMillis`, because demanding a
 * method would reject a perfectly valid deserialized timestamp.
 *
 * @param {unknown} value - Candidate value, typically read straight from a document.
 * @return {boolean} `true` when the value carries numeric `seconds` and `nanoseconds`.
 */
export declare const isTimestampLike: (value: unknown) => value is TimestampLike;
/**
 * A single reason a document failed validation.
 *
 * Kept deliberately flat and free of any library type so that a failure can be
 * logged, serialized onto a queue, or returned from an API without dragging a
 * validation library into the consumer's own contract.
 */
export interface ParseIssue {
    /**
     * Dotted path to the offending field, for example `user.id` or
     * `blocks.0.type`. Empty string when the failure applies to the document as a
     * whole rather than to one field.
     */
    path: string;
    /**
     * Machine-readable classification of the failure, taken from the underlying
     * validator, for example `invalid_type` or `invalid_value`. Suitable for
     * branching; the wording of {@link ParseIssue.message} is not.
     */
    code: string;
    /**
     * Human-readable explanation intended for a log line or a developer-facing
     * error response.
     *
     * Never contains the rejected value itself, because a rejected document may
     * carry user content and this string is expected to reach logs.
     */
    message: string;
}
/**
 * Successful outcome of a parse: the value is the declared interface.
 *
 * @template T The interface the schema produces.
 */
export interface ParseSuccess<T> {
    /**
     * Discriminant. Always `true` on this branch.
     */
    success: true;
    /**
     * The validated document, typed as the declared interface.
     */
    data: T;
    /**
     * Always absent on success. Declared so that reading `.issues` off an
     * un-narrowed {@link ParseResult} is a compile error rather than `undefined`
     * at runtime.
     */
    issues?: undefined;
    /**
     * Always absent on success, mirroring {@link ParseFailure.message} so the two
     * branches present the same key set and an un-narrowed result can be inspected
     * without a cast.
     */
    message?: undefined;
}
/**
 * Failed outcome of a parse.
 *
 * There is deliberately **no `data` property on this branch at all** — not even
 * an optional `data?: undefined`. That distinction is load-bearing rather than
 * stylistic, and it was measured rather than assumed.
 *
 * With `strictNullChecks: false`, which both this package and its consumers
 * compile under, `undefined` is assignable to every type. So a sibling marker of
 * the form `data?: undefined` **collapses**, and `result.data.amount` on an
 * un-narrowed {@link ParseResult} compiles cleanly and throws `TypeError` at
 * runtime. Omitting the property entirely produces `Property 'data' does not
 * exist on type 'ParseFailure'` regardless of the null-checking setting, which
 * is the only form of the guarantee that actually fires here.
 *
 * The asymmetry with {@link ParseSuccess} is deliberate. Reading `.issues` off a
 * success yields `undefined` where a caller expected none to exist — wrong, but
 * benign, and convenient when logging an un-narrowed result. Reading `.data` off
 * a failure yields an absent value typed as a valid document, which is the exact
 * defect this whole module exists to prevent. Only the dangerous direction is
 * closed.
 */
export interface ParseFailure {
    /**
     * Discriminant. Always `false` on this branch.
     */
    success: false;
    /**
     * Every reason the document was rejected, not just the first.
     */
    issues: ParseIssue[];
    /**
     * Single-line summary of {@link ParseFailure.issues}, suitable for a log
     * message or an error string.
     */
    message: string;
}
/**
 * Discriminated result of parsing an untrusted value.
 *
 * Narrow on `success` to reach the data; there is no branch that offers both a
 * typed document and an unverified one.
 *
 * @template T The interface the schema produces.
 */
export type ParseResult<T> = ParseSuccess<T> | ParseFailure;
/**
 * Error thrown by the throwing form of a parse helper.
 *
 * Carries the structured {@link ParseIssue} list alongside the message so a
 * caller can inspect the failures without re-parsing the message text.
 */
export declare class ParseError extends Error {
    /**
     * Every reason the document was rejected.
     */
    readonly issues: ParseIssue[];
    /**
     * Creates a parse error.
     *
     * @param {string} message - Single-line summary of the failure.
     * @param {ParseIssue[]} issues - Structured reasons the value was rejected.
     */
    constructor(message: string, issues: ParseIssue[]);
}
/**
 * Compile-time proof that a schema produces the interface it claims to.
 *
 * Used as `type _Proof = AssertSchemaOutput<z.infer<typeof Schema>, Interface>;`
 * beside every schema in this package. The constraint `TOutput extends
 * TInterface` is checked when the alias is declared, so a schema that drifts
 * away from its interface is a **compile error at the point of divergence**
 * rather than a runtime surprise in a consumer.
 *
 * The alias is purely type-level and emits no runtime code.
 *
 * ### What it catches, measured rather than assumed
 *
 * - A declared field typed differently in the schema than in the interface.
 * - A field the interface requires that the schema does not produce.
 * - An enum narrowed to a value the interface does not admit.
 *
 * ### What it cannot catch
 *
 * An **optional** interface field that the schema omits entirely. Interfaces
 * extending {@link BaseFirestore} inherit `[x: string]: any`, which makes any
 * missing optional field assignable. That blind spot is covered instead by the
 * schema-shape inventory tests, which assert the schema's key set at runtime.
 *
 * @template TOutput The schema's inferred output type.
 * @template TInterface The declared interface the schema must produce.
 */
export type AssertSchemaOutput<TOutput extends TInterface, TInterface> = TOutput;
/**
 * Validates an untrusted value against a schema and returns a discriminated
 * result instead of throwing.
 *
 * This is the non-throwing half of the parse boundary. Use it wherever a
 * malformed stored document is an expected condition to be handled — a sweep
 * over a collection, a queue consumer, a migration — so that one bad document
 * does not abort the batch.
 *
 * @template TSchema The schema type, which determines the output type.
 * @param {TSchema} schema - Schema describing the expected shape.
 * @param {unknown} value - Untrusted value, typically the raw data of a stored document.
 * @param {string} label - Name of the shape, used in the failure message.
 * @return {ParseResult<z.output<TSchema>>} Success carrying the typed document, or failure carrying the reasons.
 */
export declare const parseResult: <TSchema extends z.ZodType>(schema: TSchema, value: unknown, label: string) => ParseResult<z.output<TSchema>>;
/**
 * Validates an untrusted value against a schema and returns the typed document,
 * throwing when it does not conform.
 *
 * This is the throwing half of the parse boundary. Use it on a request or
 * transaction path where continuing with an unvalidated document is never the
 * right outcome, so that the failure surfaces at the boundary the data entered
 * rather than as a `NaN` several layers downstream.
 *
 * @template TSchema The schema type, which determines the output type.
 * @param {TSchema} schema - Schema describing the expected shape.
 * @param {unknown} value - Untrusted value, typically the raw data of a stored document.
 * @param {string} label - Name of the shape, used in the thrown message.
 * @return {z.output<TSchema>} The validated document.
 * @throws {ParseError} When the value does not conform to the schema.
 */
export declare const parseOrThrow: <TSchema extends z.ZodType>(schema: TSchema, value: unknown, label: string) => z.output<TSchema>;
/**
 * Wraps a schema so that the object key it validates is inferred as
 * **required** rather than optional.
 *
 * ## Why this is necessary, and why it is specific to this repository
 *
 * `tsconfig.json` sets `strict: true` and then overrides it with
 * `strictNullChecks: false`. Under that setting `undefined` is assignable to
 * everything, so a type of the form `"optional" | undefined` collapses to
 * `"optional"` — and that is exactly how zod carries its per-schema optionality
 * marker for several wrapper schemas, including `z.union`, `z.nullable` and
 * `z.nonoptional`. Zod decides an object key's optionality by testing that
 * marker, so in this repository **every required key whose schema is one of
 * those wrappers is inferred as optional**.
 *
 * The consequence is not cosmetic: a parse helper would return a type claiming
 * a field may be absent when at runtime it never is, and every consumer would
 * then write a defensive `?? fallback` for a case that cannot occur — which is
 * how a default value gets into a code path that had no need of one.
 *
 * `z.custom` declares the marker as an *optional property* rather than a
 * required one, so it is unaffected by the collapse. Wrapping the real schema in
 * one preserves the runtime validation exactly — the inner schema still decides
 * what is accepted — while restoring the correct inferred optionality.
 *
 * The trade-off is error granularity: a failure reports one issue at the key's
 * path rather than the inner schema's per-member detail, which is why the
 * message is a required argument rather than a generic default.
 *
 * @template TSchema The inner schema, which performs the actual validation.
 * @param {TSchema} schema - Schema describing the accepted values.
 * @param {string} message - Message reported when the value is rejected.
 * @return {z.ZodCustom<z.output<TSchema>, z.output<TSchema>>} An equivalent schema whose key is inferred as required.
 */
export declare const requiredKey: <TSchema extends z.ZodType>(schema: TSchema, message: string) => z.ZodCustom<z.output<TSchema>, z.output<TSchema>>;
/**
 * Schema for a non-empty string.
 *
 * The lower bound matters: an empty string is a common product of a failed
 * lookup or a `String(undefined ?? '')` fallback, and accepting it stores a
 * document that looks populated and matches nothing.
 *
 * @return {z.ZodString} Schema accepting any string of length one or more.
 */
export declare const nonEmptyString: () => z.ZodString;
/**
 * Schema for a Firestore document identifier or path segment.
 *
 * Bounded at 1500 bytes, the documented Firestore limit for a document name, so
 * an oversized value is rejected here rather than by the datastore after the
 * surrounding work has already been done.
 *
 * @return {z.ZodString} Schema accepting a plausible document identifier.
 */
export declare const documentId: () => z.ZodString;
/**
 * Schema for an opaque server-generated token, such as a lease owner token or a
 * hold claim token.
 *
 * Bounded so that a token read from an untrusted source cannot be used to bloat
 * a document, while staying wide enough for any common token format.
 *
 * @return {z.ZodString} Schema accepting a non-empty token of at most 512 characters.
 */
export declare const token: () => z.ZodString;
/**
 * Schema for a real number, rejecting `NaN` and both infinities.
 *
 * This is the money-safe numeric primitive of this package and the direct
 * answer to `Number(data['amount'] ?? 0)`: a non-numeric input is **rejected,
 * never coerced**. Coercion is the defect, not the fix — `Number('abc')` is
 * `NaN`, `NaN` compares false against every threshold, and it contaminates
 * every subsequent sum without ever throwing.
 *
 * No sign or integrality constraint is applied, because a monetary movement may
 * legitimately be negative for a reversal or a credit.
 *
 * @return {z.ZodNumber} Schema accepting any finite number.
 */
export declare const finiteNumber: () => z.ZodNumber;
/**
 * Schema for a finite number that may not be negative.
 *
 * Suitable for a balance, a quota allowance or a consumed total, where a
 * negative value indicates a broken accumulation rather than a legitimate
 * reversal.
 *
 * @return {z.ZodNumber} Schema accepting a finite number greater than or equal to zero.
 */
export declare const nonNegativeNumber: () => z.ZodNumber;
/**
 * Schema for a counter: a safe integer that may not be negative.
 *
 * Rejects fractional values as well as negative ones, because a fractional
 * attempt count or generation number is evidence that an increment was applied
 * to something that was never a counter.
 *
 * @return {z.ZodNumber} Schema accepting a non-negative safe integer.
 */
export declare const counter: () => z.ZodNumber;
/**
 * Schema for a Unix epoch instant expressed in **seconds**.
 *
 * Seconds, not milliseconds. The distinction is enforced rather than documented
 * because a millisecond value silently accepted where seconds are expected is
 * wrong by a factor of 1000 and lands roughly fifty thousand years in the
 * future, where nothing expires and every check that depends on expiry
 * quietly stops firing.
 *
 * The upper bound is the year 2286, which is comfortably beyond any legitimate
 * expiry and, crucially, **below the lower bound of {@link epochMillis}**. The
 * two ranges do not overlap, so a value in one unit can never validate as the
 * other. That matters concretely: this package models two different persisted
 * shapes that each carry a field named `expiresAt`, in different units, and a
 * field name is not a unit.
 *
 * @return {z.ZodNumber} Schema accepting a plausible epoch-seconds instant.
 */
export declare const epochSeconds: () => z.ZodNumber;
/**
 * Schema for a Unix epoch instant expressed in **milliseconds**.
 *
 * The lower bound is deliberately not zero. It is roughly September 2001 in
 * milliseconds, which is above every epoch-**seconds** value this package will
 * ever see, so a seconds value mistakenly stored in a milliseconds field is
 * rejected here instead of being read as a moment in January 1970 — an instant
 * that is always in the past, which silently expires every record that carries
 * it.
 *
 * The ranges of this schema and {@link epochSeconds} are disjoint by
 * construction. Neither unit can pass validation for the other.
 *
 * @return {z.ZodNumber} Schema accepting a plausible epoch-milliseconds instant.
 */
export declare const epochMillis: () => z.ZodNumber;
/**
 * Schema for a Firestore timestamp, validated structurally and passed through by
 * reference.
 *
 * Built on `z.custom` rather than `z.object` for a reason that is easy to get
 * wrong: an object schema **rebuilds** the value, so validating a live
 * `Timestamp` through one returns a plain `{seconds, nanoseconds}` object and
 * destroys the class instance. Writing that back would break a Firestore TTL
 * policy keyed on the field, and nothing would report it. `z.custom` validates
 * without reconstructing, so the original value — instance methods and all —
 * survives the parse.
 *
 * @return {z.ZodType<TimestampLike, TimestampLike>} Schema accepting a timestamp-like value unchanged.
 */
export declare const timestampLike: () => z.ZodType<TimestampLike, TimestampLike>;
/**
 * Schema for an audit or time-to-live timestamp **read** from the datastore.
 *
 * This is the runtime resolution of the timestamp fields on
 * {@link BaseFirestore} that are declared `any`. Their honest static type is
 * `Timestamp | Date | FieldValue | string`, and the `FieldValue` half of that
 * union can only be named by importing the server SDK — which this package must
 * not do, because it would land a server SDK in every consumer's dependency
 * closure to describe one field. The type therefore stays permissive on purpose
 * and the constraint is enforced here, at the boundary where it can actually be
 * checked.
 *
 * Four shapes are accepted, which are the four a stored timestamp is genuinely
 * observed as:
 *
 * | Shape | Where it comes from |
 * |---|---|
 * | {@link TimestampLike} | A live SDK read, or its JSON form after a round-trip. |
 * | `Date` | A value already converted by a caller. |
 * | `string` | An ISO 8601 serialization, for transport. |
 * | `number` | An epoch instant recorded numerically. |
 *
 * ### What it deliberately rejects, and how to opt out
 *
 * A **write** payload carrying a server sentinel is not a read shape and is
 * rejected: a sentinel is an opaque SDK instance with no structure to check
 * against, and quietly accepting any unrecognised object would make this schema
 * accept everything while reading as though it validated something. Validate a
 * write payload with an explicitly widened schema instead:
 *
 * ```ts
 * const writeSchema = Price.Schema.extend({created: openValue(), updated: openValue()});
 * ```
 *
 * `null` is also rejected. An audit timestamp that is explicitly null is not a
 * time, and treating it as one produces an epoch-zero date that sorts first and
 * expires immediately.
 *
 * @return {z.ZodType<TimestampLike | Date | string | number>} Schema accepting any read shape of a stored timestamp.
 */
export declare const auditTimestamp: () => z.ZodType<TimestampLike | Date | string | number>;
/**
 * Schema for a field whose runtime shape is genuinely open.
 *
 * Accepts any value, including absence, and passes it through by reference.
 *
 * Reach for this only where the openness is the specification — {@link MessageQueue.counted}
 * is an arbitrary diagnostic snapshot by declaration — or where a caller must
 * deliberately widen a document schema to validate a write payload rather than a
 * read. It is not a placeholder for a narrower schema that someone forgot to
 * write; prefer {@link auditTimestamp} for a timestamp.
 *
 * @return {z.ZodOptional<z.ZodUnknown>} Schema accepting any value, including absence.
 */
export declare const openValue: () => z.ZodOptional<z.ZodUnknown>;
/**
 * Successful narrowing of an untrusted value to a member of a caller-owned
 * enumeration.
 *
 * @template TMember The enumeration's member type.
 */
export interface MemberMatch<TMember extends string> {
    /**
     * Discriminant. Always `true` on this branch.
     */
    matched: true;
    /**
     * The value, now typed as a member of the enumeration.
     */
    member: TMember;
}
/**
 * Failed narrowing: the value is not a member of the enumeration.
 *
 * There is deliberately **no `member` property on this branch at all**, for the
 * same measured reason as {@link ParseFailure}: under `strictNullChecks: false`
 * a sibling `member?: undefined` marker collapses, and reading `.member` off an
 * un-narrowed result would compile cleanly. Omitting it makes the unhandled case
 * a compile error regardless of the null-checking setting.
 */
export interface MemberMiss {
    /**
     * Discriminant. Always `false` on this branch.
     */
    matched: false;
    /**
     * The value that failed to match, carried so a caller can distinguish the
     * cases that {@link matchMember} deliberately does not distinguish for them.
     *
     * `undefined` means the field was absent, `null` means it was explicitly null,
     * and anything else is a value that was present but is not a member. All three
     * are misses; which of them warrants an error is the caller's policy, not this
     * function's.
     */
    value: unknown;
}
/**
 * Result of narrowing an untrusted value to a member of an enumeration.
 *
 * @template TMember The enumeration's member type.
 */
export type MemberResult<TMember extends string> = MemberMatch<TMember> | MemberMiss;
/**
 * Narrows an untrusted value to a member of a caller-owned enumeration.
 *
 * ## Why this exists
 *
 * Some fields in this package are deliberately typed `string` rather than an
 * enum, because the vocabulary is owned by the service that writes them and a
 * partial copy here would reject legitimate records. That is the correct
 * layering — this package validates *shape*, the vocabulary's owner validates
 * *membership* — but on its own it only **moves** the cast rather than removing
 * it: a caller still writes `parsed.service as Service`, which checks nothing.
 *
 * This closes that. The cast is written once, here, inside a guard that has
 * actually checked, instead of once per call site inside nothing. And because
 * the miss branch carries no `member` property, a caller that ignores the failure
 * gets a compile error rather than a silent misroute — the mistake is
 * unrepresentable rather than merely discouraged.
 *
 * ## What counts as a miss
 *
 * Everything that is not exactly one of the enumeration's values: a non-string,
 * `null`, `undefined`, the empty string (unless the enumeration declares an
 * empty member, which none should), and any string with different casing or
 * surrounding whitespace. No normalisation is performed, because normalising
 * would mean guessing which near-miss the writer intended.
 *
 * Absence and invalidity are both misses. They are **distinguishable** through
 * {@link MemberMiss.value}, so a caller for whom an absent field is acceptable
 * but a wrong one is not can tell them apart; the function does not decide that
 * policy on the caller's behalf.
 *
 * @template TEnum The enumeration object, typically `typeof SomeEnum`.
 * @param {TEnum} members - The enumeration to narrow against.
 * @param {unknown} value - Untrusted value, typically a field of an already-parsed document.
 * @return {MemberResult<TEnum[keyof TEnum]>} A match carrying the typed member, or a miss carrying the offending value.
 */
export declare const matchMember: <TEnum extends Record<string, string>>(members: TEnum, value: unknown) => MemberResult<TEnum[keyof TEnum]>;
/**
 * Narrows an untrusted value to a member of an enumeration, throwing when it is
 * not one.
 *
 * The throwing counterpart to {@link matchMember}, mirroring the relationship
 * between {@link parseOrThrow} and {@link parseResult}. Use it where continuing
 * with an unrecognised value is never the right outcome, so the failure surfaces
 * at the boundary the value entered rather than as a dispatch with no matching
 * branch several layers later.
 *
 * @template TEnum The enumeration object, typically `typeof SomeEnum`.
 * @param {TEnum} members - The enumeration to narrow against.
 * @param {unknown} value - Untrusted value, typically a field of an already-parsed document.
 * @param {string} label - Name of the field being narrowed, used in the thrown message.
 * @return {TEnum[keyof TEnum]} The value, typed as a member of the enumeration.
 * @throws {ParseError} When the value is not a member.
 */
export declare const requireMember: <TEnum extends Record<string, string>>(members: TEnum, value: unknown, label: string) => TEnum[keyof TEnum];
