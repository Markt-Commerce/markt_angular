/**
 * Social DTOs
 */

import type { Pagination } from '../../../core/models';
import type { CategoryDto } from '../../categories/models/category.dto';
import type { ProductDto } from '../../marketplace/models/product.dto';
import type {
  MediaDto,
  SocialMediaPostDto,
} from '../../media/models/media.dto';

export const FOLLOW_TYPES = ['customer', 'peer'] as const;
export type FollowTypeDto = (typeof FOLLOW_TYPES)[number];

export const POST_STATUS = ['draft', 'active', 'archived', 'deleted'] as const;
export type PostStatusDto = (typeof POST_STATUS)[number];

export const POST_STATUS_ACTIONS = [
  'publish',
  'archive',
  'unarchive',
  'delete',
] as const;
export type PostStatusActionDto = (typeof POST_STATUS_ACTIONS)[number];

export const NICHE_STATUS = [
  'active',
  'inactive',
  'moderated',
  'archived',
] as const;
export type NicheStatusDto = (typeof NICHE_STATUS)[number];

export const NICHE_VISIBILITY = ['public', 'private', 'restricted'] as const;
export type NicheVisibilityDto = (typeof NICHE_VISIBILITY)[number];

export const NICHE_MEMBERSHIP_ROLES = [
  'member',
  'moderator',
  'admin',
  'owner',
] as const;
export type NicheMembershipRoleDto = (typeof NICHE_MEMBERSHIP_ROLES)[number];

export interface PostUserSummaryDto {
  readonly id: string;
  readonly username: string;
  readonly first_name?: string | null;
  readonly last_name?: string | null;
  readonly profile_picture_url?: string | null;
  readonly email_verified?: boolean | null;
  readonly is_buyer?: boolean | null;
  readonly is_seller?: boolean | null;
  readonly shop_name?: string | null;
  readonly shop_slug?: string | null;
}

export interface FollowDto {
  readonly follower_id: string;
  readonly followee_id: string;
  readonly follow_type: FollowTypeDto;
  readonly created_at: string;
  readonly follower?: PostUserSummaryDto | null;
  readonly followee?: PostUserSummaryDto | null;
}

export interface FollowSearchParamsDto {
  readonly page?: number;
  readonly per_page?: number;
  readonly user_id?: string;
  readonly type?: FollowTypeDto | null;
}

export interface FollowListDto {
  readonly items: FollowDto[];
  readonly pagination: Pagination;
}

export interface PostNicheContextDto {
  readonly niche_id: string;
  readonly niche_name: string;
  readonly niche_slug: string;
  readonly is_pinned: boolean;
  readonly is_featured: boolean;
  readonly is_approved: boolean;
  readonly niche_likes: number;
  readonly niche_comments: number;
  readonly niche_visibility: NicheVisibilityDto;
}

export interface PostLikeDto {
  readonly user_id: string;
  readonly post_id: string;
  readonly created_at: string;
  readonly user?: PostUserSummaryDto | null;
}

export interface PostTaggedProductDto {
  readonly post_id: string;
  readonly product_id: string;
  readonly product?: ProductDto | null;
}

export interface PostCategoryAttachmentDto {
  readonly category_id: number | string;
  readonly sort_order?: number | null;
  readonly category?: CategoryDto | null;
}

export interface ReactionSummaryDto {
  readonly reaction_type: string;
  readonly emoji: string;
  readonly count: number;
  readonly has_reacted: boolean;
}

export interface PostCommentReactionDto {
  readonly id: number;
  readonly comment_id: number;
  readonly user_id: string;
  readonly reaction_type: string;
  readonly emoji: string;
  readonly created_at: string;
  readonly user?: PostUserSummaryDto | null;
}

export interface PostCommentDto {
  readonly id: number;
  readonly post_id: string;
  readonly user_id: string;
  readonly content: string;
  readonly parent_id?: number | null;
  readonly created_at: string;
  readonly updated_at?: string | null;
  readonly user?: PostUserSummaryDto | null;
  readonly replies?: PostCommentDto[];
  readonly reactions?: PostCommentReactionDto[];
  readonly reaction_summary?: ReactionSummaryDto[];
}

export interface PostCommentCreateDto {
  readonly content: string;
  readonly parent_id?: number | null;
}

export interface PostCommentUpdateDto {
  readonly content: string;
}

export interface PostDto {
  readonly id: string;
  readonly user_id: string;
  readonly caption: string | null;
  readonly status: PostStatusDto;
  readonly tags?: string[] | null;
  readonly created_at: string;
  readonly updated_at?: string | null;
  readonly like_count: number;
  readonly comment_count: number;
  readonly niche_context?: PostNicheContextDto | null;
  readonly user?: PostUserSummaryDto | null;
  readonly categories?: PostCategoryAttachmentDto[];
  readonly social_media?: SocialMediaPostDto[];
  readonly tagged_products?: PostTaggedProductDto[];
  readonly likes?: PostLikeDto[];
  readonly comments?: PostCommentDto[];
  readonly niche_posts?: NichePostDto[];
}

export interface PostSummaryDto {
  readonly id: string;
  readonly caption: string | null;
  readonly status: PostStatusDto;
  readonly like_count: number;
  readonly comment_count: number;
  readonly created_at: string;
  readonly user?: PostUserSummaryDto | null;
}

export interface PostDetailDto extends PostDto {
  readonly products?: ProductDto[];
}

export interface PostDetailSearchResultDto {
  readonly items: PostDetailDto[];
  readonly pagination: Pagination;
}

export interface PostCreateDto {
  readonly caption?: string | null;
  readonly category_ids?: Array<number | string>;
  readonly media_ids?: number[];
  readonly products?: Array<{ product_id: string }>;
  readonly tags?: string[];
  readonly status?: Extract<PostStatusDto, 'draft' | 'active'>;
}

export interface PostUpdateDto {
  readonly caption?: string | null;
  readonly category_ids?: Array<number | string>;
  readonly media_ids?: number[];
  readonly products?: Array<{ product_id: string }>;
  readonly tags?: string[];
  readonly status?: PostStatusDto;
}

export interface PostStatusUpdateDto {
  readonly action: PostStatusActionDto;
}

export interface PostCommentsResponseDto {
  readonly items: PostCommentDto[];
  readonly pagination: Pagination;
}

export interface PostSearchParamsDto {
  readonly page?: number;
  readonly per_page?: number;
  readonly status?: PostStatusDto | PostStatusDto[];
  readonly user_id?: string;
  readonly niche_id?: string;
  readonly tags?: string[];
  readonly search?: string | null;
  readonly sort_by?: string | null;
  readonly sort_order?: 'asc' | 'desc' | null;
}

export interface PostFeedParamsDto {
  readonly page?: number;
  readonly per_page?: number;
  readonly niche_id?: string;
  readonly after?: string | null;
  readonly before?: string | null;
}

export interface PostCommentSearchParamsDto {
  readonly page?: number;
  readonly per_page?: number;
  readonly parent_id?: number | null;
}

export interface FeedPostPayloadDto {
  readonly id: string;
  readonly caption: string | null;
  readonly created_at: string;
  readonly likes_count: number;
  readonly comments_count: number;
  readonly niche?: PostNicheContextDto | null;
  readonly user?: PostUserSummaryDto | null;
  readonly media?: SocialMediaPostDto[];
}

export interface FeedProductPayloadDto {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly price: number;
  readonly images?: MediaDto[];
  readonly seller?: ProductDto['seller'];
}

export type FeedItemTypeDto = 'post' | 'product' | 'niche_post' | string;

export interface FeedItemDto {
  readonly type: FeedItemTypeDto;
  readonly data: Record<string, unknown>;
  readonly score?: number;
  readonly created_at?: string;
}

export interface FeedResponseDto {
  readonly items: FeedItemDto[];
  readonly pagination: Pagination;
}

export interface StoryDto {
  readonly id: string;
  readonly user_id: string;
  readonly media_url: string;
  readonly media_type: 'image' | 'video';
  readonly duration?: number | null;
  readonly created_at: string;
  readonly expires_at: string;
  readonly user?: PostUserSummaryDto | null;
}

export interface StoryCreateDto {
  readonly media_url: string;
  readonly media_type: 'image' | 'video';
  readonly duration?: number | null;
  readonly caption?: string | null;
}

export interface CollectionDto {
  readonly id: string;
  readonly user_id: string;
  readonly name: string;
  readonly description?: string | null;
  readonly is_public: boolean;
  readonly is_collaborative: boolean;
  readonly created_at: string;
  readonly updated_at: string;
  readonly user?: PostUserSummaryDto | null;
}

export interface CollectionCreateDto {
  readonly name: string;
  readonly description?: string | null;
  readonly is_public?: boolean;
  readonly is_collaborative?: boolean;
}

export interface CollectionUpdateDto {
  readonly name?: string;
  readonly description?: string | null;
  readonly is_public?: boolean;
  readonly is_collaborative?: boolean;
}

export interface NicheCategoryDto {
  readonly id: number | string;
  readonly category?: CategoryDto | null;
}

export interface NicheDto {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly slug: string;
  readonly status: NicheStatusDto;
  readonly visibility: NicheVisibilityDto;
  readonly allow_buyer_posts: boolean;
  readonly allow_seller_posts: boolean;
  readonly require_approval: boolean;
  readonly max_members: number | null;
  readonly tags?: string[] | null;
  readonly rules?: string[] | null;
  readonly settings?: Record<string, unknown> | null;
  readonly member_count: number;
  readonly post_count: number;
  readonly created_at: string;
  readonly updated_at?: string | null;
  readonly categories?: NicheCategoryDto[];
}

export interface NicheCreateDto {
  readonly name: string;
  readonly description?: string | null;
  readonly category_ids: Array<number | string>;
  readonly tags?: string[] | null;
  readonly visibility: NicheVisibilityDto;
  readonly allow_buyer_posts?: boolean;
  readonly allow_seller_posts?: boolean;
  readonly require_approval?: boolean;
  readonly max_members?: number | null;
  readonly rules?: string[] | null;
  readonly settings?: Record<string, unknown> | null;
}

export interface NicheUpdateDto {
  readonly name?: string;
  readonly description?: string | null;
  readonly category_ids?: Array<number | string>;
  readonly tags?: string[] | null;
  readonly visibility?: NicheVisibilityDto | null;
  readonly allow_buyer_posts?: boolean;
  readonly allow_seller_posts?: boolean;
  readonly require_approval?: boolean;
  readonly max_members?: number | null;
  readonly rules?: string[] | null;
  readonly settings?: Record<string, unknown> | null;
}

export interface NicheSearchParamsDto {
  readonly search?: string | null;
  readonly category_ids?: Array<number | string>;
  readonly visibility?: NicheVisibilityDto | null;
  readonly page?: number;
  readonly per_page?: number;
}

export interface NicheSearchResultDto {
  readonly items: NicheDto[];
  readonly pagination: Pagination;
}

export interface NicheMembershipDto {
  readonly id: number;
  readonly niche_id: string;
  readonly user_id: string;
  readonly role: NicheMembershipRoleDto;
  readonly joined_at: string;
  readonly invited_by?: string | null;
  readonly is_active: boolean;
  readonly is_banned: boolean;
  readonly banned_until?: string | null;
  readonly ban_reason?: string | null;
  readonly last_activity?: string | null;
  readonly post_count?: number;
  readonly comment_count?: number;
  readonly user?: PostUserSummaryDto | null;
  readonly inviter?: PostUserSummaryDto | null;
  readonly niche?: NicheDto | null;
}

export interface NicheMembershipSearchResultDto {
  readonly items: NicheMembershipDto[];
  readonly pagination: Pagination;
}

export interface NicheModerationActionDto {
  readonly id: number;
  readonly niche_id: string;
  readonly moderator_id: string;
  readonly target_user_id: string;
  readonly action_type: string;
  readonly reason: string;
  readonly duration?: number | null;
  readonly target_type: string;
  readonly target_id?: string | null;
  readonly is_active: boolean;
  readonly expires_at?: string | null;
  readonly created_at: string;
  readonly moderator?: PostUserSummaryDto | null;
  readonly target_user?: PostUserSummaryDto | null;
}

export interface ModerationActionCreateDto {
  readonly target_user_id: string;
  readonly action_type: string;
  readonly reason: string;
  readonly duration?: number | null;
  readonly target_type?: string;
  readonly target_id?: string | null;
  readonly banned_until?: string | null;
}

export interface NichePostDto {
  readonly id: number;
  readonly niche_id: string;
  readonly post_id: string;
  readonly status: PostStatusDto;
  readonly is_pinned: boolean;
  readonly is_featured: boolean;
  readonly is_approved: boolean;
  readonly moderated_by?: string | null;
  readonly moderated_at?: string | null;
  readonly niche_likes: number;
  readonly niche_comments: number;
  readonly created_at: string;
  readonly updated_at?: string | null;
  readonly niche?: NicheDto | null;
}

export interface NichePostCreateDto {
  readonly caption?: string | null;
  readonly social_media?: SocialMediaPostDto[];
  readonly products?: Array<{ product_id: string }>;
  readonly status?: Extract<PostStatusDto, 'draft' | 'active'>;
}

export interface NichePostResponseDto {
  readonly post: PostDetailDto;
  readonly niche_post: NichePostDto;
  readonly requires_approval: boolean;
  readonly is_approved: boolean;
}

export interface NichePostListDto {
  readonly items: NichePostDto[];
  readonly pagination: Pagination;
}

export interface NichePostApprovalDto {
  readonly action: 'approve' | 'reject';
  readonly reason?: string;
}

export interface ReactionCreateDto {
  readonly reaction_type: string;
}

export interface ReactionSummaryListDto {
  readonly reaction_type: string;
  readonly emoji: string;
  readonly count: number;
  readonly has_reacted: boolean;
}

export interface CommentReactionListDto {
  readonly items: PostCommentReactionDto[];
}
