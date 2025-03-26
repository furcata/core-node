/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */
import {BaseFirestore} from '../interface/base_db.js';
import {BasePlaceData} from '../interface/place.js';
import {Block} from './Block.js';

export namespace EventData {
  export enum Type {
    inPerson = 'inPerson',
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
    canceled = 'canceled'
  }

  export enum Visibility {
    public = 'public',
    private = 'private',
    unlisted = 'unlisted',
  }

  export interface Interface extends BaseFirestore, BasePlaceData {
    name?: string;
    description?: string;
    language?: string;
    account?: string;
    media?: string[];
    type?: Type | any;
    frequency?: Frequency | any;
    visibility?: Visibility | any;
    status?: Status | any;
    uid?: string | null;
    blocks?: Block.Interface[],
    currency?: string;
    amount?: number;
    users?: string[]; // user ids
    hosts?: string[]; // user ids
    limit?: number;
    successMessage?: string;
    redirectUrl?: string;
    successUrl?: string;
    startTime?: any;
    endTime?: any;
    runHour?: number;
  }
}
