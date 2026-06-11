/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */

import { describe, it, expect } from 'vitest';
import type { MessageQueue } from '../../src/interface/queue.js';

describe('MessageQueue', () => {
  describe('optional pending field', () => {
    it('should be undefined when not provided', () => {
      const queue: MessageQueue = {};
      expect(queue.pending).toBeUndefined();
    });

    it('should accept a positive integer', () => {
      const queue: MessageQueue = { pending: 5 };
      expect(queue.pending).toBe(5);
    });

    it('should accept zero', () => {
      const queue: MessageQueue = { pending: 0 };
      expect(queue.pending).toBe(0);
    });
  });

  describe('optional ready field', () => {
    it('should be undefined when not provided', () => {
      const queue: MessageQueue = {};
      expect(queue.ready).toBeUndefined();
    });

    it('should accept a positive integer', () => {
      const queue: MessageQueue = { ready: 10 };
      expect(queue.ready).toBe(10);
    });
  });

  describe('optional sender field', () => {
    it('should be undefined when not provided', () => {
      const queue: MessageQueue = {};
      expect(queue.sender).toBeUndefined();
    });

    it('should accept a positive integer', () => {
      const queue: MessageQueue = { sender: 2 };
      expect(queue.sender).toBe(2);
    });
  });

  describe('optional sending field', () => {
    it('should be undefined when not provided', () => {
      const queue: MessageQueue = {};
      expect(queue.sending).toBeUndefined();
    });

    it('should accept a positive integer', () => {
      const queue: MessageQueue = { sending: 3 };
      expect(queue.sending).toBe(3);
    });
  });

  describe('optional counted field', () => {
    it('should be undefined when not provided', () => {
      const queue: MessageQueue = {};
      expect(queue.counted).toBeUndefined();
    });

    it('should accept an arbitrary metadata object', () => {
      const meta = { timestamp: '2024-01-01T00:00:00Z', by: 'worker-1' };
      const queue: MessageQueue = { counted: meta };
      expect(queue.counted).toEqual(meta);
    });

    it('should accept a string', () => {
      const queue: MessageQueue = { counted: '2024-01-01' };
      expect(queue.counted).toBe('2024-01-01');
    });
  });

  describe('fully populated queue state', () => {
    it('should accept all fields simultaneously', () => {
      const queue: MessageQueue = {
        pending: 100,
        ready: 80,
        sender: 5,
        sending: 15,
        counted: { ts: Date.now() },
      };
      expect(queue.pending).toBe(100);
      expect(queue.ready).toBe(80);
      expect(queue.sender).toBe(5);
      expect(queue.sending).toBe(15);
      expect(queue.counted).toBeDefined();
    });

    it('should accept an empty object', () => {
      const queue: MessageQueue = {};
      expect(queue).toBeDefined();
      expect(typeof queue).toBe('object');
    });
  });

  describe('queue state pipeline progression', () => {
    it('should reflect pending-only state', () => {
      const queue: MessageQueue = { pending: 50, ready: 0, sender: 0, sending: 0 };
      expect(queue.pending).toBeGreaterThan(0);
      expect(queue.ready).toBe(0);
    });

    it('should reflect an in-flight sending state', () => {
      const queue: MessageQueue = { pending: 0, ready: 0, sender: 1, sending: 10 };
      expect(queue.sending).toBeGreaterThan(0);
      expect(queue.pending).toBe(0);
    });
  });
});
