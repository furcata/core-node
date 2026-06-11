/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */

import { Price } from '../../src/model/Price.js';

describe('Price.Type', () => {
  describe('enum values', () => {
    it('should have value "event" for event', () => {
      expect(Price.Type.event).toBe('event');
    });

    it('should have value "product" for product', () => {
      expect(Price.Type.product).toBe('product');
    });

    it('should expose exactly 2 members', () => {
      const members = Object.values(Price.Type);
      expect(members).toHaveLength(2);
    });
  });
});

describe('Price.Visibility', () => {
  describe('enum values', () => {
    it('should have value "public" for public', () => {
      expect(Price.Visibility.public).toBe('public');
    });

    it('should have value "private" for private', () => {
      expect(Price.Visibility.private).toBe('private');
    });

    it('should have value "unlisted" for unlisted', () => {
      expect(Price.Visibility.unlisted).toBe('unlisted');
    });

    it('should expose exactly 3 members', () => {
      const members = Object.values(Price.Visibility);
      expect(members).toHaveLength(3);
    });
  });
});

describe('Price.Interface', () => {
  describe('required account field', () => {
    it('should accept a Firestore document ID string', () => {
      const price: Price.Interface = { account: 'acct-001' };
      expect(price.account).toBe('acct-001');
    });
  });

  describe('optional amount field', () => {
    it('should accept a positive integer in smallest currency unit', () => {
      const price: Price.Interface = { account: 'acct-001', amount: 1500 }; // $15.00
      expect(price.amount).toBe(1500);
    });

    it('should accept zero for free items', () => {
      const price: Price.Interface = { account: 'acct-001', amount: 0 };
      expect(price.amount).toBe(0);
    });

    it('should be undefined when not set', () => {
      const price: Price.Interface = { account: 'acct-001' };
      expect(price.amount).toBeUndefined();
    });
  });

  describe('optional currency field', () => {
    it('should accept an ISO 4217 currency code', () => {
      const price: Price.Interface = { account: 'acct-001', currency: 'usd' };
      expect(price.currency).toBe('usd');
    });

    it('should accept EUR', () => {
      const price: Price.Interface = { account: 'acct-001', currency: 'eur' };
      expect(price.currency).toBe('eur');
    });
  });

  describe('optional source field', () => {
    it('should accept a parent product or event document ID', () => {
      const price: Price.Interface = { account: 'acct-001', source: 'evt-town-hall-001' };
      expect(price.source).toBe('evt-town-hall-001');
    });
  });

  describe('optional display fields', () => {
    it('should accept image URL', () => {
      const price: Price.Interface = {
        account: 'acct-001',
        image: 'https://cdn.example.com/ticket.jpg',
      };
      expect(price.image).toContain('cdn.example.com');
    });

    it('should accept label', () => {
      const price: Price.Interface = { account: 'acct-001', label: 'General Admission' };
      expect(price.label).toBe('General Admission');
    });

    it('should accept description', () => {
      const price: Price.Interface = {
        account: 'acct-001',
        description: 'Access to all general sessions.',
      };
      expect(price.description).toBe('Access to all general sessions.');
    });
  });

  describe('optional limit field', () => {
    it('should accept a positive integer cap', () => {
      const price: Price.Interface = { account: 'acct-001', limit: 50 };
      expect(price.limit).toBe(50);
    });

    it('should be undefined for unlimited purchases', () => {
      const price: Price.Interface = { account: 'acct-001' };
      expect(price.limit).toBeUndefined();
    });
  });

  describe('optional type field', () => {
    it('should accept Price.Type.event', () => {
      const price: Price.Interface = { account: 'acct-001', type: Price.Type.event };
      expect(price.type).toBe('event');
    });

    it('should accept Price.Type.product', () => {
      const price: Price.Interface = { account: 'acct-001', type: Price.Type.product };
      expect(price.type).toBe('product');
    });
  });

  describe('optional uid field', () => {
    it('should accept a Firebase Auth UID for user-restricted prices', () => {
      const price: Price.Interface = { account: 'acct-001', uid: 'user-uid-vip' };
      expect(price.uid).toBe('user-uid-vip');
    });

    it('should accept null for publicly purchasable prices', () => {
      const price: Price.Interface = { account: 'acct-001', uid: null };
      expect(price.uid).toBeNull();
    });
  });

  describe('optional users field', () => {
    it('should accept an array of Auth UIDs who have paid', () => {
      const price: Price.Interface = {
        account: 'acct-001',
        users: ['uid-a', 'uid-b', 'uid-c'],
      };
      expect(price.users).toHaveLength(3);
      expect(price.users?.[0]).toBe('uid-a');
    });

    it('should accept an empty array', () => {
      const price: Price.Interface = { account: 'acct-001', users: [] };
      expect(price.users).toHaveLength(0);
    });
  });

  describe('optional visibility field', () => {
    it('should accept Price.Visibility.public', () => {
      const price: Price.Interface = { account: 'acct-001', visibility: Price.Visibility.public };
      expect(price.visibility).toBe('public');
    });

    it('should accept Price.Visibility.private', () => {
      const price: Price.Interface = { account: 'acct-001', visibility: Price.Visibility.private };
      expect(price.visibility).toBe('private');
    });

    it('should accept Price.Visibility.unlisted', () => {
      const price: Price.Interface = { account: 'acct-001', visibility: Price.Visibility.unlisted };
      expect(price.visibility).toBe('unlisted');
    });
  });

  describe('analytics tracking fields', () => {
    it('should accept clicks counter', () => {
      const price: Price.Interface = { account: 'acct-001', clicks: 120 };
      expect(price.clicks).toBe(120);
    });

    it('should accept views counter', () => {
      const price: Price.Interface = { account: 'acct-001', views: 500 };
      expect(price.views).toBe(500);
    });

    it('should accept checkout counter', () => {
      const price: Price.Interface = { account: 'acct-001', checkout: 30 };
      expect(price.checkout).toBe(30);
    });

    it('should accept booked counter', () => {
      const price: Price.Interface = { account: 'acct-001', booked: 25 };
      expect(price.booked).toBe(25);
    });
  });

  describe('inherited BaseFirestore fields', () => {
    it('should accept id and backup', () => {
      const price: Price.Interface = { account: 'acct-001', id: 'price-001', backup: true };
      expect(price.id).toBe('price-001');
      expect(price.backup).toBe(true);
    });
  });

  describe('fully populated price record', () => {
    it('should accept all core fields simultaneously', () => {
      const price: Price.Interface = {
        id: 'price-ga-001',
        account: 'acct-springfield',
        source: 'evt-town-hall-2024',
        amount: 2000,
        currency: 'usd',
        label: 'General Admission',
        description: 'One ticket to the Annual Town Hall event.',
        image: 'https://cdn.example.com/ga-ticket.jpg',
        type: Price.Type.event,
        visibility: Price.Visibility.public,
        limit: 200,
        uid: null,
        users: [],
        clicks: 0,
        views: 0,
        checkout: 0,
        booked: 0,
        backup: false,
      };
      expect(price.label).toBe('General Admission');
      expect(price.amount).toBe(2000);
      expect(price.type).toBe('event');
      expect(price.visibility).toBe('public');
    });
  });
});
