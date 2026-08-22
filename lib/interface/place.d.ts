/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */
import { z } from 'zod';
import { AssertSchemaOutput, ParseResult } from './schema.js';
/**
 * Discriminated enum that categorises a geographic place by its administrative
 * level, used when storing or querying place-related documents.
 */
export declare enum PlaceType {
    country = "country",
    state = "state",
    area = "area",
    city = "city",
    unknown = "unknown"
}
/**
 * Extend this interface to add place data as part of the main object.
 */
export interface BasePlaceData {
    /**
     * GeoJSON-style `[longitude, latitude]` coordinate pair for the place.
     */
    location?: number[];
    /**
     * Google Places API place identifier for the location.
     */
    placeId?: string;
    /**
     * Decimal degrees latitude of the place.
     */
    latitude?: number;
    /**
     * Decimal degrees longitude of the place.
     */
    longitude?: number;
    /**
     * Human-readable display name for the place.
     */
    placeName?: string;
    /**
     * UTC offset in minutes for the place's local timezone.
     */
    utcOffset?: number;
    /**
     * ISO 3166-1 alpha-2 country code (e.g., `"US"`, `"CA"`).
     */
    country?: string;
    /**
     * Geohash string encoding the place's latitude/longitude for efficient
     * proximity queries in Firestore.
     */
    geohash?: string;
    /**
     * Administrative region/state/province name, also known as the geographic
     * area designation.
     */
    area?: string;
}
/**
 * Field schemas for {@link BasePlaceData}, exported as a raw shape so documents
 * that mix place data in — {@link EventData} in particular — can spread it
 * instead of restating it and letting the copies drift.
 */
export declare const basePlaceDataShape: {
    /**
     * See {@link BasePlaceData.location}. Element count is deliberately
     * unconstrained: the published type is `number[]`, and rejecting a stored
     * array of another length would narrow it.
     */
    location: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
    /**
     * See {@link BasePlaceData.placeId}.
     */
    placeId: z.ZodOptional<z.ZodString>;
    /**
     * See {@link BasePlaceData.latitude}.
     */
    latitude: z.ZodOptional<z.ZodNumber>;
    /**
     * See {@link BasePlaceData.longitude}.
     */
    longitude: z.ZodOptional<z.ZodNumber>;
    /**
     * See {@link BasePlaceData.placeName}.
     */
    placeName: z.ZodOptional<z.ZodString>;
    /**
     * See {@link BasePlaceData.utcOffset}.
     */
    utcOffset: z.ZodOptional<z.ZodNumber>;
    /**
     * See {@link BasePlaceData.country}. Accepted as any non-empty string rather
     * than a two-letter code: the field is documented as ISO 3166-1 alpha-2, but
     * narrowing a published field to a fixed length would reject any stored
     * document that predates that convention.
     */
    country: z.ZodOptional<z.ZodString>;
    /**
     * See {@link BasePlaceData.geohash}.
     */
    geohash: z.ZodOptional<z.ZodString>;
    /**
     * See {@link BasePlaceData.area}.
     */
    area: z.ZodOptional<z.ZodString>;
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
export declare const BasePlaceDataSchema: z.ZodObject<{
    location: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
    placeId: z.ZodOptional<z.ZodString>;
    latitude: z.ZodOptional<z.ZodNumber>;
    longitude: z.ZodOptional<z.ZodNumber>;
    placeName: z.ZodOptional<z.ZodString>;
    utcOffset: z.ZodOptional<z.ZodNumber>;
    country: z.ZodOptional<z.ZodString>;
    geohash: z.ZodOptional<z.ZodString>;
    area: z.ZodOptional<z.ZodString>;
}, z.core.$loose>;
/**
 * Compile-time proof that {@link BasePlaceDataSchema} produces
 * {@link BasePlaceData}.
 */
export type BasePlaceDataSchemaOutput = AssertSchemaOutput<z.infer<typeof BasePlaceDataSchema>, BasePlaceData>;
/**
 * Full place record as stored in the Firestore places collection.
 *
 * This interface captures all geographic and timezone metadata returned by the
 * Google Places API, along with administrative fields used by the platform.
 * Documents that match this shape are typically created or updated by a Cloud
 * Function that resolves coordinates to a structured address.
 */
export interface PlaceData {
    /**
     * ISO 8601 timestamp string recorded when this place document was first
     * created; required for auditing.
     */
    created?: string;
    /**
     * Unique Firestore document identifier for this place; required for lookups.
     */
    id?: string;
    /**
     * Short administrative area (region/state) name, or `null` if unavailable.
     */
    area?: string | null;
    /**
     * Full administrative area (region/state) name, or `null` if unavailable.
     */
    areaLong?: string | null;
    /**
     * Numeric identifiers for parent area documents used in hierarchical queries.
     */
    areas?: number[];
    /**
     * Short city name, or `null` if unavailable.
     */
    city?: string | null;
    /**
     * Full city name, or `null` if unavailable.
     */
    cityLong?: string | null;
    /**
     * ISO 3166-1 alpha-2 country code, or `null` if unavailable.
     */
    country?: string | null;
    /**
     * Full country name, or `null` if unavailable.
     */
    countryLong?: string | null;
    /**
     * Decimal degrees latitude; required for geospatial queries.
     */
    latitude?: number;
    /**
     * Decimal degrees longitude; required for geospatial queries.
     */
    longitude?: number;
    /**
     * When `true`, indicates this place is local/domestic relative to the
     * primary operating region; required for filtering.
     */
    local?: boolean;
    /**
     * Full display name of the place, or `null` if unavailable.
     */
    longName?: string | null;
    /**
     * Short display name of the place, or `null` if unavailable.
     */
    name?: string | null;
    /**
     * Postal/ZIP code associated with the place, or `null` if unavailable.
     */
    postalCode?: null | number;
    /**
     * Short state/province name, or `null` if unavailable.
     */
    state?: string | null;
    /**
     * Full state/province name, or `null` if unavailable.
     */
    stateLong?: string | null;
    /**
     * UTC offset in minutes for the place's timezone; required for scheduling.
     */
    timeOffset?: number;
    /**
     * IANA timezone identifier (e.g., `"America/New_York"`); required for
     * accurate local-time calculations.
     */
    timeZoneId?: string;
    /**
     * Human-readable timezone name (e.g., `"Eastern Standard Time"`); required
     * for display purposes.
     */
    timeZoneName?: string;
    /**
     * Administrative level of this place as categorised by {@link PlaceType};
     * required for hierarchical filtering.
     */
    type?: PlaceType;
    /**
     * ISO 8601 timestamp string recorded the last time this document was
     * modified; required for cache invalidation.
     */
    updated?: string;
    /**
     * Public URL for this place on an external directory or maps service, or
     * `null` if unavailable.
     */
    url?: string | null;
    /**
     * Informal vicinity description (e.g., neighbourhood name), or `null` if
     * unavailable.
     */
    vicinity?: string | null;
    /**
     * Bounding box for the place returned by the Google Places API, expressed as
     * northeast and southwest coordinate pairs.
     */
    viewport?: {
        northeast: {
            latitude: number;
            longitude: number;
        };
        southwest: {
            latitude: number;
            longitude: number;
        };
    };
}
/**
 * Field schemas for {@link PlaceData}, exported as a raw shape for composition
 * and for inventory assertions in tests.
 */
export declare const placeDataShape: {
    /**
     * See {@link PlaceData.created}.
     */
    created: z.ZodOptional<z.ZodString>;
    /**
     * See {@link PlaceData.id}.
     */
    id: z.ZodOptional<z.ZodString>;
    /**
     * See {@link PlaceData.area}.
     */
    area: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    /**
     * See {@link PlaceData.areaLong}.
     */
    areaLong: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    /**
     * See {@link PlaceData.areas}.
     */
    areas: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
    /**
     * See {@link PlaceData.city}.
     */
    city: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    /**
     * See {@link PlaceData.cityLong}.
     */
    cityLong: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    /**
     * See {@link PlaceData.country}.
     */
    country: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    /**
     * See {@link PlaceData.countryLong}.
     */
    countryLong: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    /**
     * See {@link PlaceData.latitude}.
     */
    latitude: z.ZodOptional<z.ZodNumber>;
    /**
     * See {@link PlaceData.longitude}.
     */
    longitude: z.ZodOptional<z.ZodNumber>;
    /**
     * See {@link PlaceData.local}.
     */
    local: z.ZodOptional<z.ZodBoolean>;
    /**
     * See {@link PlaceData.longName}.
     */
    longName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    /**
     * See {@link PlaceData.name}.
     */
    name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    /**
     * See {@link PlaceData.postalCode}. Numeric rather than string by declaration;
     * a postal code supplied as text is rejected here rather than coerced, because
     * `Number('SW1A')` is `NaN` and a `NaN` postal code matches nothing while
     * looking like a value.
     */
    postalCode: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    /**
     * See {@link PlaceData.state}.
     */
    state: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    /**
     * See {@link PlaceData.stateLong}.
     */
    stateLong: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    /**
     * See {@link PlaceData.timeOffset}.
     */
    timeOffset: z.ZodOptional<z.ZodNumber>;
    /**
     * See {@link PlaceData.timeZoneId}.
     */
    timeZoneId: z.ZodOptional<z.ZodString>;
    /**
     * See {@link PlaceData.timeZoneName}.
     */
    timeZoneName: z.ZodOptional<z.ZodString>;
    /**
     * See {@link PlaceData.type}. Constrained to {@link PlaceType}, so an
     * unrecognised administrative level is rejected instead of being asserted into
     * the enum by a cast.
     */
    type: z.ZodOptional<z.ZodEnum<typeof PlaceType>>;
    /**
     * See {@link PlaceData.updated}.
     */
    updated: z.ZodOptional<z.ZodString>;
    /**
     * See {@link PlaceData.url}.
     */
    url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    /**
     * See {@link PlaceData.vicinity}.
     */
    vicinity: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    /**
     * See {@link PlaceData.viewport}.
     */
    viewport: z.ZodOptional<z.ZodObject<{
        northeast: z.ZodObject<{
            latitude: z.ZodNumber;
            longitude: z.ZodNumber;
        }, z.core.$loose>;
        southwest: z.ZodObject<{
            latitude: z.ZodNumber;
            longitude: z.ZodNumber;
        }, z.core.$loose>;
    }, z.core.$loose>>;
};
/**
 * Runtime schema producing {@link PlaceData}.
 *
 * Unknown keys are preserved rather than dropped or rejected, so a place
 * document written by a newer resolver still parses here and survives a
 * round-trip without losing the fields this version does not know about.
 */
export declare const PlaceDataSchema: z.ZodObject<{
    created: z.ZodOptional<z.ZodString>;
    id: z.ZodOptional<z.ZodString>;
    area: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    areaLong: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    areas: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
    city: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    cityLong: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    country: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    countryLong: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    latitude: z.ZodOptional<z.ZodNumber>;
    longitude: z.ZodOptional<z.ZodNumber>;
    local: z.ZodOptional<z.ZodBoolean>;
    longName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    postalCode: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    state: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    stateLong: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    timeOffset: z.ZodOptional<z.ZodNumber>;
    timeZoneId: z.ZodOptional<z.ZodString>;
    timeZoneName: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<typeof PlaceType>>;
    updated: z.ZodOptional<z.ZodString>;
    url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    vicinity: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    viewport: z.ZodOptional<z.ZodObject<{
        northeast: z.ZodObject<{
            latitude: z.ZodNumber;
            longitude: z.ZodNumber;
        }, z.core.$loose>;
        southwest: z.ZodObject<{
            latitude: z.ZodNumber;
            longitude: z.ZodNumber;
        }, z.core.$loose>;
    }, z.core.$loose>>;
}, z.core.$loose>;
/**
 * Compile-time proof that {@link PlaceDataSchema} produces {@link PlaceData}.
 */
export type PlaceDataSchemaOutput = AssertSchemaOutput<z.infer<typeof PlaceDataSchema>, PlaceData>;
/**
 * Validates untrusted data as a {@link PlaceData} document without throwing.
 *
 * @param {unknown} value - Untrusted value, typically the raw data of a stored place document.
 * @return {ParseResult<PlaceData>} Success carrying the typed place, or failure carrying the reasons.
 */
export declare const safeParsePlaceData: (value: unknown) => ParseResult<PlaceData>;
/**
 * Validates untrusted data as a {@link PlaceData} document, throwing when it
 * does not conform.
 *
 * @param {unknown} value - Untrusted value, typically the raw data of a stored place document.
 * @return {PlaceData} The validated place document.
 * @throws {ParseError} When the value does not conform to {@link PlaceDataSchema}.
 */
export declare const parsePlaceData: (value: unknown) => PlaceData;
