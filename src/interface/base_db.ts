/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */
import {z} from 'zod';
import {AssertSchemaOutput, auditTimestamp, documentId} from './schema.js';

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
  id?: string;
  /**
   * Backup status flag for long-term historical storage.
   * When `true`, the document has been successfully backed up to the
   * historical long-term database. When `false`, the backup is still pending.
   */
  backup?: boolean;
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
  expiry?: any; // TTL
  /**
   * Catch-all index signature that allows additional arbitrary properties
   * to be stored on any document that extends this interface.
   */
  [x: string]: any,
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
 */
export const baseFirestoreShape = {
  /**
   * See {@link BaseFirestore.id}.
   */
  id: documentId().optional(),
  /**
   * See {@link BaseFirestore.backup}.
   */
  backup: z.boolean().optional(),
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

/**
 * Compile-time proof that {@link BaseFirestoreSchema} produces
 * {@link BaseFirestore}.
 */
export type BaseFirestoreSchemaOutput = AssertSchemaOutput<z.infer<typeof BaseFirestoreSchema>, BaseFirestore>;
