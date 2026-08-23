/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */
import { z } from 'zod';
import { baseFirestoreShape } from '../interface/base_db.js';
import { auditTimestamp, nonEmptyString, nonNegativeNumber, parseOrThrow, parseResult, token, } from '../interface/schema.js';
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
export var MessageUsage;
(function (MessageUsage) {
    /**
     * Schema for {@link Pending}.
     */
    const pendingSchema = z.looseObject({
        /**
         * See {@link Pending.identifier}.
         */
        identifier: nonEmptyString().max(512),
        /**
         * See {@link Pending.from}.
         */
        from: nonNegativeNumber(),
        /**
         * See {@link Pending.to}.
         */
        to: nonNegativeNumber(),
        /**
         * See {@link Pending.delta}.
         */
        delta: nonNegativeNumber(),
        /**
         * See {@link Pending.firstAttemptedAt}.
         */
        firstAttemptedAt: auditTimestamp().optional(),
    });
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
    MessageUsage.Schema = z.looseObject({
        ...baseFirestoreShape,
        /**
         * See {@link Interface.period}. A closed UTC day in `YYYY-MM-DD` form. The
         * pattern constrains the shape only; whether the value names a real calendar
         * day is the writer's to guarantee.
         */
        period: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { error: 'Expected a closed UTC day in YYYY-MM-DD form' }),
        /**
         * See {@link Interface.token}.
         */
        token: token(),
        /**
         * See {@link Interface.reported}. A watermark, so it never decreases and is
         * never negative.
         */
        reported: nonNegativeNumber().nullish(),
        /**
         * See {@link Interface.pending}.
         */
        pending: pendingSchema.nullish(),
    });
    /**
     * Validates untrusted data as a message-usage record without throwing.
     *
     * @param {unknown} value - Untrusted value, typically the raw data of a stored usage document.
     * @return {ParseResult<Interface>} Success carrying the typed record, or failure carrying the reasons.
     */
    MessageUsage.safeParse = (value) => parseResult(MessageUsage.Schema, value, 'MessageUsage.Interface');
    /**
     * Validates untrusted data as a message-usage record, throwing when it does not
     * conform.
     *
     * @param {unknown} value - Untrusted value, typically the raw data of a stored usage document.
     * @return {Interface} The validated record.
     * @throws {ParseError} When the value does not conform to {@link Schema}.
     */
    MessageUsage.parse = (value) => parseOrThrow(MessageUsage.Schema, value, 'MessageUsage.Interface');
})(MessageUsage || (MessageUsage = {}));
