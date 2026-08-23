/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */
import { z } from 'zod';
import { baseFirestoreShape } from '../interface/base_db.js';
import { finiteNumber, nonEmptyString, nonNegativeNumber, parseOrThrow, parseResult, } from '../interface/schema.js';
/**
 * Namespace for spend-ledger records: the server-authored accounting of metered
 * consumption against an allowance.
 *
 * A ledger document is the shape a quota decision is made from, which is what
 * makes reading one through an unchecked cast expensive rather than merely
 * untidy. `Number(data['amount'] ?? 0)` turns a malformed amount into `0` and a
 * non-numeric one into `NaN`; the first under-charges silently, and the second
 * loses **every** comparison it is subsequently used in, so an allowance check
 * written correctly still passes. This namespace exists so that neither value
 * can reach the check.
 *
 * These documents are **server-authored**. A client that could write one could
 * mint spend.
 */
export var Ledger;
(function (Ledger) {
    /**
     * Runtime schema producing {@link Interface}.
     *
     * {@link Interface.service}, {@link Interface.scope} and
     * {@link Interface.amount} are **required**, departing from this package's
     * usual optional-by-default convention for stored documents. A ledger record
     * missing any of the three is not a sparse record, it is a record that cannot
     * be applied to a balance, and the alternative to failing here is a caller
     * defaulting it to zero.
     *
     * Unknown keys are preserved, so a record written by a newer service keeps the
     * fields this version does not declare.
     */
    Ledger.Schema = z.looseObject({
        ...baseFirestoreShape,
        /**
         * See {@link Interface.service}.
         */
        service: nonEmptyString().max(128),
        /**
         * See {@link Interface.scope}.
         */
        scope: nonEmptyString().max(256),
        /**
         * See {@link Interface.amount}. Money: rejected, never coerced.
         */
        amount: finiteNumber(),
        /**
         * See {@link Interface.consumed}.
         */
        consumed: nonNegativeNumber().nullish(),
        /**
         * See {@link Interface.limit}.
         */
        limit: nonNegativeNumber().nullish(),
        /**
         * See {@link Interface.spendConfirmed}.
         */
        spendConfirmed: z.boolean().nullish(),
    });
    /**
     * Validates untrusted data as a ledger record without throwing.
     *
     * @param {unknown} value - Untrusted value, typically the raw data of a stored ledger document.
     * @return {ParseResult<Interface>} Success carrying the typed record, or failure carrying the reasons.
     */
    Ledger.safeParse = (value) => parseResult(Ledger.Schema, value, 'Ledger.Interface');
    /**
     * Validates untrusted data as a ledger record, throwing when it does not
     * conform.
     *
     * @param {unknown} value - Untrusted value, typically the raw data of a stored ledger document.
     * @return {Interface} The validated record.
     * @throws {ParseError} When the value does not conform to {@link Schema}.
     */
    Ledger.parse = (value) => parseOrThrow(Ledger.Schema, value, 'Ledger.Interface');
})(Ledger || (Ledger = {}));
