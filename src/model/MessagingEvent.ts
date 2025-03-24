/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */
import {BaseFirestore} from '../interface/base_db.js';

export namespace MessagingEvent {
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

  export interface Interface extends BaseFirestore {
    account?: string;
    service?: string;
    language?: string;
    media?: string[];
    body?: string;
    type?: Type | any;
    uid?: string | null;
    ml?: boolean;
    unsafe?: boolean,
    labels?: string[],
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
