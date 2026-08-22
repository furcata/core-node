/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */

import {describe, it, expect} from 'vitest';
import {Reservation} from '../../src/model/Reservation.js';
import {Capacity} from '../../src/model/Capacity.js';
import {ParseError} from '../../src/interface/schema.js';

/**
 * A fixed epoch-milliseconds instant, well above the epoch-seconds range so the
 * unit is unambiguous in every assertion below.
 */
const EXPIRES_AT_MILLIS = 1767225600000;

/**
 * The same instant expressed in epoch seconds, used to prove the two units are
 * not interchangeable.
 */
const EXPIRES_AT_SECONDS = 1767225600;

/**
 * An entry that must parse.
 */
const validEntry = (): Record<string, unknown> => ({
  token: 'token_synthetic',
  identity: 'identity_synthetic',
  expiresAt: EXPIRES_AT_MILLIS,
});

describe('Reservation.Schema', () => {
  describe('field inventory', () => {
    it('should declare exactly the three load-bearing fields and no audit fields', () => {
      expect(Object.keys(Reservation.Schema.shape).sort()).toEqual(['expiresAt', 'identity', 'token']);
    });
  });

  describe('a valid entry', () => {
    it('should parse and return the typed entry', () => {
      const parsed = Reservation.parse(validEntry());
      expect(parsed.token).toBe('token_synthetic');
      expect(parsed.identity).toBe('identity_synthetic');
      expect(parsed.expiresAt).toBe(EXPIRES_AT_MILLIS);
    });
  });

  describe('missing required fields', () => {
    it('should reject an entry with no token', () => {
      const entry = validEntry();
      delete entry['token'];
      const result = Reservation.safeParse(entry);
      expect(result.success).toBe(false);
      expect(result.issues?.some((issue) => issue.path === 'token')).toBe(true);
    });

    it('should reject an entry with no identity', () => {
      const entry = validEntry();
      delete entry['identity'];
      expect(Reservation.safeParse(entry).success).toBe(false);
    });

    it('should reject an entry with no expiry, which would never lapse', () => {
      const entry = validEntry();
      delete entry['expiresAt'];
      expect(Reservation.safeParse(entry).success).toBe(false);
    });

    it('should reject an empty token or identity', () => {
      expect(Reservation.safeParse({...validEntry(), token: ''}).success).toBe(false);
      expect(Reservation.safeParse({...validEntry(), identity: ''}).success).toBe(false);
    });
  });

  describe('the expiresAt unit', () => {
    it('should accept an epoch-milliseconds instant', () => {
      expect(Reservation.safeParse({...validEntry(), expiresAt: EXPIRES_AT_MILLIS}).success).toBe(true);
    });

    it('should reject the same instant expressed in seconds', () => {
      const result = Reservation.safeParse({...validEntry(), expiresAt: EXPIRES_AT_SECONDS});
      expect(result.success).toBe(false);
      expect(result.issues?.some((issue) => issue.path === 'expiresAt')).toBe(true);
    });

    it('should reject a value this package would accept as a Capacity expiry, proving the units do not overlap', () => {
      const capacityExpiry = EXPIRES_AT_SECONDS;
      expect(Capacity.Schema.safeParse({
        uid: 'uid_synthetic',
        price: 'price_synthetic',
        source: 'source_synthetic',
        type: 'event',
        token: 'token_synthetic',
        generation: 1,
        expiresAt: capacityExpiry,
      }).success).toBe(true);
      expect(Reservation.safeParse({...validEntry(), expiresAt: capacityExpiry}).success).toBe(false);
    });

    it('should reject a non-numeric expiry rather than coercing it', () => {
      expect(Reservation.safeParse({...validEntry(), expiresAt: '1767225600000'}).success).toBe(false);
      expect(Reservation.safeParse({...validEntry(), expiresAt: 'abc'}).success).toBe(false);
    });

    it('should reject a fractional expiry', () => {
      expect(Reservation.safeParse({...validEntry(), expiresAt: EXPIRES_AT_MILLIS + 0.5}).success).toBe(false);
    });
  });

  describe('isActive', () => {
    it('should report a future reservation as active', () => {
      const reservation = Reservation.parse({...validEntry(), expiresAt: EXPIRES_AT_MILLIS});
      expect(Reservation.isActive(reservation, EXPIRES_AT_MILLIS - 1)).toBe(true);
    });

    it('should report a lapsed reservation as inactive', () => {
      const reservation = Reservation.parse({...validEntry(), expiresAt: EXPIRES_AT_MILLIS});
      expect(Reservation.isActive(reservation, EXPIRES_AT_MILLIS + 1)).toBe(false);
    });

    it('should treat the exact expiry instant as lapsed', () => {
      const reservation = Reservation.parse({...validEntry(), expiresAt: EXPIRES_AT_MILLIS});
      expect(Reservation.isActive(reservation, EXPIRES_AT_MILLIS)).toBe(false);
    });
  });

  describe('unknown-key policy', () => {
    it('should preserve an undeclared field rather than dropping it', () => {
      const parsed = Reservation.parse({...validEntry(), seat: 'A1'});
      expect(parsed['seat']).toBe('A1');
    });
  });

  describe('throwing form', () => {
    it('should throw a ParseError naming the shape', () => {
      expect(() => Reservation.parse({token: 't'})).toThrow(ParseError);
      expect(() => Reservation.parse({token: 't'})).toThrow(/Reservation\.Interface failed validation/);
    });
  });
});
