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
})(EventData || (EventData = {}));
