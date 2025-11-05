/**
 * Social Domain Models
 * 
 * Domain entities for social features.
 */

export type PostStatus = 'draft' | 'published' | 'archived';

/**
 * Post - Domain Entity
 */
export class Post {
  constructor(
    public readonly id: string,
    public readonly sellerId: string,
    public readonly caption: string,
    public readonly likeCount: number,
    public readonly commentCount: number,
    public readonly createdAt: string,
    public readonly categoryIds: string[],
    public readonly status: PostStatus
  ) {}

  /**
   * Business Rule: Check if post is published
   */
  isPublished(): boolean {
    return this.status === 'published';
  }

  /**
   * Business Rule: Check if post can be edited
   */
  canEdit(): boolean {
    return this.status === 'draft' || this.status === 'published';
  }

  /**
   * Business Rule: Check if post has engagement
   */
  hasEngagement(): boolean {
    return this.likeCount > 0 || this.commentCount > 0;
  }
}

/**
 * Post Comment - Value Object
 */
export class PostComment {
  constructor(
    public readonly id: string,
    public readonly postId: string,
    public readonly userId: string,
    public readonly content: string,
    public readonly createdAt: string
  ) {}

  /**
   * Business Rule: Check if comment is valid
   */
  isValid(): boolean {
    return this.content.trim().length > 0 && this.content.trim().length <= 1000;
  }
}

