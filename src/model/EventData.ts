/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */
import {BaseFirestore} from '../interface/base_db.js';
import {BasePlaceData} from '../interface/place.js';
import {Block} from './Block.js';

export namespace EventData {
  export enum Type {
    inPerson = 'in_person',
    online = 'online',
  }

  export enum Frequency {
    once = 'once',
    daily = 'daily',
    weekly = 'weekly',
    monthly = 'monthly',
  }

  export enum Status {
    draft = 'draft',
    scheduled = 'scheduled',
    active = 'active',
    archived = 'archived'
  }

  export interface Interface extends BaseFirestore, BasePlaceData {
    name?: string;
    description?: string;
    language?: string;
    account?: string;
    media?: string[];
    type?: Type | any;
    frequency?: Frequency | any;
    status?: Status | any;
    uid?: string | null;
    blocks?: Block.Interface[],
    // @deprecated Use Price instead
    currency?: string;
    // @deprecated Use Price instead
    amount?: number;
    users?: string[]; // user ids
    hosts?: string[]; // user ids
    // Limit the number of users that can join the event
    limit?: number;
    startTime?: any;
    endTime?: any;
    duration?: number; // in minutes
    runHour?: number;
    // Track
    clicks?: number;
    views?: number;
    checkout?: number;
    booked?: number;
  }
}
