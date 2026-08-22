/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */
import { z } from 'zod';
import { AssertSchemaOutput, ParseResult } from '../interface/schema.js';
/**
 * Namespace for short-lived registration reservations: a provisional claim on a
 * place that has not yet been paid for.
 *
 * A reservation is stored as an element of an array on its parent document
 * rather than as a document of its own, so it does not extend
 * {@link BaseFirestore} and carries no auditing fields. Every field is
 * load-bearing and all three are required — an element missing any of them
 * cannot be matched, released, or expired, and is simply an entry that occupies
 * a place forever.
 */
export declare namespace Reservation {
    /**
     * Shape of a single reservation entry.
     */
    interface Interface {
        /**
         * Opaque token identifying this specific reservation.
         *
         * Presented back when releasing, so that a caller can only release the
         * reservation it holds rather than whichever one happens to occupy the slot.
         */
        token: string;
        /**
         * Stable identity of the holder this reservation is being held for.
         *
         * Distinct from {@link Interface.token}: the token identifies the *claim* and
         * changes when the claim is refreshed, while the identity identifies *who* it
         * is held for and does not.
         */
        identity: string;
        /**
         * Instant at which this reservation lapses, as Unix epoch **milliseconds**.
         *
         * 🔴 **Milliseconds, not seconds** — and note that {@link Capacity.Interface}
         * declares a field of the same name in **seconds**. A field name is not a
         * unit, and these two are three orders of magnitude apart. A seconds value
         * stored here reads as an instant in January 1970, which is always in the
         * past, so every reservation carrying one is treated as already expired and
         * released the moment it is created. {@link Schema} rejects such a value
         * rather than accepting it: its accepted range is disjoint from the
         * epoch-seconds range used by {@link Capacity.Interface.expiresAt}.
         */
        expiresAt: number;
    }
    /**
     * Runtime schema producing {@link Interface}.
     *
     * All three fields are required, which is the whole point: the service that
     * reads these entries already filters out any element failing exactly this
     * check, and expressing it once here means every consumer inherits it instead
     * of reimplementing it — or, more likely, not reimplementing it.
     *
     * Unknown keys are preserved rather than dropped, so an entry written by a
     * newer service is not silently stripped when an older one rewrites the array.
     */
    const Schema: z.ZodObject<{
        token: z.ZodString;
        identity: z.ZodString;
        expiresAt: z.ZodNumber;
    }, z.core.$loose>;
    /**
     * Compile-time proof that {@link Schema} produces {@link Interface}.
     */
    type SchemaOutput = AssertSchemaOutput<z.infer<typeof Schema>, Interface>;
    /**
     * Reports whether a reservation is still live at a given instant.
     *
     * Provided so that the expiry comparison — the one place the millisecond unit
     * actually matters — has a single implementation rather than one per caller.
     *
     * @param {Interface} reservation - A reservation that has already been validated by {@link parse} or {@link safeParse}.
     * @param {number} now - Current instant as Unix epoch milliseconds; defaults to `Date.now()`.
     * @return {boolean} `true` when the reservation has not yet lapsed.
     */
    const isActive: (reservation: Interface, now?: number) => boolean;
    /**
     * Validates untrusted data as a reservation entry without throwing.
     *
     * This is the form to use when filtering a stored array: one malformed entry
     * should drop that entry, not abort the read of every other reservation
     * alongside it.
     *
     * @param {unknown} value - Untrusted value, typically one element of a stored reservations array.
     * @return {ParseResult<Interface>} Success carrying the typed reservation, or failure carrying the reasons.
     */
    const safeParse: (value: unknown) => ParseResult<Interface>;
    /**
     * Validates untrusted data as a reservation entry, throwing when it does not
     * conform.
     *
     * @param {unknown} value - Untrusted value, typically one element of a stored reservations array.
     * @return {Interface} The validated reservation.
     * @throws {ParseError} When the value does not conform to {@link Schema}.
     */
    const parse: (value: unknown) => Interface;
}
