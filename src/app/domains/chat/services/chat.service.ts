/**
 * Chat Domain Service
 *
 * Coordinates chat-specific business logic on top of the repository layer.
 * Uses immutable domain models and internal subjects for simple state caching.
 */

import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ChatRepository } from '../repositories/chat.repository';
import {
  ChatDiscount,
  ChatDiscountResponse,
  ChatMessage,
  ChatMessageType,
  ChatMessagesResult,
  ChatRoom,
  ChatRoomSummary,
  ChatRoomsResult,
  DiscountApplicationResult,
  DiscountCancellationResult
} from '../models/chat.model';
import {
  CreateChatDiscountDto,
  CreateChatRoomDto,
  DiscountResponseRequestDto,
  SendMessageDto,
  SendOfferDto
} from '../models/chat.dto';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private readonly chatRepository = inject(ChatRepository);

  private readonly roomsSubject = new BehaviorSubject<ChatRoomSummary[]>([]);
  readonly rooms$ = this.roomsSubject.asObservable();

  private readonly roomsPaginationSubject = new BehaviorSubject<ChatRoomsResult['pagination'] | null>(null);
  readonly roomsPagination$ = this.roomsPaginationSubject.asObservable();

  private readonly messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  readonly messages$ = this.messagesSubject.asObservable();

  private readonly messagesPaginationSubject = new BehaviorSubject<ChatMessagesResult['pagination'] | null>(null);
  readonly messagesPagination$ = this.messagesPaginationSubject.asObservable();

  private readonly unreadCountSubject = new BehaviorSubject<number>(0);
  readonly unreadCount$ = this.unreadCountSubject.asObservable();

  readonly typing$ = new BehaviorSubject<{ roomId: number | null; isTyping: boolean }>({
    roomId: null,
    isTyping: false
  });
  readonly newMessage$ = new Subject<ChatMessage>();

  private selectedRoomId: number | null = null;

  loadRooms(page = 1, perPage = 20): Observable<ChatRoomSummary[]> {
    return this.chatRepository.getRooms(page, perPage).pipe(
      tap(result => this.persistRooms(result)),
      map(result => result.rooms)
    );
  }

  getRoomsSnapshot(): ChatRoomSummary[] {
    return this.roomsSubject.value;
  }

  createRoom(payload: CreateChatRoomDto): Observable<ChatRoom> {
    if (!payload.buyer_id && !payload.seller_id) {
      throw new Error('Either buyer_id or seller_id must be provided to create a chat room');
    }

    return this.chatRepository.createRoom(payload).pipe(
      tap(room => {
        this.selectedRoomId = room.id;
        void this.loadRooms().subscribe();
      })
    );
  }

  getMessages(roomId: number | string, page = 1, perPage = 50): Observable<ChatMessage[]> {
    const resolvedRoomId = this.ensureRoomId(roomId);
    this.selectedRoomId = resolvedRoomId;

    return this.chatRepository.getMessages(resolvedRoomId, page, perPage).pipe(
      tap(result => {
        this.messagesSubject.next(result.messages);
        this.messagesPaginationSubject.next(result.pagination);
      }),
      map(result => result.messages)
    );
  }

  sendMessage(
    roomId: number | string,
    content: string,
    messageType: ChatMessageType = 'text',
    messageData?: Record<string, unknown>
  ): Observable<ChatMessage> {
    if (!content?.trim()) {
      throw new Error('Message content is required');
    }

    const resolvedRoomId = this.ensureRoomId(roomId);
    const payload: SendMessageDto = {
      content: content.trim(),
      message_type: messageType,
      message_data: messageData ?? null
    };

    return this.chatRepository.sendMessage(resolvedRoomId, payload).pipe(
      tap(message => {
        if (this.selectedRoomId === resolvedRoomId) {
          this.messagesSubject.next([...this.messagesSubject.value, message]);
        }
        this.newMessage$.next(message);
        void this.loadRooms().subscribe();
      })
    );
  }

  markMessagesAsRead(roomId: number | string): Observable<string> {
    const resolvedRoomId = this.ensureRoomId(roomId);
    return this.chatRepository.markMessagesAsRead(resolvedRoomId).pipe(
      tap(() => {
        const updatedRooms = this.roomsSubject.value.map(room =>
          room.id === resolvedRoomId
            ? new ChatRoomSummary(
                room.id,
                room.otherUser,
                0,
                room.lastMessageAt,
                room.lastMessage,
                room.product,
                room.request
              )
            : room
        );
        this.roomsSubject.next(updatedRooms);
        this.recalculateUnread();
      })
    );
  }

  getUnreadCount$(): Observable<number> {
    return this.unreadCount$;
  }

  sendOffer(roomId: number | string, payload: SendOfferDto): Observable<ChatMessage> {
    const resolvedRoomId = this.ensureRoomId(roomId);
    return this.chatRepository.sendOffer(resolvedRoomId, payload).pipe(
      tap(message => {
        if (this.selectedRoomId === resolvedRoomId) {
          this.messagesSubject.next([...this.messagesSubject.value, message]);
        }
        void this.loadRooms().subscribe();
      })
    );
  }

  getMessageReactions(messageId: number | string) {
    return this.chatRepository.getMessageReactions(this.ensureNumericId(messageId));
  }

  addMessageReaction(messageId: number | string, reactionType: string) {
    return this.chatRepository.addMessageReaction(this.ensureNumericId(messageId), {
      reaction_type: reactionType
    });
  }

  removeMessageReaction(messageId: number | string, reactionType: string) {
    return this.chatRepository.removeMessageReaction(this.ensureNumericId(messageId), reactionType);
  }

  getRoomDiscounts(roomId: number | string): Observable<ChatDiscount[]> {
    return this.chatRepository.getRoomDiscounts(this.ensureRoomId(roomId));
  }

  createDiscountOffer(roomId: number | string, payload: CreateChatDiscountDto): Observable<ChatDiscount> {
    return this.chatRepository.createDiscount(this.ensureRoomId(roomId), payload);
  }

  respondToDiscount(discountId: number | string, payload: DiscountResponseRequestDto): Observable<ChatDiscountResponse> {
    return this.chatRepository.respondToDiscount(this.ensureNumericId(discountId), payload);
  }

  applyDiscount(discountId: number | string, orderAmount: number): Observable<DiscountApplicationResult> {
    return this.chatRepository.applyDiscount(this.ensureNumericId(discountId), { order_amount: orderAmount });
  }

  cancelDiscount(discountId: number | string): Observable<DiscountCancellationResult> {
    return this.chatRepository.cancelDiscount(this.ensureNumericId(discountId));
  }

  getMyActiveDiscounts(): Observable<ChatDiscount[]> {
    return this.chatRepository.getMyActiveDiscounts();
  }

  getOrCreateRoom(
    buyerId: string,
    sellerId: string,
    productId?: string,
    requestId?: string
  ): Observable<ChatRoom> {
    const payload: CreateChatRoomDto = {
      buyer_id: buyerId,
      seller_id: sellerId,
      product_id: productId,
      request_id: requestId
    };
    return this.createRoom(payload);
  }

  deleteRoom(roomId: number | string): Observable<void> {
    const resolvedRoomId = this.ensureRoomId(roomId);
    return this.chatRepository.deleteRoom(resolvedRoomId).pipe(
      tap(() => {
        const remainingRooms = this.roomsSubject.value.filter(
          room => room.id !== resolvedRoomId
        );
        this.roomsSubject.next(remainingRooms);
        this.recalculateUnread();
      })
    );
  }

  selectRoom(roomId: number | string): void {
    this.selectedRoomId = this.ensureRoomId(roomId);
  }

  startTyping(roomId: number | string): void {
    this.typing$.next({ roomId: this.ensureRoomId(roomId), isTyping: true });
  }

  stopTyping(roomId: number | string): void {
    this.typing$.next({ roomId: this.ensureRoomId(roomId), isTyping: false });
  }

  private persistRooms(result: ChatRoomsResult): void {
    this.roomsSubject.next(result.rooms);
    this.roomsPaginationSubject.next(result.pagination);
    this.recalculateUnread();
  }

  private recalculateUnread(): void {
    const totalUnread = this.roomsSubject.value.reduce((total, room) => total + room.unreadCount, 0);
    this.unreadCountSubject.next(totalUnread);
  }

  private ensureRoomId(roomId: number | string): number {
    return this.ensureNumericId(roomId, 'Invalid chat room identifier');
  }

  private ensureNumericId(value: number | string, message = 'Invalid identifier'): number {
    if (typeof value === 'number') {
      return value;
    }
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      throw new Error(message);
    }
    return parsed;
  }
}

