/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */

import { Account } from '../../src/model/index.js';
import { Block } from '../../src/model/index.js';
import { EventData } from '../../src/model/index.js';
import { MessagingEvent } from '../../src/model/index.js';
import { Post } from '../../src/model/index.js';
import { Price } from '../../src/model/index.js';
import { Capacity, Entitlement, Idempotency, Ledger, MessageUsage, Reservation } from '../../src/model/index.js';
import * as modelBarrel from '../../src/model/index.js';

describe('model/index barrel exports', () => {
  describe('Account namespace re-export', () => {
    it('should export Account as a usable namespace', () => {
      expect(Account).toBeDefined();
    });

    it('should expose Account.Status through the barrel', () => {
      expect(Account.Status.active).toBe('active');
    });

    it('should expose Account.Type through the barrel', () => {
      expect(Account.Type.business).toBe('business');
    });

    it('should expose Account.Roles through the barrel', () => {
      expect(Account.Roles.owner).toBe('owner');
    });

    it('should expose Account.BrandType through the barrel', () => {
      expect(Account.BrandType.standard).toBe('STANDARD');
    });

    it('should allow constructing an Account.Interface object via the barrel', () => {
      const account: Account.Interface = { id: 'acct-barrel', status: Account.Status.active };
      expect(account.id).toBe('acct-barrel');
    });
  });

  describe('Block namespace re-export', () => {
    it('should export Block as a usable namespace', () => {
      expect(Block).toBeDefined();
    });

    it('should expose Block.Type through the barrel', () => {
      expect(Block.Type.image).toBe('image');
    });

    it('should allow constructing a Block.Interface object via the barrel', () => {
      const block: Block.Interface = { type: Block.Type.text, value: 'hello', label: 'Greeting' };
      expect(block.type).toBe('text');
    });
  });

  describe('EventData namespace re-export', () => {
    it('should export EventData as a usable namespace', () => {
      expect(EventData).toBeDefined();
    });

    it('should expose EventData.Type through the barrel', () => {
      expect(EventData.Type.online).toBe('online');
    });

    it('should expose EventData.Frequency through the barrel', () => {
      expect(EventData.Frequency.monthly).toBe('monthly');
    });

    it('should expose EventData.Status through the barrel', () => {
      expect(EventData.Status.active).toBe('active');
    });

    it('should allow constructing an EventData.Interface object via the barrel', () => {
      const event: EventData.Interface = { id: 'evt-barrel', status: EventData.Status.draft };
      expect(event.status).toBe('draft');
    });
  });

  describe('MessagingEvent namespace re-export', () => {
    it('should export MessagingEvent as a usable namespace', () => {
      expect(MessagingEvent).toBeDefined();
    });

    it('should expose MessagingEvent.Type through the barrel', () => {
      expect(MessagingEvent.Type.sms).toBe('sms');
    });

    it('should expose MessagingEvent.Status through the barrel', () => {
      expect(MessagingEvent.Status.delivered).toBe('delivered');
    });

    it('should allow constructing a MessagingEvent.Interface object via the barrel', () => {
      const msg: MessagingEvent.Interface = { id: 'msg-barrel', type: MessagingEvent.Type.sms };
      expect(msg.type).toBe('sms');
    });
  });

  describe('Post namespace re-export', () => {
    it('should export Post as a usable namespace', () => {
      expect(Post).toBeDefined();
    });

    it('should expose Post.Status through the barrel', () => {
      expect(Post.Status.active).toBe('active');
    });

    it('should expose Post.Type through the barrel', () => {
      expect(Post.Type.youtube).toBe('youtube');
    });

    it('should allow constructing a Post.Interface object via the barrel', () => {
      const post: Post.Interface = { source: 'https://youtu.be/abc', type: Post.Type.youtube };
      expect(post.type).toBe('youtube');
    });
  });

  describe('Price namespace re-export', () => {
    it('should export Price as a usable namespace', () => {
      expect(Price).toBeDefined();
    });

    it('should expose Price.Type through the barrel', () => {
      expect(Price.Type.event).toBe('event');
    });

    it('should expose Price.Visibility through the barrel', () => {
      expect(Price.Visibility.public).toBe('public');
    });

    it('should allow constructing a Price.Interface object via the barrel', () => {
      const price: Price.Interface = { account: 'acct-001', type: Price.Type.event };
      expect(price.account).toBe('acct-001');
    });
  });
});

describe('model barrel completeness', () => {
  /**
   * The namespaces the barrel is expected to re-export. A dropped `export *` is
   * otherwise invisible here and only surfaces when a consumer fails to compile,
   * which is why this is an explicit inventory rather than a spot check.
   */
  const expectedNamespaces = [
    'Account',
    'Block',
    'Capacity',
    'Entitlement',
    'EventData',
    'Idempotency',
    'Ledger',
    'MessageUsage',
    'MessagingEvent',
    'Post',
    'Price',
    'Reservation',
  ];

  it('should export exactly the expected namespaces', () => {
    expect(Object.keys(modelBarrel).sort()).toEqual(expectedNamespaces);
  });

  it.each(expectedNamespaces)('should expose a Schema, parse and safeParse on %s', (name) => {
    const namespace = (modelBarrel as Record<string, Record<string, unknown>>)[name];
    expect(namespace).toBeDefined();
    expect(namespace['Schema']).toBeDefined();
    expect(typeof namespace['parse']).toBe('function');
    expect(typeof namespace['safeParse']).toBe('function');
  });

  it('should reach the new namespaces through the barrel with validation intact', () => {
    expect(Idempotency.safeParse({ state: Idempotency.State.failed, requestHash: 'h' }).success).toBe(true);
    expect(Ledger.safeParse({ service: 's', scope: 'sc', amount: 'abc' }).success).toBe(false);
    expect(Reservation.safeParse({ token: 't', identity: 'i', expiresAt: 1767225600000 }).success).toBe(true);
    expect(Entitlement.safeParse({ account: 'a', uid: 'u', price: 'p', source: 's', type: Price.Type.event }).success).toBe(true);
    expect(Capacity.safeParse({ uid: 'u', price: 'p', source: 's', type: Price.Type.product, token: 't', generation: 0, expiresAt: 1767225600 }).success).toBe(true);
    expect(MessageUsage.safeParse({ period: '2026-01-01', token: 't' }).success).toBe(true);
  });

  it('should share one Price.Type across every namespace that references it', () => {
    expect(Entitlement.safeParse({ account: 'a', uid: 'u', price: 'p', source: 's', type: 'subscription' }).success).toBe(false);
    expect(Capacity.safeParse({ uid: 'u', price: 'p', source: 's', type: 'subscription', token: 't', generation: 0, expiresAt: 1767225600 }).success).toBe(false);
  });
});
