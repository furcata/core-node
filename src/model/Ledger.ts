/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */
import {z} from 'zod';
import {BaseFirestore, baseFirestoreShape} from '../interface/base_db.js';
import {
  AssertSchemaOutput,
  finiteNumber,
  nonEmptyString,
  nonNegativeNumber,
  ParseResult,
  parseOrThrow,
  parseResult,
} from '../interface/schema.js';

/**
 * Namespace for spend-ledger records: the server-authored accounting of metered
 * consumption against an allowance.
 *
 * A ledger document is the shape a quota decision is made from, which is what
 * makes reading one through an unchecked cast expensive rather than merely
 * untidy. `Number(data['amount'] ?? 0)` turns a malformed amount into `0` and a
 * non-numeric one into `NaN`; the first under-charges silently, and the second
 * loses **every** comparison it is subsequently used in, so an allowance check
 * written correctly still passes. This namespace exists so that neither value
 * can reach the check.
 *
 * These documents are **server-authored**. A client that could write one could
 * mint spend.
 */
export namespace Ledger {
  /**
   * Firestore document shape for a single ledger record.
   *
   * Extends {@link BaseFirestore} for standard auditing fields.
   */
  export interface Interface extends BaseFirestore {
    /**
     * Identifier of the metered surface this record accounts for.
     *
     * Deliberately a `string` rather than an enum. The set of metered surfaces is
     * defined by the service that does the metering, not by this package, and
     * publishing a partial copy of it here would be worse than publishing none:
     * a schema constrained to an incomplete list rejects legitimate records, and
     * an allow-list that is minimal rather than complete is a capability
     * regression wearing a validation costume. Callers that need strict
     * membership should check the parsed value against their own enum.
     */
    service: string;
    /**
     * Key identifying which allowance this record draws against — for example a
     * standing resource cap or a periodic allowance.
     *
     * Two records sharing a scope contend on the same balance; two records with
     * different scopes do not. Required, because a record with no scope debits
     * nothing while still looking like a debit.
     */
    scope: string;
    /**
     * Quantity this record moves, in the unit its scope is denominated in.
     *
     * Required and **rejected rather than coerced** when it is not a finite
     * number. Deliberately unconstrained in sign: a reversal or a credit is a
     * legitimate negative movement, and rejecting one would turn a refund into a
     * validation error.
     *
     * The unit is the scope's, not this field's. A value here is meaningless
     * without {@link Interface.scope}, which is why both are required together.
     */
    amount: number;
    /**
     * Quantity actually consumed once the movement settled, when that differs
     * from {@link Interface.amount}.
     *
     * Absent means "not yet settled", which is a different claim from
     * "settled at zero". A caller that collapses the two with `?? 0` will treat
     * an outstanding reservation as a completed no-op and release it.
     */
    consumed?: number | null;
    /**
     * Allowance this scope was seeded from, recorded for observability.
     *
     * `null` means the scope has no recorded allowance and must survive a JSON
     * round-trip as such; absent means the field was never written. Neither means
     * "zero", and reading either as zero denies every request against the scope.
     */
    limit?: number | null;
    /**
     * When `true`, the metered work behind this record is known to have completed
     * even though its settlement did not.
     *
     * This marker is the only thing distinguishing such a record from an
     * abandoned one, and the difference is real money: by state alone the two are
     * indistinguishable, and a sweep that refunded the confirmed one would refund
     * spend that actually happened. Absent or `false` both mean "not confirmed" —
     * a record is only confirmed when this is explicitly `true`.
     */
    spendConfirmed?: boolean | null;
  }

  /**
   * Runtime schema producing {@link Interface}.
   *
   * {@link Interface.service}, {@link Interface.scope} and
   * {@link Interface.amount} are **required**, departing from this package's
   * usual optional-by-default convention for stored documents. A ledger record
   * missing any of the three is not a sparse record, it is a record that cannot
   * be applied to a balance, and the alternative to failing here is a caller
   * defaulting it to zero.
   *
   * Unknown keys are preserved, so a record written by a newer service keeps the
   * fields this version does not declare.
   */
  export const Schema = z.looseObject({
    ...baseFirestoreShape,
    /**
     * See {@link Interface.service}.
     */
    service: nonEmptyString().max(128),
    /**
     * See {@link Interface.scope}.
     */
    scope: nonEmptyString().max(256),
    /**
     * See {@link Interface.amount}. Money: rejected, never coerced.
     */
    amount: finiteNumber(),
    /**
     * See {@link Interface.consumed}.
     */
    consumed: nonNegativeNumber().nullish(),
    /**
     * See {@link Interface.limit}.
     */
    limit: nonNegativeNumber().nullish(),
    /**
     * See {@link Interface.spendConfirmed}.
     */
    spendConfirmed: z.boolean().nullish(),
  });

  /**
   * Compile-time proof that {@link Schema} produces {@link Interface}.
   */
  export type SchemaOutput = AssertSchemaOutput<z.infer<typeof Schema>, Interface>;

  /**
   * Validates untrusted data as a ledger record without throwing.
   *
   * @param {unknown} value - Untrusted value, typically the raw data of a stored ledger document.
   * @return {ParseResult<Interface>} Success carrying the typed record, or failure carrying the reasons.
   */
  export const safeParse = (value: unknown): ParseResult<Interface> => parseResult(Schema, value, 'Ledger.Interface');

  /**
   * Validates untrusted data as a ledger record, throwing when it does not
   * conform.
   *
   * @param {unknown} value - Untrusted value, typically the raw data of a stored ledger document.
   * @return {Interface} The validated record.
   * @throws {ParseError} When the value does not conform to {@link Schema}.
   */
  export const parse = (value: unknown): Interface => parseOrThrow(Schema, value, 'Ledger.Interface');
}
