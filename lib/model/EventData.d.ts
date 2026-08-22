/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */
import { z } from 'zod';
import { BaseFirestore } from '../interface/base_db.js';
import { BasePlaceData } from '../interface/place.js';
import { AssertSchemaOutput, ParseResult } from '../interface/schema.js';
import { Block } from './Block.js';
/**
 * Namespace for event-data models representing scheduled or on-demand events
 * (both in-person and online) stored in Firestore.
 *
 * Cloud Functions consume `EventData.Interface` documents to trigger
 * scheduling reminders, process bookings, and update participant counters.
 * Pricing for events is managed via the separate `Price` namespace.
 */
export declare namespace EventData {
    /**
     * Distinguishes between in-person and virtual (online) event formats.
     */
    enum Type {
        inPerson = "in_person",
        online = "online"
    }
    /**
     * Recurrence cadence for a repeating event.
     *
     * Cloud Functions use this value to determine when to generate the next
     * occurrence document after the current event completes.
     */
    enum Frequency {
        once = "once",
        daily = "daily",
        weekly = "weekly",
        monthly = "monthly"
    }
    /**
     * Lifecycle status of an event document.
     *
     * Cloud Functions gate participant access and notification dispatch based on
     * this status value.
     */
    enum Status {
        draft = "draft",
        scheduled = "scheduled",
        active = "active",
        archived = "archived"
    }
    /**
     * Firestore document shape for a single event.
     *
     * Extends {@link BaseFirestore} for auditing fields and {@link BasePlaceData}
     * for geographic location data. Writing or updating these documents may
     * trigger Cloud Function listeners that send notifications to registered
     * participants and hosts.
     */
    interface Interface extends BaseFirestore, BasePlaceData {
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
        blocks?: Block.Interface[];
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
        users?: string[];
        /**
         * Firebase Auth UIDs of users who have been designated as event hosts.
         */
        hosts?: string[];
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
        duration?: number;
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
    const Schema: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
        account: z.ZodOptional<z.ZodString>;
        media: z.ZodOptional<z.ZodArray<z.ZodString>>;
        type: z.ZodOptional<z.ZodUnion<readonly [z.ZodEnum<typeof Type>, z.ZodString]>>;
        frequency: z.ZodOptional<z.ZodUnion<readonly [z.ZodEnum<typeof Frequency>, z.ZodString]>>;
        status: z.ZodOptional<z.ZodUnion<readonly [z.ZodEnum<typeof Status>, z.ZodString]>>;
        uid: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        blocks: z.ZodOptional<z.ZodArray<z.ZodObject<{
            type: z.ZodEnum<typeof Block.Type>;
            value: z.ZodUnion<readonly [z.ZodString, z.ZodNumber, z.ZodRecord<z.ZodString, z.ZodUnknown>, z.ZodArray<z.ZodUnknown>]>;
            label: z.ZodString;
            width: z.ZodOptional<z.ZodNumber>;
            height: z.ZodOptional<z.ZodNumber>;
        }, z.core.$loose>>>;
        currency: z.ZodOptional<z.ZodString>;
        amount: z.ZodOptional<z.ZodNumber>;
        users: z.ZodOptional<z.ZodArray<z.ZodString>>;
        hosts: z.ZodOptional<z.ZodArray<z.ZodString>>;
        limit: z.ZodOptional<z.ZodNumber>;
        startTime: z.ZodOptional<z.ZodType<string | number | import("../interface/schema.js").TimestampLike | Date, unknown, z.core.$ZodTypeInternals<string | number | import("../interface/schema.js").TimestampLike | Date, unknown>>>;
        endTime: z.ZodOptional<z.ZodType<string | number | import("../interface/schema.js").TimestampLike | Date, unknown, z.core.$ZodTypeInternals<string | number | import("../interface/schema.js").TimestampLike | Date, unknown>>>;
        duration: z.ZodOptional<z.ZodNumber>;
        runHour: z.ZodOptional<z.ZodInt>;
        clicks: z.ZodOptional<z.ZodNumber>;
        views: z.ZodOptional<z.ZodNumber>;
        checkout: z.ZodOptional<z.ZodNumber>;
        booked: z.ZodOptional<z.ZodNumber>;
        location: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
        placeId: z.ZodOptional<z.ZodString>;
        latitude: z.ZodOptional<z.ZodNumber>;
        longitude: z.ZodOptional<z.ZodNumber>;
        placeName: z.ZodOptional<z.ZodString>;
        utcOffset: z.ZodOptional<z.ZodNumber>;
        country: z.ZodOptional<z.ZodString>;
        geohash: z.ZodOptional<z.ZodString>;
        area: z.ZodOptional<z.ZodString>;
        id: z.ZodOptional<z.ZodString>;
        backup: z.ZodOptional<z.ZodBoolean>;
        created: z.ZodOptional<z.ZodType<string | number | import("../interface/schema.js").TimestampLike | Date, unknown, z.core.$ZodTypeInternals<string | number | import("../interface/schema.js").TimestampLike | Date, unknown>>>;
        updated: z.ZodOptional<z.ZodType<string | number | import("../interface/schema.js").TimestampLike | Date, unknown, z.core.$ZodTypeInternals<string | number | import("../interface/schema.js").TimestampLike | Date, unknown>>>;
        expiry: z.ZodOptional<z.ZodType<string | number | import("../interface/schema.js").TimestampLike | Date, unknown, z.core.$ZodTypeInternals<string | number | import("../interface/schema.js").TimestampLike | Date, unknown>>>;
    }, z.core.$loose>;
    /**
     * Compile-time proof that {@link Schema} produces {@link Interface}.
     */
    type SchemaOutput = AssertSchemaOutput<z.infer<typeof Schema>, Interface>;
    /**
     * Validates untrusted data as an event document without throwing.
     *
     * @param {unknown} value - Untrusted value, typically the raw data of a stored event document.
     * @return {ParseResult<Interface>} Success carrying the typed event, or failure carrying the reasons.
     */
    const safeParse: (value: unknown) => ParseResult<Interface>;
    /**
     * Validates untrusted data as an event document, throwing when it does not
     * conform.
     *
     * @param {unknown} value - Untrusted value, typically the raw data of a stored event document.
     * @return {Interface} The validated event document.
     * @throws {ParseError} When the value does not conform to {@link Schema}.
     */
    const parse: (value: unknown) => Interface;
}
