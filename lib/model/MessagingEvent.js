/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */
import { z } from 'zod';
import { baseFirestoreShape } from '../interface/base_db.js';
import { documentId, nonEmptyString, parseOrThrow, parseResult, } from '../interface/schema.js';
/**
 * Namespace for messaging event models that represent individual communication
 * interactions (SMS, MMS, voice calls, in-app messages, etc.) recorded in
 * Firestore.
 *
 * Cloud Functions write `MessagingEvent` documents when messages are sent or
 * received via Twilio or the in-app messaging system. Status transitions are
 * updated asynchronously through webhook callbacks.
 */
export var MessagingEvent;
(function (MessagingEvent) {
    /**
     * Discriminated enum of all supported communication channel types for a
     * messaging event.
     *
     * The `type` value drives routing logic in Cloud Functions and determines
     * which downstream provider (Twilio, WebSocket, etc.) handles the event.
     */
    let Type;
    (function (Type) {
        // message is in-app messaging
        Type["message"] = "message";
        Type["sms"] = "sms";
        Type["mms"] = "mms";
        // voice is in-app voice
        Type["voice"] = "voice";
        Type["voicemail"] = "voicemail";
        // call is a phone call - one segment === one minute
        Type["call"] = "call";
        Type["whatsapp"] = "whatsapp";
        Type["action"] = "action";
        Type["unsubscribe"] = "unsubscribe";
        Type["post"] = "post";
    })(Type = MessagingEvent.Type || (MessagingEvent.Type = {}));
    /**
     * Represents the current lifecycle status of a messaging event as it
     * progresses through the delivery pipeline.
     *
     * Statuses map closely to Twilio's delivery status model and are updated via
     * webhook Cloud Functions. The `inProgress` and `ringing` statuses are
     * specific to voice/call events.
     */
    let Status;
    (function (Status) {
        Status["opened"] = "opened";
        Status["sender"] = "sender";
        Status["pending"] = "pending";
        Status["ready"] = "ready";
        Status["queued"] = "queued";
        Status["error"] = "error";
        Status["accepted"] = "accepted";
        Status["delivered"] = "delivered";
        Status["failed"] = "failed";
        Status["received"] = "received";
        Status["sent"] = "sent";
        Status["undelivered"] = "undelivered";
        Status["unknown"] = "unknown";
        Status["completed"] = "completed";
        Status["inProgress"] = "inProgress";
        Status["ringing"] = "ringing";
        Status["initiated"] = "initiated";
        Status["busy"] = "busy";
        Status["noAnswer"] = "noAnswer";
        Status["canceled"] = "canceled";
    })(Status = MessagingEvent.Status || (MessagingEvent.Status = {}));
    /**
     * Schema for the denormalised sender snapshot on {@link Interface.user}.
     *
     * `id` is required because the snapshot exists precisely so that a display
     * surface does not have to perform a second lookup — a snapshot without the
     * identity it stands in for cannot be reconciled against anything.
     */
    const userSnapshotSchema = z.looseObject({
        /**
         * See {@link Interface.user}.
         */
        avatar: nonEmptyString().nullish(),
        /**
         * Sender's first name.
         */
        firstName: z.string().nullish(),
        /**
         * Sender's last name.
         */
        lastName: z.string().nullish(),
        /**
         * Sender's full display name.
         */
        name: z.string().nullish(),
        /**
         * Abbreviated form of the sender's name.
         */
        abbr: z.string().nullish(),
        /**
         * Sender's unique username handle.
         */
        username: z.string().nullish(),
        /**
         * Firebase Auth UID of the sender.
         */
        id: nonEmptyString(),
    });
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
    MessagingEvent.Schema = z.looseObject({
        ...baseFirestoreShape,
        /**
         * See {@link Interface.account}.
         */
        account: documentId().nullish(),
        /**
         * See {@link Interface.service}.
         */
        service: nonEmptyString().nullish(),
        /**
         * See {@link Interface.language}.
         */
        language: nonEmptyString().nullish(),
        /**
         * See {@link Interface.media}.
         */
        media: z.array(z.string()).nullish(),
        /**
         * See {@link Interface.body}. Permitted to be empty: a delivery receipt for
         * a media-only message legitimately carries no text.
         */
        body: z.string().nullish(),
        /**
         * See {@link Interface.type}, and the note on this schema about why a raw
         * string is still accepted.
         */
        type: z.union([z.enum(Type), z.string()]).nullish(),
        /**
         * See {@link Interface.uid}. `null` denotes a system-generated event and
         * must survive a JSON round-trip.
         */
        uid: z.string().nullish(),
        /**
         * See {@link Interface.ml}.
         */
        ml: z.boolean().nullish(),
        /**
         * See {@link Interface.unsafe}.
         */
        unsafe: z.boolean().nullish(),
        /**
         * See {@link Interface.labels}.
         */
        labels: z.array(z.string()).nullish(),
        /**
         * See {@link Interface.error}. `null` denotes "no error occurred", which is
         * a different claim from the field being absent.
         */
        error: z.string().nullish(),
        /**
         * See {@link Interface.errorCodeProvider}. Accepted as either a number or a
         * string because providers differ, but **never coerced between them**: a
         * code turned into `NaN` by a reflexive `Number()` would compare equal to no
         * known code and silently classify a hard failure as unrecognised.
         */
        errorCodeProvider: z.union([z.number(), z.string()]).nullish(),
        /**
         * See {@link Interface.user}.
         */
        user: userSnapshotSchema.nullish(),
    });
    /**
     * Validates untrusted data as a messaging event without throwing.
     *
     * @param {unknown} value - Untrusted value, typically the raw data of a stored messaging event document.
     * @return {ParseResult<Interface>} Success carrying the typed event, or failure carrying the reasons.
     */
    MessagingEvent.safeParse = (value) => parseResult(MessagingEvent.Schema, value, 'MessagingEvent.Interface');
    /**
     * Validates untrusted data as a messaging event, throwing when it does not
     * conform.
     *
     * @param {unknown} value - Untrusted value, typically the raw data of a stored messaging event document.
     * @return {Interface} The validated messaging event.
     * @throws {ParseError} When the value does not conform to {@link Schema}.
     */
    MessagingEvent.parse = (value) => parseOrThrow(MessagingEvent.Schema, value, 'MessagingEvent.Interface');
})(MessagingEvent || (MessagingEvent = {}));
