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
})(Post || (Post = {}));
