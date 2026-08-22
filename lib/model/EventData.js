/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */
import { z } from 'zod';
import { baseFirestoreShape } from '../interface/base_db.js';
import { basePlaceDataShape } from '../interface/place.js';
import { auditTimestamp, counter, documentId, finiteNumber, nonEmptyString, parseOrThrow, parseResult, } from '../interface/schema.js';
import { Block } from './Block.js';
/**
 * Namespace for event-data models representing scheduled or on-demand events
 * (both in-person and online) stored in Firestore.
 *
 * Cloud Functions consume `EventData.Interface` documents to trigger
 * scheduling reminders, process bookings, and update participant counters.
 * Pricing for events is managed via the separate `Price` namespace.
 */
export var EventData;
(function (EventData) {
    /**
     * Distinguishes between in-person and virtual (online) event formats.
     */
    let Type;
    (function (Type) {
        Type["inPerson"] = "in_person";
        Type["online"] = "online";
    })(Type = EventData.Type || (EventData.Type = {}));
    /**
     * Recurrence cadence for a repeating event.
     *
     * Cloud Functions use this value to determine when to generate the next
     * occurrence document after the current event completes.
     */
    let Frequency;
    (function (Frequency) {
        Frequency["once"] = "once";
        Frequency["daily"] = "daily";
        Frequency["weekly"] = "weekly";
        Frequency["monthly"] = "monthly";
    })(Frequency = EventData.Frequency || (EventData.Frequency = {}));
    /**
     * Lifecycle status of an event document.
     *
     * Cloud Functions gate participant access and notification dispatch based on
     * this status value.
     */
    let Status;
    (function (Status) {
        Status["draft"] = "draft";
        Status["scheduled"] = "scheduled";
        Status["active"] = "active";
        Status["archived"] = "archived";
    })(Status = EventData.Status || (EventData.Status = {}));
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
    EventData.Schema = z.looseObject({
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
        currency: z.string().regex(/^[A-Za-z]{3}$/, { error: 'Expected a three-letter ISO 4217 currency code' }).optional(),
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
     * Validates untrusted data as an event document without throwing.
     *
     * @param {unknown} value - Untrusted value, typically the raw data of a stored event document.
     * @return {ParseResult<Interface>} Success carrying the typed event, or failure carrying the reasons.
     */
    EventData.safeParse = (value) => parseResult(EventData.Schema, value, 'EventData.Interface');
    /**
     * Validates untrusted data as an event document, throwing when it does not
     * conform.
     *
     * @param {unknown} value - Untrusted value, typically the raw data of a stored event document.
     * @return {Interface} The validated event document.
     * @throws {ParseError} When the value does not conform to {@link Schema}.
     */
    EventData.parse = (value) => parseOrThrow(EventData.Schema, value, 'EventData.Interface');
})(EventData || (EventData = {}));
