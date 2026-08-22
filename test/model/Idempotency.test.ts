/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */

import {describe, it, expect} from 'vitest';
import {Idempotency} from '../../src/model/Idempotency.js';
import {ParseError} from '../../src/interface/schema.js';

/**
 * A record that must parse. Every negative case below is this object with one
 * field changed, so a failure names the field that caused it.
 */
const validRecord = (): Record<string, unknown> => ({
  state: Idempotency.State.completed,
  requestHash: 'hash_synthetic',
  ownerToken: 'token_synthetic',
  attempts: 2,
  progress: {step_one: 'done'},
  response: {status: 200, body: '{"ok":true}', truncated: false},
  lockExpires: {seconds: 1767225600, nanoseconds: 0},
});

describe('Idempotency.State', () => {
  it('should map each member to its stored value', () => {
    expect(Idempotency.State.inProgress).toBe('in_progress');
    expect(Idempotency.State.completed).toBe('completed');
    expect(Idempotency.State.failed).toBe('failed');
  });

  it('should contain exactly the declared members', () => {
    expect(Object.keys(Idempotency.State).sort()).toEqual(['completed', 'failed', 'inProgress']);
  });
});

describe('Idempotency.Schema', () => {
  describe('field inventory', () => {
    it('should declare every field of the interface plus the inherited audit fields', () => {
      expect(Object.keys(Idempotency.Schema.shape).sort()).toEqual([
        'attempts',
        'backup',
        'created',
        'expiry',
        'id',
        'lockExpires',
        'ownerToken',
        'progress',
        'requestHash',
        'response',
        'state',
        'updated',
      ]);
    });
  });

  describe('a valid record', () => {
    it('should parse and return the typed record', () => {
      const parsed = Idempotency.parse(validRecord());
      expect(parsed.state).toBe(Idempotency.State.completed);
      expect(parsed.attempts).toBe(2);
      expect(parsed.response?.status).toBe(200);
    });

    it('should parse a minimal record carrying only the required fields', () => {
      const parsed = Idempotency.parse({state: Idempotency.State.inProgress, requestHash: 'h'});
      expect(parsed.state).toBe(Idempotency.State.inProgress);
      expect(parsed.ownerToken).toBeUndefined();
    });

    it('should accept every declared state', () => {
      for (const state of Object.values(Idempotency.State)) {
        expect(Idempotency.safeParse({state, requestHash: 'h'}).success).toBe(true);
      }
    });
  });

  describe('enum rejection', () => {
    it('should reject a state that is not a declared member', () => {
      const result = Idempotency.safeParse({...validRecord(), state: 'in-progress'});
      expect(result.success).toBe(false);
      expect(result.issues?.[0]?.path).toBe('state');
    });

    it('should reject a plausible-looking but undeclared state', () => {
      for (const state of ['pending', 'done', 'success', 'IN_PROGRESS', 'Completed']) {
        expect(Idempotency.safeParse({...validRecord(), state}).success).toBe(false);
      }
    });

    it('should reject a non-string state', () => {
      expect(Idempotency.safeParse({...validRecord(), state: 1}).success).toBe(false);
      expect(Idempotency.safeParse({...validRecord(), state: null}).success).toBe(false);
    });
  });

  describe('missing required fields', () => {
    it('should reject a record with no state', () => {
      const record = validRecord();
      delete record['state'];
      const result = Idempotency.safeParse(record);
      expect(result.success).toBe(false);
      expect(result.issues?.some((issue) => issue.path === 'state')).toBe(true);
    });

    it('should reject a record with no requestHash', () => {
      const record = validRecord();
      delete record['requestHash'];
      expect(Idempotency.safeParse(record).success).toBe(false);
    });

    it('should reject an empty requestHash, which a failed digest would produce', () => {
      expect(Idempotency.safeParse({...validRecord(), requestHash: ''}).success).toBe(false);
    });
  });

  describe('numeric fields', () => {
    it('should reject a non-numeric attempts count rather than coercing it', () => {
      expect(Idempotency.safeParse({...validRecord(), attempts: 'abc'}).success).toBe(false);
      expect(Idempotency.safeParse({...validRecord(), attempts: '2'}).success).toBe(false);
    });

    it('should reject a negative or fractional attempts count', () => {
      expect(Idempotency.safeParse({...validRecord(), attempts: -1}).success).toBe(false);
      expect(Idempotency.safeParse({...validRecord(), attempts: 1.5}).success).toBe(false);
    });
  });

  describe('the stored response', () => {
    it('should accept a null body, which means the original response had none', () => {
      const record = {...validRecord(), response: {status: 204, body: null, truncated: false}};
      const parsed = Idempotency.parse(record);
      expect(parsed.response?.body).toBeNull();
    });

    it('should reject a response with a missing body key, which is a different claim from null', () => {
      const record = {...validRecord(), response: {status: 200, truncated: false}};
      expect(Idempotency.safeParse(record).success).toBe(false);
    });

    it('should reject a status outside the HTTP range', () => {
      expect(Idempotency.safeParse({...validRecord(), response: {status: 99, body: null, truncated: false}}).success).toBe(false);
      expect(Idempotency.safeParse({...validRecord(), response: {status: 600, body: null, truncated: false}}).success).toBe(false);
    });

    it('should reject a non-boolean truncated flag', () => {
      const record = {...validRecord(), response: {status: 200, body: null, truncated: 'false'}};
      expect(Idempotency.safeParse(record).success).toBe(false);
    });
  });

  describe('lockExpires', () => {
    it('should accept a timestamp-like value and preserve it by reference', () => {
      const lockExpires = {seconds: 1767225600, nanoseconds: 0};
      const parsed = Idempotency.parse({...validRecord(), lockExpires});
      expect(parsed.lockExpires).toBe(lockExpires);
    });

    it('should reject a numeric lease expiry, because the field is a Firestore timestamp', () => {
      expect(Idempotency.safeParse({...validRecord(), lockExpires: 1767225600000}).success).toBe(false);
    });
  });

  describe('unknown-key policy', () => {
    it('should preserve an undeclared field rather than dropping it', () => {
      const parsed = Idempotency.parse({...validRecord(), expires: {seconds: 1, nanoseconds: 0}});
      expect(parsed['expires']).toEqual({seconds: 1, nanoseconds: 0});
    });
  });

  describe('throwing form', () => {
    it('should throw a ParseError naming the shape', () => {
      expect(() => Idempotency.parse({requestHash: 'h'})).toThrow(ParseError);
      expect(() => Idempotency.parse({requestHash: 'h'})).toThrow(/Idempotency\.Interface failed validation/);
    });
  });
});
