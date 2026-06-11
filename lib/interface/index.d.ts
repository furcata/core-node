/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */
/**
 * Public barrel export for all shared interface definitions used across the
 * Furcata backend and Cloud Functions.
 *
 * Import from this module when you need {@link BaseFirestore}, {@link MessageQueue},
 * or any place-related interfaces, to avoid deep relative imports.
 */
export * from './base_db.js';
export * from './queue.js';
export * from './place.js';
