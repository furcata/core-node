/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */
import { z } from 'zod';
import { baseFirestoreShape } from '../interface/base_db.js';
import { counter, documentId, epochSeconds, nonEmptyString, parseOrThrow, parseResult, timestampLike, token, } from '../interface/schema.js';
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
export var Capacity;
(function (Capacity) {
    /**
     * Field schemas for {@link Interface}, before the cross-field expiry check is
     * attached.
     *
     * Split out so that {@link Schema}'s key inventory remains reachable for tests
     * after the refinement is applied.
     */
    const shape = {
        ...baseFirestoreShape,
        /**
         * See {@link Interface.uid}.
         */
        uid: nonEmptyString().max(256),
        /**
         * See {@link Interface.price}.
         */
        price: documentId(),
        /**
         * See {@link Interface.source}.
         */
        source: documentId(),
        /**
         * See {@link Interface.type}. Validated against {@link Price.Type}.
         */
        type: z.enum(Price.Type),
        /**
         * See {@link Interface.token}.
         */
        token: token(),
        /**
         * See {@link Interface.generation}.
         */
        generation: counter(),
        /**
         * See {@link Interface.expiresAt}. Epoch **seconds**; a milliseconds value is
         * rejected rather than read as an instant far beyond any expiry.
         */
        expiresAt: epochSeconds(),
        /**
         * See {@link Interface.expires}.
         */
        expires: timestampLike().optional(),
    };
    /**
     * Object schema for {@link Interface} without the cross-field expiry check.
     *
     * Exported so that a caller validating a partially assembled hold — one where
     * {@link Interface.expires} has not yet been derived — can do so without the
     * consistency rule that only applies once both fields exist. Prefer
     * {@link Schema} for anything read from the datastore.
     */
    Capacity.ObjectSchema = z.looseObject(shape);
    /**
     * Reports whether the two expiry fields agree.
     *
     * Both may be absent, and {@link Interface.expires} may be absent on its own —
     * a hold whose TTL has not been written yet is a legitimate intermediate
     * state. What is never legitimate is the two disagreeing, because that means
     * one of them was derived with the wrong unit.
     *
     * @param {{expiresAt?: number, expires?: TimestampLike}} value - A candidate hold, already validated field by field.
     * @return {boolean} `true` when the fields are consistent or the check does not apply.
     */
    const expiryFieldsAgree = (value) => {
        if (value.expires === undefined || value.expires === null)
            return true;
        if (typeof value.expiresAt !== 'number')
            return true;
        return value.expires.seconds === Math.trunc(value.expiresAt);
    };
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
    Capacity.Schema = Capacity.ObjectSchema.refine(expiryFieldsAgree, {
        error: 'expires must equal expiresAt: expires.seconds and expiresAt state the same instant, in Firestore-timestamp and epoch-seconds form respectively',
        path: ['expires'],
    });
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
    Capacity.expiresAtToMillis = (expiresAtSeconds) => Math.trunc(expiresAtSeconds) * 1000;
    /**
     * Validates untrusted data as a capacity hold without throwing.
     *
     * @param {unknown} value - Untrusted value, typically the raw data of a stored hold document.
     * @return {ParseResult<Interface>} Success carrying the typed hold, or failure carrying the reasons.
     */
    Capacity.safeParse = (value) => parseResult(Capacity.Schema, value, 'Capacity.Interface');
    /**
     * Validates untrusted data as a capacity hold, throwing when it does not
     * conform.
     *
     * @param {unknown} value - Untrusted value, typically the raw data of a stored hold document.
     * @return {Interface} The validated hold.
     * @throws {ParseError} When the value does not conform to {@link Schema}.
     */
    Capacity.parse = (value) => parseOrThrow(Capacity.Schema, value, 'Capacity.Interface');
})(Capacity || (Capacity = {}));
