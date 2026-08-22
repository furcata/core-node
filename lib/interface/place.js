/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */
import { z } from 'zod';
import { nonEmptyString, parseOrThrow, parseResult } from './schema.js';
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
/**
 * Schema for a latitude in decimal degrees.
 *
 * Bounded at the poles because a latitude outside this range is not a value
 * with an unusual meaning, it is a value that cannot exist — most often a
 * longitude that was written into the wrong field, which places a point on the
 * opposite side of the planet without any arithmetic ever failing.
 *
 * @return {z.ZodNumber} Schema accepting a latitude between -90 and 90.
 */
const latitudeDegrees = () => z.number().min(-90).max(90);
/**
 * Schema for a longitude in decimal degrees.
 *
 * @return {z.ZodNumber} Schema accepting a longitude between -180 and 180.
 */
const longitudeDegrees = () => z.number().min(-180).max(180);
/**
 * Schema for a UTC offset expressed in **minutes**, not hours.
 *
 * Minutes is the unit the platform stores, and offsets such as `+05:45` are not
 * expressible in whole hours at all, so an hours value silently accepted here
 * would be wrong by a factor of sixty for every account that has one.
 *
 * @return {z.ZodNumber} Schema accepting a whole-minute offset within a day either side of UTC.
 */
const utcOffsetMinutes = () => z.int().min(-1440).max(1440);
/**
 * Field schemas for {@link BasePlaceData}, exported as a raw shape so documents
 * that mix place data in — {@link EventData} in particular — can spread it
 * instead of restating it and letting the copies drift.
 */
export const basePlaceDataShape = {
    /**
     * See {@link BasePlaceData.location}. Element count is deliberately
     * unconstrained: the published type is `number[]`, and rejecting a stored
     * array of another length would narrow it.
     */
    location: z.array(z.number()).optional(),
    /**
     * See {@link BasePlaceData.placeId}.
     */
    placeId: nonEmptyString().optional(),
    /**
     * See {@link BasePlaceData.latitude}.
     */
    latitude: latitudeDegrees().optional(),
    /**
     * See {@link BasePlaceData.longitude}.
     */
    longitude: longitudeDegrees().optional(),
    /**
     * See {@link BasePlaceData.placeName}.
     */
    placeName: nonEmptyString().optional(),
    /**
     * See {@link BasePlaceData.utcOffset}.
     */
    utcOffset: utcOffsetMinutes().optional(),
    /**
     * See {@link BasePlaceData.country}. Accepted as any non-empty string rather
     * than a two-letter code: the field is documented as ISO 3166-1 alpha-2, but
     * narrowing a published field to a fixed length would reject any stored
     * document that predates that convention.
     */
    country: nonEmptyString().optional(),
    /**
     * See {@link BasePlaceData.geohash}.
     */
    geohash: nonEmptyString().optional(),
    /**
     * See {@link BasePlaceData.area}.
     */
    area: nonEmptyString().optional(),
};
/**
 * Runtime schema producing {@link BasePlaceData}.
 *
 * Unknown keys are preserved rather than dropped, because this shape is mixed
 * into larger documents and a stripping schema would delete their other fields
 * on a read-modify-write.
 *
 * No standalone parse helper is exported: this is a mixin, and every field on it
 * is optional, so parsing an arbitrary value against it succeeds almost
 * unconditionally. Compose it into a concrete document schema instead.
 */
export const BasePlaceDataSchema = z.looseObject(basePlaceDataShape);
/**
 * Schema for one corner of a {@link PlaceData.viewport} bounding box.
 *
 * Both coordinates are required, because a corner missing one of them does not
 * describe a smaller box, it describes a box with an undefined edge that every
 * containment test will silently answer `false` for.
 */
const viewportCornerSchema = z.looseObject({
    /**
     * Decimal degrees latitude of the corner.
     */
    latitude: latitudeDegrees(),
    /**
     * Decimal degrees longitude of the corner.
     */
    longitude: longitudeDegrees(),
});
/**
 * Field schemas for {@link PlaceData}, exported as a raw shape for composition
 * and for inventory assertions in tests.
 */
export const placeDataShape = {
    /**
     * See {@link PlaceData.created}.
     */
    created: nonEmptyString().optional(),
    /**
     * See {@link PlaceData.id}.
     */
    id: nonEmptyString().optional(),
    /**
     * See {@link PlaceData.area}.
     */
    area: z.string().nullable().optional(),
    /**
     * See {@link PlaceData.areaLong}.
     */
    areaLong: z.string().nullable().optional(),
    /**
     * See {@link PlaceData.areas}.
     */
    areas: z.array(z.number()).optional(),
    /**
     * See {@link PlaceData.city}.
     */
    city: z.string().nullable().optional(),
    /**
     * See {@link PlaceData.cityLong}.
     */
    cityLong: z.string().nullable().optional(),
    /**
     * See {@link PlaceData.country}.
     */
    country: z.string().nullable().optional(),
    /**
     * See {@link PlaceData.countryLong}.
     */
    countryLong: z.string().nullable().optional(),
    /**
     * See {@link PlaceData.latitude}.
     */
    latitude: latitudeDegrees().optional(),
    /**
     * See {@link PlaceData.longitude}.
     */
    longitude: longitudeDegrees().optional(),
    /**
     * See {@link PlaceData.local}.
     */
    local: z.boolean().optional(),
    /**
     * See {@link PlaceData.longName}.
     */
    longName: z.string().nullable().optional(),
    /**
     * See {@link PlaceData.name}.
     */
    name: z.string().nullable().optional(),
    /**
     * See {@link PlaceData.postalCode}. Numeric rather than string by declaration;
     * a postal code supplied as text is rejected here rather than coerced, because
     * `Number('SW1A')` is `NaN` and a `NaN` postal code matches nothing while
     * looking like a value.
     */
    postalCode: z.number().nullable().optional(),
    /**
     * See {@link PlaceData.state}.
     */
    state: z.string().nullable().optional(),
    /**
     * See {@link PlaceData.stateLong}.
     */
    stateLong: z.string().nullable().optional(),
    /**
     * See {@link PlaceData.timeOffset}.
     */
    timeOffset: utcOffsetMinutes().optional(),
    /**
     * See {@link PlaceData.timeZoneId}.
     */
    timeZoneId: nonEmptyString().optional(),
    /**
     * See {@link PlaceData.timeZoneName}.
     */
    timeZoneName: nonEmptyString().optional(),
    /**
     * See {@link PlaceData.type}. Constrained to {@link PlaceType}, so an
     * unrecognised administrative level is rejected instead of being asserted into
     * the enum by a cast.
     */
    type: z.enum(PlaceType).optional(),
    /**
     * See {@link PlaceData.updated}.
     */
    updated: nonEmptyString().optional(),
    /**
     * See {@link PlaceData.url}.
     */
    url: z.string().nullable().optional(),
    /**
     * See {@link PlaceData.vicinity}.
     */
    vicinity: z.string().nullable().optional(),
    /**
     * See {@link PlaceData.viewport}.
     */
    viewport: viewportCornerBoxSchema().optional(),
};
/**
 * Builds the bounding-box schema for {@link PlaceData.viewport}.
 *
 * Declared as a function so the two corner schemas are constructed at the point
 * of use, keeping the module free of initialisation-order coupling.
 *
 * @return {z.ZodObject} Schema accepting a northeast/southwest bounding box.
 */
function viewportCornerBoxSchema() {
    return z.looseObject({
        /**
         * Northeast corner of the bounding box.
         */
        northeast: viewportCornerSchema,
        /**
         * Southwest corner of the bounding box.
         */
        southwest: viewportCornerSchema,
    });
}
/**
 * Runtime schema producing {@link PlaceData}.
 *
 * Unknown keys are preserved rather than dropped or rejected, so a place
 * document written by a newer resolver still parses here and survives a
 * round-trip without losing the fields this version does not know about.
 */
export const PlaceDataSchema = z.looseObject(placeDataShape);
/**
 * Validates untrusted data as a {@link PlaceData} document without throwing.
 *
 * @param {unknown} value - Untrusted value, typically the raw data of a stored place document.
 * @return {ParseResult<PlaceData>} Success carrying the typed place, or failure carrying the reasons.
 */
export const safeParsePlaceData = (value) => parseResult(PlaceDataSchema, value, 'PlaceData');
/**
 * Validates untrusted data as a {@link PlaceData} document, throwing when it
 * does not conform.
 *
 * @param {unknown} value - Untrusted value, typically the raw data of a stored place document.
 * @return {PlaceData} The validated place document.
 * @throws {ParseError} When the value does not conform to {@link PlaceDataSchema}.
 */
export const parsePlaceData = (value) => parseOrThrow(PlaceDataSchema, value, 'PlaceData');
