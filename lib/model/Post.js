/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */
import { z } from 'zod';
import { baseFirestoreShape } from '../interface/base_db.js';
import { counter, documentId, nonEmptyString, parseOrThrow, parseResult, } from '../interface/schema.js';
/**
 * Namespace for post models representing social-media content items (e.g.,
 * Instagram reels, YouTube videos, TikToks) that are imported, curated, and
 * optionally enriched with ML metadata before being stored in Firestore.
 *
 * Cloud Functions fetch external post data using the `source` URL or
 * platform-specific ID, populate ML fields via an AI enrichment pipeline, and
 * persist the result as a `Post.Interface` document.
 */
export var Post;
(function (Post) {
    /**
     * Lifecycle status of a post document within the Furcata platform.
     *
     * Cloud Functions use this value to determine whether a post should be
     * displayed to end-users or removed from listing results.
     */
    let Status;
    (function (Status) {
        Status["pending"] = "pending";
        Status["active"] = "active";
        Status["removed"] = "removed";
        // The user should pause the account to be able to stop the queue
        Status["unknown"] = "unknown";
    })(Status = Post.Status || (Post.Status = {}));
    /**
     * Social-media platform or link type from which the post originates.
     *
     * The `type` value drives which fetcher implementation Cloud Functions use
     * to retrieve and normalise external metadata.
     */
    let Type;
    (function (Type) {
        Type["instagram"] = "instagram";
        Type["link"] = "link";
        Type["youtube"] = "youtube";
        Type["x"] = "x";
        Type["tiktok"] = "tiktok";
        Type["vimeo"] = "vimeo";
    })(Type = Post.Type || (Post.Type = {}));
    /**
     * Runtime schema producing {@link Interface}.
     *
     * Both discriminants are validated rather than asserted. {@link Interface.type}
     * selects which external fetcher runs, so an unrecognised value is a dispatch
     * failure rather than a cosmetic one, and {@link Interface.status} gates
     * whether the post is shown to end-users, so a value that is neither
     * `removed` nor a known state fails open and displays content that was meant
     * to be withdrawn.
     *
     * Unknown keys are preserved, matching the index signature inherited from
     * {@link BaseFirestore}.
     */
    Post.Schema = z.looseObject({
        ...baseFirestoreShape,
        /**
         * See {@link Interface.account}.
         */
        account: documentId().optional(),
        /**
         * See {@link Interface.service}.
         */
        service: nonEmptyString().optional(),
        /**
         * See {@link Interface.source}. Required: a post with no source URL or
         * platform identifier cannot be fetched or de-duplicated.
         */
        source: nonEmptyString(),
        /**
         * See {@link Interface.status}.
         */
        status: z.enum(Status).optional(),
        /**
         * See {@link Interface.type}. Required and enum-constrained.
         */
        type: z.enum(Type),
        /**
         * See {@link Interface.uid}.
         */
        uid: nonEmptyString().optional(),
        /**
         * See {@link Interface.category}.
         */
        category: z.string().optional(),
        /**
         * See {@link Interface.description}.
         */
        description: z.string().optional(),
        /**
         * See {@link Interface.featured}.
         */
        featured: z.boolean().optional(),
        /**
         * See {@link Interface.tags}.
         */
        tags: z.array(z.string()).optional(),
        /**
         * See {@link Interface.hashtags}.
         */
        hashtags: z.array(z.string()).optional(),
        /**
         * See {@link Interface.image}.
         */
        image: nonEmptyString().optional(),
        /**
         * See {@link Interface.images}.
         */
        images: z.array(z.string()).optional(),
        /**
         * See {@link Interface.language}.
         */
        language: nonEmptyString().optional(),
        /**
         * See {@link Interface.media}.
         */
        media: nonEmptyString().optional(),
        /**
         * See {@link Interface.safe}.
         */
        safe: z.boolean().optional(),
        /**
         * See {@link Interface.title}.
         */
        title: z.string().optional(),
        /**
         * See {@link Interface.url}.
         */
        url: nonEmptyString().optional(),
        /**
         * See {@link Interface.user}.
         */
        user: nonEmptyString().optional(),
        /**
         * See {@link Interface.ml}.
         */
        ml: z.boolean().optional(),
        /**
         * See {@link Interface.mlTitle}.
         */
        mlTitle: z.string().optional(),
        /**
         * See {@link Interface.mlDescription}.
         */
        mlDescription: z.string().optional(),
        /**
         * See {@link Interface.mlHashtags}.
         */
        mlHashtags: z.array(z.string()).optional(),
        /**
         * See {@link Interface.mlImage}.
         */
        mlImage: nonEmptyString().optional(),
        /**
         * See {@link Interface.fetched}.
         */
        fetched: z.boolean().optional(),
        /**
         * See {@link Interface.views}.
         */
        views: counter().optional(),
        /**
         * See {@link Interface.likes}.
         */
        likes: counter().optional(),
    });
    /**
     * Validates untrusted data as a post document without throwing.
     *
     * @param {unknown} value - Untrusted value, typically the raw data of a stored post document.
     * @return {ParseResult<Interface>} Success carrying the typed post, or failure carrying the reasons.
     */
    Post.safeParse = (value) => parseResult(Post.Schema, value, 'Post.Interface');
    /**
     * Validates untrusted data as a post document, throwing when it does not
     * conform.
     *
     * @param {unknown} value - Untrusted value, typically the raw data of a stored post document.
     * @return {Interface} The validated post document.
     * @throws {ParseError} When the value does not conform to {@link Schema}.
     */
    Post.parse = (value) => parseOrThrow(Post.Schema, value, 'Post.Interface');
})(Post || (Post = {}));
