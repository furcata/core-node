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

  export interface Interface extends BaseFirestore {
    account: string;
    active?: boolean;
    amount?: number;
    currency?: string;
    event?: string;
    label?: string;
    description?: string;
    // Limit the number of users that can pay for this price
    limit?: number;
    type?: Type;
    users?: string[]; // user ids that have paid for this price
  }
}
