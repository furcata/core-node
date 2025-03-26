import {BaseFirestore} from '../interface/index.js';

/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 * Uses stripe price structure
 */
export namespace Price {
  export enum Type {
    oneTime = 'one_time',
    recurring = 'recurring',
  }

  export enum Visibility {
    public = 'public',
    private = 'private',
    unlisted = 'unlisted',
  }

  export interface Interface extends BaseFirestore {
    account: string;
    amount?: number;
    currency?: string;
    event?: string;
    image?: string;
    label?: string;
    description?: string;
    // Limit the number of users that can pay for this price
    limit?: number;
    type?: Type;
    uid?: string | null;
    users?: string[]; // user ids that have paid for this price
    visibility?: Visibility;
  }
}
