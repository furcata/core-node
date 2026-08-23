/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */
import { z } from 'zod';
import { BaseFirestore } from '../interface/base_db.js';
import { AssertSchemaOutput, ParseResult } from '../interface/schema.js';
/**
 * Namespace for message-usage records: the per-period watermark of message
 * volume that has been reported for billing, and the marker that says a period
 * needs re-reading.
 *
 * The shape is a **watermark, not a running total**. Everything downstream adds
 * a delta to a period sum, so the value that matters is how far the period has
 * already been reported, and the amount to report is the difference between what
 * is now observed and that watermark. Reading the watermark as a total, or
 * defaulting an absent one to zero when it was merely unreadable, re-reports the
 * whole period.
 */
export declare namespace MessageUsage {
    /**
     * A delta that has been computed and handed to the billing provider but whose
     * acknowledgement has not yet been recorded.
     *
     * Its presence is what makes a retry safe: a retry that finds this block
     * re-sends the same identified delta rather than computing a fresh one from a
     * watermark that may or may not have moved.
     */
    interface Pending {
        /**
         * Stable identifier for this specific cumulative transition.
         *
         * Derived from the period rather than from the delivery, so two attempts to
         * report the same transition carry the same identifier and the provider can
         * recognise the second as a repeat. A per-delivery identifier would make each
         * retry a new addition to the period sum, which is the failure this field
         * exists to prevent.
         */
        identifier: string;
        /**
         * Watermark this transition starts from.
         */
        from: number;
        /**
         * Watermark this transition moves to.
         */
        to: number;
        /**
         * The amount being reported, equal to `to` minus `from`.
         *
         * Stored rather than recomputed so that a retry reports exactly what the
         * first attempt reported, even if the observed volume has moved since.
         */
        delta: number;
        /**
         * When the first attempt at this transition was made, used to decide when a
         * pending block has been outstanding long enough to warrant attention.
         */
        firstAttemptedAt?: unknown;
    }
    /**
     * Firestore document shape for a message-usage record.
     *
     * Extends {@link BaseFirestore} for standard auditing fields.
     *
     * The same shape covers two closely related documents: a *dirty marker*, which
     * carries only {@link Interface.period} and {@link Interface.token} to say that
     * a period must be re-read, and a *settled record*, which additionally carries
     * {@link Interface.reported} and possibly {@link Interface.pending}. That is
     * why only the first two fields are required.
     */
    interface Interface extends BaseFirestore {
        /**
         * The closed UTC day this record accounts for, as `YYYY-MM-DD`.
         *
         * UTC, and a *closed* day: a period that is still open would be re-reported
         * as more messages arrived. The format is a closed grammar and is validated
         * as one, because a malformed period is not a period that sorts oddly — it is
         * a period that silently accumulates its own separate sum.
         */
        period: string;
        /**
         * Generation token for this record, replaced whenever the record is
         * superseded.
         *
         * A clear or settle operation must find the token it captured still in place,
         * which is what stops a slow operation from clearing a marker that a newer
         * one has since written. Required: a marker with no token cannot be cleared
         * safely and will be re-processed forever.
         */
        token: string;
        /**
         * Volume already reported for {@link Interface.period}: the watermark.
         *
         * Absent means nothing has been reported for the period yet. It does **not**
         * mean zero has been reported, and collapsing the two with `?? 0` is only
         * harmless when the read genuinely succeeded — which is exactly the case a
         * caller cannot distinguish without validating first.
         */
        reported?: number | null;
        /**
         * An in-flight report awaiting acknowledgement; see {@link Pending}.
         *
         * Absent means there is nothing outstanding. Present means a delta has been
         * handed to the provider, and it must be re-sent verbatim rather than
         * recomputed.
         */
        pending?: Pending | null;
    }
    /**
     * Runtime schema producing {@link Interface}.
     *
     * {@link Interface.period} is validated against a fixed `YYYY-MM-DD` pattern
     * rather than accepted as any string. The pattern is genuinely closed, and a
     * period that does not match is not a cosmetic problem: periods are compared as
     * strings and used as document identifiers, so a differently formatted one
     * neither sorts nor collides with the period it was meant to be, and quietly
     * starts a second sum for the same day.
     *
     * Unknown keys are preserved, so a record written by a newer service keeps the
     * fields this version does not declare.
     */
    const Schema: z.ZodObject<{
        period: z.ZodString;
        token: z.ZodString;
        reported: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        pending: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            identifier: z.ZodString;
            from: z.ZodNumber;
            to: z.ZodNumber;
            delta: z.ZodNumber;
            firstAttemptedAt: z.ZodOptional<z.ZodType<string | number | import("../interface/schema.js").TimestampLike | Date, unknown, z.core.$ZodTypeInternals<string | number | import("../interface/schema.js").TimestampLike | Date, unknown>>>;
        }, z.core.$loose>>>;
        id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        backup: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
        created: z.ZodOptional<z.ZodType<string | number | import("../interface/schema.js").TimestampLike | Date, unknown, z.core.$ZodTypeInternals<string | number | import("../interface/schema.js").TimestampLike | Date, unknown>>>;
        updated: z.ZodOptional<z.ZodType<string | number | import("../interface/schema.js").TimestampLike | Date, unknown, z.core.$ZodTypeInternals<string | number | import("../interface/schema.js").TimestampLike | Date, unknown>>>;
        expiry: z.ZodOptional<z.ZodType<string | number | import("../interface/schema.js").TimestampLike | Date, unknown, z.core.$ZodTypeInternals<string | number | import("../interface/schema.js").TimestampLike | Date, unknown>>>;
    }, z.core.$loose>;
    /**
     * Compile-time proof that {@link Schema} produces {@link Interface}.
     */
    type SchemaOutput = AssertSchemaOutput<z.infer<typeof Schema>, Interface>;
    /**
     * Validates untrusted data as a message-usage record without throwing.
     *
     * @param {unknown} value - Untrusted value, typically the raw data of a stored usage document.
     * @return {ParseResult<Interface>} Success carrying the typed record, or failure carrying the reasons.
     */
    const safeParse: (value: unknown) => ParseResult<Interface>;
    /**
     * Validates untrusted data as a message-usage record, throwing when it does not
     * conform.
     *
     * @param {unknown} value - Untrusted value, typically the raw data of a stored usage document.
     * @return {Interface} The validated record.
     * @throws {ParseError} When the value does not conform to {@link Schema}.
     */
    const parse: (value: unknown) => Interface;
}
