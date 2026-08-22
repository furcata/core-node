/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */

import {describe, it, expect} from 'vitest';
import {Capacity} from '../../src/model/Capacity.js';
import {Price} from '../../src/model/Price.js';
import {ParseError} from '../../src/interface/schema.js';

/**
 * A fixed epoch-seconds instant used throughout, so the unit of every assertion
 * below is unambiguous.
 */
const EXPIRES_AT_SECONDS = 1767225600;

/**
 * The same instant in milliseconds, which is what a Firestore timestamp is
 * derived from and what a transposition would wrongly store in `expiresAt`.
 */
const EXPIRES_AT_MILLIS = 1767225600000;

/**
 * A hold that must parse, with the two expiry fields correctly in step.
 */
const validHold = (): Record<string, unknown> => ({
  uid: 'uid_synthetic',
  price: 'price_synthetic',
  source: 'source_synthetic',
  type: Price.Type.event,
  token: 'token_synthetic',
  generation: 3,
  expiresAt: EXPIRES_AT_SECONDS,
  expires: {seconds: EXPIRES_AT_SECONDS, nanoseconds: 0},
});

describe('Capacity.Schema', () => {
  describe('field inventory', () => {
    it('should declare every field of the interface plus the inherited audit fields', () => {
      expect(Object.keys(Capacity.ObjectSchema.shape).sort()).toEqual([
        'backup',
        'created',
        'expires',
        'expiresAt',
        'expiry',
        'generation',
        'id',
        'price',
        'source',
        'token',
        'type',
        'uid',
        'updated',
      ]);
    });

    it('should carry both expiry fields, which are not duplicates of each other', () => {
      const keys = Object.keys(Capacity.ObjectSchema.shape);
      expect(keys).toContain('expiresAt');
      expect(keys).toContain('expires');
    });
  });

  describe('a valid hold', () => {
    it('should parse and return the typed hold', () => {
      const parsed = Capacity.parse(validHold());
      expect(parsed.uid).toBe('uid_synthetic');
      expect(parsed.generation).toBe(3);
      expect(parsed.type).toBe(Price.Type.event);
    });

    it('should parse a hold whose TTL has not been written yet', () => {
      const hold = validHold();
      delete hold['expires'];
      const parsed = Capacity.parse(hold);
      expect(parsed.expiresAt).toBe(EXPIRES_AT_SECONDS);
      expect(parsed.expires).toBeUndefined();
    });
  });

  describe('enum rejection on type', () => {
    it('should accept every declared price type', () => {
      for (const type of Object.values(Price.Type)) {
        expect(Capacity.safeParse({...validHold(), type}).success).toBe(true);
      }
    });

    it('should reject a type that is not a declared member', () => {
      const result = Capacity.safeParse({...validHold(), type: 'subscription'});
      expect(result.success).toBe(false);
      expect(result.issues?.some((issue) => issue.path === 'type')).toBe(true);
    });

    it('should reject plausible-looking but undeclared types', () => {
      for (const type of ['events', 'Event', 'EVENT', 'products', '']) {
        expect(Capacity.safeParse({...validHold(), type}).success).toBe(false);
      }
    });
  });

  describe('missing required fields', () => {
    it.each(['uid', 'price', 'source', 'type', 'token', 'generation', 'expiresAt'])(
      'should reject a hold with no %s',
      (field) => {
        const hold = validHold();
        delete hold[field];
        const result = Capacity.safeParse(hold);
        expect(result.success).toBe(false);
        expect(result.issues?.some((issue) => issue.path === field)).toBe(true);
      },
    );

    it('should reject an empty identifier, which a failed lookup would produce', () => {
      expect(Capacity.safeParse({...validHold(), uid: ''}).success).toBe(false);
      expect(Capacity.safeParse({...validHold(), price: ''}).success).toBe(false);
      expect(Capacity.safeParse({...validHold(), token: ''}).success).toBe(false);
    });
  });

  describe('the generation counter', () => {
    it('should reject a non-numeric generation rather than coercing it', () => {
      expect(Capacity.safeParse({...validHold(), generation: '3'}).success).toBe(false);
      expect(Capacity.safeParse({...validHold(), generation: 'abc'}).success).toBe(false);
    });

    it('should reject a negative or fractional generation', () => {
      expect(Capacity.safeParse({...validHold(), generation: -1}).success).toBe(false);
      expect(Capacity.safeParse({...validHold(), generation: 1.5}).success).toBe(false);
    });
  });

  describe('the two expiry fields, which differ by two characters and a factor of 1000', () => {
    it('should accept expiresAt in epoch seconds', () => {
      expect(Capacity.parse(validHold()).expiresAt).toBe(EXPIRES_AT_SECONDS);
    });

    it('should reject expiresAt supplied in milliseconds', () => {
      const hold = validHold();
      delete hold['expires'];
      const result = Capacity.safeParse({...hold, expiresAt: EXPIRES_AT_MILLIS});
      expect(result.success).toBe(false);
      expect(result.issues?.some((issue) => issue.path === 'expiresAt')).toBe(true);
    });

    it('should reject a numeric expires, because that field is a Firestore timestamp', () => {
      expect(Capacity.safeParse({...validHold(), expires: EXPIRES_AT_SECONDS}).success).toBe(false);
      expect(Capacity.safeParse({...validHold(), expires: EXPIRES_AT_MILLIS}).success).toBe(false);
    });

    it('should round-trip both fields with their units intact', () => {
      const parsed = Capacity.parse(validHold());
      expect(parsed.expiresAt).toBe(EXPIRES_AT_SECONDS);
      expect(parsed.expires?.seconds).toBe(EXPIRES_AT_SECONDS);
      expect(parsed.expires?.seconds).toBe(parsed.expiresAt);
      expect(Capacity.expiresAtToMillis(parsed.expiresAt)).toBe(EXPIRES_AT_MILLIS);
      expect(Capacity.expiresAtToMillis(parsed.expiresAt)).toBe((parsed.expires?.seconds ?? 0) * 1000);
    });

    it('should preserve the expires value by reference, so a live Timestamp keeps its prototype', () => {
      const expires = {seconds: EXPIRES_AT_SECONDS, nanoseconds: 0};
      expect(Capacity.parse({...validHold(), expires}).expires).toBe(expires);
    });

    it('should reject a hold whose expires was derived with the wrong unit, off by 1000x', () => {
      const result = Capacity.safeParse({
        ...validHold(),
        expires: {seconds: EXPIRES_AT_MILLIS, nanoseconds: 0},
      });
      expect(result.success).toBe(false);
      expect(result.issues?.some((issue) => issue.path === 'expires')).toBe(true);
    });

    it('should reject a hold whose expires is off by 1000x in the other direction', () => {
      const result = Capacity.safeParse({
        ...validHold(),
        expires: {seconds: Math.trunc(EXPIRES_AT_SECONDS / 1000), nanoseconds: 0},
      });
      expect(result.success).toBe(false);
    });

    it('should reject a hold whose expires is merely one second out of step', () => {
      const result = Capacity.safeParse({
        ...validHold(),
        expires: {seconds: EXPIRES_AT_SECONDS + 1, nanoseconds: 0},
      });
      expect(result.success).toBe(false);
    });

    it('should not apply the consistency rule when expires is absent', () => {
      const hold = validHold();
      delete hold['expires'];
      expect(Capacity.safeParse(hold).success).toBe(true);
    });

    it('should allow ObjectSchema to accept a partially assembled hold without the consistency rule', () => {
      const inconsistent = {...validHold(), expires: {seconds: EXPIRES_AT_SECONDS + 1, nanoseconds: 0}};
      expect(Capacity.ObjectSchema.safeParse(inconsistent).success).toBe(true);
      expect(Capacity.safeParse(inconsistent).success).toBe(false);
    });
  });

  describe('expiresAtToMillis', () => {
    it('should convert epoch seconds to epoch milliseconds', () => {
      expect(Capacity.expiresAtToMillis(EXPIRES_AT_SECONDS)).toBe(EXPIRES_AT_MILLIS);
    });

    it('should truncate a fractional second rather than producing a fractional millisecond', () => {
      expect(Capacity.expiresAtToMillis(EXPIRES_AT_SECONDS + 0.9)).toBe(EXPIRES_AT_MILLIS);
    });

    it('should agree with the consistency rule the schema enforces', () => {
      const derived = {seconds: Capacity.expiresAtToMillis(EXPIRES_AT_SECONDS) / 1000, nanoseconds: 0};
      expect(Capacity.safeParse({...validHold(), expires: derived}).success).toBe(true);
    });
  });

  describe('unknown-key policy', () => {
    it('should preserve an undeclared field rather than dropping it', () => {
      const parsed = Capacity.parse({...validHold(), checkoutCounted: true});
      expect(parsed['checkoutCounted']).toBe(true);
    });
  });

  describe('throwing form', () => {
    it('should throw a ParseError naming the shape', () => {
      expect(() => Capacity.parse({uid: 'u'})).toThrow(ParseError);
      expect(() => Capacity.parse({uid: 'u'})).toThrow(/Capacity\.Interface failed validation/);
    });
  });
});
