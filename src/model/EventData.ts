/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */
import {z} from 'zod';
import {BaseFirestore, baseFirestoreShape} from '../interface/base_db.js';
import {BasePlaceData, basePlaceDataShape} from '../interface/place.js';
import {
  AssertSchemaOutput,
  auditTimestamp,
  counter,
  documentId,
  finiteNumber,
  nonEmptyString,
  ParseResult,
  parseOrThrow,
  parseResult,
} from '../interface/schema.js';
import {Block} from './Block.js';

/**
 * Namespace for event-data models representing scheduled or on-demand events
 * (both in-person and online) stored in Firestore.
 *
 * Cloud Functions consume `EventData.Interface` documents to trigger
 * scheduling reminders, process bookings, and update participant counters.
 * Pricing for events is managed via the separate `Price` namespace.
 */
export namespace EventData {
  /**
   * Distinguishes between in-person and virtual (online) event formats.
   */
  export enum Type {
    inPerson = 'in_person',
    online = 'online',
  }

  /**
   * Recurrence cadence for a repeating event.
   *
   * Cloud Functions use this value to determine when to generate the next
   * occurrence document after the current event completes.
   */
  export enum Frequency {
    once = 'once',
    daily = 'daily',
    weekly = 'weekly',
    monthly = 'monthly',
  }

  /**
   * Lifecycle status of an event document.
   *
   * Cloud Functions gate participant access and notification dispatch based on
   * this status value.
   */
  export enum Status {
    draft = 'draft',
    scheduled = 'scheduled',
    active = 'active',
    archived = 'archived'
  }

  /**
   * Firestore document shape for a single event.
   *
   * Extends {@link BaseFirestore} for auditing fields and {@link BasePlaceData}
   * for geographic location data. Writing or updating these documents may
   * trigger Cloud Function listeners that send notifications to registered
   * participants and hosts.
   */
  export interface Interface extends BaseFirestore, BasePlaceData {
    /**
     * Public display name of the event.
     */
    name?: string;
    /**
     * Detailed description of the event shown to potential participants.
     */
    description?: string;
    /**
     * BCP 47 language tag for the event's primary language (e.g., `"en"`).
     */
    language?: string;
    /**
     * Firestore document ID of the account that owns this event.
     */
    account?: string;
    /**
     * Array of media asset URLs (images, videos) associated with the event.
     */
    media?: string[];
    /**
     * Event format; see {@link Type} for accepted values.
     * Accepts a typed enum member or a raw string for forward-compatibility
     * with values stored in Firestore before this enum existed.
     */
    type?: Type | string;
    /**
     * Recurrence cadence; see {@link Frequency} for accepted values.
     * Accepts a typed enum member or a raw string for forward-compatibility
     * with values stored in Firestore before this enum existed.
     */
    frequency?: Frequency | string;
    /**
     * Current lifecycle status; see {@link Status} for accepted values.
     * Accepts a typed enum member or a raw string for forward-compatibility
     * with values stored in Firestore before this enum existed.
     */
    status?: Status | string;
    /**
     * Firebase Auth UID of the user who created this event, or `null` for
     * system-generated events.
     */
    uid?: string | null;
    /**
     * Ordered array of content blocks that compose the event's rich-media
     * detail page.
     */
    blocks?: Block.Interface[],
    /**
     * @deprecated Use the `Price` namespace instead.
     * ISO 4217 currency code for the event ticket price.
     */
    currency?: string;
    /**
     * @deprecated Use the `Price` namespace instead.
     * Ticket price amount expressed in the smallest currency unit (e.g., cents).
     */
    amount?: number;
    /**
     * Firebase Auth UIDs of participants who have booked or joined this event.
     */
    users?: string[]; // user ids
    /**
     * Firebase Auth UIDs of users who have been designated as event hosts.
     */
    hosts?: string[]; // user ids
    /**
     * Maximum number of participants allowed to join; enforced by Cloud
     * Functions during the booking process.
     */
    limit?: number;
    /**
     * Timestamp at which the event starts; stored as a Firestore Timestamp
     * or ISO 8601 string.
     */
    startTime?: any;
    /**
     * Timestamp at which the event ends; stored as a Firestore Timestamp
     * or ISO 8601 string.
     */
    endTime?: any;
    /**
     * Planned duration of the event in minutes.
     */
    duration?: number; // in minutes
    /**
     * UTC hour of the day (0–23) at which recurring Cloud Function jobs
     * process or re-schedule this event.
     */
    runHour?: number;
    /**
     * Cumulative number of times this event's detail page has been clicked
     * from a listing view.
     */
    clicks?: number;
    /**
     * Cumulative number of times this event's detail page has been viewed.
     */
    views?: number;
    /**
     * Cumulative number of users who initiated the checkout / booking flow for
     * this event.
     */
    checkout?: number;
    /**
     * Cumulative number of confirmed bookings for this event.
     */
    booked?: number;
  }

  /**
   * Runtime schema producing {@link Interface}.
   *
   * ### On the three enum-or-string fields
   *
   * {@link Interface.type}, {@link Interface.frequency} and
   * {@link Interface.status} are published as `Enum | string`, so this schema
   * accepts either. That is faithful to the declared contract and it is **not**
   * enum validation: narrowing any of them to the enum alone would reject every
   * event stored before that enum existed, which is a breaking change for
   * consumers rather than a fix. Each union is written out rather than collapsed
   * to `z.string()` so the intended grammar stays visible at the point a future
   * major version can close it. A caller that needs strict membership should
   * test the parsed value against `Object.values(EventData.Status)` explicitly.
   *
   * ### On the timestamps
   *
   * {@link Interface.startTime} and {@link Interface.endTime} are declared `any`
   * for the same reason the audit fields on {@link BaseFirestore} are, and they
   * are resolved the same way — validated at this boundary rather than in a type
   * that cannot name a server sentinel. See `auditTimestamp` for the shapes
   * accepted and how to widen the schema for a write payload.
   */
  export const Schema = z.looseObject({
    ...baseFirestoreShape,
    ...basePlaceDataShape,
    /**
     * See {@link Interface.name}.
     */
    name: z.string().optional(),
    /**
     * See {@link Interface.description}.
     */
    description: z.string().optional(),
    /**
     * See {@link Interface.language}.
     */
    language: nonEmptyString().optional(),
    /**
     * See {@link Interface.account}.
     */
    account: documentId().optional(),
    /**
     * See {@link Interface.media}.
     */
    media: z.array(z.string()).optional(),
    /**
     * See {@link Interface.type}, and the note on this schema about why a raw
     * string is still accepted.
     */
    type: z.union([z.enum(Type), z.string()]).optional(),
    /**
     * See {@link Interface.frequency}, and the note on this schema about why a
     * raw string is still accepted.
     */
    frequency: z.union([z.enum(Frequency), z.string()]).optional(),
    /**
     * See {@link Interface.status}, and the note on this schema about why a raw
     * string is still accepted.
     */
    status: z.union([z.enum(Status), z.string()]).optional(),
    /**
     * See {@link Interface.uid}. `null` denotes a system-generated event and
     * must survive a JSON round-trip.
     */
    uid: z.string().nullable().optional(),
    /**
     * See {@link Interface.blocks}. Every element is validated against
     * {@link Block.Schema}, so one malformed block fails the event rather than
     * reaching a renderer that has no branch for it.
     */
    blocks: z.array(Block.Schema).optional(),
    /**
     * See {@link Interface.currency}.
     * @deprecated Use the `Price` namespace instead.
     */
    currency: z.string().regex(/^[A-Za-z]{3}$/, {error: 'Expected a three-letter ISO 4217 currency code'}).optional(),
    /**
     * See {@link Interface.amount}. Money, so a non-numeric value is rejected
     * rather than coerced into `NaN`.
     * @deprecated Use the `Price` namespace instead.
     */
    amount: finiteNumber().optional(),
    /**
     * See {@link Interface.users}.
     */
    users: z.array(z.string()).optional(),
    /**
     * See {@link Interface.hosts}.
     */
    hosts: z.array(z.string()).optional(),
    /**
     * See {@link Interface.limit}.
     */
    limit: counter().optional(),
    /**
     * See {@link Interface.startTime}.
     */
    startTime: auditTimestamp().optional(),
    /**
     * See {@link Interface.endTime}.
     */
    endTime: auditTimestamp().optional(),
    /**
     * See {@link Interface.duration}. Whole minutes.
     */
    duration: counter().optional(),
    /**
     * See {@link Interface.runHour}. A UTC hour of day, so the accepted range is
     * 0 to 23; a value outside it schedules a recurring job that never fires.
     */
    runHour: z.int().min(0).max(23).optional(),
    /**
     * See {@link Interface.clicks}.
     */
    clicks: counter().optional(),
    /**
     * See {@link Interface.views}.
     */
    views: counter().optional(),
    /**
     * See {@link Interface.checkout}.
     */
    checkout: counter().optional(),
    /**
     * See {@link Interface.booked}.
     */
    booked: counter().optional(),
  });

  /**
   * Compile-time proof that {@link Schema} produces {@link Interface}.
   */
  export type SchemaOutput = AssertSchemaOutput<z.infer<typeof Schema>, Interface>;

  /**
   * Validates untrusted data as an event document without throwing.
   *
   * @param {unknown} value - Untrusted value, typically the raw data of a stored event document.
   * @return {ParseResult<Interface>} Success carrying the typed event, or failure carrying the reasons.
   */
  export const safeParse = (value: unknown): ParseResult<Interface> => parseResult(Schema, value, 'EventData.Interface');

  /**
   * Validates untrusted data as an event document, throwing when it does not
   * conform.
   *
   * @param {unknown} value - Untrusted value, typically the raw data of a stored event document.
   * @return {Interface} The validated event document.
   * @throws {ParseError} When the value does not conform to {@link Schema}.
   */
  export const parse = (value: unknown): Interface => parseOrThrow(Schema, value, 'EventData.Interface');
}
