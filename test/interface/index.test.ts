/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */

import { describe, it, expect } from 'vitest';
import { PlaceType } from '../../src/interface/index.js';
import type { BaseFirestore, MessageQueue, BasePlaceData, PlaceData } from '../../src/interface/index.js';

describe('interface/index barrel exports', () => {
  describe('PlaceType enum re-export', () => {
    it('should export PlaceType as a usable value', () => {
      expect(PlaceType).toBeDefined();
      expect(typeof PlaceType).toBe('object');
    });

    it('should expose all PlaceType members through the barrel', () => {
      expect(PlaceType.country).toBe('country');
      expect(PlaceType.state).toBe('state');
      expect(PlaceType.area).toBe('area');
      expect(PlaceType.city).toBe('city');
      expect(PlaceType.unknown).toBe('unknown');
    });
  });

  describe('BaseFirestore type re-export', () => {
    it('should allow constructing a BaseFirestore object via the barrel import', () => {
      const doc: BaseFirestore = { id: 'barrel-test', backup: false };
      expect(doc.id).toBe('barrel-test');
    });
  });

  describe('MessageQueue type re-export', () => {
    it('should allow constructing a MessageQueue object via the barrel import', () => {
      const queue: MessageQueue = { pending: 1, ready: 2 };
      expect(queue.pending).toBe(1);
    });
  });

  describe('BasePlaceData type re-export', () => {
    it('should allow constructing a BasePlaceData object via the barrel import', () => {
      const place: BasePlaceData = { latitude: 0, longitude: 0 };
      expect(place.latitude).toBe(0);
    });
  });

  describe('PlaceData type re-export', () => {
    it('should allow constructing a PlaceData object via the barrel import', () => {
      const data: PlaceData = { type: PlaceType.city, local: true };
      expect(data.type).toBe('city');
    });
  });
});
