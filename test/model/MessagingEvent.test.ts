/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */

import { describe, it, expect } from 'vitest';
import { MessagingEvent } from '../../src/model/MessagingEvent.js';
import { ParseError } from '../../src/interface/schema.js';

describe('MessagingEvent.Type', () => {
  describe('enum values', () => {
    it('should have value "message" for message', () => {
      expect(MessagingEvent.Type.message).toBe('message');
    });

    it('should have value "sms" for sms', () => {
      expect(MessagingEvent.Type.sms).toBe('sms');
    });

    it('should have value "mms" for mms', () => {
      expect(MessagingEvent.Type.mms).toBe('mms');
    });

    it('should have value "voice" for voice', () => {
      expect(MessagingEvent.Type.voice).toBe('voice');
    });

    it('should have value "voicemail" for voicemail', () => {
      expect(MessagingEvent.Type.voicemail).toBe('voicemail');
    });

    it('should have value "call" for call', () => {
      expect(MessagingEvent.Type.call).toBe('call');
    });

    it('should have value "whatsapp" for whatsapp', () => {
      expect(MessagingEvent.Type.whatsapp).toBe('whatsapp');
    });

    it('should have value "action" for action', () => {
      expect(MessagingEvent.Type.action).toBe('action');
    });

    it('should have value "unsubscribe" for unsubscribe', () => {
      expect(MessagingEvent.Type.unsubscribe).toBe('unsubscribe');
    });

    it('should have value "post" for post', () => {
      expect(MessagingEvent.Type.post).toBe('post');
    });

    it('should expose exactly 10 members', () => {
      const members = Object.values(MessagingEvent.Type);
      expect(members).toHaveLength(10);
    });
  });
});

describe('MessagingEvent.Status', () => {
  describe('enum values', () => {
    it('should have value "opened" for opened', () => {
      expect(MessagingEvent.Status.opened).toBe('opened');
    });

    it('should have value "sender" for sender', () => {
      expect(MessagingEvent.Status.sender).toBe('sender');
    });

    it('should have value "pending" for pending', () => {
      expect(MessagingEvent.Status.pending).toBe('pending');
    });

    it('should have value "ready" for ready', () => {
      expect(MessagingEvent.Status.ready).toBe('ready');
    });

    it('should have value "queued" for queued', () => {
      expect(MessagingEvent.Status.queued).toBe('queued');
    });

    it('should have value "error" for error', () => {
      expect(MessagingEvent.Status.error).toBe('error');
    });

    it('should have value "accepted" for accepted', () => {
      expect(MessagingEvent.Status.accepted).toBe('accepted');
    });

    it('should have value "delivered" for delivered', () => {
      expect(MessagingEvent.Status.delivered).toBe('delivered');
    });

    it('should have value "failed" for failed', () => {
      expect(MessagingEvent.Status.failed).toBe('failed');
    });

    it('should have value "received" for received', () => {
      expect(MessagingEvent.Status.received).toBe('received');
    });

    it('should have value "sent" for sent', () => {
      expect(MessagingEvent.Status.sent).toBe('sent');
    });

    it('should have value "undelivered" for undelivered', () => {
      expect(MessagingEvent.Status.undelivered).toBe('undelivered');
    });

    it('should have value "unknown" for unknown', () => {
      expect(MessagingEvent.Status.unknown).toBe('unknown');
    });

    it('should have value "completed" for completed', () => {
      expect(MessagingEvent.Status.completed).toBe('completed');
    });

    it('should have value "inProgress" for inProgress', () => {
      expect(MessagingEvent.Status.inProgress).toBe('inProgress');
    });

    it('should have value "ringing" for ringing', () => {
      expect(MessagingEvent.Status.ringing).toBe('ringing');
    });

    it('should have value "initiated" for initiated', () => {
      expect(MessagingEvent.Status.initiated).toBe('initiated');
    });

    it('should have value "busy" for busy', () => {
      expect(MessagingEvent.Status.busy).toBe('busy');
    });

    it('should have value "noAnswer" for noAnswer', () => {
      expect(MessagingEvent.Status.noAnswer).toBe('noAnswer');
    });

    it('should have value "canceled" for canceled', () => {
      expect(MessagingEvent.Status.canceled).toBe('canceled');
    });

    it('should expose exactly 20 members', () => {
      const members = Object.values(MessagingEvent.Status);
      expect(members).toHaveLength(20);
    });
  });
});

describe('MessagingEvent.Interface', () => {
  describe('empty document', () => {
    it('should accept an empty object', () => {
      const event: MessagingEvent.Interface = {};
      expect(event).toBeDefined();
    });
  });

  describe('account and service fields', () => {
    it('should accept account as a Firestore document ID', () => {
      const event: MessagingEvent.Interface = { account: 'acct-001' };
      expect(event.account).toBe('acct-001');
    });

    it('should accept service as a messaging service ID', () => {
      const event: MessagingEvent.Interface = { service: 'MG1234567890abcdef' };
      expect(event.service).toBe('MG1234567890abcdef');
    });
  });

  describe('message content fields', () => {
    it('should accept body as plain-text message', () => {
      const event: MessagingEvent.Interface = { body: 'Hello from Furcata!' };
      expect(event.body).toBe('Hello from Furcata!');
    });

    it('should accept language as BCP 47 tag', () => {
      const event: MessagingEvent.Interface = { language: 'es' };
      expect(event.language).toBe('es');
    });

    it('should accept a media array of attachment URLs', () => {
      const event: MessagingEvent.Interface = {
        media: ['https://cdn.example.com/photo.jpg', 'https://cdn.example.com/doc.pdf'],
      };
      expect(event.media).toHaveLength(2);
    });

    it('should accept type from MessagingEvent.Type', () => {
      const event: MessagingEvent.Interface = { type: MessagingEvent.Type.sms };
      expect(event.type).toBe('sms');
    });
  });

  describe('uid field', () => {
    it('should accept a Firebase Auth UID string', () => {
      const event: MessagingEvent.Interface = { uid: 'user-uid-xyz' };
      expect(event.uid).toBe('user-uid-xyz');
    });

    it('should accept null for system-generated events', () => {
      const event: MessagingEvent.Interface = { uid: null };
      expect(event.uid).toBeNull();
    });
  });

  describe('ML fields', () => {
    it('should accept ml flag', () => {
      const event: MessagingEvent.Interface = { ml: true };
      expect(event.ml).toBe(true);
    });

    it('should accept unsafe flag', () => {
      const event: MessagingEvent.Interface = { unsafe: false };
      expect(event.unsafe).toBe(false);
    });

    it('should accept labels array', () => {
      const event: MessagingEvent.Interface = { labels: ['spam', 'marketing'] };
      expect(event.labels).toEqual(['spam', 'marketing']);
    });
  });

  describe('error fields', () => {
    it('should accept error as a string', () => {
      const event: MessagingEvent.Interface = { error: 'Message delivery failed.' };
      expect(event.error).toBe('Message delivery failed.');
    });

    it('should accept error as null when no error occurred', () => {
      const event: MessagingEvent.Interface = { error: null };
      expect(event.error).toBeNull();
    });

    it('should accept numeric errorCodeProvider', () => {
      const event: MessagingEvent.Interface = { errorCodeProvider: 30003 };
      expect(event.errorCodeProvider).toBe(30003);
    });

    it('should accept string errorCodeProvider', () => {
      const event: MessagingEvent.Interface = { errorCodeProvider: 'ERR_30003' };
      expect(event.errorCodeProvider).toBe('ERR_30003');
    });
  });

  describe('user snapshot field', () => {
    it('should accept a fully populated user snapshot', () => {
      const event: MessagingEvent.Interface = {
        user: {
          id: 'uid-sender',
          firstName: 'Alice',
          lastName: 'Smith',
          name: 'Alice Smith',
          abbr: 'AS',
          username: 'alice',
          avatar: 'https://cdn.example.com/alice.jpg',
        },
      };
      expect(event.user?.id).toBe('uid-sender');
      expect(event.user?.firstName).toBe('Alice');
    });

    it('should accept a user snapshot with only the required id field', () => {
      const event: MessagingEvent.Interface = {
        user: { id: 'uid-minimal' },
      };
      expect(event.user?.id).toBe('uid-minimal');
      expect(event.user?.firstName).toBeUndefined();
    });
  });

  describe('inherited BaseFirestore fields', () => {
    it('should accept id and backup', () => {
      const event: MessagingEvent.Interface = { id: 'msg-001', backup: false };
      expect(event.id).toBe('msg-001');
      expect(event.backup).toBe(false);
    });
  });

  describe('fully populated messaging event', () => {
    it('should accept all core fields simultaneously', () => {
      const event: MessagingEvent.Interface = {
        id: 'msg-2024-001',
        account: 'acct-springfield',
        service: 'MG1234567890abcdef',
        type: MessagingEvent.Type.sms,
        body: 'Your appointment is confirmed for Sept 1 at 10am.',
        language: 'en',
        uid: 'sender-uid',
        ml: false,
        unsafe: false,
        error: null,
        user: { id: 'sender-uid', name: 'Jane Doe' },
      };
      expect(event.id).toBe('msg-2024-001');
      expect(event.type).toBe('sms');
      expect(event.body).toContain('appointment');
      expect(event.user?.name).toBe('Jane Doe');
    });
  });

  describe('all MessagingEvent.Type values usable in Interface', () => {
    const types = Object.values(MessagingEvent.Type);
    types.forEach((typeValue) => {
      it(`should accept type "${typeValue}"`, () => {
        const event: MessagingEvent.Interface = { type: typeValue };
        expect(event.type).toBe(typeValue);
      });
    });
  });

  describe('all MessagingEvent.Status values are string constants', () => {
    it('should ensure every status is a non-empty string', () => {
      Object.values(MessagingEvent.Status).forEach((status) => {
        expect(typeof status).toBe('string');
        expect(status.length).toBeGreaterThan(0);
      });
    });
  });
});

/**
 * A messaging event that must parse.
 */
const validEvent = (): Record<string, unknown> => ({
  account: 'account_synthetic',
  service: 'service_synthetic',
  language: 'en',
  body: 'Synthetic message body',
  type: MessagingEvent.Type.sms,
  uid: null,
  ml: true,
  unsafe: false,
  labels: ['synthetic'],
  error: null,
  errorCodeProvider: 30007,
  user: { id: 'uid_synthetic', name: 'Synthetic Sender' },
});

describe('MessagingEvent.Schema', () => {
  describe('field inventory', () => {
    it('should declare every field of the interface plus the inherited audit fields', () => {
      expect(Object.keys(MessagingEvent.Schema.shape).sort()).toEqual([
        'account',
        'backup',
        'body',
        'created',
        'error',
        'errorCodeProvider',
        'expiry',
        'id',
        'labels',
        'language',
        'media',
        'ml',
        'service',
        'type',
        'uid',
        'unsafe',
        'updated',
        'user',
      ]);
    });
  });

  describe('a valid document', () => {
    it('should parse and return the typed event', () => {
      const parsed = MessagingEvent.parse(validEvent());
      expect(parsed.type).toBe(MessagingEvent.Type.sms);
      expect(parsed.user?.id).toBe('uid_synthetic');
    });

    it('should accept every declared channel type', () => {
      for (const type of Object.values(MessagingEvent.Type)) {
        expect(MessagingEvent.safeParse({ ...validEvent(), type }).success).toBe(true);
      }
    });

    it('should accept an empty object, because every field is optional', () => {
      expect(MessagingEvent.safeParse({}).success).toBe(true);
    });
  });

  describe('the enum-or-string type field', () => {
    it('should accept a raw string, which is what the published Type | string contract permits', () => {
      const parsed = MessagingEvent.parse({ ...validEvent(), type: 'legacy_channel' });
      expect(parsed.type).toBe('legacy_channel');
    });

    it('should still reject a non-string type', () => {
      expect(MessagingEvent.safeParse({ ...validEvent(), type: 1 }).success).toBe(false);
      expect(MessagingEvent.safeParse({ ...validEvent(), type: true }).success).toBe(false);
    });

    it('should let a caller test strict enum membership on the parsed value', () => {
      const members = Object.values(MessagingEvent.Type) as string[];
      expect(members.includes(MessagingEvent.parse(validEvent()).type as string)).toBe(true);
      expect(members.includes(MessagingEvent.parse({ type: 'legacy_channel' }).type as string)).toBe(false);
    });
  });

  describe('the nested sender snapshot', () => {
    it('should reject a snapshot with no id, which cannot be reconciled against anything', () => {
      const result = MessagingEvent.safeParse({ ...validEvent(), user: { name: 'Synthetic Sender' } });
      expect(result.success).toBe(false);
      expect(result.issues?.some((issue) => issue.path === 'user.id')).toBe(true);
    });

    it('should reject an empty id', () => {
      expect(MessagingEvent.safeParse({ ...validEvent(), user: { id: '' } }).success).toBe(false);
    });

    it('should reject a snapshot that is not an object', () => {
      expect(MessagingEvent.safeParse({ ...validEvent(), user: 'uid_synthetic' }).success).toBe(false);
    });
  });

  describe('the provider error code', () => {
    it('should accept either a number or a string, as providers differ', () => {
      expect(MessagingEvent.parse({ ...validEvent(), errorCodeProvider: 30007 }).errorCodeProvider).toBe(30007);
      expect(MessagingEvent.parse({ ...validEvent(), errorCodeProvider: '30007' }).errorCodeProvider).toBe('30007');
    });

    it('should never coerce between them', () => {
      expect(MessagingEvent.parse({ ...validEvent(), errorCodeProvider: '30007' }).errorCodeProvider).not.toBe(30007);
    });

    it('should reject a code of any other kind', () => {
      expect(MessagingEvent.safeParse({ ...validEvent(), errorCodeProvider: true }).success).toBe(false);
      expect(MessagingEvent.safeParse({ ...validEvent(), errorCodeProvider: { code: 1 } }).success).toBe(false);
    });
  });

  describe('null-bearing fields', () => {
    it('should keep an explicit null on error and uid across a JSON round-trip', () => {
      const parsed = MessagingEvent.parse(validEvent());
      const roundTripped = JSON.parse(JSON.stringify(parsed));
      expect(roundTripped.error).toBeNull();
      expect(roundTripped.uid).toBeNull();
    });
  });

  describe('unknown-key policy', () => {
    it('should preserve a stored status, a field the Status enum describes but the interface does not declare', () => {
      const parsed = MessagingEvent.parse({ ...validEvent(), status: MessagingEvent.Status.delivered });
      expect(parsed['status']).toBe(MessagingEvent.Status.delivered);
    });
  });

  describe('throwing form', () => {
    it('should throw a ParseError naming the shape', () => {
      expect(() => MessagingEvent.parse({ user: {} })).toThrow(ParseError);
      expect(() => MessagingEvent.parse({ user: {} })).toThrow(/MessagingEvent\.Interface failed validation/);
    });
  });
});
