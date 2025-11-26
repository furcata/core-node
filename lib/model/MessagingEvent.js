export var MessagingEvent;
(function (MessagingEvent) {
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
