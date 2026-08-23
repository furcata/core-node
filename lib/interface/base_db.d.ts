/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */
import { z } from 'zod';
import { AssertSchemaOutput } from './schema.js';
/**
 * Base interface for all Firestore document models in the Furcata platform.
 *
 * Every collection document should extend this interface so that common
 * administrative fields (identity, auditing, time-to-live) are always present
 * and handled consistently by Cloud Functions and server-side helpers.
 * The index signature allows arbitrary extra fields to pass through without
 * TypeScript compile errors while the specific named fields are still
 * type-checked.
 */
export interface BaseFirestore {
    /**
     * Firestore document identifier, typically the auto-generated document ID.
     */
    id?: string | null;
    /**
     * Backup status flag for long-term historical storage.
     * When `true`, the document has been successfully backed up to the
     * historical long-term database. When `false`, the backup is still pending.
     */
    backup?: boolean | null;
    /**
     * Server-side timestamp recorded when the document was first created.
     */
    created?: any;
    /**
     * Server-side timestamp recorded each time the document is modified.
     */
    updated?: any;
    /**
     * Time-to-live (TTL) expiry timestamp used by Firestore TTL policies to
     * automatically delete stale documents.
     */
    expiry?: any;
    /**
     * Catch-all index signature that allows additional arbitrary properties
     * to be stored on any document that extends this interface.
     */
    [x: string]: any;
}
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
export declare const baseFirestoreShape: {
    /**
     * See {@link BaseFirestore.id}.
     */
    id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    /**
     * See {@link BaseFirestore.backup}.
     */
    backup: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
    /**
     * See {@link BaseFirestore.created}.
     */
    created: z.ZodOptional<z.ZodType<string | number | import("./schema.js").TimestampLike | Date, unknown, z.core.$ZodTypeInternals<string | number | import("./schema.js").TimestampLike | Date, unknown>>>;
    /**
     * See {@link BaseFirestore.updated}.
     */
    updated: z.ZodOptional<z.ZodType<string | number | import("./schema.js").TimestampLike | Date, unknown, z.core.$ZodTypeInternals<string | number | import("./schema.js").TimestampLike | Date, unknown>>>;
    /**
     * See {@link BaseFirestore.expiry}.
     */
    expiry: z.ZodOptional<z.ZodType<string | number | import("./schema.js").TimestampLike | Date, unknown, z.core.$ZodTypeInternals<string | number | import("./schema.js").TimestampLike | Date, unknown>>>;
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
export declare const BaseFirestoreSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    backup: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
    created: z.ZodOptional<z.ZodType<string | number | import("./schema.js").TimestampLike | Date, unknown, z.core.$ZodTypeInternals<string | number | import("./schema.js").TimestampLike | Date, unknown>>>;
    updated: z.ZodOptional<z.ZodType<string | number | import("./schema.js").TimestampLike | Date, unknown, z.core.$ZodTypeInternals<string | number | import("./schema.js").TimestampLike | Date, unknown>>>;
    expiry: z.ZodOptional<z.ZodType<string | number | import("./schema.js").TimestampLike | Date, unknown, z.core.$ZodTypeInternals<string | number | import("./schema.js").TimestampLike | Date, unknown>>>;
}, z.core.$loose>;
/**
 * Compile-time proof that {@link BaseFirestoreSchema} produces
 * {@link BaseFirestore}.
 */
export type BaseFirestoreSchemaOutput = AssertSchemaOutput<z.infer<typeof BaseFirestoreSchema>, BaseFirestore>;
