import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiClientService } from '../../../core/infrastructure/http/api-client.service';
import {
  ChatDiscountDto,
  ChatMessageDto,
  ChatMessageListDto,
  ChatMessageReactionCreateDto,
  ChatMessageReactionSummaryDto,
  ChatRoomDto,
  ChatRoomListDto,
  CreateChatDiscountDto,
  CreateChatRoomDto,
  DiscountApplicationRequestDto,
  DiscountApplicationResponseDto,
  DiscountResponseDto,
  DiscountResponseRequestDto,
  DiscountCancellationDto,
  MarkReadResponseDto,
  RoomDiscountsDto,
  SendMessageDto,
  SendOfferDto,
} from '../models/chat.dto';
import {
  ChatDiscount,
  ChatMessage,
  ChatMessageType,
  ChatMessageOffer,
  ChatMessagesResult,
  ChatPagination,
  ChatParticipant,
  ChatProductSummary,
  ChatRequestSummary,
  ChatRoom,
  ChatRoomSummary,
  ChatRoomsResult,
  ChatDiscountResponse,
  DiscountApplicationResult,
  DiscountCancellationResult,
  LastMessagePreview,
} from '../models/chat.model';

@Injectable({
  providedIn: 'root',
})
export class ChatRepository {
  private readonly apiClient = inject(ApiClientService);
  private readonly baseEndpoint = '/chats';

  private toParticipant(dto: {
    id: string;
    username: string;
    profile_picture?: string | null;
    is_seller: boolean;
  }): ChatParticipant {
    return new ChatParticipant(
      dto.id,
      dto.username,
      dto.is_seller,
      dto.profile_picture ?? null
    );
  }

  private toProduct(
    dto?: {
      id: string;
      name: string;
      price: number;
      image?: string | null;
    } | null
  ): ChatProductSummary | null {
    if (!dto) {
      return null;
    }
    return new ChatProductSummary(
      dto.id,
      dto.name,
      dto.price,
      dto.image ?? null
    );
  }

  private toRequest(
    dto?: { id: string; title: string; description?: string | null } | null
  ): ChatRequestSummary | null {
    if (!dto) {
      return null;
    }
    return new ChatRequestSummary(dto.id, dto.title, dto.description ?? null);
  }

  private toOffer(
    dto?: {
      id: number;
      product_id: string;
      price: number;
      status: string;
    } | null
  ): ChatMessageOffer | null {
    if (!dto) {
      return null;
    }
    return new ChatMessageOffer(dto.id, dto.product_id, dto.price, dto.status);
  }

  private toMessage(dto: ChatMessageDto): ChatMessage {
    return new ChatMessage(
      dto.id,
      dto.room_id,
      dto.sender_id,
      this.toParticipant(dto.sender),
      dto.content,
      dto.message_type,
      dto.created_at,
      dto.is_read,
      dto.message_data ?? null,
      dto.read_at ?? null,
      this.toOffer(dto.offer ?? null)
    );
  }

  private toRoom(dto: ChatRoomDto): ChatRoom {
    return new ChatRoom(
      dto.id,
      dto.buyer_id,
      dto.seller_id,
      dto.product_id ?? null,
      dto.request_id ?? null,
      dto.last_message_at ?? null,
      dto.unread_count_buyer,
      dto.unread_count_seller
    );
  }

  private toLastMessage(
    dto:
      | {
          id: number;
          sender_id: string;
          content: string;
          message_type: string;
          created_at: string;
        }
      | null
      | undefined
  ): LastMessagePreview | null {
    if (!dto) {
      return null;
    }
    return new LastMessagePreview(
      dto.id,
      dto.sender_id,
      dto.content,
      dto.message_type as ChatMessageType,
      dto.created_at
    );
  }

  private toPagination(dto: {
    page: number;
    per_page: number;
    total: number;
  }): ChatPagination {
    return {
      page: dto.page,
      perPage: dto.per_page,
      total: dto.total,
    };
  }

  private toRoomSummary(
    dto: ChatRoomListDto['rooms'][number]
  ): ChatRoomSummary {
    return new ChatRoomSummary(
      dto.id,
      this.toParticipant(dto.other_user),
      dto.unread_count,
      dto.last_message_at ?? null,
      this.toLastMessage(dto.last_message ?? null),
      this.toProduct(dto.product ?? null),
      this.toRequest(dto.request ?? null)
    );
  }

  private toRoomsResult(dto: ChatRoomListDto): ChatRoomsResult {
    return {
      rooms: dto.rooms.map((room) => this.toRoomSummary(room)),
      pagination: this.toPagination(dto.pagination),
    };
  }

  private toMessagesResult(dto: ChatMessageListDto): ChatMessagesResult {
    return {
      messages: dto.messages.map((message) => this.toMessage(message)),
      pagination: this.toPagination(dto.pagination),
    };
  }

  private toDiscount(dto: ChatDiscountDto): ChatDiscount {
    return new ChatDiscount(
      dto.id,
      dto.room_id,
      dto.discount_type,
      dto.discount_value,
      dto.expires_at,
      dto.usage_limit,
      dto.usage_count,
      dto.status,
      dto.minimum_order_amount ?? null,
      dto.maximum_discount_amount ?? null,
      dto.discount_message ?? null,
      dto.discount_code ?? null,
      this.toProduct(dto.product ?? null)
    );
  }

  getRooms(page = 1, perPage = 20): Observable<ChatRoomsResult> {
    return this.apiClient
      .get<ChatRoomListDto>(`${this.baseEndpoint}/rooms`, {
        page,
        per_page: perPage,
      })
      .pipe(map((response) => this.toRoomsResult(response.data)));
  }

  createRoom(payload: CreateChatRoomDto): Observable<ChatRoom> {
    return this.apiClient
      .post<ChatRoomDto>(`${this.baseEndpoint}/rooms`, payload)
      .pipe(map((response) => this.toRoom(response.data)));
  }

  getMessages(
    roomId: number,
    page = 1,
    perPage = 50
  ): Observable<ChatMessagesResult> {
    return this.apiClient
      .get<ChatMessageListDto>(
        `${this.baseEndpoint}/rooms/${roomId}/messages`,
        { page, per_page: perPage }
      )
      .pipe(map((response) => this.toMessagesResult(response.data)));
  }

  sendMessage(roomId: number, dto: SendMessageDto): Observable<ChatMessage> {
    const payload: SendMessageDto = {
      message_type: dto.message_type ?? 'text',
      content: dto.content,
      message_data: dto.message_data ?? null,
    };

    return this.apiClient
      .post<ChatMessageDto>(
        `${this.baseEndpoint}/rooms/${roomId}/messages`,
        payload
      )
      .pipe(map((response) => this.toMessage(response.data)));
  }

  markMessagesAsRead(roomId: number): Observable<string> {
    return this.apiClient
      .post<MarkReadResponseDto>(`${this.baseEndpoint}/rooms/${roomId}/read`)
      .pipe(map((response) => response.data.message));
  }

  sendOffer(roomId: number, dto: SendOfferDto): Observable<ChatMessage> {
    return this.apiClient
      .post<ChatMessageDto>(`${this.baseEndpoint}/rooms/${roomId}/offers`, dto)
      .pipe(map((response) => this.toMessage(response.data)));
  }

  getMessageReactions(
    messageId: number
  ): Observable<ChatMessageReactionSummaryDto[]> {
    return this.apiClient
      .get<ChatMessageReactionSummaryDto[]>(
        `${this.baseEndpoint}/messages/${messageId}/reactions`
      )
      .pipe(map((response) => response.data));
  }

  addMessageReaction(
    messageId: number,
    payload: ChatMessageReactionCreateDto
  ): Observable<ChatMessageReactionSummaryDto[]> {
    return this.apiClient
      .post<ChatMessageReactionSummaryDto[]>(
        `${this.baseEndpoint}/messages/${messageId}/reactions`,
        payload
      )
      .pipe(map((response) => response.data));
  }

  removeMessageReaction(
    messageId: number,
    reactionType: string
  ): Observable<void> {
    return this.apiClient
      .delete<void>(
        `${this.baseEndpoint}/messages/${messageId}/reactions/${reactionType}`
      )
      .pipe(map(() => undefined));
  }

  getRoomDiscounts(roomId: number): Observable<ChatDiscount[]> {
    return this.apiClient
      .get<RoomDiscountsDto>(`${this.baseEndpoint}/rooms/${roomId}/discounts`)
      .pipe(
        map((response) =>
          (response.data.discounts ?? []).map((discount) =>
            this.toDiscount(discount)
          )
        )
      );
  }

  createDiscount(
    roomId: number,
    payload: CreateChatDiscountDto
  ): Observable<ChatDiscount> {
    return this.apiClient
      .post<ChatDiscountDto>(
        `${this.baseEndpoint}/rooms/${roomId}/discounts`,
        payload
      )
      .pipe(map((response) => this.toDiscount(response.data)));
  }

  private toDiscountResponse(dto: DiscountResponseDto): ChatDiscountResponse {
    return {
      discountId: dto.discount_id,
      response: dto.response,
      responseMessage: dto.response_message ?? null,
      messageId: dto.message_id,
      updatedAt: dto.updated_at,
      discount: {
        id: dto.discount.id,
        status: dto.discount.status as ChatDiscount['status'],
        discountType: dto.discount
          .discount_type as ChatDiscount['discountType'],
        discountValue: dto.discount.discount_value,
        expiresAt: dto.discount.expires_at,
      },
    };
  }

  private toDiscountCancellation(
    dto: DiscountCancellationDto
  ): DiscountCancellationResult {
    return {
      discountId: dto.discount_id,
      status: dto.status as ChatDiscount['status'],
      cancelledAt: dto.cancelled_at,
    };
  }

  respondToDiscount(
    discountId: number,
    payload: DiscountResponseRequestDto
  ): Observable<ChatDiscountResponse> {
    return this.apiClient
      .post<DiscountResponseDto>(
        `${this.baseEndpoint}/discounts/${discountId}/respond`,
        payload
      )
      .pipe(map((response) => this.toDiscountResponse(response.data)));
  }

  applyDiscount(
    discountId: number,
    payload: DiscountApplicationRequestDto
  ): Observable<DiscountApplicationResult> {
    return this.apiClient
      .post<DiscountApplicationResponseDto>(
        `${this.baseEndpoint}/discounts/${discountId}/apply`,
        payload
      )
      .pipe(
        map((response) => ({
          success: response.data.success,
          discountAmount: response.data.discount_amount,
          finalAmount: response.data.final_amount,
          message: response.data.message,
        }))
      );
  }

  cancelDiscount(discountId: number): Observable<DiscountCancellationResult> {
    return this.apiClient
      .post<DiscountCancellationDto>(
        `${this.baseEndpoint}/discounts/${discountId}/cancel`
      )
      .pipe(map((response) => this.toDiscountCancellation(response.data)));
  }

  getMyActiveDiscounts(): Observable<ChatDiscount[]> {
    return this.apiClient
      .get<RoomDiscountsDto>(`${this.baseEndpoint}/discounts/my-active`)
      .pipe(
        map((response) =>
          (response.data.discounts ?? []).map((discount) =>
            this.toDiscount(discount)
          )
        )
      );
  }

  deleteRoom(roomId: number): Observable<void> {
    return this.apiClient
      .delete<void>(`${this.baseEndpoint}/rooms/${roomId}`)
      .pipe(map(() => undefined));
  }
}
