/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */
import { BaseFirestore } from '../interface/base_db.js';
import { BasePlaceData } from '../interface/place.js';
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
         */
        type?: Type | any;
        /**
         * Recurrence cadence; see {@link Frequency} for accepted values.
         */
        frequency?: Frequency | any;
        /**
         * Current lifecycle status; see {@link Status} for accepted values.
         */
        status?: Status | any;
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
}
