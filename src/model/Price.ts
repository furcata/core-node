/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */
import {BaseFirestore} from '../interface/base_db.js';

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
    amount?: number;
    /**
     * ISO 4217 currency code for this price (e.g., `"usd"`, `"eur"`).
     */
    currency?: string;
    /**
     * Firestore document ID of the parent product or event that this price is
     * associated with.
     */
    // The product this price is associated with
    source?: string;
    /**
     * URL of the primary display image for this price (e.g., product photo or
     * event cover art).
     */
    image?: string;
    /**
     * Short display name shown to buyers during the checkout flow.
     */
    label?: string;
    /**
     * Longer description of what the buyer is purchasing, displayed on the
     * checkout and confirmation pages.
     */
    description?: string;
    /**
     * Maximum number of users that may purchase this price; enforced by Cloud
     * Functions during checkout. `undefined` means unlimited.
     */
    // Limit the number of users that can pay for this price
    limit?: number;
    /**
     * Item category for this price; see {@link Type} for accepted values.
     */
    type?: Type;
    /**
     * Firebase Auth UID of a specific user this price is restricted to, or
     * `null` for publicly purchasable prices.
     */
    uid?: string | null;
    /**
     * Firebase Auth UIDs of users who have successfully purchased this price.
     */
    users?: string[]; // user ids that have paid for this price
    /**
     * Visibility scope of this price record; see {@link Visibility} for
     * accepted values.
     */
    visibility?: Visibility;
    /**
     * Cumulative number of times a link to this price has been clicked.
     */
    // Track
    clicks?: number;
    /**
     * Cumulative number of times this price's detail page has been viewed.
     */
    views?: number;
    /**
     * Cumulative number of users who initiated the checkout flow for this
     * price.
     */
    checkout?: number;
    /**
     * Cumulative number of confirmed purchases for this price.
     */
    booked?: number;
  }
}
