/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */
import { z } from 'zod';
import { epochMillis, nonEmptyString, parseOrThrow, parseResult, token, } from '../interface/schema.js';
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
export var Reservation;
(function (Reservation) {
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
    Reservation.Schema = z.looseObject({
        /**
         * See {@link Interface.token}.
         */
        token: token(),
        /**
         * See {@link Interface.identity}.
         */
        identity: nonEmptyString().max(256),
        /**
         * See {@link Interface.expiresAt}. Epoch **milliseconds**; a seconds value is
         * rejected rather than read as 1970.
         */
        expiresAt: epochMillis(),
    });
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
    Reservation.isActive = (reservation, now = Date.now()) => reservation.expiresAt > now;
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
    Reservation.safeParse = (value) => parseResult(Reservation.Schema, value, 'Reservation.Interface');
    /**
     * Validates untrusted data as a reservation entry, throwing when it does not
     * conform.
     *
     * @param {unknown} value - Untrusted value, typically one element of a stored reservations array.
     * @return {Interface} The validated reservation.
     * @throws {ParseError} When the value does not conform to {@link Schema}.
     */
    Reservation.parse = (value) => parseOrThrow(Reservation.Schema, value, 'Reservation.Interface');
})(Reservation || (Reservation = {}));
