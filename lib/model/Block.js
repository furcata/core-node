/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */
import { z } from "zod";
import { counter, parseOrThrow, parseResult, requiredKey, } from "../interface/schema.js";
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
    /**
     * Accepted runtime shapes for {@link Interface.value}, kept as a separate
     * schema so it is the single source of truth for both the validation and the
     * inferred output type of the `value` field below.
     */
    const blockValueSchema = z.union([z.string(), z.number(), z.record(z.string(), z.unknown()), z.array(z.unknown())]);
    /**
     * Runtime schema producing {@link Interface}.
     *
     * A block is the one shape in this package whose `type` is genuinely a
     * dispatch discriminant: the renderer selects a component from it. Asserting
     * an unrecognised value into {@link Type} therefore does not produce a
     * mislabelled block, it produces a dispatch with no matching branch, so the
     * value is validated against the enum here instead.
     *
     * Unknown keys are preserved rather than dropped, so a block written by a
     * newer renderer survives a round-trip through an older consumer with its
     * extra fields intact.
     */
    Block.Schema = z.looseObject({
        /**
         * See {@link Interface.type}. Required and enum-constrained.
         */
        type: z.enum(Type),
        /**
         * See {@link Interface.value}. Validated through a union of the four
         * declared runtime shapes; which member is legitimate depends on
         * {@link Interface.type}, and that correspondence is the renderer's to
         * enforce rather than this schema's.
         *
         * Wrapped in `requiredKey` because this key is required and its schema is a
         * `z.union`, which zod infers as an optional key under this repository's
         * `strictNullChecks: false` setting. Without the wrapper {@link parse} would
         * return a type claiming `value` may be absent when at runtime it never is.
         * The compile-time proof below is what surfaced that; see `requiredKey` for
         * the full explanation.
         */
        value: requiredKey(blockValueSchema, 'Expected a string, number, object or array block value'),
        /**
         * See {@link Interface.label}. Required but permitted to be empty, because
         * a block with no caption is a legitimate authoring choice.
         */
        label: z.string(),
        /**
         * See {@link Interface.width}. Whole pixels.
         */
        width: counter().optional(),
        /**
         * See {@link Interface.height}. Whole pixels.
         */
        height: counter().optional(),
    });
    /**
     * Validates untrusted data as a content block without throwing.
     *
     * @param {unknown} value - Untrusted value, typically one element of a stored `blocks` array.
     * @return {ParseResult<Interface>} Success carrying the typed block, or failure carrying the reasons.
     */
    Block.safeParse = (value) => parseResult(Block.Schema, value, 'Block.Interface');
    /**
     * Validates untrusted data as a content block, throwing when it does not
     * conform.
     *
     * @param {unknown} value - Untrusted value, typically one element of a stored `blocks` array.
     * @return {Interface} The validated block.
     * @throws {ParseError} When the value does not conform to {@link Schema}.
     */
    Block.parse = (value) => parseOrThrow(Block.Schema, value, 'Block.Interface');
})(Block || (Block = {}));
