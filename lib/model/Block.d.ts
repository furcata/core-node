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
export declare namespace Block {
    /**
     * Discriminated union of all supported content-block media types.
     *
     * The `type` value tells the renderer which component or embed to use when
     * displaying the block to an end-user.
     */
    enum Type {
        download = "download",
        image = "image",
        text = "text",
        video = "video",
        youtube = "youtube",
        vimeo = "vimeo",
        location = "location",
        audio = "audio",
        link = "link",
        tiktok = "tiktok",
        instagram = "instagram",
        facebook = "facebook",
        twitter = "twitter"
    }
    /**
     * Represents a single content block within a structured document.
     *
     * Blocks are the building blocks of rich-media content (e.g., event pages).
     * An array of `Interface` objects forms the `blocks` field on
     * {@link EventData.Interface}.
     */
    interface Interface {
        /**
         * The media type of this block, which determines how `value` is
         * interpreted by the renderer.
         */
        type: Type;
        /**
         * The raw content or resource identifier for this block (e.g., a URL for
         * an image or video, plain text for a text block, coordinates for a
         * location block as `Record<string, unknown>`, or an ordered list as
         * `unknown[]`).
         */
        value: string | number | Record<string, unknown> | unknown[];
        /**
         * Human-readable label or caption displayed alongside the block content.
         */
        label: string;
        /**
         * Optional display width hint in pixels for media blocks such as images
         * and videos.
         */
        width?: number;
        /**
         * Optional display height hint in pixels for media blocks such as images
         * and videos.
         */
        height?: number;
    }
}
