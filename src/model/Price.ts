/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */
import {z} from 'zod';
import {BaseFirestore, baseFirestoreShape} from '../interface/base_db.js';
import {
  AssertSchemaOutput,
  counter,
  documentId,
  finiteNumber,
  nonEmptyString,
  ParseResult,
  parseOrThrow,
  parseResult,
} from '../interface/schema.js';

/**
 * Namespace for price models that represent purchasable items (event tickets,
 * products) stored in Firestore and backed by Stripe price records.
 *
 * Cloud Functions reference `Price.Interface` documents during checkout flows
 * to validate amounts, enforce participant limits, and record payment
 * confirmation metadata.
 */
export namespace Price {
  /**
   * Classifies the kind of item associated with this price.
   *
   * Cloud Functions use this value to route post-payment logic (e.g., adding
   * the buyer to an event's `users` list vs. fulfilling a product order).
   */
  export enum Type {
    event = 'event',
    product = 'product',
  }

  /**
   * Controls who can discover and access this price record.
   *
   * Cloud Functions and API handlers enforce this visibility during listing
   * and checkout operations.
   */
  export enum Visibility {
    public = 'public',
    private = 'private',
    unlisted = 'unlisted',
  }

  /**
   * Firestore document shape for a single price record.
   *
   * Extends {@link BaseFirestore} for standard auditing fields. Updating a
   * `Price.Interface` document may trigger Cloud Function listeners that sync
   * the record with Stripe or notify account owners of configuration changes.
   */
  export interface Interface extends BaseFirestore {
    /**
     * Firestore document ID of the account that owns this price.
     */
    account: string;
    /**
     * Price amount expressed in the smallest currency unit (e.g., cents for
     * USD) to avoid floating-point rounding errors.
     */
    amount?: number | null;
    /**
     * ISO 4217 currency code for this price (e.g., `"usd"`, `"eur"`).
     */
    currency?: string | null;
    /**
     * Firestore document ID of the parent product or event that this price is
     * associated with.
     */
    // The product this price is associated with
    source?: string | null;
    /**
     * URL of the primary display image for this price (e.g., product photo or
     * event cover art).
     */
    image?: string | null;
    /**
     * Short display name shown to buyers during the checkout flow.
     */
    label?: string | null;
    /**
     * Longer description of what the buyer is purchasing, displayed on the
     * checkout and confirmation pages.
     */
    description?: string | null;
    /**
     * Maximum number of users that may purchase this price; enforced by Cloud
     * Functions during checkout.
     *
     * Unlimited is expressed **both** ways in stored data: `null` in documents
     * written by the usual path, and absent in older ones. Read it as
     * `limit ?? Infinity` rather than testing for `undefined`, which answers
     * `false` for the far more common of the two.
     */
    // Limit the number of users that can pay for this price
    limit?: number | null;
    /**
     * Item category for this price; see {@link Type} for accepted values.
     */
    type?: Type | null;
    /**
     * Firebase Auth UID of a specific user this price is restricted to, or
     * `null` for publicly purchasable prices.
     */
    uid?: string | null;
    /**
     * Firebase Auth UIDs of users who have successfully purchased this price.
     */
    users?: string[] | null; // user ids that have paid for this price
    /**
     * Visibility scope of this price record; see {@link Visibility} for
     * accepted values.
     */
    visibility?: Visibility | null;
    /**
     * Cumulative number of times a link to this price has been clicked.
     */
    // Track
    clicks?: number | null;
    /**
     * Cumulative number of times this price's detail page has been viewed.
     */
    views?: number | null;
    /**
     * Cumulative number of users who initiated the checkout flow for this
     * price.
     */
    checkout?: number | null;
    /**
     * Cumulative number of confirmed purchases for this price.
     */
    booked?: number | null;
  }

  /**
   * Runtime schema producing {@link Interface}.
   *
   * This is the parse boundary for a price document. It exists because
   * `data['amount'] as number` is not a check — it is a suppressed diagnostic,
   * and a price whose amount arrives as a string then becomes `NaN` at the first
   * arithmetic operation and compares `false` against every limit it is tested
   * against, without anything throwing.
   *
   * Unknown keys are **preserved**, matching the `[x: string]: any` index
   * signature inherited from {@link BaseFirestore}: a stripping schema would
   * delete unrecognised fields on a read-modify-write, and a strict one would
   * reject documents written before this schema existed.
   *
   * Every optional field is `.nullish()` rather than `.optional()`, because a
   * stored price writes its unset fields as an explicit `null` rather than
   * omitting them — `limit`, `description` and `image` in particular. A schema
   * that accepted only `undefined` rejected the documents it exists to
   * validate. The loosening is bounded to `null` alone: a wrong type, a
   * fractional counter and an unrecognised enum member are all still rejected,
   * as are `null` on the required {@link Interface.account} and on the audit
   * timestamps.
   */
  export const Schema = z.looseObject({
    ...baseFirestoreShape,
    /**
     * See {@link Interface.account}. Required, because a price that belongs to
     * no account cannot be authorised against anything.
     */
    account: documentId(),
    /**
     * See {@link Interface.amount}. Rejected rather than coerced when it is not
     * a finite number: this field is money, and a silent `NaN` is the defect
     * this schema exists to stop.
     */
    amount: finiteNumber().nullish(),
    /**
     * See {@link Interface.currency}. Constrained to a three-letter ISO 4217
     * code, which is a genuinely closed grammar rather than a convention.
     */
    currency: z.string().regex(/^[A-Za-z]{3}$/, {error: 'Expected a three-letter ISO 4217 currency code'}).nullish(),
    /**
     * See {@link Interface.source}.
     */
    source: documentId().nullish(),
    /**
     * See {@link Interface.image}.
     */
    image: nonEmptyString().nullish(),
    /**
     * See {@link Interface.label}.
     */
    label: z.string().nullish(),
    /**
     * See {@link Interface.description}.
     */
    description: z.string().nullish(),
    /**
     * See {@link Interface.limit}. `null` or absent means unlimited; a present
     * value is a whole number of buyers, so a fractional limit is rejected.
     */
    limit: counter().nullish(),
    /**
     * See {@link Interface.type}. Validated against {@link Type} rather than
     * asserted into it, so an unrecognised item category fails here instead of
     * routing post-payment logic down the wrong branch.
     */
    type: z.enum(Type).nullish(),
    /**
     * See {@link Interface.uid}. Explicitly nullable: `null` means publicly
     * purchasable and must survive a JSON round-trip, which `undefined` would
     * not.
     */
    uid: z.string().nullish(),
    /**
     * See {@link Interface.users}.
     */
    users: z.array(z.string()).nullish(),
    /**
     * See {@link Interface.visibility}. Validated against {@link Visibility},
     * so an unrecognised value cannot widen access by failing an equality check
     * against `private`.
     */
    visibility: z.enum(Visibility).nullish(),
    /**
     * See {@link Interface.clicks}.
     */
    clicks: counter().nullish(),
    /**
     * See {@link Interface.views}.
     */
    views: counter().nullish(),
    /**
     * See {@link Interface.checkout}.
     */
    checkout: counter().nullish(),
    /**
     * See {@link Interface.booked}.
     */
    booked: counter().nullish(),
  });

  /**
   * Compile-time proof that {@link Schema} produces {@link Interface}.
   *
   * A schema that drifts from the interface is a compile error here rather than
   * a runtime surprise in a consumer.
   */
  export type SchemaOutput = AssertSchemaOutput<z.infer<typeof Schema>, Interface>;

  /**
   * Validates untrusted data as a price document without throwing.
   *
   * Use this where a malformed stored document is an expected condition to be
   * handled rather than an abort — a sweep, a migration, a queue consumer.
   *
   * @param {unknown} value - Untrusted value, typically the raw data of a stored price document.
   * @return {ParseResult<Interface>} Success carrying the typed price, or failure carrying the reasons.
   */
  export const safeParse = (value: unknown): ParseResult<Interface> => parseResult(Schema, value, 'Price.Interface');

  /**
   * Validates untrusted data as a price document, throwing when it does not
   * conform.
   *
   * Use this on a checkout or transaction path, where continuing with an
   * unvalidated price is never the correct outcome.
   *
   * @param {unknown} value - Untrusted value, typically the raw data of a stored price document.
   * @return {Interface} The validated price document.
   * @throws {ParseError} When the value does not conform to {@link Schema}.
   */
  export const parse = (value: unknown): Interface => parseOrThrow(Schema, value, 'Price.Interface');
}
