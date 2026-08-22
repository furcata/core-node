/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */

import {describe, it, expect} from 'vitest';
import {Ledger} from '../../src/model/Ledger.js';
import {ParseError} from '../../src/interface/schema.js';

/**
 * A record that must parse. Every negative case below is this object with one
 * field changed.
 */
const validRecord = (): Record<string, unknown> => ({
  service: 'service_synthetic',
  scope: 'scope_synthetic',
  amount: 2500,
  consumed: 2500,
  limit: 100000,
  spendConfirmed: true,
});

describe('Ledger.Schema', () => {
  describe('field inventory', () => {
    it('should declare every field of the interface plus the inherited audit fields', () => {
      expect(Object.keys(Ledger.Schema.shape).sort()).toEqual([
        'amount',
        'backup',
        'consumed',
        'created',
        'expiry',
        'id',
        'limit',
        'scope',
        'service',
        'spendConfirmed',
        'updated',
      ]);
    });
  });

  describe('a valid record', () => {
    it('should parse and return the typed record', () => {
      const parsed = Ledger.parse(validRecord());
      expect(parsed.amount).toBe(2500);
      expect(parsed.scope).toBe('scope_synthetic');
      expect(parsed.spendConfirmed).toBe(true);
    });

    it('should parse a minimal record carrying only the required fields', () => {
      const parsed = Ledger.parse({service: 's', scope: 'sc', amount: 1});
      expect(parsed.consumed).toBeUndefined();
      expect(parsed.spendConfirmed).toBeUndefined();
    });
  });

  describe('the amount field, which is money', () => {
    it('should reject a non-numeric amount rather than coercing it to NaN', () => {
      const result = Ledger.safeParse({...validRecord(), amount: 'abc'});
      expect(result.success).toBe(false);
      expect(result.issues?.some((issue) => issue.path === 'amount')).toBe(true);
      expect(Number('abc')).toBeNaN();
    });

    it('should reject a numeric string, because accepting it would be coercion', () => {
      expect(Ledger.safeParse({...validRecord(), amount: '2500'}).success).toBe(false);
    });

    it('should reject NaN and both infinities', () => {
      expect(Ledger.safeParse({...validRecord(), amount: Number.NaN}).success).toBe(false);
      expect(Ledger.safeParse({...validRecord(), amount: Number.POSITIVE_INFINITY}).success).toBe(false);
      expect(Ledger.safeParse({...validRecord(), amount: Number.NEGATIVE_INFINITY}).success).toBe(false);
    });

    it('should reject null and an absent amount rather than defaulting either to zero', () => {
      expect(Ledger.safeParse({...validRecord(), amount: null}).success).toBe(false);
      const record = validRecord();
      delete record['amount'];
      expect(Ledger.safeParse(record).success).toBe(false);
    });

    it('should accept a negative amount, because a reversal is a legitimate movement', () => {
      const parsed = Ledger.parse({...validRecord(), amount: -2500});
      expect(parsed.amount).toBe(-2500);
    });

    it('should accept zero', () => {
      expect(Ledger.parse({...validRecord(), amount: 0}).amount).toBe(0);
    });
  });

  describe('missing required fields', () => {
    it('should reject a record with no service', () => {
      const record = validRecord();
      delete record['service'];
      const result = Ledger.safeParse(record);
      expect(result.success).toBe(false);
      expect(result.issues?.some((issue) => issue.path === 'service')).toBe(true);
    });

    it('should reject a record with no scope, which would debit nothing while looking like a debit', () => {
      const record = validRecord();
      delete record['scope'];
      expect(Ledger.safeParse(record).success).toBe(false);
    });

    it('should reject an empty service or scope, which a failed lookup would produce', () => {
      expect(Ledger.safeParse({...validRecord(), service: ''}).success).toBe(false);
      expect(Ledger.safeParse({...validRecord(), scope: ''}).success).toBe(false);
    });
  });

  describe('the consumed field', () => {
    it('should reject a negative consumed quantity', () => {
      expect(Ledger.safeParse({...validRecord(), consumed: -1}).success).toBe(false);
    });

    it('should reject a non-numeric consumed quantity', () => {
      expect(Ledger.safeParse({...validRecord(), consumed: 'abc'}).success).toBe(false);
    });

    it('should distinguish an absent consumed from a zero one', () => {
      const record = validRecord();
      delete record['consumed'];
      const parsed = Ledger.parse(record);
      expect(parsed.consumed).toBeUndefined();
      expect(Ledger.parse({...validRecord(), consumed: 0}).consumed).toBe(0);
    });
  });

  describe('the limit field', () => {
    it('should accept an explicit null, which must survive a JSON round-trip', () => {
      const parsed = Ledger.parse({...validRecord(), limit: null});
      expect(parsed.limit).toBeNull();
      expect(JSON.parse(JSON.stringify(parsed)).limit).toBeNull();
    });

    it('should accept absence, which is a different claim from null', () => {
      const record = validRecord();
      delete record['limit'];
      const parsed = Ledger.parse(record);
      expect(parsed.limit).toBeUndefined();
      expect('limit' in parsed).toBe(false);
    });

    it('should reject a negative limit', () => {
      expect(Ledger.safeParse({...validRecord(), limit: -1}).success).toBe(false);
    });

    it('should reject a non-numeric limit', () => {
      expect(Ledger.safeParse({...validRecord(), limit: 'unlimited'}).success).toBe(false);
    });
  });

  describe('the spendConfirmed marker', () => {
    it('should reject a truthy string, which would otherwise read as confirmed', () => {
      expect(Ledger.safeParse({...validRecord(), spendConfirmed: 'true'}).success).toBe(false);
      expect(Ledger.safeParse({...validRecord(), spendConfirmed: 1}).success).toBe(false);
    });

    it('should treat absence and false as distinguishable but both not-confirmed', () => {
      const record = validRecord();
      delete record['spendConfirmed'];
      expect(Ledger.parse(record).spendConfirmed).toBeUndefined();
      expect(Ledger.parse({...validRecord(), spendConfirmed: false}).spendConfirmed).toBe(false);
    });
  });

  describe('unknown-key policy', () => {
    it('should preserve undeclared fields rather than dropping them', () => {
      const parsed = Ledger.parse({...validRecord(), reserved: 10, unit: 'count'});
      expect(parsed['reserved']).toBe(10);
      expect(parsed['unit']).toBe('count');
    });
  });

  describe('throwing form', () => {
    it('should throw a ParseError naming the shape', () => {
      expect(() => Ledger.parse({service: 's', scope: 'sc'})).toThrow(ParseError);
      expect(() => Ledger.parse({service: 's', scope: 'sc'})).toThrow(/Ledger\.Interface failed validation/);
    });
  });
});
