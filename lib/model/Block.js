/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */
/**
 * Namespace for content-block primitives used to compose rich-media sections
 * within {@link EventData.Interface} and other structured content documents.
 *
 * Each block carries a `type`, a raw `value`, a display `label`, and optional
 * dimensional hints (`width`, `height`). Cloud Functions that render or
 * validate content iterate over arrays of `Block.Interface` to build
 * provider-specific payloads.
 */
export var Block;
(function (Block) {
    /**
     * Discriminated union of all supported content-block media types.
     *
     * The `type` value tells the renderer which component or embed to use when
     * displaying the block to an end-user.
     */
    let Type;
    (function (Type) {
        Type["download"] = "download";
        Type["image"] = "image";
        Type["text"] = "text";
        Type["video"] = "video";
        Type["youtube"] = "youtube";
        Type["vimeo"] = "vimeo";
        Type["location"] = "location";
        Type["audio"] = "audio";
        Type["link"] = "link";
        Type["tiktok"] = "tiktok";
        Type["instagram"] = "instagram";
        Type["facebook"] = "facebook";
        Type["twitter"] = "twitter";
    })(Type = Block.Type || (Block.Type = {}));
})(Block || (Block = {}));
