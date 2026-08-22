/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */

import {describe, it, expect} from 'vitest';
import {MessageUsage} from '../../src/model/MessageUsage.js';
import {ParseError} from '../../src/interface/schema.js';

/**
 * A settled usage record that must parse.
 */
const validRecord = (): Record<string, unknown> => ({
  period: '2026-01-01',
  token: 'token_synthetic',
  reported: 1200,
  pending: {
    identifier: 'identifier_synthetic',
    from: 1200,
    to: 1450,
    delta: 250,
    firstAttemptedAt: {seconds: 1767225600, nanoseconds: 0},
  },
});

describe('MessageUsage.Schema', () => {
  describe('field inventory', () => {
    it('should declare every field of the interface plus the inherited audit fields', () => {
      expect(Object.keys(MessageUsage.Schema.shape).sort()).toEqual([
        'backup',
        'created',
        'expiry',
        'id',
        'pending',
        'period',
        'reported',
        'token',
        'updated',
      ]);
    });
  });

  describe('a valid record', () => {
    it('should parse and return the typed record', () => {
      const parsed = MessageUsage.parse(validRecord());
      expect(parsed.period).toBe('2026-01-01');
      expect(parsed.reported).toBe(1200);
      expect(parsed.pending?.delta).toBe(250);
    });

    it('should parse a dirty marker, which carries only the period and the token', () => {
      const parsed = MessageUsage.parse({period: '2026-01-01', token: 'token_synthetic'});
      expect(parsed.reported).toBeUndefined();
      expect(parsed.pending).toBeUndefined();
    });
  });

  describe('the period format', () => {
    it('should accept a well-formed closed UTC day', () => {
      for (const period of ['2026-01-01', '1999-12-31', '2026-02-29']) {
        expect(MessageUsage.safeParse({...validRecord(), period}).success).toBe(true);
      }
    });

    it('should reject a period that is not in YYYY-MM-DD form', () => {
      for (const period of ['2026-1-1', '01-01-2026', '2026/01/01', '2026-01-01T00:00:00Z', '20260101', '']) {
        const result = MessageUsage.safeParse({...validRecord(), period});
        expect(result.success).toBe(false);
        expect(result.issues?.some((issue) => issue.path === 'period')).toBe(true);
      }
    });

    it('should reject a numeric period rather than coercing it to a string', () => {
      expect(MessageUsage.safeParse({...validRecord(), period: 20260101}).success).toBe(false);
    });

    it('should reject a record with no period', () => {
      const record = validRecord();
      delete record['period'];
      expect(MessageUsage.safeParse(record).success).toBe(false);
    });
  });

  describe('the token', () => {
    it('should reject a record with no token, which could never be cleared safely', () => {
      const record = validRecord();
      delete record['token'];
      const result = MessageUsage.safeParse(record);
      expect(result.success).toBe(false);
      expect(result.issues?.some((issue) => issue.path === 'token')).toBe(true);
    });

    it('should reject an empty token', () => {
      expect(MessageUsage.safeParse({...validRecord(), token: ''}).success).toBe(false);
    });
  });

  describe('the reported watermark', () => {
    it('should reject a non-numeric watermark rather than coercing it', () => {
      expect(MessageUsage.safeParse({...validRecord(), reported: 'abc'}).success).toBe(false);
      expect(MessageUsage.safeParse({...validRecord(), reported: '1200'}).success).toBe(false);
    });

    it('should reject a negative watermark', () => {
      expect(MessageUsage.safeParse({...validRecord(), reported: -1}).success).toBe(false);
    });

    it('should reject NaN, which arithmetic on a coerced string would produce', () => {
      expect(MessageUsage.safeParse({...validRecord(), reported: Number.NaN}).success).toBe(false);
    });

    it('should distinguish an absent watermark from a reported zero', () => {
      const record = validRecord();
      delete record['reported'];
      expect(MessageUsage.parse(record).reported).toBeUndefined();
      expect(MessageUsage.parse({...validRecord(), reported: 0}).reported).toBe(0);
    });
  });

  describe('the pending block', () => {
    it('should reject a pending block with no identifier, which a retry could not match', () => {
      const record = validRecord();
      const pending = {...(record['pending'] as Record<string, unknown>)};
      delete pending['identifier'];
      const result = MessageUsage.safeParse({...record, pending});
      expect(result.success).toBe(false);
      expect(result.issues?.some((issue) => issue.path === 'pending.identifier')).toBe(true);
    });

    it('should reject a non-numeric delta rather than coercing it', () => {
      const pending = {...(validRecord()['pending'] as Record<string, unknown>), delta: 'abc'};
      expect(MessageUsage.safeParse({...validRecord(), pending}).success).toBe(false);
    });

    it('should reject a negative delta, from or to', () => {
      for (const field of ['delta', 'from', 'to']) {
        const pending = {...(validRecord()['pending'] as Record<string, unknown>), [field]: -1};
        expect(MessageUsage.safeParse({...validRecord(), pending}).success).toBe(false);
      }
    });

    it('should accept a pending block whose first attempt is recorded as an ISO string', () => {
      const pending = {
        ...(validRecord()['pending'] as Record<string, unknown>),
        firstAttemptedAt: '2026-01-01T00:00:00.000Z',
      };
      expect(MessageUsage.safeParse({...validRecord(), pending}).success).toBe(true);
    });

    it('should reject a pending block that is not an object', () => {
      expect(MessageUsage.safeParse({...validRecord(), pending: 250}).success).toBe(false);
    });
  });

  describe('unknown-key policy', () => {
    it('should preserve undeclared fields rather than dropping them', () => {
      const parsed = MessageUsage.parse({...validRecord(), markerToken: 'kept'});
      expect(parsed['markerToken']).toBe('kept');
    });
  });

  describe('throwing form', () => {
    it('should throw a ParseError naming the shape', () => {
      expect(() => MessageUsage.parse({period: '2026-01-01'})).toThrow(ParseError);
      expect(() => MessageUsage.parse({period: '2026-01-01'})).toThrow(/MessageUsage\.Interface failed validation/);
    });
  });
});
