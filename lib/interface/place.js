/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */
/**
 * Discriminated enum that categorises a geographic place by its administrative
 * level, used when storing or querying place-related documents.
 */
export var PlaceType;
(function (PlaceType) {
    PlaceType["country"] = "country";
    PlaceType["state"] = "state";
    PlaceType["area"] = "area";
    PlaceType["city"] = "city";
    PlaceType["unknown"] = "unknown";
})(PlaceType || (PlaceType = {}));
