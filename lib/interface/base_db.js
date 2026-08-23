/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */
import { z } from 'zod';
import { auditTimestamp, documentId } from './schema.js';
/**
 * Field schemas for the administrative fields declared by {@link BaseFirestore}.
 *
 * Exported as a raw shape rather than a finished schema so that every document
 * schema in this package can spread it into its own `z.looseObject` call. That
 * spread is what keeps the base fields validated identically everywhere: a
 * document schema that redeclared them by hand would drift the moment one copy
 * changed.
 *
 * The three audit timestamps use {@link auditTimestamp}, which is the runtime
 * resolution of the `any` on those fields. Their honest static type is
 * `Timestamp | Date | FieldValue | string`, and naming the `FieldValue` half
 * would require the server SDK — deliberately not a dependency of this package.
 * The type therefore stays permissive on purpose and the constraint is enforced
 * at the boundary instead, where it can actually be checked. See
 * {@link auditTimestamp} for the shapes accepted, what is rejected, and how to
 * widen a schema for a write payload.
 *
 * {@link BaseFirestore.id} and {@link BaseFirestore.backup} are `.nullish()`,
 * because a stored document writes an unset optional field as an explicit
 * `null` rather than omitting it, and a field that accepted only `undefined`
 * would reject documents that are otherwise entirely well formed.
 *
 * The three timestamps are deliberately **not** `.nullish()` and keep rejecting
 * `null`. An explicitly null timestamp is not a time: read as one it becomes
 * epoch zero, which sorts first and — for {@link BaseFirestore.expiry}, a TTL —
 * expires the document immediately. No stored null was observed in any of the
 * three, so the exemption costs nothing today. If one is ever observed, the fix
 * is a decision about what a null instant means, recorded here, rather than a
 * blanket loosening. The `nullRejecting` inventory in
 * `test/interface/schema.test.ts` is what holds that line.
 */
export const baseFirestoreShape = {
    /**
     * See {@link BaseFirestore.id}.
     */
    id: documentId().nullish(),
    /**
     * See {@link BaseFirestore.backup}.
     */
    backup: z.boolean().nullish(),
    /**
     * See {@link BaseFirestore.created}.
     */
    created: auditTimestamp().optional(),
    /**
     * See {@link BaseFirestore.updated}.
     */
    updated: auditTimestamp().optional(),
    /**
     * See {@link BaseFirestore.expiry}.
     */
    expiry: auditTimestamp().optional(),
};
/**
 * Runtime schema producing {@link BaseFirestore}.
 *
 * Built with `z.looseObject`, so undeclared fields are **preserved** rather than
 * dropped or rejected. That mirrors the `[x: string]: any` index signature above
 * — a strict schema would contradict the published type and reject stored
 * documents that predate every change made here, while a stripping schema would
 * silently delete fields on a read-modify-write.
 *
 * No standalone parse helper is exported for this schema on purpose. It accepts
 * very nearly everything, so a `parseBaseFirestore` would be a validation
 * function that validates almost nothing while reading at every call site as
 * though the document had been checked. Compose it into a concrete document
 * schema instead.
 */
export const BaseFirestoreSchema = z.looseObject(baseFirestoreShape);
