/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 * Uses stripe price structure
 */
/**
 * Namespace for price models that represent purchasable items (event tickets,
 * products) stored in Firestore and backed by Stripe price records.
 *
 * Cloud Functions reference `Price.Interface` documents during checkout flows
 * to validate amounts, enforce participant limits, and record payment
 * confirmation metadata.
 */
export var Price;
(function (Price) {
    /**
     * Classifies the kind of item associated with this price.
     *
     * Cloud Functions use this value to route post-payment logic (e.g., adding
     * the buyer to an event's `users` list vs. fulfilling a product order).
     */
    let Type;
    (function (Type) {
        Type["event"] = "event";
        Type["product"] = "product";
    })(Type = Price.Type || (Price.Type = {}));
    /**
     * Controls who can discover and access this price record.
     *
     * Cloud Functions and API handlers enforce this visibility during listing
     * and checkout operations.
     */
    let Visibility;
    (function (Visibility) {
        Visibility["public"] = "public";
        Visibility["private"] = "private";
        Visibility["unlisted"] = "unlisted";
    })(Visibility = Price.Visibility || (Price.Visibility = {}));
})(Price || (Price = {}));
