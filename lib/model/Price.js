/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */
import { z } from 'zod';
import { baseFirestoreShape } from '../interface/base_db.js';
import { counter, documentId, finiteNumber, nonEmptyString, parseOrThrow, parseResult, } from '../interface/schema.js';
/**
 * Namespace for price models that represent purchasable items (event tickets,
 * products) stored in Firestore and backed by Stripe price records.
 *
 * Cloud Functions reference `Price.Interface` documents during checkout flows
 * to validate amounts, enforce participant limits, and record payment
 * confirmation metadata.
 */
export var Price;
(function (Price) {
    /**
     * Classifies the kind of item associated with this price.
     *
     * Cloud Functions use this value to route post-payment logic (e.g., adding
     * the buyer to an event's `users` list vs. fulfilling a product order).
     */
    let Type;
    (function (Type) {
        Type["event"] = "event";
        Type["product"] = "product";
    })(Type = Price.Type || (Price.Type = {}));
    /**
     * Controls who can discover and access this price record.
     *
     * Cloud Functions and API handlers enforce this visibility during listing
     * and checkout operations.
     */
    let Visibility;
    (function (Visibility) {
        Visibility["public"] = "public";
        Visibility["private"] = "private";
        Visibility["unlisted"] = "unlisted";
    })(Visibility = Price.Visibility || (Price.Visibility = {}));
    /**
     * Runtime schema producing {@link Interface}.
     *
     * This is the parse boundary for a price document. It exists because
     * `data['amount'] as number` is not a check — it is a suppressed diagnostic,
     * and a price whose amount arrives as a string then becomes `NaN` at the first
     * arithmetic operation and compares `false` against every limit it is tested
     * against, without anything throwing.
     *
     * Unknown keys are **preserved**, matching the `[x: string]: any` index
     * signature inherited from {@link BaseFirestore}: a stripping schema would
     * delete unrecognised fields on a read-modify-write, and a strict one would
     * reject documents written before this schema existed.
     */
    Price.Schema = z.looseObject({
        ...baseFirestoreShape,
        /**
         * See {@link Interface.account}. Required, because a price that belongs to
         * no account cannot be authorised against anything.
         */
        account: documentId(),
        /**
         * See {@link Interface.amount}. Rejected rather than coerced when it is not
         * a finite number: this field is money, and a silent `NaN` is the defect
         * this schema exists to stop.
         */
        amount: finiteNumber().optional(),
        /**
         * See {@link Interface.currency}. Constrained to a three-letter ISO 4217
         * code, which is a genuinely closed grammar rather than a convention.
         */
        currency: z.string().regex(/^[A-Za-z]{3}$/, { error: 'Expected a three-letter ISO 4217 currency code' }).optional(),
        /**
         * See {@link Interface.source}.
         */
        source: documentId().optional(),
        /**
         * See {@link Interface.image}.
         */
        image: nonEmptyString().optional(),
        /**
         * See {@link Interface.label}.
         */
        label: z.string().optional(),
        /**
         * See {@link Interface.description}.
         */
        description: z.string().optional(),
        /**
         * See {@link Interface.limit}. Absent means unlimited; a present value is a
         * whole number of buyers, so a fractional limit is rejected.
         */
        limit: counter().optional(),
        /**
         * See {@link Interface.type}. Validated against {@link Type} rather than
         * asserted into it, so an unrecognised item category fails here instead of
         * routing post-payment logic down the wrong branch.
         */
        type: z.enum(Type).optional(),
        /**
         * See {@link Interface.uid}. Explicitly nullable: `null` means publicly
         * purchasable and must survive a JSON round-trip, which `undefined` would
         * not.
         */
        uid: z.string().nullable().optional(),
        /**
         * See {@link Interface.users}.
         */
        users: z.array(z.string()).optional(),
        /**
         * See {@link Interface.visibility}. Validated against {@link Visibility},
         * so an unrecognised value cannot widen access by failing an equality check
         * against `private`.
         */
        visibility: z.enum(Visibility).optional(),
        /**
         * See {@link Interface.clicks}.
         */
        clicks: counter().optional(),
        /**
         * See {@link Interface.views}.
         */
        views: counter().optional(),
        /**
         * See {@link Interface.checkout}.
         */
        checkout: counter().optional(),
        /**
         * See {@link Interface.booked}.
         */
        booked: counter().optional(),
    });
    /**
     * Validates untrusted data as a price document without throwing.
     *
     * Use this where a malformed stored document is an expected condition to be
     * handled rather than an abort — a sweep, a migration, a queue consumer.
     *
     * @param {unknown} value - Untrusted value, typically the raw data of a stored price document.
     * @return {ParseResult<Interface>} Success carrying the typed price, or failure carrying the reasons.
     */
    Price.safeParse = (value) => parseResult(Price.Schema, value, 'Price.Interface');
    /**
     * Validates untrusted data as a price document, throwing when it does not
     * conform.
     *
     * Use this on a checkout or transaction path, where continuing with an
     * unvalidated price is never the correct outcome.
     *
     * @param {unknown} value - Untrusted value, typically the raw data of a stored price document.
     * @return {Interface} The validated price document.
     * @throws {ParseError} When the value does not conform to {@link Schema}.
     */
    Price.parse = (value) => parseOrThrow(Price.Schema, value, 'Price.Interface');
})(Price || (Price = {}));
