/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */

import { Price } from '../../src/model/Price.js';
import { ParseError } from '../../src/interface/schema.js';

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

/**
 * A price document that must parse. Every negative case below is this object
 * with one field changed.
 */
const validPrice = (): Record<string, unknown> => ({
  account: 'account_synthetic',
  amount: 2500,
  currency: 'usd',
  source: 'source_synthetic',
  label: 'Synthetic ticket',
  limit: 100,
  type: Price.Type.event,
  uid: null,
  users: ['uid_synthetic'],
  visibility: Price.Visibility.public,
  clicks: 4,
  views: 40,
  checkout: 2,
  booked: 1,
});

describe('Price.Schema', () => {
  describe('field inventory', () => {
    it('should declare every field of the interface plus the inherited audit fields', () => {
      expect(Object.keys(Price.Schema.shape).sort()).toEqual([
        'account',
        'amount',
        'backup',
        'booked',
        'checkout',
        'clicks',
        'created',
        'currency',
        'description',
        'expiry',
        'id',
        'image',
        'label',
        'limit',
        'source',
        'type',
        'uid',
        'updated',
        'users',
        'views',
        'visibility',
      ]);
    });
  });

  describe('a valid document', () => {
    it('should parse and return the typed price', () => {
      const parsed = Price.parse(validPrice());
      expect(parsed.account).toBe('account_synthetic');
      expect(parsed.amount).toBe(2500);
      expect(parsed.type).toBe(Price.Type.event);
    });

    it('should parse a minimal document carrying only the required account', () => {
      const parsed = Price.parse({ account: 'account_synthetic' });
      expect(parsed.amount).toBeUndefined();
    });
  });

  describe('the amount field, which is money', () => {
    it('should reject a non-numeric amount rather than coercing it to NaN', () => {
      const result = Price.safeParse({ ...validPrice(), amount: 'abc' });
      expect(result.success).toBe(false);
      expect(result.issues?.some((issue) => issue.path === 'amount')).toBe(true);
      expect(Number('abc')).toBeNaN();
    });

    it('should reject a numeric string, NaN and both infinities', () => {
      expect(Price.safeParse({ ...validPrice(), amount: '2500' }).success).toBe(false);
      expect(Price.safeParse({ ...validPrice(), amount: Number.NaN }).success).toBe(false);
      expect(Price.safeParse({ ...validPrice(), amount: Number.POSITIVE_INFINITY }).success).toBe(false);
      expect(Price.safeParse({ ...validPrice(), amount: Number.NEGATIVE_INFINITY }).success).toBe(false);
    });

    it('should distinguish an absent amount from a zero one', () => {
      const price = validPrice();
      delete price['amount'];
      expect(Price.parse(price).amount).toBeUndefined();
      expect(Price.parse({ ...validPrice(), amount: 0 }).amount).toBe(0);
    });
  });

  describe('enum rejection', () => {
    it('should accept every declared type and visibility', () => {
      for (const type of Object.values(Price.Type)) {
        expect(Price.safeParse({ ...validPrice(), type }).success).toBe(true);
      }
      for (const visibility of Object.values(Price.Visibility)) {
        expect(Price.safeParse({ ...validPrice(), visibility }).success).toBe(true);
      }
    });

    it('should reject a type that is not a declared member', () => {
      for (const type of ['subscription', 'Event', 'EVENT', 'events', '']) {
        expect(Price.safeParse({ ...validPrice(), type }).success).toBe(false);
      }
    });

    it('should reject a visibility that is not a declared member', () => {
      for (const visibility of ['hidden', 'Public', 'PRIVATE', 'secret', '']) {
        const result = Price.safeParse({ ...validPrice(), visibility });
        expect(result.success).toBe(false);
        expect(result.issues?.some((issue) => issue.path === 'visibility')).toBe(true);
      }
    });
  });

  describe('missing required fields', () => {
    it('should reject a document with no account', () => {
      const price = validPrice();
      delete price['account'];
      const result = Price.safeParse(price);
      expect(result.success).toBe(false);
      expect(result.issues?.some((issue) => issue.path === 'account')).toBe(true);
    });

    it('should reject an empty account, which a failed lookup would produce', () => {
      expect(Price.safeParse({ ...validPrice(), account: '' }).success).toBe(false);
    });
  });

  describe('the currency code', () => {
    it('should accept a three-letter ISO 4217 code in either case', () => {
      expect(Price.safeParse({ ...validPrice(), currency: 'usd' }).success).toBe(true);
      expect(Price.safeParse({ ...validPrice(), currency: 'EUR' }).success).toBe(true);
    });

    it('should reject a code of the wrong length or containing digits', () => {
      for (const currency of ['us', 'usdd', 'us1', '', 'dollars']) {
        expect(Price.safeParse({ ...validPrice(), currency }).success).toBe(false);
      }
    });
  });

  describe('the uid field', () => {
    it('should accept an explicit null, which must survive a JSON round-trip', () => {
      const parsed = Price.parse({ ...validPrice(), uid: null });
      expect(parsed.uid).toBeNull();
      expect(JSON.parse(JSON.stringify(parsed)).uid).toBeNull();
    });

    it('should accept absence, which is a different claim from null', () => {
      const price = validPrice();
      delete price['uid'];
      expect('uid' in Price.parse(price)).toBe(false);
    });
  });

  describe('counters', () => {
    it('should reject a fractional or negative counter', () => {
      for (const field of ['limit', 'clicks', 'views', 'checkout', 'booked']) {
        expect(Price.safeParse({ ...validPrice(), [field]: 1.5 }).success).toBe(false);
        expect(Price.safeParse({ ...validPrice(), [field]: -1 }).success).toBe(false);
      }
    });

    it('should reject a numeric string counter rather than coercing it', () => {
      expect(Price.safeParse({ ...validPrice(), limit: '100' }).success).toBe(false);
    });
  });

  describe('unknown-key policy', () => {
    it('should preserve an undeclared field rather than dropping it', () => {
      const parsed = Price.parse({ ...validPrice(), legacyField: 'kept' });
      expect(parsed['legacyField']).toBe('kept');
    });

    it('should preserve an undeclared field across a full round-trip', () => {
      const parsed = Price.parse(Price.parse({ ...validPrice(), legacyField: 'kept' }));
      expect(parsed['legacyField']).toBe('kept');
    });
  });

  describe('throwing form', () => {
    it('should throw a ParseError naming the shape', () => {
      expect(() => Price.parse({})).toThrow(ParseError);
      expect(() => Price.parse({})).toThrow(/Price\.Interface failed validation/);
    });
  });
});
