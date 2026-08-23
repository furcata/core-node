/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */
import { z } from 'zod';
import { AssertSchemaOutput, ParseResult } from './schema.js';
/**
 * Tracks the state counters for a messaging queue attached to an account.
 *
 * These counters are maintained by Cloud Functions as messages move through
 * each stage of the delivery pipeline (pending → ready → sending → sent).
 * Reading these values allows the UI and backend to display progress without
 * querying individual message documents.
 */
export interface MessageQueue {
    /**
     * Number of messages that have been created but not yet validated or approved
     * for sending.
     */
    pending?: number | null;
    /**
     * Number of messages that have passed validation and are ready to be picked
     * up by the sender worker.
     */
    ready?: number | null;
    /**
     * Number of messages currently assigned to a sender worker for processing.
     */
    sender?: number | null;
    /**
     * Number of messages actively being transmitted to the downstream messaging
     * provider (e.g., Twilio).
     */
    sending?: number | null;
    /**
     * Arbitrary snapshot or metadata captured at the time the queue was last
     * counted; used for auditing and diagnostics.
     */
    counted?: any;
}
/**
 * Field schemas for {@link MessageQueue}, exported as a raw shape so that
 * {@link Account}'s document schema can spread it rather than restating the
 * counters and letting the two copies drift.
 *
 * Every counter is validated as a non-negative safe integer. A queue counter is
 * the product of an increment applied to whatever was already stored, so a
 * fractional or negative value is evidence that the increment was applied to
 * something that was never a counter — a condition worth failing on rather than
 * carrying forward into a limit check.
 */
export declare const messageQueueShape: {
    /**
     * See {@link MessageQueue.pending}.
     */
    pending: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    /**
     * See {@link MessageQueue.ready}.
     */
    ready: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    /**
     * See {@link MessageQueue.sender}.
     */
    sender: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    /**
     * See {@link MessageQueue.sending}.
     */
    sending: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    /**
     * See {@link MessageQueue.counted}. Deliberately open: the field is declared
     * as an arbitrary diagnostic snapshot and constraining it here would narrow a
     * published type.
     */
    counted: z.ZodOptional<z.ZodUnknown>;
};
/**
 * Runtime schema producing {@link MessageQueue}.
 *
 * Unknown keys are preserved rather than dropped, so parsing a queue fragment
 * out of a larger account document and writing it back cannot silently delete
 * the fields the schema does not name.
 */
export declare const MessageQueueSchema: z.ZodObject<{
    pending: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    ready: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    sender: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    sending: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    counted: z.ZodOptional<z.ZodUnknown>;
}, z.core.$loose>;
/**
 * Compile-time proof that {@link MessageQueueSchema} produces
 * {@link MessageQueue}.
 */
export type MessageQueueSchemaOutput = AssertSchemaOutput<z.infer<typeof MessageQueueSchema>, MessageQueue>;
/**
 * Validates untrusted data as a {@link MessageQueue} without throwing.
 *
 * @param {unknown} value - Untrusted value, typically the queue fields of a stored account document.
 * @return {ParseResult<MessageQueue>} Success carrying the typed counters, or failure carrying the reasons.
 */
export declare const safeParseMessageQueue: (value: unknown) => ParseResult<MessageQueue>;
/**
 * Validates untrusted data as a {@link MessageQueue}, throwing when it does not
 * conform.
 *
 * @param {unknown} value - Untrusted value, typically the queue fields of a stored account document.
 * @return {MessageQueue} The validated counters.
 * @throws {ParseError} When the value does not conform to {@link MessageQueueSchema}.
 */
export declare const parseMessageQueue: (value: unknown) => MessageQueue;
