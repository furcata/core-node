/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */
import { z } from "zod";
import { counter, parseOrThrow, parseResult, } from "../interface/schema.js";
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
    const blockValueSchema = z.union([z.string(), z.number(), z.record(z.string(), z.unknown()), z.array(z.unknown())], { error: 'Expected a string, number, object or array block value' });
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
         * Carries an explicit `error` message on the union itself, because zod
         * reports a failed union as the unhelpful `Invalid input` — it cannot know
         * which member the caller intended. Naming the accepted shapes is the
         * difference between a caller seeing what to send and seeing nothing.
         */
        value: blockValueSchema,
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
