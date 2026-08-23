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
    width?: number | null,
    /**
     * Optional display height hint in pixels for media blocks such as images
     * and videos.
     */
    height?: number | null,
  }

  /**
   * Accepted runtime shapes for {@link Interface.value}, kept as a separate
   * schema so it is the single source of truth for both the validation and the
   * inferred output type of the `value` field below.
   */
  const blockValueSchema = z.union([z.string(), z.number(), z.record(z.string(), z.unknown()), z.array(z.unknown())], {error: 'Expected a string, number, object or array block value'});

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
    width: counter().nullish(),
    /**
     * See {@link Interface.height}. Whole pixels.
     */
    height: counter().nullish(),
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
