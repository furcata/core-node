/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */
import { z } from 'zod';
import { BaseFirestore } from '../interface/base_db.js';
import { AssertSchemaOutput, ParseResult, TimestampLike } from '../interface/schema.js';
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
export declare namespace Idempotency {
    /**
     * Lifecycle state of an idempotency record.
     *
     * The state decides what happens to a second delivery of the same request, so
     * an unrecognised value is not a cosmetic mislabelling: it falls through every
     * comparison and the request runs a second time. That is why
     * {@link Interface.state} is validated against this enum rather than asserted
     * into it.
     */
    enum State {
        /**
         * A holder is executing the request right now. A second delivery arriving in
         * this state must be told to retry rather than allowed to proceed, unless the
         * holder's lease has already lapsed.
         */
        inProgress = "in_progress",
        /**
         * The request finished and {@link Interface.response} holds the original
         * outcome for replay. A second delivery is answered from the record and the
         * work is not repeated.
         */
        completed = "completed",
        /**
         * The request failed and the key may be reclaimed by a later attempt.
         */
        failed = "failed"
    }
    /**
     * The response captured when a request completed, replayed verbatim to any
     * later delivery of the same key.
     */
    interface Response {
        /**
         * HTTP status code the original attempt returned.
         */
        status: number;
        /**
         * Serialized response body, or `null` when the original response had no body
         * or its body was too large to store. `null` rather than absent, so the
         * distinction survives a JSON round-trip.
         */
        body: string | null;
        /**
         * When `true`, the body was dropped for exceeding the stored-response size
         * limit and this record is **not** replayable. Re-running the work to
         * reproduce a large response would be the more dangerous option, so a
         * truncated record is surfaced as a failure to the caller instead.
         */
        truncated: boolean;
    }
    /**
     * Firestore document shape for a single idempotency claim.
     *
     * Extends {@link BaseFirestore} for standard auditing fields.
     */
    interface Interface extends BaseFirestore {
        /**
         * Current lifecycle state; see {@link State} for accepted values. Required,
         * because a record whose state cannot be read is a record that cannot decide
         * whether the request may run.
         */
        state: State;
        /**
         * Digest of the canonicalised request payload, used to detect a key that has
         * been reused with a different body.
         *
         * Opaque: it is only ever compared for equality, never parsed, so its exact
         * encoding is not part of this contract.
         */
        requestHash: string;
        /**
         * Token identifying the holder of the current lease.
         *
         * A later attempt must present the same token to complete or fail the claim,
         * which is what stops a process that lost its lease from writing the outcome
         * of work another process has since redone. Absent once the record has
         * settled.
         */
        ownerToken?: string;
        /**
         * Number of times this key has been claimed, including the first.
         *
         * Increments each time a lapsed lease is reclaimed, so a value climbing
         * without the record settling indicates a handler that keeps dying mid-flight.
         */
        attempts?: number;
        /**
         * Durable, operation-specific checkpoints retained across failed attempts and
         * lease reclaims, so a retried handler can skip work that already succeeded.
         *
         * Server-authored, and keyed by a stable child-operation name. Absent means
         * no checkpoint has been recorded yet, which is not the same as the operation
         * having no steps.
         */
        progress?: Record<string, unknown>;
        /**
         * Outcome of the original attempt, present only once
         * {@link Interface.state} is {@link State.completed}.
         */
        response?: Response;
        /**
         * Instant at which the current holder's lease lapses, after which another
         * attempt may reclaim the key.
         *
         * A Firestore timestamp rather than a number, because it is compared against
         * server time. Distinct from {@link BaseFirestore.expiry}, which governs how
         * long the settled record is retained: a lapsed lease frees the key for
         * another attempt, while a lapsed expiry deletes the record entirely and
         * frees it for replay.
         */
        lockExpires?: TimestampLike;
    }
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
    const Schema: z.ZodObject<{
        state: z.ZodEnum<typeof State>;
        requestHash: z.ZodString;
        ownerToken: z.ZodOptional<z.ZodString>;
        attempts: z.ZodOptional<z.ZodNumber>;
        progress: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        response: z.ZodOptional<z.ZodObject<{
            status: z.ZodInt;
            body: z.ZodCustom<string, string>;
            truncated: z.ZodBoolean;
        }, z.core.$loose>>;
        lockExpires: z.ZodOptional<z.ZodType<TimestampLike, TimestampLike, z.core.$ZodTypeInternals<TimestampLike, TimestampLike>>>;
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
     * Validates untrusted data as an idempotency record without throwing.
     *
     * @param {unknown} value - Untrusted value, typically the raw data of a stored idempotency document.
     * @return {ParseResult<Interface>} Success carrying the typed record, or failure carrying the reasons.
     */
    const safeParse: (value: unknown) => ParseResult<Interface>;
    /**
     * Validates untrusted data as an idempotency record, throwing when it does not
     * conform.
     *
     * @param {unknown} value - Untrusted value, typically the raw data of a stored idempotency document.
     * @return {Interface} The validated record.
     * @throws {ParseError} When the value does not conform to {@link Schema}.
     */
    const parse: (value: unknown) => Interface;
}
