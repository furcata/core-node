/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */
export declare enum PlaceType {
    country = "country",
    state = "state",
    area = "area",
    city = "city",
    unknown = "unknown"
}
/**
 * Extend this interface to add place data as part of the main object
 */
export interface BasePlaceData {
    location?: number[];
    placeId?: string;
    latitude?: number;
    longitude?: number;
    placeName?: string;
    utcOffset?: number;
    country?: string;
    geohash?: string;
    area?: string;
}
export interface PlaceData {
    created?: string;
    id?: string;
    area?: string | null;
    areaLong?: string | null;
    areas?: number[];
    city?: string | null;
    cityLong?: string | null;
    country?: string | null;
    countryLong?: string | null;
    latitude?: number;
    longitude?: number;
    local?: boolean;
    longName?: string | null;
    name?: string | null;
    postalCode?: null | number;
    state?: string | null;
    stateLong?: string | null;
    timeOffset?: number;
    timeZoneId?: string;
    timeZoneName?: string;
    type?: PlaceType;
    updated?: string;
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
