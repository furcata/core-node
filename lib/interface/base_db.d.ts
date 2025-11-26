/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */
export interface BaseFirestore {
    id?: string;
    backup?: boolean;
    created?: any;
    updated?: any;
    expiry?: any;
    [x: string]: any;
}
