/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */
import { z } from 'zod';
import { baseFirestoreShape } from '../interface/base_db.js';
import { documentId, nonEmptyString, parseOrThrow, parseResult, token, } from '../interface/schema.js';
import { Price } from './Price.js';
/**
 * Namespace for entitlement records: what a settled purchase actually confers,
 * and the durable claim that stops it being conferred twice.
 *
 * Every coordinate on an entitlement is a document path, and each one is
 * server-derived rather than caller-supplied. That distinction is the reason
 * this shape is worth validating: the fields look like ordinary identifiers, but
 * an entitlement assembled from unvalidated input grants access to whichever
 * documents the input named.
 */
export var Entitlement;
(function (Entitlement) {
    /**
     * Processing state of an entitlement claim.
     *
     * A second delivery of the same purchase event is arbitrated on this value, so
     * an unrecognised state falls through every comparison and the entitlement is
     * granted again. That is why {@link Interface.status} is validated against this
     * enum rather than asserted into it.
     */
    let Status;
    (function (Status) {
        /**
         * A delivery holds the claim and is granting the entitlement now. A second
         * delivery arriving in this state must back off rather than proceed.
         */
        Status["processing"] = "processing";
        /**
         * The entitlement was granted. A second delivery is a replay and must do
         * nothing.
         */
        Status["complete"] = "complete";
        /**
         * The attempt failed and the claim may be taken again.
         */
        Status["failed"] = "failed";
    })(Status = Entitlement.Status || (Entitlement.Status = {}));
    /**
     * Runtime schema producing {@link Interface}.
     *
     * The five coordinates that identify *what is being granted to whom* are
     * **required**, departing from this package's usual optional-by-default
     * convention for stored documents. That is the point of the shape: an
     * entitlement is a set of document paths, and a partially populated one does
     * not describe a smaller grant, it describes a grant that resolves against
     * whatever a caller substitutes for the missing coordinate.
     *
     * Unknown keys are preserved, so a record written by a newer service keeps the
     * fields this version does not declare.
     */
    Entitlement.Schema = z.looseObject({
        ...baseFirestoreShape,
        /**
         * See {@link Interface.account}.
         */
        account: documentId(),
        /**
         * See {@link Interface.uid}.
         */
        uid: nonEmptyString().max(256),
        /**
         * See {@link Interface.price}.
         */
        price: documentId(),
        /**
         * See {@link Interface.source}.
         */
        source: documentId(),
        /**
         * See {@link Interface.type}. Validated against {@link Price.Type}, so an
         * unrecognised category is rejected instead of being asserted into the enum
         * and then used to name a collection that does not exist.
         */
        type: z.enum(Price.Type),
        /**
         * See {@link Interface.status}. Validated against {@link Status}.
         */
        status: z.enum(Status).nullish(),
        /**
         * See {@link Interface.entitlement}.
         */
        entitlement: nonEmptyString().max(512).nullish(),
        /**
         * See {@link Interface.ownerToken}.
         */
        ownerToken: token().nullish(),
    });
    /**
     * Validates untrusted data as an entitlement record without throwing.
     *
     * @param {unknown} value - Untrusted value, typically the raw data of a stored entitlement document.
     * @return {ParseResult<Interface>} Success carrying the typed entitlement, or failure carrying the reasons.
     */
    Entitlement.safeParse = (value) => parseResult(Entitlement.Schema, value, 'Entitlement.Interface');
    /**
     * Validates untrusted data as an entitlement record, throwing when it does not
     * conform.
     *
     * @param {unknown} value - Untrusted value, typically the raw data of a stored entitlement document.
     * @return {Interface} The validated entitlement.
     * @throws {ParseError} When the value does not conform to {@link Schema}.
     */
    Entitlement.parse = (value) => parseOrThrow(Entitlement.Schema, value, 'Entitlement.Interface');
})(Entitlement || (Entitlement = {}));
