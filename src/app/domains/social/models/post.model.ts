import {
  FOLLOW_TYPES,
  NICHE_MEMBERSHIP_ROLES,
  NICHE_STATUS,
  NICHE_VISIBILITY,
  POST_STATUS,
  type FollowDto,
  type FollowTypeDto,
  type NicheCategoryDto,
  type NicheDto,
  type NicheMembershipDto,
  type NicheMembershipRoleDto,
  type NicheModerationActionDto,
  type NichePostDto,
  type NicheStatusDto,
  type NicheVisibilityDto,
  type PostCategoryAttachmentDto,
  type PostCommentDto,
  type PostCommentReactionDto,
  type PostDto,
  type PostLikeDto,
  type PostNicheContextDto,
  type PostStatusDto,
  type PostTaggedProductDto,
  type PostUserSummaryDto,
  type ReactionSummaryDto,
  type FeedItemDto,
  type FeedItemTypeDto,
  type StoryDto,
  type CollectionDto,
} from './post.dto';
import type { CategoryDto } from '../../categories/models/category.dto';
import type {
  ProductDto,
  ProductSellerDto,
} from '../../marketplace/models/product.dto';
import type { SocialMediaPostDto } from '../../media/models/media.dto';

export type PostStatus = PostStatusDto;
export const POST_STATUS_VALUES = POST_STATUS;

export type FollowType = FollowTypeDto;
export const FOLLOW_TYPE_VALUES = FOLLOW_TYPES;

export type NicheStatus = NicheStatusDto;
export const NICHE_STATUS_VALUES = NICHE_STATUS;

export type NicheVisibility = NicheVisibilityDto;
export const NICHE_VISIBILITY_VALUES = NICHE_VISIBILITY;

export type NicheMembershipRole = NicheMembershipRoleDto;
export const NICHE_MEMBERSHIP_ROLE_VALUES = NICHE_MEMBERSHIP_ROLES;

export class PostUser {
  private constructor(
    public readonly id: string,
    public readonly username: string,
    public readonly firstName: string | null,
    public readonly lastName: string | null,
    public readonly profilePictureUrl: string | null,
    public readonly emailVerified: boolean,
    public readonly isBuyer: boolean,
    public readonly isSeller: boolean,
    public readonly shopName: string | null,
    public readonly shopSlug: string | null
  ) {}

  static fromDto(dto?: PostUserSummaryDto | null): PostUser | null {
    if (!dto) {
      return null;
    }

    return new PostUser(
      dto.id,
      dto.username,
      dto.first_name ?? null,
      dto.last_name ?? null,
      dto.profile_picture_url ?? null,
      Boolean(dto.email_verified ?? false),
      Boolean(dto.is_buyer ?? false),
      Boolean(dto.is_seller ?? false),
      dto.shop_name ?? null,
      dto.shop_slug ?? null
    );
  }

  get displayName(): string {
    if (this.username) {
      return this.username;
    }

    const parts = [this.firstName, this.lastName].filter(Boolean) as string[];
    return parts.join(' ').trim();
  }

  get profile_picture_url(): string | null {
    return this.profilePictureUrl;
  }

  get first_name(): string | null {
    return this.firstName;
  }

  get last_name(): string | null {
    return this.lastName;
  }

  get email_verified(): boolean {
    return this.emailVerified;
  }
}

export class PostCategory {
  private constructor(
    public readonly categoryId: number | string,
    public readonly sortOrder: number | null,
    public readonly category: CategoryDto | null
  ) {}

  static fromDto(dto: PostCategoryAttachmentDto): PostCategory {
    const category = dto.category ? dto.category : null;

    return new PostCategory(dto.category_id, dto.sort_order ?? null, category);
  }
}

export class PostMedia {
  private constructor(
    public readonly id: number,
    public readonly postId: string,
    public readonly mediaId: number,
    public readonly platform: string | null,
    public readonly postType: string | null,
    public readonly sortOrder: number,
    public readonly aspectRatio: string | null,
    public readonly optimizedForPlatform: boolean,
    public readonly media: SocialMediaPostDto['media'] | null
  ) {}

  static fromDto(dto: SocialMediaPostDto): PostMedia {
    return new PostMedia(
      dto.id,
      dto.post_id,
      dto.media_id,
      dto.platform ?? null,
      dto.post_type ?? null,
      dto.sort_order,
      dto.aspect_ratio ?? null,
      dto.optimized_for_platform,
      dto.media ?? null
    );
  }
}

export class ProductSummary {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly price: number,
    public readonly currency: string | null,
    public readonly primaryImageUrl: string | null,
    public readonly seller: ProductSellerSummary | null
  ) {}

  static fromDto(dto: ProductDto): ProductSummary {
    const primaryImage = dto.images?.[0]?.media;

    return new ProductSummary(
      dto.id,
      dto.name,
      dto.description ?? null,
      dto.price,
      (dto.product_metadata as { currency?: string } | undefined)?.currency ??
        null,
      primaryImage?.social_post_url ??
        primaryImage?.social_square_url ??
        primaryImage?.thumbnail_url ??
        primaryImage?.original_url ??
        null,
      dto.seller ? ProductSellerSummary.fromDto(dto.seller) : null
    );
  }
}

export class ProductSellerSummary {
  private constructor(
    public readonly id: number | string,
    public readonly shopName: string,
    public readonly shopSlug: string | null,
    public readonly profilePictureUrl: string | null,
    public readonly averageRating: number | null,
    public readonly verificationStatus: string | null
  ) {}

  static fromDto(dto: ProductSellerDto): ProductSellerSummary {
    return new ProductSellerSummary(
      dto.id,
      dto.shop_name,
      dto.shop_slug ?? null,
      dto.profile_picture_url ?? null,
      dto.average_rating ?? null,
      dto.verification_status ?? null
    );
  }
}

export class PostTaggedProduct {
  private constructor(
    public readonly postId: string,
    public readonly productId: string,
    public readonly product: ProductSummary | null
  ) {}

  static fromDto(dto: PostTaggedProductDto): PostTaggedProduct {
    return new PostTaggedProduct(
      dto.post_id,
      dto.product_id,
      dto.product ? ProductSummary.fromDto(dto.product) : null
    );
  }
}

export class PostLike {
  private constructor(
    public readonly postId: string,
    public readonly userId: string,
    public readonly createdAt: string,
    public readonly user: PostUser | null
  ) {}

  static fromDto(dto: PostLikeDto): PostLike {
    return new PostLike(
      dto.post_id,
      dto.user_id,
      dto.created_at,
      PostUser.fromDto(dto.user)
    );
  }
}

export class ReactionSummary {
  private constructor(
    public readonly reactionType: string,
    public readonly emoji: string,
    public readonly count: number,
    public readonly hasReacted: boolean
  ) {}

  static fromDto(dto: ReactionSummaryDto): ReactionSummary {
    return new ReactionSummary(
      dto.reaction_type,
      dto.emoji,
      dto.count,
      dto.has_reacted
    );
  }
}

export class PostCommentReaction {
  private constructor(
    public readonly id: number,
    public readonly commentId: number,
    public readonly userId: string,
    public readonly reactionType: string,
    public readonly emoji: string,
    public readonly createdAt: string,
    public readonly user: PostUser | null
  ) {}

  static fromDto(dto: PostCommentReactionDto): PostCommentReaction {
    return new PostCommentReaction(
      dto.id,
      dto.comment_id,
      dto.user_id,
      dto.reaction_type,
      dto.emoji,
      dto.created_at,
      PostUser.fromDto(dto.user)
    );
  }
}

export class PostComment {
  private constructor(
    public readonly id: number,
    public readonly postId: string,
    public readonly userId: string,
    public readonly content: string,
    public readonly createdAt: string,
    public readonly updatedAt: string | null,
    public readonly parentId: number | null,
    public readonly author: PostUser | null,
    public readonly reactions: PostCommentReaction[],
    public readonly reactionSummary: ReactionSummary[],
    public readonly replies: PostComment[]
  ) {}

  static fromDto(dto: PostCommentDto): PostComment {
    const reactions = (dto.reactions ?? []).map(PostCommentReaction.fromDto);
    const reactionSummary = (dto.reaction_summary ?? []).map(
      ReactionSummary.fromDto
    );
    const replies = (dto.replies ?? []).map(PostComment.fromDto);

    return new PostComment(
      dto.id,
      dto.post_id,
      dto.user_id,
      dto.content,
      dto.created_at,
      dto.updated_at ?? null,
      dto.parent_id ?? null,
      PostUser.fromDto(dto.user),
      reactions,
      reactionSummary,
      replies
    );
  }

  hasReplies(): boolean {
    return this.replies.length > 0;
  }

  hasReactions(): boolean {
    return this.reactions.length > 0 || this.reactionSummary.length > 0;
  }

  get replyCount(): number {
    return this.replies.length;
  }
}

export class PostNicheContext {
  private constructor(
    public readonly nicheId: string,
    public readonly nicheName: string,
    public readonly nicheSlug: string,
    public readonly isPinned: boolean,
    public readonly isFeatured: boolean,
    public readonly isApproved: boolean,
    public readonly likes: number,
    public readonly comments: number,
    public readonly visibility: NicheVisibility
  ) {}

  static fromDto(dto: PostNicheContextDto): PostNicheContext {
    return new PostNicheContext(
      dto.niche_id,
      dto.niche_name,
      dto.niche_slug,
      dto.is_pinned,
      dto.is_featured,
      dto.is_approved,
      dto.niche_likes,
      dto.niche_comments,
      dto.niche_visibility
    );
  }
}

export class Post {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly caption: string | null,
    public readonly status: PostStatus,
    public readonly tags: string[],
    public readonly createdAt: string,
    public readonly updatedAt: string | null,
    public readonly likeCount: number,
    public readonly commentCount: number,
    public readonly author: PostUser | null,
    public readonly categories: PostCategory[],
    public readonly media: PostMedia[],
    public readonly taggedProducts: PostTaggedProduct[],
    public readonly likes: PostLike[],
    public readonly comments: PostComment[],
    public readonly nichePosts: NichePostSummary[],
    public readonly nicheContext: PostNicheContext | null,
    public readonly isLiked: boolean
  ) {}

  static fromDto(dto: PostDto): Post {
    const categories = (dto.categories ?? []).map(PostCategory.fromDto);
    const media = (dto.social_media ?? []).map(PostMedia.fromDto);
    const taggedProducts = (dto.tagged_products ?? []).map(
      PostTaggedProduct.fromDto
    );
    const likes = (dto.likes ?? []).map(PostLike.fromDto);
    const comments = (dto.comments ?? []).map(PostComment.fromDto);
    const nichePosts = (dto.niche_posts ?? []).map(NichePostSummary.fromDto);

    const isLiked =
      typeof (dto as { is_liked?: unknown }).is_liked === 'boolean'
        ? Boolean((dto as { is_liked?: boolean }).is_liked)
        : false;

    return new Post(
      dto.id,
      dto.user_id,
      dto.caption ?? null,
      dto.status,
      dto.tags ?? [],
      dto.created_at,
      dto.updated_at ?? null,
      dto.like_count ?? 0,
      dto.comment_count ?? 0,
      PostUser.fromDto(dto.user),
      categories,
      media,
      taggedProducts,
      likes,
      comments,
      nichePosts,
      dto.niche_context ? PostNicheContext.fromDto(dto.niche_context) : null,
      isLiked
    );
  }

  isDraft(): boolean {
    return this.status === 'draft';
  }

  isActive(): boolean {
    return this.status === 'active';
  }

  isArchived(): boolean {
    return this.status === 'archived';
  }

  hasMedia(): boolean {
    return this.media.length > 0;
  }

  hasProducts(): boolean {
    return this.taggedProducts.length > 0;
  }

  hasEngagement(): boolean {
    return this.likeCount > 0 || this.commentCount > 0;
  }

  get like_count(): number {
    return this.likeCount;
  }

  get comment_count(): number {
    return this.commentCount;
  }

  get created_at(): string {
    return this.createdAt;
  }

  get updated_at(): string | null {
    return this.updatedAt;
  }

  get is_liked(): boolean {
    return this.isLiked;
  }

  get user(): PostUser | null {
    return this.author;
  }

  get social_media(): PostMedia[] {
    return this.media;
  }

  get tagged_products(): PostTaggedProduct[] {
    return this.taggedProducts;
  }
}

export class Follow {
  private constructor(
    public readonly followerId: string,
    public readonly followeeId: string,
    public readonly type: FollowType,
    public readonly createdAt: string,
    public readonly follower: PostUser | null,
    public readonly followee: PostUser | null
  ) {}

  static fromDto(dto: FollowDto): Follow {
    return new Follow(
      dto.follower_id,
      dto.followee_id,
      dto.follow_type,
      dto.created_at,
      PostUser.fromDto(dto.follower),
      PostUser.fromDto(dto.followee)
    );
  }
}

export class Niche {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly slug: string,
    public readonly status: NicheStatus,
    public readonly visibility: NicheVisibility,
    public readonly allowBuyerPosts: boolean,
    public readonly allowSellerPosts: boolean,
    public readonly requireApproval: boolean,
    public readonly maxMembers: number | null,
    public readonly tags: string[],
    public readonly rules: string[],
    public readonly settings: Record<string, unknown> | null,
    public readonly memberCount: number,
    public readonly postCount: number,
    public readonly createdAt: string,
    public readonly updatedAt: string | null,
    public readonly categories: CategoryDto[]
  ) {}

  static fromDto(dto: NicheDto): Niche {
    const categories = (dto.categories ?? [])
      .map((attachment) => attachment.category)
      .filter((category): category is CategoryDto => Boolean(category));

    return new Niche(
      dto.id,
      dto.name,
      dto.description ?? null,
      dto.slug,
      dto.status,
      dto.visibility,
      dto.allow_buyer_posts,
      dto.allow_seller_posts,
      dto.require_approval,
      dto.max_members ?? null,
      dto.tags ?? [],
      dto.rules ?? [],
      dto.settings ?? null,
      dto.member_count,
      dto.post_count,
      dto.created_at,
      dto.updated_at ?? null,
      categories
    );
  }

  isPublic(): boolean {
    return this.visibility === 'public';
  }

  requiresApproval(): boolean {
    return this.requireApproval;
  }
}

export class NicheMembership {
  private constructor(
    public readonly id: number,
    public readonly nicheId: string,
    public readonly userId: string,
    public readonly role: NicheMembershipRole,
    public readonly joinedAt: string,
    public readonly invitedBy: string | null,
    public readonly isActive: boolean,
    public readonly isBanned: boolean,
    public readonly bannedUntil: string | null,
    public readonly banReason: string | null,
    public readonly lastActivity: string | null,
    public readonly postCount: number,
    public readonly commentCount: number,
    public readonly user: PostUser | null,
    public readonly inviter: PostUser | null,
    public readonly niche: Niche | null
  ) {}

  static fromDto(dto: NicheMembershipDto): NicheMembership {
    return new NicheMembership(
      dto.id,
      dto.niche_id,
      dto.user_id,
      dto.role,
      dto.joined_at,
      dto.invited_by ?? null,
      dto.is_active,
      dto.is_banned,
      dto.banned_until ?? null,
      dto.ban_reason ?? null,
      dto.last_activity ?? null,
      dto.post_count ?? 0,
      dto.comment_count ?? 0,
      PostUser.fromDto(dto.user),
      PostUser.fromDto(dto.inviter),
      dto.niche ? Niche.fromDto(dto.niche) : null
    );
  }

  isModerator(): boolean {
    return (
      this.role === 'moderator' ||
      this.role === 'admin' ||
      this.role === 'owner'
    );
  }
}

export class NichePostSummary {
  private constructor(
    public readonly id: number,
    public readonly nicheId: string,
    public readonly postId: string,
    public readonly status: PostStatus,
    public readonly isPinned: boolean,
    public readonly isFeatured: boolean,
    public readonly isApproved: boolean,
    public readonly moderatedBy: string | null,
    public readonly moderatedAt: string | null,
    public readonly likes: number,
    public readonly comments: number,
    public readonly createdAt: string,
    public readonly updatedAt: string | null,
    public readonly niche: Niche | null
  ) {}

  static fromDto(dto: NichePostDto): NichePostSummary {
    return new NichePostSummary(
      dto.id,
      dto.niche_id,
      dto.post_id,
      dto.status,
      dto.is_pinned,
      dto.is_featured,
      dto.is_approved,
      dto.moderated_by ?? null,
      dto.moderated_at ?? null,
      dto.niche_likes,
      dto.niche_comments,
      dto.created_at,
      dto.updated_at ?? null,
      dto.niche ? Niche.fromDto(dto.niche) : null
    );
  }

  isPendingApproval(): boolean {
    return this.isApproved === false;
  }
}

export class NicheModerationAction {
  private constructor(
    public readonly id: number,
    public readonly nicheId: string,
    public readonly moderatorId: string,
    public readonly targetUserId: string,
    public readonly actionType: string,
    public readonly reason: string,
    public readonly duration: number | null,
    public readonly targetType: string,
    public readonly targetId: string | null,
    public readonly isActive: boolean,
    public readonly expiresAt: string | null,
    public readonly createdAt: string,
    public readonly moderator: PostUser | null,
    public readonly targetUser: PostUser | null
  ) {}

  static fromDto(dto: NicheModerationActionDto): NicheModerationAction {
    return new NicheModerationAction(
      dto.id,
      dto.niche_id,
      dto.moderator_id,
      dto.target_user_id,
      dto.action_type,
      dto.reason,
      dto.duration ?? null,
      dto.target_type,
      dto.target_id ?? null,
      dto.is_active,
      dto.expires_at ?? null,
      dto.created_at,
      PostUser.fromDto(dto.moderator),
      PostUser.fromDto(dto.target_user)
    );
  }

  hasExpired(reference: Date = new Date()): boolean {
    if (!this.expiresAt) {
      return false;
    }
    return new Date(this.expiresAt).getTime() <= reference.getTime();
  }
}

export class Story {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly mediaUrl: string,
    public readonly mediaType: 'image' | 'video',
    public readonly duration: number | null,
    public readonly createdAt: string,
    public readonly expiresAt: string,
    public readonly author: PostUser | null,
    public readonly caption: string | null,
    public readonly isLiked: boolean
  ) {}

  static fromDto(dto: StoryDto): Story {
    return new Story(
      dto.id,
      dto.user_id,
      dto.media_url,
      dto.media_type,
      dto.duration ?? null,
      dto.created_at,
      dto.expires_at,
      PostUser.fromDto(dto.user),
      (dto as { caption?: string | null }).caption ?? null,
      Boolean((dto as { is_liked?: boolean }).is_liked ?? false)
    );
  }

  isExpired(reference: Date = new Date()): boolean {
    return new Date(this.expiresAt).getTime() <= reference.getTime();
  }

  get media_url(): string {
    return this.mediaUrl;
  }

  get media_type(): 'image' | 'video' {
    return this.mediaType;
  }

  get created_at(): string {
    return this.createdAt;
  }

  get expires_at(): string {
    return this.expiresAt;
  }

  get user(): PostUser | null {
    return this.author;
  }

  get liked(): boolean {
    return this.isLiked;
  }

  get user_id(): string {
    return this.userId;
  }
}

export class Collection {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly isPublic: boolean,
    public readonly isCollaborative: boolean,
    public readonly createdAt: string,
    public readonly updatedAt: string,
    public readonly owner: PostUser | null
  ) {}

  static fromDto(dto: CollectionDto): Collection {
    return new Collection(
      dto.id,
      dto.user_id,
      dto.name,
      dto.description ?? null,
      dto.is_public,
      dto.is_collaborative,
      dto.created_at,
      dto.updated_at,
      PostUser.fromDto(dto.user)
    );
  }

  rename(name: string, description: string | null): Collection {
    return new Collection(
      this.id,
      this.userId,
      name,
      description,
      this.isPublic,
      this.isCollaborative,
      this.createdAt,
      this.updatedAt,
      this.owner
    );
  }

  get is_public(): boolean {
    return this.isPublic;
  }

  get is_collaborative(): boolean {
    return this.isCollaborative;
  }

  get user(): PostUser | null {
    return this.owner;
  }
}

export class FeedItem {
  private constructor(
    public readonly type: FeedItemTypeDto,
    public readonly data: Record<string, unknown>,
    public readonly score: number | null,
    public readonly createdAt: string | null
  ) {}

  static fromDto(dto: FeedItemDto): FeedItem {
    return new FeedItem(
      dto.type,
      dto.data ?? {},
      dto.score ?? null,
      dto.created_at ?? null
    );
  }

  isPost(): boolean {
    return this.type.startsWith('post');
  }

  isProduct(): boolean {
    return this.type.startsWith('product');
  }

  asPost(): Post | null {
    if (!this.isPost()) {
      return null;
    }

    if (!isPostDto(this.data)) {
      return null;
    }

    return Post.fromDto(this.data);
  }
}

const isPostDto = (value: unknown): value is PostDto => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const record = value as Record<string, unknown>;
  return (
    typeof record['id'] === 'string' &&
    typeof record['user_id'] === 'string' &&
    typeof record['status'] === 'string' &&
    typeof record['created_at'] === 'string'
  );
};
