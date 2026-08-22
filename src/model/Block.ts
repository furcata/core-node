/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */

import { z } from "zod";
import { EventData } from "./EventData.js";
import {
  AssertSchemaOutput,
  counter,
  ParseResult,
  parseOrThrow,
  parseResult,
  requiredKey,
} from "../interface/schema.js";

/**
 * Namespace for content-block primitives used to compose rich-media sections
 * within {@link EventData.Interface} and other structured content documents.
 *
 * Each block carries a `type`, a raw `value`, a display `label`, and optional
 * dimensional hints (`width`, `height`). Cloud Functions that render or
 * validate content iterate over arrays of `Block.Interface` to build
 * provider-specific payloads.
 */
export namespace Block {
  /**
   * Discriminated union of all supported content-block media types.
   *
   * The `type` value tells the renderer which component or embed to use when
   * displaying the block to an end-user.
   */
  export enum Type {
    download = 'download',
    image = 'image',
    text = 'text',
    video = 'video',
    youtube = 'youtube',
    vimeo = 'vimeo',
    location = 'location',
    audio = 'audio',
    link = 'link',
    tiktok = 'tiktok',
    instagram = 'instagram',
    facebook = 'facebook',
    twitter = 'twitter',
  }

  /**
   * Represents a single content block within a structured document.
   *
   * Blocks are the building blocks of rich-media content (e.g., event pages).
   * An array of `Interface` objects forms the `blocks` field on
   * {@link EventData.Interface}.
   */
  export interface Interface {
    /**
     * The media type of this block, which determines how `value` is
     * interpreted by the renderer.
     */
    type: Type,
    /**
     * The raw content or resource identifier for this block (e.g., a URL for
     * an image or video, plain text for a text block, coordinates for a
     * location block as `Record<string, unknown>`, or an ordered list as
     * `unknown[]`).
     */
    value: string | number | Record<string, unknown> | unknown[],
    /**
     * Human-readable label or caption displayed alongside the block content.
     */
    label: string,
    /**
     * Optional display width hint in pixels for media blocks such as images
     * and videos.
     */
    width?: number,
    /**
     * Optional display height hint in pixels for media blocks such as images
     * and videos.
     */
    height?: number,
  }

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
  export const Schema = z.looseObject({
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
     * `z.union`, which zod inferred as an optional key under the
     * `strictNullChecks: false` setting this package previously used. Without
     * the wrapper {@link parse} would have returned a type claiming `value` may
     * be absent when at runtime it never is. `strictNullChecks` is now enabled
     * and the inference is correct without the wrapper, which is retained here
     * only so that removing it is a deliberate change with its own tests rather
     * than a side effect of a compiler-flag change; see `requiredKey`.
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
   * Compile-time proof that {@link Schema} produces {@link Interface}.
   */
  export type SchemaOutput = AssertSchemaOutput<z.infer<typeof Schema>, Interface>;

  /**
   * Validates untrusted data as a content block without throwing.
   *
   * @param {unknown} value - Untrusted value, typically one element of a stored `blocks` array.
   * @return {ParseResult<Interface>} Success carrying the typed block, or failure carrying the reasons.
   */
  export const safeParse = (value: unknown): ParseResult<Interface> => parseResult(Schema, value, 'Block.Interface');

  /**
   * Validates untrusted data as a content block, throwing when it does not
   * conform.
   *
   * @param {unknown} value - Untrusted value, typically one element of a stored `blocks` array.
   * @return {Interface} The validated block.
   * @throws {ParseError} When the value does not conform to {@link Schema}.
   */
  export const parse = (value: unknown): Interface => parseOrThrow(Schema, value, 'Block.Interface');
}
