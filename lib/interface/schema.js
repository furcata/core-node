/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */
import { z } from 'zod';
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
export const isTimestampLike = (value) => {
    if (typeof value !== 'object' || value === null)
        return false;
    const candidate = value;
    return typeof candidate['seconds'] === 'number' &&
        Number.isFinite(candidate['seconds']) &&
        typeof candidate['nanoseconds'] === 'number' &&
        Number.isFinite(candidate['nanoseconds']);
};
/**
 * Error thrown by the throwing form of a parse helper.
 *
 * Carries the structured {@link ParseIssue} list alongside the message so a
 * caller can inspect the failures without re-parsing the message text.
 */
export class ParseError extends Error {
    /**
     * Creates a parse error.
     *
     * @param {string} message - Single-line summary of the failure.
     * @param {ParseIssue[]} issues - Structured reasons the value was rejected.
     */
    constructor(message, issues) {
        super(message);
        this.name = 'ParseError';
        this.issues = issues;
    }
}
/**
 * Converts validator issues into the library-independent {@link ParseIssue}
 * shape.
 *
 * @param {z.core.$ZodIssue[]} issues - Raw issues reported by the validator.
 * @return {ParseIssue[]} Flat, serializable issues.
 */
const toParseIssues = (issues) => issues.map((issue) => ({
    path: issue.path.map((segment) => String(segment)).join('.'),
    code: String(issue.code ?? 'invalid'),
    message: issue.message,
}));
/**
 * Builds the single-line summary carried by a failure.
 *
 * @param {string} label - Name of the shape that was being parsed, for example `Price.Interface`.
 * @param {ParseIssue[]} issues - Structured reasons the value was rejected.
 * @return {string} Summary suitable for a log line.
 */
const toMessage = (label, issues) => {
    const detail = issues.map((issue) => (issue.path ? `${issue.path}: ${issue.message}` : issue.message)).join('; ');
    return `${label} failed validation: ${detail}`;
};
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
export const parseResult = (schema, value, label) => {
    const result = schema.safeParse(value);
    if (result.success)
        return { success: true, data: result.data };
    const issues = toParseIssues(result.error.issues);
    return { success: false, issues, message: toMessage(label, issues) };
};
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
export const parseOrThrow = (schema, value, label) => {
    const result = schema.safeParse(value);
    if (result.success)
        return result.data;
    const issues = toParseIssues(result.error.issues);
    throw new ParseError(toMessage(label, issues), issues);
};
/**
 * Wraps a schema so that the object key it validates is inferred as
 * **required** rather than optional.
 *
 * ## Why this exists, and its current status
 *
 * This wrapper was introduced to work around a type-inference collapse caused by
 * `strictNullChecks: false`. Under that setting `undefined` is assignable to
 * everything, so a type of the form `"optional" | undefined` collapses to
 * `"optional"` — and that is exactly how zod carries its per-schema optionality
 * marker for several wrapper schemas, including `z.union`, `z.nullable` and
 * `z.nonoptional`. Zod decides an object key's optionality by testing that
 * marker, so under that setting **every required key whose schema is one of
 * those wrappers was inferred as optional**.
 *
 * The consequence was not cosmetic: a parse helper would return a type claiming
 * a field may be absent when at runtime it never is, and every consumer would
 * then write a defensive `?? fallback` for a case that cannot occur — which is
 * how a default value gets into a code path that had no need of one.
 *
 * `z.custom` declares the marker as an *optional property* rather than a
 * required one, so it is unaffected by the collapse. Wrapping the real schema in
 * one preserves the runtime validation exactly — the inner schema still decides
 * what is accepted — while restoring the correct inferred optionality.
 *
 * **`strictNullChecks` is now enabled, so the collapse no longer occurs.**
 * Verified by inferring `z.object({u: z.union([...])})` and observing that the
 * required key is now correctly reported as missing (`TS2741`) where it
 * previously type-checked clean. Both former call sites have been migrated and
 * their keys remain inferred as required without the wrapper.
 *
 * ## Use zod's native `error` parameter instead
 *
 * The replacement is not "delete the wrapper" — doing only that degrades the
 * reported message. A failed `z.union` reports `Invalid input`, because zod
 * cannot know which member the caller intended, and a failed `z.string()`
 * inside a `.nullable()` reports `expected string`, which is true of the inner
 * schema but false of the field. Both send a caller looking for the wrong fix.
 *
 * Declare the message on the schema itself, which preserves the wording *and*
 * the correct inference, and drops the `z.custom` indirection:
 *
 * ```ts
 * // instead of requiredKey(z.union([...]), 'Expected …')
 * z.union([...], {error: 'Expected …'})
 * // instead of requiredKey(z.string().nullable(), 'Expected … or null')
 * z.string({error: 'Expected … or null'}).nullable()
 * ```
 *
 * This is **retained rather than removed** because it is a published export and
 * dropping it would be a breaking change for any consumer that imported it.
 *
 * @deprecated Declare the message on the schema with zod's native `error`
 * parameter — `z.union([...], {error})` or `z.string({error}).nullable()` —
 * which reports the same message, infers the key as required, and avoids
 * wrapping the schema in `z.custom`.
 *
 * @template TSchema The inner schema, which performs the actual validation.
 * @param {TSchema} schema - Schema describing the accepted values.
 * @param {string} message - Message reported when the value is rejected.
 * @return {z.ZodCustom<z.output<TSchema>, z.output<TSchema>>} An equivalent schema whose key is inferred as required.
 */
export const requiredKey = (schema, message) => z.custom((candidate) => schema.safeParse(candidate).success, { error: message });
/**
 * Schema for a non-empty string.
 *
 * The lower bound matters: an empty string is a common product of a failed
 * lookup or a `String(undefined ?? '')` fallback, and accepting it stores a
 * document that looks populated and matches nothing.
 *
 * @return {z.ZodString} Schema accepting any string of length one or more.
 */
export const nonEmptyString = () => z.string().min(1);
/**
 * Schema for a Firestore document identifier or path segment.
 *
 * Bounded at 1500 bytes, the documented Firestore limit for a document name, so
 * an oversized value is rejected here rather than by the datastore after the
 * surrounding work has already been done.
 *
 * @return {z.ZodString} Schema accepting a plausible document identifier.
 */
export const documentId = () => z.string().min(1).max(1500);
/**
 * Schema for an opaque server-generated token, such as a lease owner token or a
 * hold claim token.
 *
 * Bounded so that a token read from an untrusted source cannot be used to bloat
 * a document, while staying wide enough for any common token format.
 *
 * @return {z.ZodString} Schema accepting a non-empty token of at most 512 characters.
 */
export const token = () => z.string().min(1).max(512);
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
export const finiteNumber = () => z.number();
/**
 * Schema for a finite number that may not be negative.
 *
 * Suitable for a balance, a quota allowance or a consumed total, where a
 * negative value indicates a broken accumulation rather than a legitimate
 * reversal.
 *
 * @return {z.ZodNumber} Schema accepting a finite number greater than or equal to zero.
 */
export const nonNegativeNumber = () => z.number().min(0);
/**
 * Schema for a counter: a safe integer that may not be negative.
 *
 * Rejects fractional values as well as negative ones, because a fractional
 * attempt count or generation number is evidence that an increment was applied
 * to something that was never a counter.
 *
 * @return {z.ZodNumber} Schema accepting a non-negative safe integer.
 */
export const counter = () => z.int().min(0);
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
export const epochSeconds = () => z.int().min(0).max(9999999999);
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
export const epochMillis = () => z.int().min(1000000000000).max(9999999999999);
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
export const timestampLike = () => z.custom(isTimestampLike, { error: 'Expected a Firestore timestamp with numeric seconds and nanoseconds' });
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
 * That rejection is why every field validated by this helper stays `.optional()`
 * while the rest of the package's stored-document fields are `.nullish()`. The
 * general rule there is that a stored optional field arrives as an explicit
 * `null`, so a schema must accept one; the exception here is that for an instant
 * specifically, accepting `null` would hand a caller a value that reads as a
 * date and denotes 1970. The exemption is inventoried in `nullRejecting` in
 * `test/interface/schema.test.ts`, so it cannot be widened silently — and it is
 * an exemption rather than a preference: if a stored document is ever observed
 * carrying `null` in one of these fields, the correct response is to decide what
 * a null instant means and record it, not to reach for `.nullish()`.
 *
 * @return {z.ZodType<TimestampLike | Date | string | number>} Schema accepting any read shape of a stored timestamp.
 */
export const auditTimestamp = () => z.custom((candidate) => {
    if (isTimestampLike(candidate))
        return true;
    if (candidate instanceof Date)
        return Number.isFinite(candidate.getTime());
    if (typeof candidate === 'string')
        return candidate.length > 0;
    return typeof candidate === 'number' && Number.isFinite(candidate);
}, { error: 'Expected a Firestore timestamp, Date, ISO 8601 string or epoch number' });
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
export const openValue = () => z.unknown().optional();
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
export const matchMember = (members, value) => {
    if (typeof value !== 'string')
        return { matched: false, value };
    const accepted = Object.values(members);
    if (!accepted.includes(value))
        return { matched: false, value };
    return { matched: true, member: value };
};
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
export const requireMember = (members, value, label) => {
    const result = matchMember(members, value);
    if (result.matched)
        return result.member;
    const issues = [{
            path: label,
            code: 'invalid_value',
            message: `Expected one of: ${Object.values(members).join(', ')}`,
        }];
    throw new ParseError(toMessage(label, issues), issues);
};
