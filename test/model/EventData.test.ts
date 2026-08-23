/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */

import { describe, it, expect } from 'vitest';
import { EventData } from '../../src/model/EventData.js';
import { Block } from '../../src/model/Block.js';
import { ParseError } from '../../src/interface/schema.js';

describe('EventData.Type', () => {
  describe('enum values', () => {
    it('should have value "in_person" for inPerson', () => {
      expect(EventData.Type.inPerson).toBe('in_person');
    });

    it('should have value "online" for online', () => {
      expect(EventData.Type.online).toBe('online');
    });

    it('should expose exactly 2 members', () => {
      const members = Object.values(EventData.Type);
      expect(members).toHaveLength(2);
    });
  });
});

describe('EventData.Frequency', () => {
  describe('enum values', () => {
    it('should have value "once" for once', () => {
      expect(EventData.Frequency.once).toBe('once');
    });

    it('should have value "daily" for daily', () => {
      expect(EventData.Frequency.daily).toBe('daily');
    });

    it('should have value "weekly" for weekly', () => {
      expect(EventData.Frequency.weekly).toBe('weekly');
    });

    it('should have value "monthly" for monthly', () => {
      expect(EventData.Frequency.monthly).toBe('monthly');
    });

    it('should expose exactly 4 members', () => {
      const members = Object.values(EventData.Frequency);
      expect(members).toHaveLength(4);
    });
  });
});

describe('EventData.Status', () => {
  describe('enum values', () => {
    it('should have value "draft" for draft', () => {
      expect(EventData.Status.draft).toBe('draft');
    });

    it('should have value "scheduled" for scheduled', () => {
      expect(EventData.Status.scheduled).toBe('scheduled');
    });

    it('should have value "active" for active', () => {
      expect(EventData.Status.active).toBe('active');
    });

    it('should have value "archived" for archived', () => {
      expect(EventData.Status.archived).toBe('archived');
    });

    it('should expose exactly 4 members', () => {
      const members = Object.values(EventData.Status);
      expect(members).toHaveLength(4);
    });
  });
});

describe('EventData.Interface', () => {
  describe('empty document', () => {
    it('should accept an empty object', () => {
      const event: EventData.Interface = {};
      expect(event).toBeDefined();
    });
  });

  describe('identity and display fields', () => {
    it('should accept name', () => {
      const event: EventData.Interface = { name: 'Community Town Hall' };
      expect(event.name).toBe('Community Town Hall');
    });

    it('should accept description', () => {
      const event: EventData.Interface = { description: 'Annual town hall meeting for all residents.' };
      expect(event.description).toBe('Annual town hall meeting for all residents.');
    });

    it('should accept language as BCP 47 tag', () => {
      const event: EventData.Interface = { language: 'en' };
      expect(event.language).toBe('en');
    });

    it('should accept account as a Firestore document ID', () => {
      const event: EventData.Interface = { account: 'acct-001' };
      expect(event.account).toBe('acct-001');
    });
  });

  describe('type, frequency, and status fields', () => {
    it('should accept EventData.Type.inPerson', () => {
      const event: EventData.Interface = { type: EventData.Type.inPerson };
      expect(event.type).toBe('in_person');
    });

    it('should accept EventData.Type.online', () => {
      const event: EventData.Interface = { type: EventData.Type.online };
      expect(event.type).toBe('online');
    });

    it('should accept EventData.Frequency.weekly', () => {
      const event: EventData.Interface = { frequency: EventData.Frequency.weekly };
      expect(event.frequency).toBe('weekly');
    });

    it('should accept EventData.Status.scheduled', () => {
      const event: EventData.Interface = { status: EventData.Status.scheduled };
      expect(event.status).toBe('scheduled');
    });
  });

  describe('user and participant fields', () => {
    it('should accept uid as a string', () => {
      const event: EventData.Interface = { uid: 'user-uid-abc' };
      expect(event.uid).toBe('user-uid-abc');
    });

    it('should accept uid as null for system-generated events', () => {
      const event: EventData.Interface = { uid: null };
      expect(event.uid).toBeNull();
    });

    it('should accept a users array of Auth UIDs', () => {
      const event: EventData.Interface = { users: ['uid-1', 'uid-2', 'uid-3'] };
      expect(event.users).toHaveLength(3);
      expect(event.users?.[0]).toBe('uid-1');
    });

    it('should accept a hosts array of Auth UIDs', () => {
      const event: EventData.Interface = { hosts: ['host-uid-1'] };
      expect(event.hosts).toHaveLength(1);
    });

    it('should accept a limit for max participants', () => {
      const event: EventData.Interface = { limit: 100 };
      expect(event.limit).toBe(100);
    });
  });

  describe('scheduling fields', () => {
    it('should accept startTime as a Date', () => {
      const start = new Date('2024-09-01T18:00:00Z');
      const event: EventData.Interface = { startTime: start };
      expect(event.startTime).toBe(start);
    });

    it('should accept endTime as a Date', () => {
      const end = new Date('2024-09-01T20:00:00Z');
      const event: EventData.Interface = { endTime: end };
      expect(event.endTime).toBe(end);
    });

    it('should accept duration in minutes', () => {
      const event: EventData.Interface = { duration: 90 };
      expect(event.duration).toBe(90);
    });

    it('should accept runHour as a UTC hour (0–23)', () => {
      const event: EventData.Interface = { runHour: 8 };
      expect(event.runHour).toBe(8);
    });
  });

  describe('media and content fields', () => {
    it('should accept a media array of URLs', () => {
      const event: EventData.Interface = { media: ['https://cdn.example.com/image.jpg'] };
      expect(event.media).toHaveLength(1);
    });

    it('should accept a blocks array of Block.Interface', () => {
      const blocks: Block.Interface[] = [
        { type: Block.Type.text, value: 'Welcome to the event!', label: 'Welcome' },
        { type: Block.Type.image, value: 'https://cdn.example.com/banner.jpg', label: 'Banner' },
      ];
      const event: EventData.Interface = { blocks };
      expect(event.blocks).toHaveLength(2);
      expect(event.blocks?.[0].type).toBe('text');
    });
  });

  describe('deprecated pricing fields', () => {
    it('should accept currency as ISO 4217 code', () => {
      const event: EventData.Interface = { currency: 'usd' };
      expect(event.currency).toBe('usd');
    });

    it('should accept amount in smallest currency unit', () => {
      const event: EventData.Interface = { amount: 1500 }; // $15.00
      expect(event.amount).toBe(1500);
    });
  });

  describe('analytics fields', () => {
    it('should accept click counter', () => {
      const event: EventData.Interface = { clicks: 42 };
      expect(event.clicks).toBe(42);
    });

    it('should accept view counter', () => {
      const event: EventData.Interface = { views: 1000 };
      expect(event.views).toBe(1000);
    });

    it('should accept checkout counter', () => {
      const event: EventData.Interface = { checkout: 50 };
      expect(event.checkout).toBe(50);
    });

    it('should accept booked counter', () => {
      const event: EventData.Interface = { booked: 30 };
      expect(event.booked).toBe(30);
    });
  });

  describe('inherited BasePlaceData fields', () => {
    it('should accept latitude and longitude', () => {
      const event: EventData.Interface = { latitude: 40.7128, longitude: -74.006 };
      expect(event.latitude).toBe(40.7128);
      expect(event.longitude).toBe(-74.006);
    });

    it('should accept placeName', () => {
      const event: EventData.Interface = { placeName: 'City Hall' };
      expect(event.placeName).toBe('City Hall');
    });
  });

  describe('inherited BaseFirestore fields', () => {
    it('should accept id and created', () => {
      const event: EventData.Interface = { id: 'evt-001', created: new Date() };
      expect(event.id).toBe('evt-001');
    });
  });

  describe('fully populated event', () => {
    it('should accept all core fields simultaneously', () => {
      const start = new Date('2024-10-01T09:00:00Z');
      const event: EventData.Interface = {
        id: 'evt-town-hall-2024',
        name: 'Annual Town Hall',
        description: 'Open discussion with residents.',
        language: 'en',
        account: 'acct-springfield',
        type: EventData.Type.inPerson,
        frequency: EventData.Frequency.once,
        status: EventData.Status.scheduled,
        startTime: start,
        duration: 120,
        limit: 200,
        latitude: 39.7817,
        longitude: -89.6501,
        placeName: 'Springfield City Hall',
        clicks: 0,
        views: 0,
      };
      expect(event.name).toBe('Annual Town Hall');
      expect(event.status).toBe('scheduled');
      expect(event.limit).toBe(200);
    });
  });
});

/**
 * An event document that must parse.
 */
const validEvent = (): Record<string, unknown> => ({
  name: 'Synthetic event',
  account: 'account_synthetic',
  type: EventData.Type.online,
  frequency: EventData.Frequency.weekly,
  status: EventData.Status.scheduled,
  uid: null,
  blocks: [{ type: Block.Type.text, value: 'Synthetic body copy', label: 'Intro' }],
  currency: 'usd',
  amount: 2500,
  users: ['uid_synthetic'],
  limit: 50,
  startTime: '2026-01-01T00:00:00.000Z',
  endTime: { seconds: 1767229200, nanoseconds: 0 },
  duration: 60,
  runHour: 9,
  latitude: 40.5,
  longitude: -74.5,
});

describe('EventData.Schema', () => {
  describe('field inventory', () => {
    it('should declare the event fields alongside the inherited audit and place fields', () => {
      const keys = Object.keys(EventData.Schema.shape);
      for (const field of ['name', 'account', 'blocks', 'startTime', 'endTime', 'runHour', 'limit', 'amount']) {
        expect(keys).toContain(field);
      }
      for (const field of ['id', 'backup', 'created', 'updated', 'expiry']) {
        expect(keys).toContain(field);
      }
      for (const field of ['latitude', 'longitude', 'geohash', 'placeId', 'utcOffset']) {
        expect(keys).toContain(field);
      }
    });
  });

  describe('a valid document', () => {
    it('should parse and return the typed event', () => {
      const parsed = EventData.parse(validEvent());
      expect(parsed.name).toBe('Synthetic event');
      expect(parsed.blocks?.length).toBe(1);
      expect(parsed.runHour).toBe(9);
    });

    it('should accept an empty object, because every field is optional', () => {
      expect(EventData.safeParse({}).success).toBe(true);
    });
  });

  describe('nested block validation', () => {
    it('should reject an event whose block carries an undeclared type', () => {
      const result = EventData.safeParse({
        ...validEvent(),
        blocks: [{ type: 'carousel', value: 'x', label: 'l' }],
      });
      expect(result.success).toBe(false);
      expect(result.issues?.some((issue) => issue.path === 'blocks.0.type')).toBe(true);
    });

    it('should reject an event whose block is missing a required field', () => {
      const result = EventData.safeParse({ ...validEvent(), blocks: [{ type: Block.Type.text, label: 'l' }] });
      expect(result.success).toBe(false);
      expect(result.issues?.some((issue) => issue.path === 'blocks.0.value')).toBe(true);
    });

    it('should report the failing element index, not just that the array is wrong', () => {
      const result = EventData.safeParse({
        ...validEvent(),
        blocks: [
          { type: Block.Type.text, value: 'ok', label: 'l' },
          { type: 'carousel', value: 'x', label: 'l' },
        ],
      });
      expect(result.issues?.some((issue) => issue.path === 'blocks.1.type')).toBe(true);
    });
  });

  describe('the deprecated amount field, which is money', () => {
    it('should reject a non-numeric amount rather than coercing it to NaN', () => {
      const result = EventData.safeParse({ ...validEvent(), amount: 'abc' });
      expect(result.success).toBe(false);
      expect(result.issues?.some((issue) => issue.path === 'amount')).toBe(true);
    });

    it('should reject NaN and both infinities', () => {
      expect(EventData.safeParse({ ...validEvent(), amount: Number.NaN }).success).toBe(false);
      expect(EventData.safeParse({ ...validEvent(), amount: Number.POSITIVE_INFINITY }).success).toBe(false);
      expect(EventData.safeParse({ ...validEvent(), amount: Number.NEGATIVE_INFINITY }).success).toBe(false);
    });
  });

  describe('the enum-or-string fields', () => {
    it('should accept every declared member of each enum', () => {
      for (const type of Object.values(EventData.Type)) {
        expect(EventData.safeParse({ ...validEvent(), type }).success).toBe(true);
      }
      for (const frequency of Object.values(EventData.Frequency)) {
        expect(EventData.safeParse({ ...validEvent(), frequency }).success).toBe(true);
      }
      for (const status of Object.values(EventData.Status)) {
        expect(EventData.safeParse({ ...validEvent(), status }).success).toBe(true);
      }
    });

    it('should accept a raw string, which is what the published Enum | string contract permits', () => {
      expect(EventData.parse({ ...validEvent(), status: 'legacy_status' }).status).toBe('legacy_status');
    });

    it('should still reject a non-string value on each of them', () => {
      expect(EventData.safeParse({ ...validEvent(), type: 1 }).success).toBe(false);
      expect(EventData.safeParse({ ...validEvent(), frequency: true }).success).toBe(false);
      expect(EventData.safeParse({ ...validEvent(), status: { name: 'active' } }).success).toBe(false);
    });

    it('should let a caller test strict enum membership on the parsed value', () => {
      const members = Object.values(EventData.Status) as string[];
      expect(members.includes(EventData.parse(validEvent()).status as string)).toBe(true);
      expect(members.includes(EventData.parse({ status: 'legacy_status' }).status as string)).toBe(false);
    });
  });

  describe('the runHour field', () => {
    it('should accept every hour of a UTC day', () => {
      for (let hour = 0; hour < 24; hour += 1) {
        expect(EventData.safeParse({ ...validEvent(), runHour: hour }).success).toBe(true);
      }
    });

    it('should reject an hour outside the day, which would schedule a job that never fires', () => {
      expect(EventData.safeParse({ ...validEvent(), runHour: 24 }).success).toBe(false);
      expect(EventData.safeParse({ ...validEvent(), runHour: -1 }).success).toBe(false);
    });

    it('should reject a fractional hour', () => {
      expect(EventData.safeParse({ ...validEvent(), runHour: 9.5 }).success).toBe(false);
    });
  });

  describe('the timestamp fields', () => {
    it('should accept an ISO 8601 string, a Firestore timestamp, a Date and an epoch number', () => {
      for (const startTime of ['2026-01-01T00:00:00.000Z', { seconds: 1767225600, nanoseconds: 0 }, new Date(1767225600000), 1767225600000]) {
        expect(EventData.safeParse({ ...validEvent(), startTime }).success).toBe(true);
      }
    });

    it('should reject a value that is not any read shape of a timestamp', () => {
      for (const startTime of [null, '', true, { when: 'soon' }]) {
        expect(EventData.safeParse({ ...validEvent(), startTime }).success).toBe(false);
      }
    });

    it('should preserve a timestamp-like value by reference rather than rebuilding it', () => {
      const endTime = { seconds: 1767229200, nanoseconds: 0 };
      expect(EventData.parse({ ...validEvent(), endTime }).endTime).toBe(endTime);
    });
  });

  describe('inherited place validation', () => {
    it('should reject a latitude outside the poles, which is usually a transposed longitude', () => {
      expect(EventData.safeParse({ ...validEvent(), latitude: 91 }).success).toBe(false);
      expect(EventData.safeParse({ ...validEvent(), latitude: -91 }).success).toBe(false);
      expect(EventData.safeParse({ ...validEvent(), longitude: 181 }).success).toBe(false);
    });

    it('should accept a coordinate pair that is merely unusual but valid', () => {
      expect(EventData.safeParse({ ...validEvent(), latitude: -74.5, longitude: 40.5 }).success).toBe(true);
    });
  });

  describe('unknown-key policy', () => {
    it('should preserve an undeclared field rather than dropping it', () => {
      const parsed = EventData.parse({ ...validEvent(), legacyField: 'kept' });
      expect(parsed['legacyField']).toBe('kept');
    });
  });

  describe('throwing form', () => {
    it('should throw a ParseError naming the shape', () => {
      expect(() => EventData.parse({ amount: 'abc' })).toThrow(ParseError);
      expect(() => EventData.parse({ amount: 'abc' })).toThrow(/EventData\.Interface failed validation/);
    });
  });
});

/**
 * Regression cover for the defect that stored `null` used to trigger.
 *
 * An event document is written progressively, so its unset fields — including
 * the array-valued ones — are stored as explicit `null` rather than omitted.
 * `blocks: null` is the interesting case: an array field nulled out is not
 * distinguishable from an absent one by any read that uses `?? []`, but it was
 * enough to reject the whole document at the parse boundary.
 *
 * The fixture reproduces the field layout of a real stored event, with entirely
 * synthetic values. A fixture using `undefined` where a stored document has
 * `null` would parse identically under `.optional()` and `.nullish()`, and so
 * would assert nothing.
 */
describe('EventData.Schema against the stored document layout', () => {
  /**
   * A stored event whose unset fields are explicit `null`.
   *
   * @return {Record<string, unknown>} An event document in stored form.
   */
  const storedEvent = (): Record<string, unknown> => ({
    name: 'Synthetic event',
    account: 'account_synthetic',
    type: EventData.Type.online,
    status: EventData.Status.scheduled,
    description: null,
    language: null,
    media: null,
    blocks: null,
    images: null,
    currency: null,
    amount: null,
    users: null,
    maxUsers: null,
    successMessage: null,
    redirectUrl: null,
    successUrl: null,
    uid: null,
    limit: null,
    startTime: '2026-01-01T00:00:00.000Z',
    endTime: '2026-01-01T02:00:00.000Z',
    created: '2026-01-01T00:00:00.000Z',
    updated: '2026-01-01T00:00:00.000Z',
  });

  it('should parse a stored event whose unset fields are explicit null', () => {
    expect(EventData.safeParse(storedEvent()).success).toBe(true);
  });

  it('should parse a stored event with every non-required declared field null', () => {
    const everyOptionalNull: Record<string, unknown> = {};
    for (const key of Object.keys(EventData.Schema.shape)) {
      if (['created', 'updated', 'expiry', 'startTime', 'endTime'].includes(key)) continue;
      everyOptionalNull[key] = null;
    }
    expect(EventData.safeParse(everyOptionalNull).success).toBe(true);
  });

  it('should accept a null array field and leave it reading as empty under a nullish-coalescing read', () => {
    const parsed = EventData.parse(storedEvent());
    expect(parsed.blocks).toBeNull();
    expect(parsed.blocks ?? []).toEqual([]);
    expect(parsed.users ?? []).toEqual([]);
  });

  describe('the loosening is bounded to null and nothing else', () => {
    it('should still reject a non-array value in an array field that now accepts null', () => {
      for (const field of ['blocks', 'users', 'hosts', 'media']) {
        expect(EventData.safeParse({ ...storedEvent(), [field]: 'not_an_array' }).success).toBe(false);
      }
    });

    it('should still reject a malformed element inside an array field that now accepts null', () => {
      expect(EventData.safeParse({ ...storedEvent(), blocks: [{ type: Block.Type.text }] }).success).toBe(false);
      expect(EventData.safeParse({ ...storedEvent(), users: [42] }).success).toBe(false);
    });

    it('should still reject a malformed currency in a field that now accepts null', () => {
      expect(EventData.safeParse({ ...storedEvent(), currency: 'dollars' }).success).toBe(false);
    });

    it('should still reject an out-of-range runHour in a field that now accepts null', () => {
      expect(EventData.safeParse({ ...storedEvent(), runHour: 24 }).success).toBe(false);
    });

    it('should still reject a null instant, which is not a time', () => {
      for (const field of ['created', 'updated', 'expiry', 'startTime', 'endTime']) {
        expect(EventData.safeParse({ ...storedEvent(), [field]: null }).success).toBe(false);
      }
    });
  });
});
