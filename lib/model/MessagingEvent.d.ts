/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */
import { z } from 'zod';
import { BaseFirestore } from '../interface/base_db.js';
import { AssertSchemaOutput, ParseResult } from '../interface/schema.js';
/**
 * Namespace for messaging event models that represent individual communication
 * interactions (SMS, MMS, voice calls, in-app messages, etc.) recorded in
 * Firestore.
 *
 * Cloud Functions write `MessagingEvent` documents when messages are sent or
 * received via Twilio or the in-app messaging system. Status transitions are
 * updated asynchronously through webhook callbacks.
 */
export declare namespace MessagingEvent {
    /**
     * Discriminated enum of all supported communication channel types for a
     * messaging event.
     *
     * The `type` value drives routing logic in Cloud Functions and determines
     * which downstream provider (Twilio, WebSocket, etc.) handles the event.
     */
    enum Type {
        message = "message",
        sms = "sms",
        mms = "mms",
        voice = "voice",
        voicemail = "voicemail",
        call = "call",
        whatsapp = "whatsapp",
        action = "action",
        unsubscribe = "unsubscribe",
        post = "post"
    }
    /**
     * Represents the current lifecycle status of a messaging event as it
     * progresses through the delivery pipeline.
     *
     * Statuses map closely to Twilio's delivery status model and are updated via
     * webhook Cloud Functions. The `inProgress` and `ringing` statuses are
     * specific to voice/call events.
     */
    enum Status {
        opened = "opened",
        sender = "sender",
        pending = "pending",
        ready = "ready",
        queued = "queued",
        error = "error",
        accepted = "accepted",
        delivered = "delivered",
        failed = "failed",
        received = "received",
        sent = "sent",
        undelivered = "undelivered",
        unknown = "unknown",
        completed = "completed",
        inProgress = "inProgress",
        ringing = "ringing",
        initiated = "initiated",
        busy = "busy",
        noAnswer = "noAnswer",
        canceled = "canceled"
    }
    /**
     * Firestore document shape for a single messaging event.
     *
     * Extends {@link BaseFirestore} for standard auditing fields. Each document
     * captures who sent the message, its content, delivery status, and optional
     * machine-learning metadata. Side-effects: writing or updating these
     * documents triggers Cloud Function listeners that update account-level
     * queue counters and may enqueue further processing steps.
     */
    interface Interface extends BaseFirestore {
        /**
         * Firestore document ID of the account that owns this messaging event.
         */
        account?: string | null;
        /**
         * Identifier of the messaging service (e.g., Twilio Messaging Service SID)
         * used to deliver this event.
         */
        service?: string | null;
        /**
         * BCP 47 language tag for the message body (e.g., `"en"`, `"es"`), used
         * for content moderation and ML processing.
         */
        language?: string | null;
        /**
         * Array of media attachment URLs associated with this message (MMS only).
         */
        media?: string[] | null;
        /**
         * Plain-text body of the message.
         */
        body?: string | null;
        /**
         * Channel type of this event; see {@link Type} for accepted values.
         * Accepts a typed enum member or a raw string for forward-compatibility
         * with values stored in Firestore before this enum existed.
         */
        type?: Type | string | null;
        /**
         * Firebase Auth UID of the user who originated this event, or `null` for
         * system-generated events.
         */
        uid?: string | null;
        /**
         * When `true`, this event was processed by the machine-learning pipeline.
         */
        ml?: boolean | null;
        /**
         * When `true`, the ML pipeline flagged this message content as unsafe.
         */
        unsafe?: boolean | null;
        /**
         * Content classification labels applied by the ML safety classifier.
         */
        labels?: string[] | null;
        /**
         * Human-readable error message if delivery failed, or `null` if no error
         * occurred.
         */
        error?: string | null;
        /**
         * Provider-specific error code returned by the downstream messaging
         * provider (e.g., a Twilio error code integer or string).
         */
        errorCodeProvider?: number | string | null;
        /**
         * Snapshot of the sender's public profile at the time this event was
         * created; used for display purposes without a secondary Firestore lookup.
         */
        user?: {
            /**
             * URL to the sender's avatar image.
             */
            avatar?: string | null;
            /**
             * Sender's first name.
             */
            firstName?: string | null;
            /**
             * Sender's last name.
             */
            lastName?: string | null;
            /**
             * Sender's full display name.
             */
            name?: string | null;
            /**
             * Abbreviated form of the sender's name (e.g., initials) for compact UI.
             */
            abbr?: string | null;
            /**
             * Sender's unique username handle.
             */
            username?: string | null;
            /**
             * Firebase Auth UID of the sender; required for all user-originated
             * events.
             */
            id: string;
        } | null;
    }
    /**
     * Runtime schema producing {@link Interface}.
     *
     * ### On {@link Interface.type}
     *
     * The published field is `Type | string`, so this schema accepts either. That
     * is deliberate and it is **not** enum validation: narrowing the field to
     * {@link Type} alone would reject every event stored before the enum existed,
     * which is a breaking change for consumers rather than a fix. The union is
     * written out rather than collapsed to `z.string()` so the intended grammar
     * stays visible at the point a future major version can close it. A caller
     * that requires strict membership should test the parsed value against
     * `Object.values(MessagingEvent.Type)` explicitly.
     *
     * Unknown keys are preserved, matching the index signature inherited from
     * {@link BaseFirestore}. That also means a stored `status` value — which
     * {@link Status} describes but {@link Interface} does not yet declare —
     * survives a parse and a round-trip untouched.
     */
    const Schema: z.ZodObject<{
        account: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        service: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        language: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        media: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
        body: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        type: z.ZodOptional<z.ZodNullable<z.ZodUnion<readonly [z.ZodEnum<typeof Type>, z.ZodString]>>>;
        uid: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        ml: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
        unsafe: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
        labels: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
        error: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        errorCodeProvider: z.ZodOptional<z.ZodNullable<z.ZodUnion<readonly [z.ZodNumber, z.ZodString]>>>;
        user: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            avatar: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            firstName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            lastName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            abbr: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            username: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            id: z.ZodString;
        }, z.core.$loose>>>;
        id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        backup: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
        created: z.ZodOptional<z.ZodType<string | number | import("../interface/schema.js").TimestampLike | Date, unknown, z.core.$ZodTypeInternals<string | number | import("../interface/schema.js").TimestampLike | Date, unknown>>>;
        updated: z.ZodOptional<z.ZodType<string | number | import("../interface/schema.js").TimestampLike | Date, unknown, z.core.$ZodTypeInternals<string | number | import("../interface/schema.js").TimestampLike | Date, unknown>>>;
        expiry: z.ZodOptional<z.ZodType<string | number | import("../interface/schema.js").TimestampLike | Date, unknown, z.core.$ZodTypeInternals<string | number | import("../interface/schema.js").TimestampLike | Date, unknown>>>;
    }, z.core.$loose>;
    /**
     * Compile-time proof that {@link Schema} produces {@link Interface}.
     */
    type SchemaOutput = AssertSchemaOutput<z.infer<typeof Schema>, Interface>;
    /**
     * Validates untrusted data as a messaging event without throwing.
     *
     * @param {unknown} value - Untrusted value, typically the raw data of a stored messaging event document.
     * @return {ParseResult<Interface>} Success carrying the typed event, or failure carrying the reasons.
     */
    const safeParse: (value: unknown) => ParseResult<Interface>;
    /**
     * Validates untrusted data as a messaging event, throwing when it does not
     * conform.
     *
     * @param {unknown} value - Untrusted value, typically the raw data of a stored messaging event document.
     * @return {Interface} The validated messaging event.
     * @throws {ParseError} When the value does not conform to {@link Schema}.
     */
    const parse: (value: unknown) => Interface;
}
