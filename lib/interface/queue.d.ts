/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */
/**
 * Tracks the state counters for a messaging queue attached to an account.
 *
 * These counters are maintained by Cloud Functions as messages move through
 * each stage of the delivery pipeline (pending → ready → sending → sent).
 * Reading these values allows the UI and backend to display progress without
 * querying individual message documents.
 */
export interface MessageQueue {
    /**
     * Number of messages that have been created but not yet validated or approved
     * for sending.
     */
    pending?: number;
    /**
     * Number of messages that have passed validation and are ready to be picked
     * up by the sender worker.
     */
    ready?: number;
    /**
     * Number of messages currently assigned to a sender worker for processing.
     */
    sender?: number;
    /**
     * Number of messages actively being transmitted to the downstream messaging
     * provider (e.g., Twilio).
     */
    sending?: number;
    /**
     * Arbitrary snapshot or metadata captured at the time the queue was last
     * counted; used for auditing and diagnostics.
     */
    counted?: any;
}
