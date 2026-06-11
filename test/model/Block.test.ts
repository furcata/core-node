/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */

import { describe, it, expect } from 'vitest';
import { Block } from '../../src/model/Block.js';

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
