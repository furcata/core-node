/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */

import { describe, it, expect } from 'vitest';
import { Block } from '../../src/model/Block.js';
import { ParseError } from '../../src/interface/schema.js';

describe('Block.Type', () => {
  describe('enum values', () => {
    it('should have value "download" for download', () => {
      expect(Block.Type.download).toBe('download');
    });

    it('should have value "image" for image', () => {
      expect(Block.Type.image).toBe('image');
    });

    it('should have value "text" for text', () => {
      expect(Block.Type.text).toBe('text');
    });

    it('should have value "video" for video', () => {
      expect(Block.Type.video).toBe('video');
    });

    it('should have value "youtube" for youtube', () => {
      expect(Block.Type.youtube).toBe('youtube');
    });

    it('should have value "vimeo" for vimeo', () => {
      expect(Block.Type.vimeo).toBe('vimeo');
    });

    it('should have value "location" for location', () => {
      expect(Block.Type.location).toBe('location');
    });

    it('should have value "audio" for audio', () => {
      expect(Block.Type.audio).toBe('audio');
    });

    it('should have value "link" for link', () => {
      expect(Block.Type.link).toBe('link');
    });

    it('should have value "tiktok" for tiktok', () => {
      expect(Block.Type.tiktok).toBe('tiktok');
    });

    it('should have value "instagram" for instagram', () => {
      expect(Block.Type.instagram).toBe('instagram');
    });

    it('should have value "facebook" for facebook', () => {
      expect(Block.Type.facebook).toBe('facebook');
    });

    it('should have value "twitter" for twitter', () => {
      expect(Block.Type.twitter).toBe('twitter');
    });

    it('should expose exactly 13 members', () => {
      const members = Object.values(Block.Type);
      expect(members).toHaveLength(13);
    });
  });
});

describe('Block.Interface', () => {
  describe('required type field', () => {
    it('should accept Block.Type.text', () => {
      const block: Block.Interface = { type: Block.Type.text, value: 'Hello', label: 'Intro' };
      expect(block.type).toBe('text');
    });

    it('should accept Block.Type.image', () => {
      const block: Block.Interface = {
        type: Block.Type.image,
        value: 'https://example.com/img.jpg',
        label: 'Banner',
      };
      expect(block.type).toBe('image');
    });

    it('should accept Block.Type.video', () => {
      const block: Block.Interface = {
        type: Block.Type.video,
        value: 'https://example.com/video.mp4',
        label: 'Promo',
      };
      expect(block.type).toBe('video');
    });

    it('should accept Block.Type.youtube', () => {
      const block: Block.Interface = {
        type: Block.Type.youtube,
        value: 'dQw4w9WgXcQ',
        label: 'YouTube clip',
      };
      expect(block.type).toBe('youtube');
    });

    it('should accept Block.Type.location', () => {
      const block: Block.Interface = {
        type: Block.Type.location,
        value: { lat: 37.7749, lng: -122.4194 },
        label: 'Venue',
      };
      expect(block.type).toBe('location');
    });
  });

  describe('required value field', () => {
    it('should accept a string value', () => {
      const block: Block.Interface = {
        type: Block.Type.text,
        value: 'Plain text content',
        label: 'Body',
      };
      expect(block.value).toBe('Plain text content');
    });

    it('should accept an object value', () => {
      const coordinates = { lat: 51.5074, lng: -0.1278 };
      const block: Block.Interface = {
        type: Block.Type.location,
        value: coordinates,
        label: 'London',
      };
      expect(block.value).toEqual(coordinates);
    });

    it('should accept a numeric value', () => {
      const block: Block.Interface = {
        type: Block.Type.audio,
        value: 12345,
        label: 'Track',
      };
      expect(block.value).toBe(12345);
    });
  });

  describe('required label field', () => {
    it('should accept a non-empty string', () => {
      const block: Block.Interface = {
        type: Block.Type.link,
        value: 'https://example.com',
        label: 'Visit our site',
      };
      expect(block.label).toBe('Visit our site');
    });

    it('should accept an empty string', () => {
      const block: Block.Interface = {
        type: Block.Type.text,
        value: 'content',
        label: '',
      };
      expect(block.label).toBe('');
    });
  });

  describe('optional dimensional fields', () => {
    it('should accept width as a number', () => {
      const block: Block.Interface = {
        type: Block.Type.image,
        value: 'https://example.com/img.jpg',
        label: 'Photo',
        width: 1920,
      };
      expect(block.width).toBe(1920);
    });

    it('should accept height as a number', () => {
      const block: Block.Interface = {
        type: Block.Type.image,
        value: 'https://example.com/img.jpg',
        label: 'Photo',
        height: 1080,
      };
      expect(block.height).toBe(1080);
    });

    it('should be undefined when not provided', () => {
      const block: Block.Interface = {
        type: Block.Type.text,
        value: 'text',
        label: 'note',
      };
      expect(block.width).toBeUndefined();
      expect(block.height).toBeUndefined();
    });

    it('should accept both width and height together', () => {
      const block: Block.Interface = {
        type: Block.Type.video,
        value: 'https://example.com/vid.mp4',
        label: 'Video',
        width: 1280,
        height: 720,
      };
      expect(block.width).toBe(1280);
      expect(block.height).toBe(720);
    });
  });

  describe('block array composition', () => {
    it('should support an array of mixed-type blocks', () => {
      const blocks: Block.Interface[] = [
        { type: Block.Type.text, value: 'Intro paragraph', label: 'Intro' },
        { type: Block.Type.image, value: 'https://cdn.example.com/hero.jpg', label: 'Hero Image', width: 1200, height: 630 },
        { type: Block.Type.youtube, value: 'abc123', label: 'Trailer' },
      ];
      expect(blocks).toHaveLength(3);
      expect(blocks[0].type).toBe('text');
      expect(blocks[1].type).toBe('image');
      expect(blocks[2].type).toBe('youtube');
    });
  });
});

/**
 * A block that must parse.
 */
const validBlock = (): Record<string, unknown> => ({
  type: Block.Type.text,
  value: 'Synthetic body copy',
  label: 'Intro',
  width: 640,
  height: 480,
});

describe('Block.Schema', () => {
  describe('field inventory', () => {
    it('should declare exactly the five fields of the interface and no audit fields', () => {
      expect(Object.keys(Block.Schema.shape).sort()).toEqual(['height', 'label', 'type', 'value', 'width']);
    });
  });

  describe('a valid block', () => {
    it('should parse and return the typed block', () => {
      const parsed = Block.parse(validBlock());
      expect(parsed.type).toBe(Block.Type.text);
      expect(parsed.value).toBe('Synthetic body copy');
      expect(parsed.width).toBe(640);
    });

    it('should accept every declared block type', () => {
      for (const type of Object.values(Block.Type)) {
        expect(Block.safeParse({ ...validBlock(), type }).success).toBe(true);
      }
    });
  });

  describe('enum rejection', () => {
    it('should reject a type that is not a declared member, which would dispatch to no renderer', () => {
      const result = Block.safeParse({ ...validBlock(), type: 'carousel' });
      expect(result.success).toBe(false);
      expect(result.issues?.some((issue) => issue.path === 'type')).toBe(true);
    });

    it('should reject plausible-looking but undeclared types', () => {
      for (const type of ['Image', 'IMAGE', 'images', 'youtube_video', '']) {
        expect(Block.safeParse({ ...validBlock(), type }).success).toBe(false);
      }
    });
  });

  describe('missing required fields', () => {
    it.each(['type', 'value', 'label'])('should reject a block with no %s', (field) => {
      const block = validBlock();
      delete block[field];
      const result = Block.safeParse(block);
      expect(result.success).toBe(false);
      expect(result.issues?.some((issue) => issue.path === field)).toBe(true);
    });

    it('should accept an empty label, because a block with no caption is a legitimate choice', () => {
      expect(Block.safeParse({ ...validBlock(), label: '' }).success).toBe(true);
    });
  });

  describe('the value union', () => {
    it('should accept each declared runtime shape', () => {
      for (const value of ['text', 42, { latitude: 0, longitude: 0 }, ['a', 'b']]) {
        expect(Block.safeParse({ ...validBlock(), value }).success).toBe(true);
      }
    });

    it('should reject a value of an undeclared kind', () => {
      for (const value of [true, null]) {
        expect(Block.safeParse({ ...validBlock(), value }).success).toBe(false);
      }
    });

    it('should return a value that is present, never undefined, on a successful parse', () => {
      const parsed = Block.parse(validBlock());
      expect(parsed.value).toBeDefined();
      expect('value' in parsed).toBe(true);
    });
  });

  describe('dimension hints', () => {
    it('should reject a fractional or negative dimension', () => {
      expect(Block.safeParse({ ...validBlock(), width: 1.5 }).success).toBe(false);
      expect(Block.safeParse({ ...validBlock(), height: -1 }).success).toBe(false);
    });

    it('should reject a numeric string dimension rather than coercing it', () => {
      expect(Block.safeParse({ ...validBlock(), width: '640' }).success).toBe(false);
    });
  });

  describe('unknown-key policy', () => {
    it('should preserve an undeclared field rather than dropping it', () => {
      const parsed = Block.parse({ ...validBlock(), alt: 'kept' });
      expect(parsed['alt']).toBe('kept');
    });
  });

  describe('throwing form', () => {
    it('should throw a ParseError naming the shape', () => {
      expect(() => Block.parse({ type: Block.Type.text })).toThrow(ParseError);
      expect(() => Block.parse({ type: Block.Type.text })).toThrow(/Block\.Interface failed validation/);
    });
  });
});
