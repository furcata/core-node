/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */

import {describe, it, expect} from 'vitest';
import {Entitlement} from '../../src/model/Entitlement.js';
import {Price} from '../../src/model/Price.js';
import {ParseError} from '../../src/interface/schema.js';

/**
 * A record that must parse.
 */
const validRecord = (): Record<string, unknown> => ({
  account: 'account_synthetic',
  uid: 'uid_synthetic',
  price: 'price_synthetic',
  source: 'source_synthetic',
  type: Price.Type.event,
  status: Entitlement.Status.complete,
  entitlement: 'entitlement_synthetic',
  ownerToken: 'token_synthetic',
});

describe('Entitlement.Status', () => {
  it('should map each member to its stored value', () => {
    expect(Entitlement.Status.processing).toBe('processing');
    expect(Entitlement.Status.complete).toBe('complete');
    expect(Entitlement.Status.failed).toBe('failed');
  });

  it('should contain exactly the declared members', () => {
    expect(Object.keys(Entitlement.Status).sort()).toEqual(['complete', 'failed', 'processing']);
  });
});

describe('Entitlement.Schema', () => {
  describe('field inventory', () => {
    it('should declare every field of the interface plus the inherited audit fields', () => {
      expect(Object.keys(Entitlement.Schema.shape).sort()).toEqual([
        'account',
        'backup',
        'created',
        'entitlement',
        'expiry',
        'id',
        'ownerToken',
        'price',
        'source',
        'status',
        'type',
        'uid',
        'updated',
      ]);
    });
  });

  describe('a valid record', () => {
    it('should parse and return the typed record', () => {
      const parsed = Entitlement.parse(validRecord());
      expect(parsed.account).toBe('account_synthetic');
      expect(parsed.type).toBe(Price.Type.event);
      expect(parsed.status).toBe(Entitlement.Status.complete);
    });

    it('should parse a record carrying only the required coordinates', () => {
      const parsed = Entitlement.parse({
        account: 'a',
        uid: 'u',
        price: 'p',
        source: 's',
        type: Price.Type.product,
      });
      expect(parsed.status).toBeUndefined();
      expect(parsed.ownerToken).toBeUndefined();
    });
  });

  describe('enum rejection on status', () => {
    it('should accept every declared status', () => {
      for (const status of Object.values(Entitlement.Status)) {
        expect(Entitlement.safeParse({...validRecord(), status}).success).toBe(true);
      }
    });

    it('should reject a status that is not a declared member', () => {
      const result = Entitlement.safeParse({...validRecord(), status: 'in-progress'});
      expect(result.success).toBe(false);
      expect(result.issues?.some((issue) => issue.path === 'status')).toBe(true);
    });

    it('should reject plausible-looking but undeclared statuses', () => {
      for (const status of ['completed', 'done', 'success', 'Complete', 'PROCESSING']) {
        expect(Entitlement.safeParse({...validRecord(), status}).success).toBe(false);
      }
    });
  });

  describe('enum rejection on type', () => {
    it('should accept every declared price type', () => {
      for (const type of Object.values(Price.Type)) {
        expect(Entitlement.safeParse({...validRecord(), type}).success).toBe(true);
      }
    });

    it('should reject a type that is not a declared member', () => {
      const result = Entitlement.safeParse({...validRecord(), type: 'subscription'});
      expect(result.success).toBe(false);
      expect(result.issues?.some((issue) => issue.path === 'type')).toBe(true);
    });

    it('should share its accepted set with Price.Type rather than declaring a parallel one', () => {
      const accepted = Object.values(Price.Type).filter(
        (type) => Entitlement.safeParse({...validRecord(), type}).success,
      );
      expect(accepted.sort()).toEqual(Object.values(Price.Type).sort());
    });
  });

  describe('missing required fields', () => {
    it.each(['account', 'uid', 'price', 'source', 'type'])(
      'should reject a record with no %s',
      (field) => {
        const record = validRecord();
        delete record[field];
        const result = Entitlement.safeParse(record);
        expect(result.success).toBe(false);
        expect(result.issues?.some((issue) => issue.path === field)).toBe(true);
      },
    );

    it('should reject an empty coordinate, which resolves against nothing', () => {
      for (const field of ['account', 'uid', 'price', 'source']) {
        expect(Entitlement.safeParse({...validRecord(), [field]: ''}).success).toBe(false);
      }
    });

    it('should reject a non-string coordinate rather than coercing it', () => {
      expect(Entitlement.safeParse({...validRecord(), uid: 12345}).success).toBe(false);
      expect(Entitlement.safeParse({...validRecord(), account: null}).success).toBe(false);
    });
  });

  describe('unknown-key policy', () => {
    it('should preserve undeclared fields rather than dropping them', () => {
      const parsed = Entitlement.parse({...validRecord(), customer: 'customer_synthetic', v: 2});
      expect(parsed['customer']).toBe('customer_synthetic');
      expect(parsed['v']).toBe(2);
    });
  });

  describe('throwing form', () => {
    it('should throw a ParseError naming the shape', () => {
      expect(() => Entitlement.parse({account: 'a'})).toThrow(ParseError);
      expect(() => Entitlement.parse({account: 'a'})).toThrow(/Entitlement\.Interface failed validation/);
    });

    it('should report every missing coordinate at once, not only the first', () => {
      const result = Entitlement.safeParse({});
      expect(result.success).toBe(false);
      expect(result.issues?.length).toBeGreaterThanOrEqual(5);
    });
  });
});
