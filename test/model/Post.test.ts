/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */

import { describe, it, expect } from 'vitest';
import { Post } from '../../src/model/Post.js';

describe('Post.Status', () => {
  describe('enum values', () => {
    it('should have value "pending" for pending', () => {
      expect(Post.Status.pending).toBe('pending');
    });

    it('should have value "active" for active', () => {
      expect(Post.Status.active).toBe('active');
    });

    it('should have value "removed" for removed', () => {
      expect(Post.Status.removed).toBe('removed');
    });

    it('should have value "unknown" for unknown', () => {
      expect(Post.Status.unknown).toBe('unknown');
    });

    it('should expose exactly 4 members', () => {
      const members = Object.values(Post.Status);
      expect(members).toHaveLength(4);
    });
  });
});

describe('Post.Type', () => {
  describe('enum values', () => {
    it('should have value "instagram" for instagram', () => {
      expect(Post.Type.instagram).toBe('instagram');
    });

    it('should have value "link" for link', () => {
      expect(Post.Type.link).toBe('link');
    });

    it('should have value "youtube" for youtube', () => {
      expect(Post.Type.youtube).toBe('youtube');
    });

    it('should have value "x" for x', () => {
      expect(Post.Type.x).toBe('x');
    });

    it('should have value "tiktok" for tiktok', () => {
      expect(Post.Type.tiktok).toBe('tiktok');
    });

    it('should have value "vimeo" for vimeo', () => {
      expect(Post.Type.vimeo).toBe('vimeo');
    });

    it('should expose exactly 6 members', () => {
      const members = Object.values(Post.Type);
      expect(members).toHaveLength(6);
    });
  });
});

describe('Post.Interface', () => {
  describe('required fields', () => {
    it('should require source to be a non-empty string', () => {
      const post: Post.Interface = { source: 'https://instagram.com/p/abc123', type: Post.Type.instagram };
      expect(post.source).toBe('https://instagram.com/p/abc123');
    });

    it('should require type to be a Post.Type value', () => {
      const post: Post.Interface = { source: 'https://youtu.be/xyz', type: Post.Type.youtube };
      expect(post.type).toBe('youtube');
    });
  });

  describe('optional account and service fields', () => {
    it('should accept account as a Firestore document ID', () => {
      const post: Post.Interface = { source: 'src', type: Post.Type.link, account: 'acct-001' };
      expect(post.account).toBe('acct-001');
    });

    it('should accept service as a service configuration ID', () => {
      const post: Post.Interface = { source: 'src', type: Post.Type.link, service: 'svc-001' };
      expect(post.service).toBe('svc-001');
    });
  });

  describe('optional status field', () => {
    it('should accept Post.Status.pending', () => {
      const post: Post.Interface = { source: 'src', type: Post.Type.link, status: Post.Status.pending };
      expect(post.status).toBe('pending');
    });

    it('should accept Post.Status.active', () => {
      const post: Post.Interface = { source: 'src', type: Post.Type.link, status: Post.Status.active };
      expect(post.status).toBe('active');
    });

    it('should accept Post.Status.removed', () => {
      const post: Post.Interface = { source: 'src', type: Post.Type.link, status: Post.Status.removed };
      expect(post.status).toBe('removed');
    });
  });

  describe('optional uid field', () => {
    it('should accept a Firebase Auth UID', () => {
      const post: Post.Interface = { source: 'src', type: Post.Type.link, uid: 'user-uid-123' };
      expect(post.uid).toBe('user-uid-123');
    });
  });

  describe('optional text content fields', () => {
    it('should accept title', () => {
      const post: Post.Interface = { source: 'src', type: Post.Type.youtube, title: 'My Video' };
      expect(post.title).toBe('My Video');
    });

    it('should accept description', () => {
      const post: Post.Interface = { source: 'src', type: Post.Type.youtube, description: 'A tutorial video.' };
      expect(post.description).toBe('A tutorial video.');
    });

    it('should accept category', () => {
      const post: Post.Interface = { source: 'src', type: Post.Type.youtube, category: 'Education' };
      expect(post.category).toBe('Education');
    });

    it('should accept language as BCP 47 tag', () => {
      const post: Post.Interface = { source: 'src', type: Post.Type.youtube, language: 'en' };
      expect(post.language).toBe('en');
    });

    it('should accept url as the resolved final URL', () => {
      const post: Post.Interface = {
        source: 'https://youtu.be/abc',
        type: Post.Type.youtube,
        url: 'https://www.youtube.com/watch?v=abc',
      };
      expect(post.url).toBe('https://www.youtube.com/watch?v=abc');
    });
  });

  describe('optional array fields', () => {
    it('should accept tags array', () => {
      const post: Post.Interface = { source: 'src', type: Post.Type.link, tags: ['news', 'local'] };
      expect(post.tags).toEqual(['news', 'local']);
    });

    it('should accept hashtags array', () => {
      const post: Post.Interface = { source: 'src', type: Post.Type.instagram, hashtags: ['#community', '#event'] };
      expect(post.hashtags).toEqual(['#community', '#event']);
    });

    it('should accept images array', () => {
      const post: Post.Interface = {
        source: 'src',
        type: Post.Type.instagram,
        images: ['https://cdn.example.com/1.jpg', 'https://cdn.example.com/2.jpg'],
      };
      expect(post.images).toHaveLength(2);
    });
  });

  describe('optional media fields', () => {
    it('should accept image as featured image URL', () => {
      const post: Post.Interface = {
        source: 'src',
        type: Post.Type.youtube,
        image: 'https://img.youtube.com/vi/abc/maxresdefault.jpg',
      };
      expect(post.image).toContain('maxresdefault');
    });

    it('should accept media as primary media asset URL', () => {
      const post: Post.Interface = {
        source: 'src',
        type: Post.Type.vimeo,
        media: 'https://player.vimeo.com/video/12345',
      };
      expect(post.media).toContain('vimeo');
    });
  });

  describe('optional boolean flags', () => {
    it('should accept featured flag', () => {
      const post: Post.Interface = { source: 'src', type: Post.Type.link, featured: true };
      expect(post.featured).toBe(true);
    });

    it('should accept safe flag', () => {
      const post: Post.Interface = { source: 'src', type: Post.Type.link, safe: true };
      expect(post.safe).toBe(true);
    });

    it('should accept fetched flag', () => {
      const post: Post.Interface = { source: 'src', type: Post.Type.link, fetched: false };
      expect(post.fetched).toBe(false);
    });
  });

  describe('ML enrichment fields', () => {
    it('should accept ml flag', () => {
      const post: Post.Interface = { source: 'src', type: Post.Type.link, ml: true };
      expect(post.ml).toBe(true);
    });

    it('should accept mlTitle', () => {
      const post: Post.Interface = { source: 'src', type: Post.Type.link, mlTitle: 'AI-generated title' };
      expect(post.mlTitle).toBe('AI-generated title');
    });

    it('should accept mlDescription', () => {
      const post: Post.Interface = { source: 'src', type: Post.Type.link, mlDescription: 'AI-generated description.' };
      expect(post.mlDescription).toBe('AI-generated description.');
    });

    it('should accept mlHashtags array', () => {
      const post: Post.Interface = {
        source: 'src',
        type: Post.Type.link,
        mlHashtags: ['#ai', '#generated'],
      };
      expect(post.mlHashtags).toEqual(['#ai', '#generated']);
    });

    it('should accept mlImage URL', () => {
      const post: Post.Interface = {
        source: 'src',
        type: Post.Type.link,
        mlImage: 'https://cdn.example.com/ml-selected.jpg',
      };
      expect(post.mlImage).toContain('ml-selected');
    });
  });

  describe('analytics fields', () => {
    it('should accept views counter', () => {
      const post: Post.Interface = { source: 'src', type: Post.Type.youtube, views: 5000 };
      expect(post.views).toBe(5000);
    });

    it('should accept likes counter', () => {
      const post: Post.Interface = { source: 'src', type: Post.Type.youtube, likes: 250 };
      expect(post.likes).toBe(250);
    });
  });

  describe('optional user creator field', () => {
    it('should accept user as a Firebase Auth UID string', () => {
      const post: Post.Interface = { source: 'src', type: Post.Type.tiktok, user: 'creator-uid-abc' };
      expect(post.user).toBe('creator-uid-abc');
    });
  });

  describe('inherited BaseFirestore fields', () => {
    it('should accept id and backup', () => {
      const post: Post.Interface = {
        source: 'https://tiktok.com/@user/video/123',
        type: Post.Type.tiktok,
        id: 'post-tt-001',
        backup: true,
      };
      expect(post.id).toBe('post-tt-001');
      expect(post.backup).toBe(true);
    });
  });

  describe('fully populated post', () => {
    it('should accept all core fields simultaneously', () => {
      const post: Post.Interface = {
        id: 'post-yt-001',
        source: 'https://youtu.be/dQw4w9WgXcQ',
        type: Post.Type.youtube,
        status: Post.Status.active,
        account: 'acct-001',
        uid: 'curator-uid',
        title: 'Never Gonna Give You Up',
        description: 'Official music video',
        language: 'en',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        image: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        tags: ['music', 'classic'],
        hashtags: ['#rickroll', '#80s'],
        featured: true,
        safe: true,
        fetched: true,
        ml: true,
        mlTitle: 'Rick Astley - Never Gonna Give You Up',
        views: 1400000000,
        likes: 15000000,
        backup: false,
      };
      expect(post.title).toBe('Never Gonna Give You Up');
      expect(post.status).toBe('active');
      expect(post.views).toBeGreaterThan(1000000000);
    });
  });
});
