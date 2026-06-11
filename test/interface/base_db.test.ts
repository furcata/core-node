/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */

import { describe, it, expect } from 'vitest';
import type { BaseFirestore } from '../../src/interface/base_db.js';

describe('BaseFirestore', () => {
  describe('optional id field', () => {
    it('should be undefined when not provided', () => {
      const doc: BaseFirestore = {};
      expect(doc.id).toBeUndefined();
    });

    it('should accept a string id', () => {
      const doc: BaseFirestore = { id: 'doc-123' };
      expect(doc.id).toBe('doc-123');
    });
  });

  describe('optional backup field', () => {
    it('should be undefined when not provided', () => {
      const doc: BaseFirestore = {};
      expect(doc.backup).toBeUndefined();
    });

    it('should accept true', () => {
      const doc: BaseFirestore = { backup: true };
      expect(doc.backup).toBe(true);
    });

    it('should accept false', () => {
      const doc: BaseFirestore = { backup: false };
      expect(doc.backup).toBe(false);
    });
  });

  describe('optional timestamp fields', () => {
    it('should accept a Date object for created', () => {
      const now = new Date();
      const doc: BaseFirestore = { created: now };
      expect(doc.created).toBe(now);
    });

    it('should accept a Date object for updated', () => {
      const now = new Date();
      const doc: BaseFirestore = { updated: now };
      expect(doc.updated).toBe(now);
    });

    it('should accept a Date object for expiry (TTL)', () => {
      const future = new Date(Date.now() + 86400000);
      const doc: BaseFirestore = { expiry: future };
      expect(doc.expiry).toBe(future);
    });
  });

  describe('index signature for arbitrary fields', () => {
    it('should allow additional string fields', () => {
      const doc: BaseFirestore = { customField: 'value' };
      expect(doc['customField']).toBe('value');
    });

    it('should allow additional numeric fields', () => {
      const doc: BaseFirestore = { count: 42 };
      expect(doc['count']).toBe(42);
    });

    it('should allow additional boolean fields', () => {
      const doc: BaseFirestore = { active: true };
      expect(doc['active']).toBe(true);
    });

    it('should allow nested object fields', () => {
      const doc: BaseFirestore = { metadata: { source: 'import' } };
      expect(doc['metadata']).toEqual({ source: 'import' });
    });
  });

  describe('fully populated document', () => {
    it('should accept all defined fields simultaneously', () => {
      const now = new Date();
      const doc: BaseFirestore = {
        id: 'full-doc',
        backup: true,
        created: now,
        updated: now,
        expiry: now,
      };
      expect(doc.id).toBe('full-doc');
      expect(doc.backup).toBe(true);
      expect(doc.created).toBe(now);
      expect(doc.updated).toBe(now);
      expect(doc.expiry).toBe(now);
    });

    it('should accept an empty object', () => {
      const doc: BaseFirestore = {};
      expect(doc).toBeDefined();
      expect(typeof doc).toBe('object');
    });
  });
});
