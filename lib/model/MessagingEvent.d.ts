/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */
import { BaseFirestore } from '../interface/base_db.js';
export declare namespace MessagingEvent {
    enum Type {
        message = "message",
        sms = "sms",
        mms = "mms",
        voice = "voice",
        voicemail = "voicemail",
        call = "call",
        whatsapp = "whatsapp",
        action = "action",
        unsubscribe = "unsubscribe",
        post = "post"
    }
    enum Status {
        opened = "opened",
        sender = "sender",
        pending = "pending",
        ready = "ready",
        queued = "queued",
        error = "error",
        accepted = "accepted",
        delivered = "delivered",
        failed = "failed",
        received = "received",
        sent = "sent",
        undelivered = "undelivered",
        unknown = "unknown",
        completed = "completed",
        inProgress = "inProgress",
        ringing = "ringing",
        initiated = "initiated",
        busy = "busy",
        noAnswer = "noAnswer",
        canceled = "canceled"
    }
    interface Interface extends BaseFirestore {
        account?: string;
        service?: string;
        language?: string;
        media?: string[];
        body?: string;
        type?: Type | any;
        uid?: string | null;
        ml?: boolean;
        unsafe?: boolean;
        labels?: string[];
        error?: string | null;
        errorCodeProvider?: number | string;
        user?: {
            avatar?: string;
            firstName?: string;
            lastName?: string;
            name?: string;
            abbr?: string;
            username?: string;
            id: string;
        };
    }
}
