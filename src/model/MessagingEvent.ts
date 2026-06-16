/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */
import {BaseFirestore} from '../interface/base_db.js';

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
    account?: string;
    /**
     * Identifier of the messaging service (e.g., Twilio Messaging Service SID)
     * used to deliver this event.
     */
    service?: string;
    /**
     * BCP 47 language tag for the message body (e.g., `"en"`, `"es"`), used
     * for content moderation and ML processing.
     */
    language?: string;
    /**
     * Array of media attachment URLs associated with this message (MMS only).
     */
    media?: string[];
    /**
     * Plain-text body of the message.
     */
    body?: string;
    /**
     * Channel type of this event; see {@link Type} for accepted values.
     * Accepts a typed enum member or a raw string for forward-compatibility
     * with values stored in Firestore before this enum existed.
     */
    type?: Type | string;
    /**
     * Firebase Auth UID of the user who originated this event, or `null` for
     * system-generated events.
     */
    uid?: string | null;
    /**
     * When `true`, this event was processed by the machine-learning pipeline.
     */
    ml?: boolean;
    /**
     * When `true`, the ML pipeline flagged this message content as unsafe.
     */
    unsafe?: boolean,
    /**
     * Content classification labels applied by the ML safety classifier.
     */
    labels?: string[],
    /**
     * Human-readable error message if delivery failed, or `null` if no error
     * occurred.
     */
    error?: string | null;
    /**
     * Provider-specific error code returned by the downstream messaging
     * provider (e.g., a Twilio error code integer or string).
     */
    errorCodeProvider?: number | string;
    /**
     * Snapshot of the sender's public profile at the time this event was
     * created; used for display purposes without a secondary Firestore lookup.
     */
    user?: {
      /**
       * URL to the sender's avatar image.
       */
      avatar?: string;
      /**
       * Sender's first name.
       */
      firstName?: string;
      /**
       * Sender's last name.
       */
      lastName?: string;
      /**
       * Sender's full display name.
       */
      name?: string;
      /**
       * Abbreviated form of the sender's name (e.g., initials) for compact UI.
       */
      abbr?: string;
      /**
       * Sender's unique username handle.
       */
      username?: string;
      /**
       * Firebase Auth UID of the sender; required for all user-originated
       * events.
       */
      id: string;
    };
  }
}
