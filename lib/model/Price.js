/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 * Uses stripe price structure
 */
export var Price;
(function (Price) {
    let Type;
    (function (Type) {
        Type["event"] = "event";
        Type["product"] = "product";
    })(Type = Price.Type || (Price.Type = {}));
    let Visibility;
    (function (Visibility) {
        Visibility["public"] = "public";
        Visibility["private"] = "private";
        Visibility["unlisted"] = "unlisted";
    })(Visibility = Price.Visibility || (Price.Visibility = {}));
})(Price || (Price = {}));
