/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */

/**
 * Public barrel export for all data model namespaces used across the Furcata
 * backend and Cloud Functions.
 *
 * Import from this module to access {@link Account}, {@link Block},
 * {@link Capacity}, {@link Entitlement}, {@link EventData},
 * {@link Idempotency}, {@link Ledger}, {@link MessageUsage},
 * {@link MessagingEvent}, {@link Post}, {@link Price} and {@link Reservation}
 * without needing deep relative imports.
 *
 * Each namespace exports a `Schema` alongside its `Interface`, plus `parse` and
 * `safeParse` helpers that turn `unknown` into that interface or into a typed
 * failure. Reach for those rather than casting a stored document into shape: a
 * cast does not skip the check, it suppresses the diagnostic that would have
 * reported the mistake.
 */
export * from './Account.js';
export * from './Block.js';
export * from './Capacity.js';
export * from './Entitlement.js';
export * from './EventData.js';
export * from './Idempotency.js';
export * from './Ledger.js';
export * from './MessageUsage.js';
export * from './MessagingEvent.js';
export * from './Post.js';
export * from './Price.js';
export * from './Reservation.js';
