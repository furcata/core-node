import { BaseFirestore } from '../interface/index.js';
/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 * Uses stripe price structure
 */
export declare namespace Price {
    enum Type {
        event = "event",
        product = "product"
    }
    enum Visibility {
        public = "public",
        private = "private",
        unlisted = "unlisted"
    }
    interface Interface extends BaseFirestore {
        account: string;
        amount?: number;
        currency?: string;
        source?: string;
        image?: string;
        label?: string;
        description?: string;
        limit?: number;
        type?: Type;
        uid?: string | null;
        users?: string[];
        visibility?: Visibility;
        clicks?: number;
        views?: number;
        checkout?: number;
        booked?: number;
    }
}
