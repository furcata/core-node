/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */

import { describe, it, expect } from 'vitest';
import { PlaceType } from '../../src/interface/place.js';
import type { BasePlaceData, PlaceData } from '../../src/interface/place.js';

describe('PlaceType', () => {
  describe('enum values', () => {
    it('should have value "country" for country', () => {
      expect(PlaceType.country).toBe('country');
    });

    it('should have value "state" for state', () => {
      expect(PlaceType.state).toBe('state');
    });

    it('should have value "area" for area', () => {
      expect(PlaceType.area).toBe('area');
    });

    it('should have value "city" for city', () => {
      expect(PlaceType.city).toBe('city');
    });

    it('should have value "unknown" for unknown', () => {
      expect(PlaceType.unknown).toBe('unknown');
    });

    it('should expose exactly 5 members', () => {
      const members = Object.values(PlaceType);
      expect(members).toHaveLength(5);
    });

    it('should contain all expected members', () => {
      const members = Object.values(PlaceType);
      expect(members).toContain('country');
      expect(members).toContain('state');
      expect(members).toContain('area');
      expect(members).toContain('city');
      expect(members).toContain('unknown');
    });
  });
});

describe('BasePlaceData', () => {
  describe('optional location field', () => {
    it('should accept a [longitude, latitude] pair', () => {
      const place: BasePlaceData = { location: [-122.4194, 37.7749] };
      expect(place.location).toEqual([-122.4194, 37.7749]);
    });

    it('should be undefined when not provided', () => {
      const place: BasePlaceData = {};
      expect(place.location).toBeUndefined();
    });
  });

  describe('coordinate fields', () => {
    it('should accept latitude and longitude as numbers', () => {
      const place: BasePlaceData = { latitude: 37.7749, longitude: -122.4194 };
      expect(place.latitude).toBe(37.7749);
      expect(place.longitude).toBe(-122.4194);
    });

    it('should accept negative coordinates', () => {
      const place: BasePlaceData = { latitude: -33.8688, longitude: 151.2093 };
      expect(place.latitude).toBeLessThan(0);
      expect(place.longitude).toBeGreaterThan(0);
    });
  });

  describe('optional string fields', () => {
    it('should accept a placeId string', () => {
      const place: BasePlaceData = { placeId: 'ChIJIQBpAG2ahYAR_6128GcTUEo' };
      expect(place.placeId).toBe('ChIJIQBpAG2ahYAR_6128GcTUEo');
    });

    it('should accept a placeName string', () => {
      const place: BasePlaceData = { placeName: 'San Francisco' };
      expect(place.placeName).toBe('San Francisco');
    });

    it('should accept a country code', () => {
      const place: BasePlaceData = { country: 'US' };
      expect(place.country).toBe('US');
    });

    it('should accept a geohash string', () => {
      const place: BasePlaceData = { geohash: '9q8yy' };
      expect(place.geohash).toBe('9q8yy');
    });

    it('should accept an area/region string', () => {
      const place: BasePlaceData = { area: 'California' };
      expect(place.area).toBe('California');
    });
  });

  describe('optional utcOffset field', () => {
    it('should accept a positive UTC offset in minutes', () => {
      const place: BasePlaceData = { utcOffset: 330 }; // IST = +5:30
      expect(place.utcOffset).toBe(330);
    });

    it('should accept a negative UTC offset', () => {
      const place: BasePlaceData = { utcOffset: -480 }; // PST = -8:00
      expect(place.utcOffset).toBe(-480);
    });

    it('should accept zero for UTC', () => {
      const place: BasePlaceData = { utcOffset: 0 };
      expect(place.utcOffset).toBe(0);
    });
  });

  describe('fully populated BasePlaceData', () => {
    it('should accept all fields simultaneously', () => {
      const place: BasePlaceData = {
        location: [-73.9857, 40.7484],
        placeId: 'place-id-nyc',
        latitude: 40.7484,
        longitude: -73.9857,
        placeName: 'New York',
        utcOffset: -300,
        country: 'US',
        geohash: 'dr5ru',
        area: 'New York',
      };
      expect(place.placeName).toBe('New York');
      expect(place.country).toBe('US');
      expect(place.latitude).toBe(40.7484);
    });
  });
});

describe('PlaceData', () => {
  describe('optional fields', () => {
    it('should accept an empty object', () => {
      const data: PlaceData = {};
      expect(data).toBeDefined();
    });

    it('should accept a valid id', () => {
      const data: PlaceData = { id: 'place-sf-001' };
      expect(data.id).toBe('place-sf-001');
    });

    it('should accept null values for nullable string fields', () => {
      const data: PlaceData = {
        area: null,
        areaLong: null,
        city: null,
        cityLong: null,
        country: null,
        countryLong: null,
        longName: null,
        name: null,
        state: null,
        stateLong: null,
        url: null,
        vicinity: null,
      };
      expect(data.area).toBeNull();
      expect(data.city).toBeNull();
      expect(data.country).toBeNull();
    });

    it('should accept string values for string fields', () => {
      const data: PlaceData = {
        area: 'CA',
        areaLong: 'California',
        city: 'SF',
        cityLong: 'San Francisco',
        country: 'US',
        countryLong: 'United States',
        state: 'CA',
        stateLong: 'California',
      };
      expect(data.area).toBe('CA');
      expect(data.city).toBe('SF');
    });

    it('should accept required boolean local field', () => {
      const data: PlaceData = { local: true };
      expect(data.local).toBe(true);
    });

    it('should accept required numeric coordinate fields', () => {
      const data: PlaceData = { latitude: 37.7749, longitude: -122.4194 };
      expect(data.latitude).toBe(37.7749);
      expect(data.longitude).toBe(-122.4194);
    });

    it('should accept timeOffset in minutes', () => {
      const data: PlaceData = { timeOffset: -480 };
      expect(data.timeOffset).toBe(-480);
    });

    it('should accept timeZoneId', () => {
      const data: PlaceData = { timeZoneId: 'America/Los_Angeles' };
      expect(data.timeZoneId).toBe('America/Los_Angeles');
    });

    it('should accept timeZoneName', () => {
      const data: PlaceData = { timeZoneName: 'Pacific Standard Time' };
      expect(data.timeZoneName).toBe('Pacific Standard Time');
    });

    it('should accept a PlaceType for type', () => {
      const data: PlaceData = { type: PlaceType.city };
      expect(data.type).toBe(PlaceType.city);
    });

    it('should accept numeric postalCode', () => {
      const data: PlaceData = { postalCode: 94103 };
      expect(data.postalCode).toBe(94103);
    });

    it('should accept null postalCode', () => {
      const data: PlaceData = { postalCode: null };
      expect(data.postalCode).toBeNull();
    });

    it('should accept a numeric areas array', () => {
      const data: PlaceData = { areas: [1, 2, 3] };
      expect(data.areas).toEqual([1, 2, 3]);
    });
  });

  describe('viewport field', () => {
    it('should accept a bounding box with northeast and southwest', () => {
      const data: PlaceData = {
        viewport: {
          northeast: { latitude: 37.8095, longitude: -122.3573 },
          southwest: { latitude: 37.7036, longitude: -122.5274 },
        },
      };
      expect(data.viewport?.northeast.latitude).toBe(37.8095);
      expect(data.viewport?.southwest.longitude).toBe(-122.5274);
    });
  });

  describe('timestamp fields', () => {
    it('should accept ISO 8601 string for created', () => {
      const data: PlaceData = { created: '2024-01-01T00:00:00Z' };
      expect(data.created).toBe('2024-01-01T00:00:00Z');
    });

    it('should accept ISO 8601 string for updated', () => {
      const data: PlaceData = { updated: '2024-06-01T12:00:00Z' };
      expect(data.updated).toBe('2024-06-01T12:00:00Z');
    });
  });

  describe('fully populated PlaceData', () => {
    it('should accept all core fields at once', () => {
      const data: PlaceData = {
        id: 'nyc-001',
        created: '2024-01-01T00:00:00Z',
        updated: '2024-06-01T12:00:00Z',
        latitude: 40.7128,
        longitude: -74.006,
        local: true,
        timeOffset: -300,
        timeZoneId: 'America/New_York',
        timeZoneName: 'Eastern Standard Time',
        type: PlaceType.city,
        country: 'US',
        state: 'NY',
        city: 'New York',
      };
      expect(data.id).toBe('nyc-001');
      expect(data.type).toBe(PlaceType.city);
      expect(data.timeZoneId).toBe('America/New_York');
    });
  });
});
