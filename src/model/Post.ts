import {BaseFirestore} from '../interface/base_db.js';

/**
 * Post
 */
export namespace Post {
  export enum Status {
    pending = 'pending',
    active = 'active',
    removed = 'removed',
    // The user should pause the account to be able to stop the queue
    unknown = 'unknown',
  }

  export enum Type {
    instagram = 'instagram',
    link = 'link',
    youtube = 'youtube',
    x = 'x',
    tiktok = 'tiktok',
    vimeo = 'vimeo',
  }

  export interface Interface extends BaseFirestore {
    account?: string;
    service?: string;
    // Source URL or id depending on the type
    source: string;
    status?: Status;
    type: Type;
    uid?: string;
    category?: string;
    description?: string;
    featured?: boolean;
    tags?: string[];
    hashtags?: string[];
    // Featured Image
    image?: string;
    // All images
    images?: string[];
    language?: string;
    media?: string;
    safe?: boolean;
    title?: string;
    // Final URL
    url?: string;
    user?: string;
    // ML
    ml?: boolean;
    mlTitle?: string;
    mlDescription?: string;
    mlHashtags?: string[];
    mlImage?: string;
    fetched?: boolean;
    views?: number;
    likes?: number;
  }
}
