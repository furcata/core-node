/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */
export interface MessageQueue {
    pending?: number;
    ready?: number;
    sender?: number;
    sending?: number;
    counted?: any;
}
