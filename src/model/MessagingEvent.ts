/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */
import {z} from 'zod';
import {BaseFirestore, baseFirestoreShape} from '../interface/base_db.js';
import {
  AssertSchemaOutput,
  documentId,
  nonEmptyString,
  ParseResult,
  parseOrThrow,
  parseResult,
} from '../interface/schema.js';

/**
 * Namespace for messaging event models that represent individual communication
 * interactions (SMS, MMS, voice calls, in-app messages, etc.) recorded in
 * Firestore.
 *
 * Cloud Functions write `MessagingEvent` documents when messages are sent or
 * received via Twilio or the in-app messaging system. Status transitions are
 * updated asynchronously through webhook callbacks.
 */
export namespace MessagingEvent {
  /**
   * Discriminated enum of all supported communication channel types for a
   * messaging event.
   *
   * The `type` value drives routing logic in Cloud Functions and determines
   * which downstream provider (Twilio, WebSocket, etc.) handles the event.
   */
  export enum Type {
    // message is in-app messaging
    message = 'message',
    sms = 'sms',
    mms = 'mms',
    // voice is in-app voice
    voice = 'voice',
    voicemail = 'voicemail',
    // call is a phone call - one segment === one minute
    call = 'call',
    whatsapp = 'whatsapp',
    action = 'action',
    unsubscribe = 'unsubscribe',
    post = 'post',
  }

  /**
   * Represents the current lifecycle status of a messaging event as it
   * progresses through the delivery pipeline.
   *
   * Statuses map closely to Twilio's delivery status model and are updated via
   * webhook Cloud Functions. The `inProgress` and `ringing` statuses are
   * specific to voice/call events.
   */
  export enum Status {
    opened = 'opened',
    sender = 'sender',
    pending = 'pending',
    ready = 'ready',
    queued = 'queued',
    error = 'error',
    accepted = 'accepted',
    delivered = 'delivered',
    failed = 'failed',
    received = 'received',
    sent = 'sent',
    undelivered = 'undelivered',
    unknown = 'unknown',
    completed = 'completed',
    inProgress = 'inProgress',
    ringing = 'ringing',
    initiated = 'initiated',
    busy = 'busy',
    noAnswer = 'noAnswer',
    canceled = 'canceled'
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
  export interface Interface extends BaseFirestore {
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
    unsafe?: boolean | null,
    /**
     * Content classification labels applied by the ML safety classifier.
     */
    labels?: string[] | null,
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
  export const Schema = z.looseObject({
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
   * Compile-time proof that {@link Schema} produces {@link Interface}.
   */
  export type SchemaOutput = AssertSchemaOutput<z.infer<typeof Schema>, Interface>;

  /**
   * Validates untrusted data as a messaging event without throwing.
   *
   * @param {unknown} value - Untrusted value, typically the raw data of a stored messaging event document.
   * @return {ParseResult<Interface>} Success carrying the typed event, or failure carrying the reasons.
   */
  export const safeParse = (value: unknown): ParseResult<Interface> =>
    parseResult(Schema, value, 'MessagingEvent.Interface');

  /**
   * Validates untrusted data as a messaging event, throwing when it does not
   * conform.
   *
   * @param {unknown} value - Untrusted value, typically the raw data of a stored messaging event document.
   * @return {Interface} The validated messaging event.
   * @throws {ParseError} When the value does not conform to {@link Schema}.
   */
  export const parse = (value: unknown): Interface => parseOrThrow(Schema, value, 'MessagingEvent.Interface');
}
