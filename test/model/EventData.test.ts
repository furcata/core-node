/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */

import { describe, it, expect } from 'vitest';
import { EventData } from '../../src/model/EventData.js';
import { Block } from '../../src/model/Block.js';

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
