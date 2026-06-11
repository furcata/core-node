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
})(MessagingEvent || (MessagingEvent = {}));
