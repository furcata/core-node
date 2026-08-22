/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */
import { z } from 'zod';
import { BaseFirestore } from '../interface/base_db.js';
import { AssertSchemaOutput, ParseResult, TimestampLike } from '../interface/schema.js';
import { Price } from './Price.js';
/**
 * Namespace for capacity holds: a transactional claim on one unit of limited
 * availability, taken before payment and released if payment never arrives.
 *
 * A hold is refreshed rather than duplicated, so a single buyer firing several
 * concurrent checkouts claims one unit rather than several. That refresh is why
 * {@link Interface.token} and {@link Interface.generation} exist: they are how a
 * later operation asks "is this still *my* hold?" rather than "does a hold
 * exist?", which are different questions with the same answer right up until
 * they are not.
 */
export declare namespace Capacity {
    /**
     * Firestore document shape for a single capacity hold.
     *
     * Extends {@link BaseFirestore} for standard auditing fields.
     */
    interface Interface extends BaseFirestore {
        /**
         * Firebase Auth UID of the holder.
         *
         * A hold is keyed on the holder and the price together, which is what bounds
         * a single buyer to one unit per price tier.
         */
        uid: string;
        /**
         * Firestore document ID of the price tier this hold is against.
         */
        price: string;
        /**
         * Firestore document ID of the parent event or product the
         * {@link Interface.price} belongs to.
         */
        source: string;
        /**
         * Item category of the held item, which also names the collection
         * {@link Interface.source} is read from.
         *
         * Reuses {@link Price.Type} rather than declaring a parallel enum.
         */
        type: Price.Type;
        /**
         * Opaque token identifying *this* claim of the hold.
         *
         * Because a hold is refreshed in place rather than recreated, the document
         * outliving a claim is normal. Presenting this token back is how a release
         * asserts it is releasing the claim it took, rather than one a later
         * operation has since taken over the same document.
         */
        token: string;
        /**
         * Monotonically increasing generation of this logical hold.
         *
         * Increments on every refresh. Checked alongside {@link Interface.token} so
         * that a stale operation holding a token that has since been reissued is
         * still rejected.
         */
        generation: number;
        /**
         * Instant at which this hold lapses, as Unix epoch **seconds**.
         *
         * 🔴 Seconds, not milliseconds — and note that {@link Reservation.Interface}
         * declares a field of the same name in **milliseconds**. A field name is not
         * a unit. A milliseconds value stored here reads as an instant tens of
         * thousands of years in the future, so the hold never lapses, the unit it
         * holds is never released, and a paid tier silently loses inventory with
         * nothing failing. {@link Schema} rejects such a value: its accepted range is
         * disjoint from the epoch-milliseconds range used by
         * {@link Reservation.Interface.expiresAt}.
         *
         * This field is the authority on expiry. {@link Interface.expires} is derived
         * from it.
         */
        expiresAt: number;
        /**
         * The same instant as {@link Interface.expiresAt}, expressed as a Firestore
         * timestamp so that a Firestore time-to-live policy can reap the document.
         *
         * 🔴 **Not a duplicate of {@link Interface.expiresAt}, and not
         * interchangeable with it.** The two differ by two characters in the name,
         * carry different types, and are stated in different units:
         *
         * | Field | Type | Unit | Read by |
         * |---|---|---|---|
         * | {@link Interface.expiresAt} | `number` | epoch **seconds** | application expiry logic |
         * | {@link Interface.expires} | {@link TimestampLike} | Firestore timestamp | the datastore's TTL policy |
         *
         * The derivation is `expires = Timestamp.fromMillis(expiresAt * 1000)`, so
         * `expires.seconds` and `expiresAt` must be equal. {@link Schema} enforces
         * that equality whenever both are present, because the two failure modes are
         * asymmetric and both are silent: a TTL derived from the wrong unit either
         * deletes a live hold early — releasing a unit somebody is paying for — or
         * never deletes it at all, which leaks the unit permanently. Neither raises
         * an error on its own.
         *
         * Absent means no TTL has been written for this hold, which is not the same
         * as the hold not expiring: {@link Interface.expiresAt} still governs the
         * application-level decision.
         */
        expires?: TimestampLike;
    }
    /**
     * Object schema for {@link Interface} without the cross-field expiry check.
     *
     * Exported so that a caller validating a partially assembled hold — one where
     * {@link Interface.expires} has not yet been derived — can do so without the
     * consistency rule that only applies once both fields exist. Prefer
     * {@link Schema} for anything read from the datastore.
     */
    const ObjectSchema: z.ZodObject<{
        uid: z.ZodString;
        price: z.ZodString;
        source: z.ZodString;
        type: z.ZodEnum<typeof Price.Type>;
        token: z.ZodString;
        generation: z.ZodNumber;
        expiresAt: z.ZodNumber;
        expires: z.ZodOptional<z.ZodType<TimestampLike, TimestampLike, z.core.$ZodTypeInternals<TimestampLike, TimestampLike>>>;
        id: z.ZodOptional<z.ZodString>;
        backup: z.ZodOptional<z.ZodBoolean>;
        created: z.ZodOptional<z.ZodType<string | number | TimestampLike | Date, unknown, z.core.$ZodTypeInternals<string | number | TimestampLike | Date, unknown>>>;
        updated: z.ZodOptional<z.ZodType<string | number | TimestampLike | Date, unknown, z.core.$ZodTypeInternals<string | number | TimestampLike | Date, unknown>>>;
        expiry: z.ZodOptional<z.ZodType<string | number | TimestampLike | Date, unknown, z.core.$ZodTypeInternals<string | number | TimestampLike | Date, unknown>>>;
    }, z.core.$loose>;
    /**
     * Runtime schema producing {@link Interface}.
     *
     * Beyond validating each field, this schema enforces the one relationship that
     * neither field can express alone: when both {@link Interface.expiresAt} and
     * {@link Interface.expires} are present they must denote the same instant.
     * That check is the reason the two fields can safely coexist. Without it a
     * transposition between them is invisible — both values are well-formed
     * numbers of their respective kinds, both pass every per-field rule, and the
     * only symptom is a hold that expires at the wrong time by a factor of a
     * thousand.
     *
     * Unknown keys are preserved, so a hold written by a newer service keeps the
     * fields this version does not declare.
     */
    const Schema: z.ZodObject<{
        uid: z.ZodString;
        price: z.ZodString;
        source: z.ZodString;
        type: z.ZodEnum<typeof Price.Type>;
        token: z.ZodString;
        generation: z.ZodNumber;
        expiresAt: z.ZodNumber;
        expires: z.ZodOptional<z.ZodType<TimestampLike, TimestampLike, z.core.$ZodTypeInternals<TimestampLike, TimestampLike>>>;
        id: z.ZodOptional<z.ZodString>;
        backup: z.ZodOptional<z.ZodBoolean>;
        created: z.ZodOptional<z.ZodType<string | number | TimestampLike | Date, unknown, z.core.$ZodTypeInternals<string | number | TimestampLike | Date, unknown>>>;
        updated: z.ZodOptional<z.ZodType<string | number | TimestampLike | Date, unknown, z.core.$ZodTypeInternals<string | number | TimestampLike | Date, unknown>>>;
        expiry: z.ZodOptional<z.ZodType<string | number | TimestampLike | Date, unknown, z.core.$ZodTypeInternals<string | number | TimestampLike | Date, unknown>>>;
    }, z.core.$loose>;
    /**
     * Compile-time proof that {@link Schema} produces {@link Interface}.
     */
    type SchemaOutput = AssertSchemaOutput<z.infer<typeof Schema>, Interface>;
    /**
     * Converts the authoritative {@link Interface.expiresAt} into the epoch
     * milliseconds a Firestore timestamp is constructed from.
     *
     * Exists so that the `× 1000` appears once in this package rather than at every
     * call site that has to derive {@link Interface.expires}. That multiplication
     * is the single place the two expiry fields can diverge, and it is a factor of
     * a thousand in either direction.
     *
     * @param {number} expiresAtSeconds - Value of {@link Interface.expiresAt}, in epoch seconds.
     * @return {number} The same instant in epoch milliseconds.
     */
    const expiresAtToMillis: (expiresAtSeconds: number) => number;
    /**
     * Validates untrusted data as a capacity hold without throwing.
     *
     * @param {unknown} value - Untrusted value, typically the raw data of a stored hold document.
     * @return {ParseResult<Interface>} Success carrying the typed hold, or failure carrying the reasons.
     */
    const safeParse: (value: unknown) => ParseResult<Interface>;
    /**
     * Validates untrusted data as a capacity hold, throwing when it does not
     * conform.
     *
     * @param {unknown} value - Untrusted value, typically the raw data of a stored hold document.
     * @return {Interface} The validated hold.
     * @throws {ParseError} When the value does not conform to {@link Schema}.
     */
    const parse: (value: unknown) => Interface;
}
