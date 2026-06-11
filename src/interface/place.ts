/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */

/**
 * Discriminated enum that categorises a geographic place by its administrative
 * level, used when storing or querying place-related documents.
 */
export enum PlaceType {
  country = 'country',
  state = 'state',
  area = 'area',
  city = 'city',
  unknown = 'unknown',
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
  area?: string; // AKA: region
}

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
  created?: string; // Required - timestamp
  /**
   * Unique Firestore document identifier for this place; required for lookups.
   */
  id?: string; // Required
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
  latitude?: number; // Required
  /**
   * Decimal degrees longitude; required for geospatial queries.
   */
  longitude?: number; // Required
  /**
   * When `true`, indicates this place is local/domestic relative to the
   * primary operating region; required for filtering.
   */
  local?: boolean; // Required
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
  timeOffset?: number; // Required
  /**
   * IANA timezone identifier (e.g., `"America/New_York"`); required for
   * accurate local-time calculations.
   */
  timeZoneId?: string; // Required
  /**
   * Human-readable timezone name (e.g., `"Eastern Standard Time"`); required
   * for display purposes.
   */
  timeZoneName?: string; // Required
  /**
   * Administrative level of this place as categorised by {@link PlaceType};
   * required for hierarchical filtering.
   */
  type?: PlaceType; // Required
  /**
   * ISO 8601 timestamp string recorded the last time this document was
   * modified; required for cache invalidation.
   */
  updated?: string; // Required - timestamp
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
