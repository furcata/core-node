/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */
import { z } from 'zod';
import { counter, openValue, parseOrThrow, parseResult } from './schema.js';
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
export const messageQueueShape = {
    /**
     * See {@link MessageQueue.pending}.
     */
    pending: counter().optional(),
    /**
     * See {@link MessageQueue.ready}.
     */
    ready: counter().optional(),
    /**
     * See {@link MessageQueue.sender}.
     */
    sender: counter().optional(),
    /**
     * See {@link MessageQueue.sending}.
     */
    sending: counter().optional(),
    /**
     * See {@link MessageQueue.counted}. Deliberately open: the field is declared
     * as an arbitrary diagnostic snapshot and constraining it here would narrow a
     * published type.
     */
    counted: openValue(),
};
/**
 * Runtime schema producing {@link MessageQueue}.
 *
 * Unknown keys are preserved rather than dropped, so parsing a queue fragment
 * out of a larger account document and writing it back cannot silently delete
 * the fields the schema does not name.
 */
export const MessageQueueSchema = z.looseObject(messageQueueShape);
/**
 * Validates untrusted data as a {@link MessageQueue} without throwing.
 *
 * @param {unknown} value - Untrusted value, typically the queue fields of a stored account document.
 * @return {ParseResult<MessageQueue>} Success carrying the typed counters, or failure carrying the reasons.
 */
export const safeParseMessageQueue = (value) => parseResult(MessageQueueSchema, value, 'MessageQueue');
/**
 * Validates untrusted data as a {@link MessageQueue}, throwing when it does not
 * conform.
 *
 * @param {unknown} value - Untrusted value, typically the queue fields of a stored account document.
 * @return {MessageQueue} The validated counters.
 * @throws {ParseError} When the value does not conform to {@link MessageQueueSchema}.
 */
export const parseMessageQueue = (value) => parseOrThrow(MessageQueueSchema, value, 'MessageQueue');
