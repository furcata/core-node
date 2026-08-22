/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */
import { z } from 'zod';
import { BaseFirestore } from '../interface/base_db.js';
import { AssertSchemaOutput, ParseResult } from '../interface/schema.js';
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
export declare namespace Entitlement {
    /**
     * Processing state of an entitlement claim.
     *
     * A second delivery of the same purchase event is arbitrated on this value, so
     * an unrecognised state falls through every comparison and the entitlement is
     * granted again. That is why {@link Interface.status} is validated against this
     * enum rather than asserted into it.
     */
    enum Status {
        /**
         * A delivery holds the claim and is granting the entitlement now. A second
         * delivery arriving in this state must back off rather than proceed.
         */
        processing = "processing",
        /**
         * The entitlement was granted. A second delivery is a replay and must do
         * nothing.
         */
        complete = "complete",
        /**
         * The attempt failed and the claim may be taken again.
         */
        failed = "failed"
    }
    /**
     * Firestore document shape for a single entitlement record.
     *
     * Extends {@link BaseFirestore} for standard auditing fields.
     */
    interface Interface extends BaseFirestore {
        /**
         * Firestore document ID of the account the entitlement belongs to.
         *
         * Required: an entitlement that names no account cannot be scoped, and an
         * unscoped grant is a grant against every tenant.
         */
        account: string;
        /**
         * Firebase Auth UID the entitlement is granted to. Required for the same
         * reason as {@link Interface.account}.
         */
        uid: string;
        /**
         * Firestore document ID of the price that was purchased.
         */
        price: string;
        /**
         * Firestore document ID of the parent event or product the
         * {@link Interface.price} belongs to.
         *
         * Which collection this identifier lives in is determined by
         * {@link Interface.type}; the pair is only meaningful together, which is why
         * both are required.
         */
        source: string;
        /**
         * Item category of the purchase, which also names the collection
         * {@link Interface.source} is read from.
         *
         * Reuses {@link Price.Type} rather than declaring a parallel enum, so the two
         * cannot drift into disagreeing about what an item category is.
         */
        type: Price.Type;
        /**
         * Processing state of the claim; see {@link Status} for accepted values.
         *
         * Absent means no claim has been recorded yet, which is not the same as
         * {@link Status.failed}: an absent state may be claimed, a failed one may be
         * re-claimed, and a caller collapsing the two loses the distinction between
         * "never attempted" and "attempted and did not work".
         */
        status?: Status;
        /**
         * Stable identity of the entitlement being conferred, independent of which
         * purchase attempt conferred it.
         *
         * Two attempts to sell the same thing to the same buyer produce the same
         * value here, which is what lets a duplicate be recognised as a duplicate
         * rather than as a second purchase.
         */
        entitlement?: string;
        /**
         * Token identifying the delivery that currently holds the claim.
         *
         * A delivery must present the same token to settle the claim it opened, so a
         * delivery that lost its claim cannot write the outcome of work another
         * delivery has since completed.
         */
        ownerToken?: string;
    }
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
    const Schema: z.ZodObject<{
        account: z.ZodString;
        uid: z.ZodString;
        price: z.ZodString;
        source: z.ZodString;
        type: z.ZodEnum<typeof Price.Type>;
        status: z.ZodOptional<z.ZodEnum<typeof Status>>;
        entitlement: z.ZodOptional<z.ZodString>;
        ownerToken: z.ZodOptional<z.ZodString>;
        id: z.ZodOptional<z.ZodString>;
        backup: z.ZodOptional<z.ZodBoolean>;
        created: z.ZodOptional<z.ZodType<string | number | import("../interface/schema.js").TimestampLike | Date, unknown, z.core.$ZodTypeInternals<string | number | import("../interface/schema.js").TimestampLike | Date, unknown>>>;
        updated: z.ZodOptional<z.ZodType<string | number | import("../interface/schema.js").TimestampLike | Date, unknown, z.core.$ZodTypeInternals<string | number | import("../interface/schema.js").TimestampLike | Date, unknown>>>;
        expiry: z.ZodOptional<z.ZodType<string | number | import("../interface/schema.js").TimestampLike | Date, unknown, z.core.$ZodTypeInternals<string | number | import("../interface/schema.js").TimestampLike | Date, unknown>>>;
    }, z.core.$loose>;
    /**
     * Compile-time proof that {@link Schema} produces {@link Interface}.
     */
    type SchemaOutput = AssertSchemaOutput<z.infer<typeof Schema>, Interface>;
    /**
     * Validates untrusted data as an entitlement record without throwing.
     *
     * @param {unknown} value - Untrusted value, typically the raw data of a stored entitlement document.
     * @return {ParseResult<Interface>} Success carrying the typed entitlement, or failure carrying the reasons.
     */
    const safeParse: (value: unknown) => ParseResult<Interface>;
    /**
     * Validates untrusted data as an entitlement record, throwing when it does not
     * conform.
     *
     * @param {unknown} value - Untrusted value, typically the raw data of a stored entitlement document.
     * @return {Interface} The validated entitlement.
     * @throws {ParseError} When the value does not conform to {@link Schema}.
     */
    const parse: (value: unknown) => Interface;
}
