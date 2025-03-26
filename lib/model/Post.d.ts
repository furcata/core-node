import { BaseFirestore } from '../interface/base_db.js';
/**
 * Post
 */
export declare namespace Post {
    enum Status {
        pending = "pending",
        active = "active",
        removed = "removed",
        unknown = "unknown"
    }
    enum Type {
        instagram = "instagram",
        link = "link",
        youtube = "youtube",
        x = "x",
        tiktok = "tiktok",
        vimeo = "vimeo"
    }
    interface Interface extends BaseFirestore {
        account?: string;
        service?: string;
        source: string;
        status?: Status;
        type: Type;
        uid?: string;
        category?: string;
        description?: string;
        featured?: boolean;
        tags?: string[];
        hashtags?: string[];
        image?: string;
        images?: string[];
        language?: string;
        media?: string;
        safe?: boolean;
        title?: string;
        url?: string;
        user?: string;
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
