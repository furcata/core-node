/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */

import {describe, it, expect} from 'vitest';
import {z} from 'zod';
import {
  auditTimestamp,
  counter,
  documentId,
  epochMillis,
  epochSeconds,
  finiteNumber,
  isTimestampLike,
  matchMember,
  nonEmptyString,
  nonNegativeNumber,
  openValue,
  ParseError,
  parseOrThrow,
  parseResult,
  requireMember,
  requiredKey,
  timestampLike,
  token,
} from '../../src/interface/schema.js';
import {messageQueueShape, safeParseMessageQueue} from '../../src/interface/queue.js';
import {placeDataShape, safeParsePlaceData} from '../../src/interface/place.js';
import {
  Account,
  Block,
  Capacity,
  Entitlement,
  EventData,
  Idempotency,
  Ledger,
  MessageUsage,
  MessagingEvent,
  Post,
  Price,
  Reservation,
} from '../../src/model/index.js';

/**
 * Minimal stand-in for a Firestore `Timestamp`, exposing `seconds` and
 * `nanoseconds` as prototype getters exactly as the real class does. Declared
 * here rather than imported so the suite stays free of any cloud SDK.
 */
class FakeTimestamp {
  private readonly _seconds: number;
  private readonly _nanoseconds: number;

  constructor(seconds: number, nanoseconds: number) {
    this._seconds = seconds;
    this._nanoseconds = nanoseconds;
  }

  get seconds(): number {
    return this._seconds;
  }

  get nanoseconds(): number {
    return this._nanoseconds;
  }

  toMillis(): number {
    return this._seconds * 1000 + Math.trunc(this._nanoseconds / 1e6);
  }
}

describe('schema primitives', () => {
  describe('finiteNumber', () => {
    it('should accept a finite number', () => {
      const schema = finiteNumber();
      expect(schema.safeParse(2500).success).toBe(true);
      expect(schema.safeParse(-2500).success).toBe(true);
      expect(schema.safeParse(0).success).toBe(true);
    });

    it('should reject a non-numeric string rather than coercing it to NaN', () => {
      const result = finiteNumber().safeParse('abc');
      expect(result.success).toBe(false);
      expect(Number('abc')).toBeNaN();
    });

    it('should reject NaN', () => {
      expect(finiteNumber().safeParse(Number.NaN).success).toBe(false);
    });

    it('should reject both infinities', () => {
      expect(finiteNumber().safeParse(Number.POSITIVE_INFINITY).success).toBe(false);
      expect(finiteNumber().safeParse(Number.NEGATIVE_INFINITY).success).toBe(false);
    });

    it('should reject a numeric string, because acceptance would be coercion', () => {
      expect(finiteNumber().safeParse('2500').success).toBe(false);
    });
  });

  describe('nonNegativeNumber', () => {
    it('should accept zero and positive values', () => {
      expect(nonNegativeNumber().safeParse(0).success).toBe(true);
      expect(nonNegativeNumber().safeParse(12.5).success).toBe(true);
    });

    it('should reject a negative value', () => {
      expect(nonNegativeNumber().safeParse(-1).success).toBe(false);
    });
  });

  describe('counter', () => {
    it('should accept a non-negative whole number', () => {
      expect(counter().safeParse(0).success).toBe(true);
      expect(counter().safeParse(7).success).toBe(true);
    });

    it('should reject a fractional value', () => {
      expect(counter().safeParse(1.5).success).toBe(false);
    });

    it('should reject a negative value', () => {
      expect(counter().safeParse(-1).success).toBe(false);
    });
  });

  describe('nonEmptyString, documentId and token', () => {
    it('should reject an empty string', () => {
      expect(nonEmptyString().safeParse('').success).toBe(false);
      expect(documentId().safeParse('').success).toBe(false);
      expect(token().safeParse('').success).toBe(false);
    });

    it('should accept a populated string', () => {
      expect(nonEmptyString().safeParse('value').success).toBe(true);
      expect(documentId().safeParse('doc_synthetic').success).toBe(true);
      expect(token().safeParse('token_synthetic').success).toBe(true);
    });

    it('should reject a document id longer than the Firestore document-name limit', () => {
      expect(documentId().safeParse('a'.repeat(1501)).success).toBe(false);
      expect(documentId().safeParse('a'.repeat(1500)).success).toBe(true);
    });

    it('should reject a token longer than the bound', () => {
      expect(token().safeParse('a'.repeat(513)).success).toBe(false);
    });
  });

  describe('epochSeconds and epochMillis ranges', () => {
    const nowSeconds = 1767225600;
    const nowMillis = 1767225600000;

    it('should accept an epoch-seconds value in the seconds schema', () => {
      expect(epochSeconds().safeParse(nowSeconds).success).toBe(true);
    });

    it('should accept an epoch-milliseconds value in the milliseconds schema', () => {
      expect(epochMillis().safeParse(nowMillis).success).toBe(true);
    });

    it('should reject a milliseconds value in the seconds schema', () => {
      expect(epochSeconds().safeParse(nowMillis).success).toBe(false);
    });

    it('should reject a seconds value in the milliseconds schema', () => {
      expect(epochMillis().safeParse(nowSeconds).success).toBe(false);
    });

    it('should keep the two accepted ranges disjoint, so no value validates as both units', () => {
      const candidates = [0, 1, nowSeconds, 9_999_999_999, 1_000_000_000_000, nowMillis, 9_999_999_999_999];
      for (const candidate of candidates) {
        const asSeconds = epochSeconds().safeParse(candidate).success;
        const asMillis = epochMillis().safeParse(candidate).success;
        expect(asSeconds && asMillis).toBe(false);
      }
    });

    it('should reject a fractional instant in either unit', () => {
      expect(epochSeconds().safeParse(1767225600.5).success).toBe(false);
      expect(epochMillis().safeParse(1767225600000.5).success).toBe(false);
    });
  });

  describe('isTimestampLike', () => {
    it('should accept a class instance exposing seconds and nanoseconds as getters', () => {
      expect(isTimestampLike(new FakeTimestamp(1767225600, 0))).toBe(true);
    });

    it('should accept a plain object recovered from JSON', () => {
      expect(isTimestampLike({seconds: 1767225600, nanoseconds: 0})).toBe(true);
    });

    it('should reject a value whose components are not numbers', () => {
      expect(isTimestampLike({seconds: '1767225600', nanoseconds: 0})).toBe(false);
    });

    it('should reject null, a primitive and an array', () => {
      expect(isTimestampLike(null)).toBe(false);
      expect(isTimestampLike(1767225600)).toBe(false);
      expect(isTimestampLike([1767225600, 0])).toBe(false);
    });
  });

  describe('timestampLike', () => {
    it('should preserve the original instance rather than rebuilding it', () => {
      const original = new FakeTimestamp(1767225600, 0);
      const result = timestampLike().safeParse(original);
      expect(result.success).toBe(true);
      expect(result.data).toBe(original);
      expect(result.data).toBeInstanceOf(FakeTimestamp);
      expect(result.data?.toMillis?.()).toBe(1767225600000);
    });

    it('should demonstrate why identity preservation matters, by contrast with an object schema', () => {
      const original = new FakeTimestamp(1767225600, 0);
      const rebuilt = z.object({seconds: z.number(), nanoseconds: z.number()}).parse(original);
      expect(rebuilt).not.toBe(original);
      expect(rebuilt).not.toBeInstanceOf(FakeTimestamp);
      expect((rebuilt as {toMillis?: () => number}).toMillis).toBeUndefined();
    });

    it('should reject a value that is not timestamp-like', () => {
      expect(timestampLike().safeParse('2026-01-01T00:00:00Z').success).toBe(false);
    });
  });

  describe('auditTimestamp', () => {
    it('should accept a timestamp-like value', () => {
      expect(auditTimestamp().safeParse(new FakeTimestamp(1767225600, 0)).success).toBe(true);
    });

    it('should accept a Date', () => {
      expect(auditTimestamp().safeParse(new Date(1767225600000)).success).toBe(true);
    });

    it('should accept an ISO 8601 string', () => {
      expect(auditTimestamp().safeParse('2026-01-01T00:00:00.000Z').success).toBe(true);
    });

    it('should accept an epoch number', () => {
      expect(auditTimestamp().safeParse(1767225600000).success).toBe(true);
    });

    it('should reject an invalid Date', () => {
      expect(auditTimestamp().safeParse(new Date('not a date')).success).toBe(false);
    });

    it('should reject null, an empty string, a boolean and a plain non-timestamp object', () => {
      expect(auditTimestamp().safeParse(null).success).toBe(false);
      expect(auditTimestamp().safeParse('').success).toBe(false);
      expect(auditTimestamp().safeParse(true).success).toBe(false);
      expect(auditTimestamp().safeParse({when: 'soon'}).success).toBe(false);
    });
  });

  describe('openValue', () => {
    it('should accept any value and pass an object through by reference', () => {
      const marker = {arbitrary: 'diagnostic snapshot'};
      const result = openValue().safeParse(marker);
      expect(result.success).toBe(true);
      expect(result.data).toBe(marker);
    });

    it('should accept absence', () => {
      expect(openValue().safeParse(undefined).success).toBe(true);
    });
  });

  describe('requiredKey', () => {
    const schema = z.looseObject({v: requiredKey(z.union([z.string(), z.number()]), 'Expected a string or number')});

    it('should still accept every value the inner schema accepts', () => {
      expect(schema.safeParse({v: 'text'}).success).toBe(true);
      expect(schema.safeParse({v: 7}).success).toBe(true);
    });

    it('should still reject every value the inner schema rejects', () => {
      expect(schema.safeParse({v: true}).success).toBe(false);
      expect(schema.safeParse({v: null}).success).toBe(false);
    });

    it('should reject a missing key', () => {
      expect(schema.safeParse({}).success).toBe(false);
    });

    it('should report the failure at the key path', () => {
      const result = schema.safeParse({v: true});
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.path).toEqual(['v']);
    });
  });
});

describe('parse plumbing', () => {
  const schema = z.looseObject({
    account: nonEmptyString(),
    amount: finiteNumber().optional(),
  });

  describe('parseResult', () => {
    it('should return a success branch carrying the data', () => {
      const result = parseResult(schema, {account: 'acc_synthetic', amount: 100}, 'Fixture');
      expect(result.success).toBe(true);
      // Narrowing on `success` is the only route to the document, by construction.
      expect(result.success && result.data).toEqual({account: 'acc_synthetic', amount: 100});
      expect(result.issues).toBeUndefined();
    });

    it('should return a failure branch with no data at all', () => {
      const result = parseResult(schema, {amount: 100}, 'Fixture');
      expect(result.success).toBe(false);
      expect(result.success ? result.data : undefined).toBeUndefined();
    });

    it('should report every reason, not only the first', () => {
      const result = parseResult(schema, {amount: 'abc'}, 'Fixture');
      expect(result.success).toBe(false);
      expect(result.issues?.length).toBe(2);
      expect(result.issues?.map((issue) => issue.path).sort()).toEqual(['account', 'amount']);
    });

    it('should build a message naming the shape and the failing paths', () => {
      const result = parseResult(schema, {amount: 'abc'}, 'Fixture');
      expect(result.message).toContain('Fixture failed validation');
      expect(result.message).toContain('amount');
    });

    it('should carry a machine-readable code alongside the message', () => {
      const result = parseResult(schema, {account: 'a', amount: 'abc'}, 'Fixture');
      expect(result.issues?.[0]?.code).toBe('invalid_type');
    });

    it('should never throw, even on a value of an entirely wrong kind', () => {
      expect(() => parseResult(schema, 'not an object', 'Fixture')).not.toThrow();
      expect(parseResult(schema, null, 'Fixture').success).toBe(false);
    });
  });

  describe('parseOrThrow', () => {
    it('should return the data when the value conforms', () => {
      expect(parseOrThrow(schema, {account: 'acc_synthetic'}, 'Fixture')).toEqual({account: 'acc_synthetic'});
    });

    it('should throw a ParseError carrying the structured issues', () => {
      let thrown: unknown;
      try {
        parseOrThrow(schema, {amount: 'abc'}, 'Fixture');
      } catch (error) {
        thrown = error;
      }
      expect(thrown).toBeInstanceOf(ParseError);
      expect((thrown as ParseError).name).toBe('ParseError');
      expect((thrown as ParseError).issues.length).toBe(2);
      expect((thrown as ParseError).message).toContain('Fixture failed validation');
    });

    it('should throw rather than returning a partially valid value', () => {
      expect(() => parseOrThrow(schema, {account: 'a', amount: 'abc'}, 'Fixture')).toThrow(ParseError);
    });
  });

  describe('unknown-key policy', () => {
    it('should preserve an unknown key rather than dropping it', () => {
      const result = parseResult(schema, {account: 'acc_synthetic', legacyField: 'kept'}, 'Fixture');
      expect(result.success).toBe(true);
      expect(result.success && result.data['legacyField']).toBe('kept');
    });

    it('should demonstrate the contrast with a stripping schema, which deletes it silently', () => {
      const stripping = z.object({account: nonEmptyString()});
      const stripped = stripping.parse({account: 'acc_synthetic', legacyField: 'lost'});
      expect((stripped as Record<string, unknown>)['legacyField']).toBeUndefined();
    });

    it('should preserve a nested unknown value by reference', () => {
      const nested = {deep: true};
      const result = parseResult(schema, {account: 'acc_synthetic', extra: nested}, 'Fixture');
      expect(result.success && result.data['extra']).toBe(nested);
    });
  });
});

/**
 * Package-wide null and optionality policy.
 *
 * `tsconfig.json` previously set `strictNullChecks: false`, under which `null`
 * was assignable to every type, leaving every `| null` annotation in this
 * package **unenforced by our own compiler** while still being emitted into the
 * shipped `.d.ts` and enforced in a consumer that compiles strictly. That flag
 * is now enabled, so the annotations are enforced locally too.
 *
 * These tests remain the primary enforcement, because the asymmetry they guard
 * is not one the compiler can see: a schema rejecting `null` where the interface
 * promises `| null` — or accepting it where the interface does not — is a
 * runtime-versus-declaration mismatch, and no amount of type checking compares
 * those two artifacts against each other.
 *
 * These tests are the enforcement. Each entry states, explicitly, which keys
 * accept `null` and which are required, and the assertions compare that
 * statement against what the schema actually does. Adding `.nullable()` to a
 * field without also declaring `| null` on its interface turns one of them red,
 * and so does the reverse.
 *
 * The policy itself is:
 *
 * - A field annotated `| null` **accepts `null`** via `.nullable()`.
 * - A field annotated only `?` **rejects `null`**, because `?` and `| null` are
 *   different claims and a parse must not return a value the declared type says
 *   cannot occur.
 * - A field annotated `any` is decided case by case and named below, because
 *   `any` permits `null` without meaning to. The audit and event timestamps
 *   **reject** it — an explicitly null timestamp is not a time, and reading one
 *   as epoch zero sorts it first and expires it immediately — while genuinely
 *   open diagnostic fields accept it.
 * - `.nullish()` is used nowhere. Optionality and nullability are declared
 *   separately so each one is a deliberate statement rather than a side effect
 *   of the other.
 */
describe('null and optionality policy', () => {
  /**
   * One schema under test, with the base document used to isolate a single
   * field, and the explicit inventories the assertions compare against.
   */
  interface PolicyCase {
    /** Name of the shape, used in test titles. */
    label: string;
    /** Keys the schema declares, in the order they should be probed. */
    keys: string[];
    /** Parses a candidate document. */
    parse: (value: unknown) => {success: boolean};
    /** A document that parses, used as the baseline for every probe. */
    base: Record<string, unknown>;
    /** Keys that must accept an explicit `null`. */
    nullAccepting: string[];
    /** Keys whose absence must be rejected. */
    required: string[];
  }

  const cases: PolicyCase[] = [
    {
      label: 'PlaceData',
      keys: Object.keys(placeDataShape),
      parse: (value) => safeParsePlaceData(value),
      base: {id: 'place_synthetic', latitude: 1, longitude: 1},
      // Exactly the thirteen fields place.ts declares as `X | null`.
      nullAccepting: [
        'area', 'areaLong', 'city', 'cityLong', 'country', 'countryLong',
        'longName', 'name', 'postalCode', 'state', 'stateLong', 'url', 'vicinity',
      ],
      required: [],
    },
    {
      label: 'MessageQueue',
      keys: Object.keys(messageQueueShape),
      parse: (value) => safeParseMessageQueue(value),
      base: {pending: 1},
      // `counted` alone, because it is declared `any` and genuinely open.
      nullAccepting: ['counted'],
      required: [],
    },
    {
      label: 'Price.Interface',
      keys: Object.keys(Price.Schema.shape),
      parse: (value) => Price.safeParse(value),
      base: {account: 'account_synthetic'},
      nullAccepting: ['uid'],
      required: ['account'],
    },
    {
      label: 'EventData.Interface',
      keys: Object.keys(EventData.Schema.shape),
      parse: (value) => EventData.safeParse(value),
      base: {},
      nullAccepting: ['uid'],
      required: [],
    },
    {
      label: 'MessagingEvent.Interface',
      keys: Object.keys(MessagingEvent.Schema.shape),
      parse: (value) => MessagingEvent.safeParse(value),
      base: {},
      nullAccepting: ['uid', 'error'],
      required: [],
    },
    {
      label: 'Post.Interface',
      keys: Object.keys(Post.Schema.shape),
      parse: (value) => Post.safeParse(value),
      base: {source: 'source_synthetic', type: Post.Type.link},
      nullAccepting: [],
      required: ['source', 'type'],
    },
    {
      label: 'Block.Interface',
      keys: Object.keys(Block.Schema.shape),
      parse: (value) => Block.safeParse(value),
      base: {type: Block.Type.text, value: 'v', label: 'l'},
      nullAccepting: [],
      required: ['type', 'value', 'label'],
    },
    {
      label: 'Account.Interface',
      keys: Object.keys(Account.Schema.shape),
      parse: (value) => Account.safeParse(value),
      base: {},
      nullAccepting: ['counted'],
      required: [],
    },
    {
      label: 'Idempotency.Interface',
      keys: Object.keys(Idempotency.Schema.shape),
      parse: (value) => Idempotency.safeParse(value),
      base: {state: Idempotency.State.failed, requestHash: 'h'},
      nullAccepting: [],
      required: ['state', 'requestHash'],
    },
    {
      label: 'Ledger.Interface',
      keys: Object.keys(Ledger.Schema.shape),
      parse: (value) => Ledger.safeParse(value),
      base: {service: 's', scope: 'sc', amount: 1},
      nullAccepting: ['limit'],
      required: ['service', 'scope', 'amount'],
    },
    {
      label: 'Reservation.Interface',
      keys: Object.keys(Reservation.Schema.shape),
      parse: (value) => Reservation.safeParse(value),
      base: {token: 't', identity: 'i', expiresAt: 1767225600000},
      nullAccepting: [],
      required: ['token', 'identity', 'expiresAt'],
    },
    {
      label: 'Entitlement.Interface',
      keys: Object.keys(Entitlement.Schema.shape),
      parse: (value) => Entitlement.safeParse(value),
      base: {account: 'a', uid: 'u', price: 'p', source: 's', type: Price.Type.event},
      nullAccepting: [],
      required: ['account', 'uid', 'price', 'source', 'type'],
    },
    {
      label: 'Capacity.Interface',
      keys: Object.keys(Capacity.ObjectSchema.shape),
      parse: (value) => Capacity.safeParse(value),
      base: {uid: 'u', price: 'p', source: 's', type: Price.Type.event, token: 't', generation: 0, expiresAt: 1767225600},
      nullAccepting: [],
      required: ['uid', 'price', 'source', 'type', 'token', 'generation', 'expiresAt'],
    },
    {
      label: 'MessageUsage.Interface',
      keys: Object.keys(MessageUsage.Schema.shape),
      parse: (value) => MessageUsage.safeParse(value),
      base: {period: '2026-01-01', token: 't'},
      nullAccepting: [],
      required: ['period', 'token'],
    },
  ];

  describe('the base document of every case must parse', () => {
    it.each(cases.map((entry) => [entry.label, entry] as const))(
      '%s should have a baseline that parses, or every probe below is vacuous',
      (_label, entry) => {
        expect(entry.parse(entry.base).success).toBe(true);
      },
    );
  });

  describe('null acceptance', () => {
    it.each(cases.map((entry) => [entry.label, entry] as const))(
      '%s should accept null on exactly the declared nullable fields',
      (_label, entry) => {
        const accepting = entry.keys.filter((key) => entry.parse({...entry.base, [key]: null}).success);
        expect(accepting.sort()).toEqual([...entry.nullAccepting].sort());
      },
    );
  });

  describe('required fields', () => {
    it.each(cases.map((entry) => [entry.label, entry] as const))(
      '%s should reject the absence of exactly the declared required fields',
      (_label, entry) => {
        const rejectingAbsence = entry.keys.filter((key) => {
          const candidate = {...entry.base};
          delete candidate[key];
          return !entry.parse(candidate).success;
        });
        expect(rejectingAbsence.sort()).toEqual([...entry.required].sort());
      },
    );
  });

  describe('the audit timestamps, which are declared any but narrowed at the boundary', () => {
    it('should reject an explicitly null created, updated or expiry', () => {
      for (const field of ['created', 'updated', 'expiry']) {
        expect(Price.safeParse({account: 'a', [field]: null}).success).toBe(false);
      }
    });

    it('should reject an explicitly null startTime, endTime or domainTimestamp', () => {
      expect(EventData.safeParse({startTime: null}).success).toBe(false);
      expect(EventData.safeParse({endTime: null}).success).toBe(false);
      expect(Account.safeParse({domainTimestamp: null}).success).toBe(false);
    });

    it('should still accept their absence, because the fields are optional', () => {
      expect(Price.safeParse({account: 'a'}).success).toBe(true);
      expect(EventData.safeParse({}).success).toBe(true);
    });
  });

  describe('the required-and-nullable case', () => {
    it('should accept a null response body while still rejecting its absence', () => {
      const base = {state: Idempotency.State.completed, requestHash: 'h'};
      expect(Idempotency.safeParse({...base, response: {status: 204, body: null, truncated: false}}).success).toBe(true);
      expect(Idempotency.safeParse({...base, response: {status: 204, truncated: false}}).success).toBe(false);
    });
  });

  describe('nullish is used nowhere', () => {
    it('should never treat null and absence as interchangeable on a required field', () => {
      expect(Ledger.safeParse({service: 's', scope: 'sc', amount: null}).success).toBe(false);
      const withoutAmount: Record<string, unknown> = {service: 's', scope: 'sc'};
      expect(Ledger.safeParse(withoutAmount).success).toBe(false);
    });

    it('should distinguish a null nullable field from an absent one after parsing', () => {
      const withNull = Ledger.safeParse({service: 's', scope: 'sc', amount: 1, limit: null});
      const withoutLimit = Ledger.safeParse({service: 's', scope: 'sc', amount: 1});
      expect(withNull.success && withNull.data.limit).toBeNull();
      expect(withoutLimit.success && 'limit' in withoutLimit.data).toBe(false);
    });
  });
});

/**
 * A caller-owned enumeration, standing in for a vocabulary this package
 * deliberately does not declare. Declared here so the suite depends on no
 * external vocabulary.
 */
enum LocalService {
  alpha = 'alpha',
  beta = 'beta',
}

describe('member narrowing', () => {
  describe('matchMember', () => {
    it('should match a declared member and carry it typed', () => {
      const result = matchMember(LocalService, 'alpha');
      expect(result.matched).toBe(true);
      expect(result.matched && result.member).toBe(LocalService.alpha);
    });

    it('should match every declared member', () => {
      for (const member of Object.values(LocalService)) {
        expect(matchMember(LocalService, member).matched).toBe(true);
      }
    });

    it('should miss a string that is not a member', () => {
      const result = matchMember(LocalService, 'gamma');
      expect(result.matched).toBe(false);
      expect(result.matched === false && result.value).toBe('gamma');
    });

    it('should miss on casing or whitespace rather than normalising', () => {
      for (const candidate of ['Alpha', 'ALPHA', ' alpha', 'alpha ']) {
        expect(matchMember(LocalService, candidate).matched).toBe(false);
      }
    });

    it('should miss the empty string', () => {
      const result = matchMember(LocalService, '');
      expect(result.matched).toBe(false);
      expect(result.matched === false && result.value).toBe('');
    });

    it('should miss null and undefined, carrying each so absence stays distinguishable from invalidity', () => {
      const absent = matchMember(LocalService, undefined);
      const explicitNull = matchMember(LocalService, null);
      const wrong = matchMember(LocalService, 'gamma');
      expect([absent.matched, explicitNull.matched, wrong.matched]).toEqual([false, false, false]);
      expect(absent.matched === false && absent.value).toBeUndefined();
      expect(explicitNull.matched === false && explicitNull.value).toBeNull();
      expect(wrong.matched === false && wrong.value).toBe('gamma');
    });

    it('should miss a non-string of any kind', () => {
      for (const candidate of [1, true, {member: 'alpha'}, ['alpha']]) {
        expect(matchMember(LocalService, candidate).matched).toBe(false);
      }
    });

    it('should compose with a parsed document, which is the intended call shape', () => {
      const record = Ledger.parse({service: 'alpha', scope: 'scope_synthetic', amount: 1});
      const result = matchMember(LocalService, record.service);
      expect(result.matched && result.member).toBe(LocalService.alpha);
    });

    it('should miss when a parsed document carries a service this caller does not know', () => {
      const record = Ledger.parse({service: 'omega', scope: 'scope_synthetic', amount: 1});
      expect(matchMember(LocalService, record.service).matched).toBe(false);
    });
  });

  describe('requireMember', () => {
    it('should return the typed member when the value is one', () => {
      expect(requireMember(LocalService, 'beta', 'service')).toBe(LocalService.beta);
    });

    it('should throw a ParseError naming the field and the accepted values', () => {
      expect(() => requireMember(LocalService, 'gamma', 'service')).toThrow(ParseError);
      expect(() => requireMember(LocalService, 'gamma', 'service')).toThrow(/service failed validation/);
      expect(() => requireMember(LocalService, 'gamma', 'service')).toThrow(/alpha, beta/);
    });

    it('should throw on absence as well as on an unrecognised value', () => {
      expect(() => requireMember(LocalService, undefined, 'service')).toThrow(ParseError);
      expect(() => requireMember(LocalService, null, 'service')).toThrow(ParseError);
    });

    it('should carry a structured issue at the field path', () => {
      let thrown: unknown;
      try {
        requireMember(LocalService, 'gamma', 'service');
      } catch (error) {
        thrown = error;
      }
      expect((thrown as ParseError).issues[0]?.path).toBe('service');
      expect((thrown as ParseError).issues[0]?.code).toBe('invalid_value');
    });
  });
});

/**
 * Compile-time guarantees, asserted with `@ts-expect-error`.
 *
 * These are the whole value of the discriminated shapes, and they are otherwise
 * untestable: a runtime assertion cannot observe a type. Each directive below
 * asserts that the line under it **is** a compile error, so if the error ever
 * stops occurring — for example because someone re-adds a `data?: undefined` or
 * `member?: undefined` sibling marker — the unused directive becomes an error
 * itself and `npm run typecheck` goes red.
 *
 * That inversion is what makes this a regression guard rather than a comment.
 * It is enforced by the existing `npm run typecheck` gate, which includes
 * `test/`, so no new tooling is involved.
 *
 * The mechanism matters because the obvious alternative does not work here.
 * Under this repository's `strictNullChecks: false` a `T | undefined` return
 * type collapses to `T`, so the unhandled case would compile cleanly; only the
 * absence of the property from the other branch survives that setting.
 */
describe('compile-time guarantees', () => {
  it('should make an un-narrowed data access a compile error', () => {
    const result = Ledger.safeParse({service: 's', scope: 'sc', amount: 'abc'});
    // @ts-expect-error data is absent from the failure branch, so reading it without narrowing on success must not compile.
    const unguarded = result.data;
    expect(unguarded).toBeUndefined();
    // The guarded form compiles and is the only way to reach the document.
    expect(result.success ? result.data : undefined).toBeUndefined();
  });

  it('should make an un-narrowed member access a compile error', () => {
    const result = matchMember(LocalService, 'gamma');
    // @ts-expect-error member is absent from the miss branch, so reading it without narrowing on matched must not compile.
    const unguarded = result.member;
    expect(unguarded).toBeUndefined();
    expect(result.matched ? result.member : undefined).toBeUndefined();
  });

  it('should still allow inspecting issues on an un-narrowed result, the benign direction', () => {
    const result = Ledger.safeParse({service: 's', scope: 'sc', amount: 'abc'});
    expect(result.issues?.length).toBeGreaterThan(0);
    expect(result.message).toContain('Ledger.Interface');
  });
});
