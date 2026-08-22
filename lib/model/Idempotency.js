/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */
import { z } from 'zod';
import { baseFirestoreShape } from '../interface/base_db.js';
import { counter, nonEmptyString, parseOrThrow, parseResult, requiredKey, timestampLike, token, } from '../interface/schema.js';
/**
 * Namespace for idempotency records: the durable claim that makes a
 * client-initiated request execute at most once.
 *
 * A record is created when a caller first presents a key, and its **existence**
 * is what blocks a replay. The record is therefore not deleted when the request
 * completes — only a time-based expiry reaps it — because deleting it on success
 * would make every key infinitely replayable while every replay test still
 * passed, there being no marker left for a replay to collide with.
 *
 * These documents are **server-authored**. Nothing here is written by a client,
 * and a stored response held for replay is readable only by the service that
 * wrote it.
 */
export var Idempotency;
(function (Idempotency) {
    /**
     * Lifecycle state of an idempotency record.
     *
     * The state decides what happens to a second delivery of the same request, so
     * an unrecognised value is not a cosmetic mislabelling: it falls through every
     * comparison and the request runs a second time. That is why
     * {@link Interface.state} is validated against this enum rather than asserted
     * into it.
     */
    let State;
    (function (State) {
        /**
         * A holder is executing the request right now. A second delivery arriving in
         * this state must be told to retry rather than allowed to proceed, unless the
         * holder's lease has already lapsed.
         */
        State["inProgress"] = "in_progress";
        /**
         * The request finished and {@link Interface.response} holds the original
         * outcome for replay. A second delivery is answered from the record and the
         * work is not repeated.
         */
        State["completed"] = "completed";
        /**
         * The request failed and the key may be reclaimed by a later attempt.
         */
        State["failed"] = "failed";
    })(State = Idempotency.State || (Idempotency.State = {}));
    /**
     * Schema for {@link Response}.
     *
     * {@link Response.body} is required **and** nullable, which in this repository
     * needs `requiredKey`: zod infers a required `z.nullable` key as optional
     * under `strictNullChecks: false`. See that helper for why. `null` here means
     * the original response genuinely had no body, which is a different claim from
     * the field being absent, so the distinction has to survive.
     */
    const responseSchema = z.looseObject({
        /**
         * See {@link Response.status}. An HTTP status code, so the accepted range is
         * 100 to 599; a value outside it did not come from a response.
         */
        status: z.int().min(100).max(599),
        /**
         * See {@link Response.body}.
         */
        body: requiredKey(z.string().nullable(), 'Expected a response body string or null'),
        /**
         * See {@link Response.truncated}.
         */
        truncated: z.boolean(),
    });
    /**
     * Runtime schema producing {@link Interface}.
     *
     * {@link Interface.state} and {@link Interface.requestHash} are **required**,
     * departing from this package's usual optional-by-default convention for
     * stored documents. That is deliberate: both are load-bearing for the decision
     * this record exists to make, and a caller handed a record with an absent state
     * will reach for a `?? 'failed'`-shaped default, which is precisely how a paid
     * request gets executed twice.
     *
     * Unknown keys are preserved, so a record written by a newer service — one that
     * has begun storing a field this version does not declare — survives a parse
     * and a write-back intact.
     */
    Idempotency.Schema = z.looseObject({
        ...baseFirestoreShape,
        /**
         * See {@link Interface.state}. Validated against {@link State}.
         */
        state: z.enum(State),
        /**
         * See {@link Interface.requestHash}.
         */
        requestHash: nonEmptyString().max(512),
        /**
         * See {@link Interface.ownerToken}.
         */
        ownerToken: token().optional(),
        /**
         * See {@link Interface.attempts}.
         */
        attempts: counter().optional(),
        /**
         * See {@link Interface.progress}.
         */
        progress: z.record(z.string(), z.unknown()).optional(),
        /**
         * See {@link Interface.response}.
         */
        response: responseSchema.optional(),
        /**
         * See {@link Interface.lockExpires}.
         */
        lockExpires: timestampLike().optional(),
    });
    /**
     * Validates untrusted data as an idempotency record without throwing.
     *
     * @param {unknown} value - Untrusted value, typically the raw data of a stored idempotency document.
     * @return {ParseResult<Interface>} Success carrying the typed record, or failure carrying the reasons.
     */
    Idempotency.safeParse = (value) => parseResult(Idempotency.Schema, value, 'Idempotency.Interface');
    /**
     * Validates untrusted data as an idempotency record, throwing when it does not
     * conform.
     *
     * @param {unknown} value - Untrusted value, typically the raw data of a stored idempotency document.
     * @return {Interface} The validated record.
     * @throws {ParseError} When the value does not conform to {@link Schema}.
     */
    Idempotency.parse = (value) => parseOrThrow(Idempotency.Schema, value, 'Idempotency.Interface');
})(Idempotency || (Idempotency = {}));
