/**
 * Post
 */
export var Post;
(function (Post) {
    let Status;
    (function (Status) {
        Status["pending"] = "pending";
        Status["active"] = "active";
        Status["removed"] = "removed";
        // The user should pause the account to be able to stop the queue
        Status["unknown"] = "unknown";
    })(Status = Post.Status || (Post.Status = {}));
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
