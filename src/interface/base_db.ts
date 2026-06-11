/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */

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
   * When `true`, this document has been marked for inclusion in backup exports.
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
