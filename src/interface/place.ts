/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */
export enum PlaceType {
  country = 'country',
  state = 'state',
  area = 'area',
  city = 'city',
  unknown = 'unknown',
}

/**
 * Extend this interface to add place data as part of the main object
 */
export interface BasePlaceData {
  // Place data
  location?: number[];
  placeId?: string;
  latitude?: number;
  longitude?: number;
  placeName?: string;
  utcOffset?: number;
  country?: string;
  geohash?: string;
  area?: string; // AKA: region
}

export interface PlaceData {
  created?: string; // Required - timestamp
  id?: string; // Required
  area?: string | null;
  areaLong?: string | null;
  areas?: number[];
  city?: string | null;
  cityLong?: string | null;
  country?: string | null;
  countryLong?: string | null;
  latitude?: number; // Required
  longitude?: number; // Required
  local?: boolean; // Required
  longName?: string | null;
  name?: string | null;
  postalCode?: null | number;
  state?: string | null;
  stateLong?: string | null;
  timeOffset?: number; // Required
  timeZoneId?: string; // Required
  timeZoneName?: string; // Required
  type?: PlaceType; // Required
  updated?: string; // Required - timestamp
  url?: string | null;
  vicinity?: string | null;
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
