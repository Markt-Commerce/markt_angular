/**
 * Chat Repository
 */

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiClientService } from '../../../core/infrastructure/http/api-client.service';
import { ChatMessage, ChatRoom } from '../models/chat.model';
import { ChatMessageDto, SendMessageDto, ChatRoomDto, CreateChatRoomDto, ReactionSummaryDto, AddReactionDto } from '../models/chat.dto';

@Injectable({
  providedIn: 'root'
})
export class ChatRepository {
  private apiClient = inject(ApiClientService);
  private readonly baseEndpoint = '/api/v1/chats'; // Using plural to match API endpoints (ApiService uses /chats)

  private messageToDomain(dto: ChatMessageDto): ChatMessage {
    return new ChatMessage(
      dto.id,
      dto.room_id,
      dto.sender_id,
      dto.content,
      dto.message_type,
      dto.is_read,
      dto.created_at,
      dto.read_at
    );
  }

  private roomToDomain(dto: ChatRoomDto): ChatRoom {
    return new ChatRoom(
      dto.id,
      dto.buyer_id,
      dto.seller_id,
      dto.pinned || false,
      dto.muted || false,
      dto.archived || false,
      dto.product_id,
      dto.request_id,
      dto.last_message_at,
      dto.unread_count_buyer,
      dto.unread_count_seller
    );
  }

  getRooms(params?: Record<string, unknown>): Observable<ChatRoom[]> {
    return this.apiClient.get<ChatRoomDto[]>(`${this.baseEndpoint}/rooms`, params).pipe(
      map(response => response.data.map(dto => this.roomToDomain(dto)))
    );
  }

  createRoom(data: CreateChatRoomDto): Observable<ChatRoom> {
    return this.apiClient.post<ChatRoomDto>(`${this.baseEndpoint}/rooms`, data).pipe(
      map(response => this.roomToDomain(response.data))
    );
  }

  getMessages(roomId: string, params?: Record<string, unknown>): Observable<ChatMessage[]> {
    return this.apiClient.get<ChatMessageDto[]>(`${this.baseEndpoint}/rooms/${roomId}/messages`, params).pipe(
      map(response => response.data.map(dto => this.messageToDomain(dto)))
    );
  }

  sendMessage(roomId: string, data: SendMessageDto): Observable<ChatMessage> {
    return this.apiClient.post<ChatMessageDto>(`${this.baseEndpoint}/rooms/${roomId}/messages`, data).pipe(
      map(response => this.messageToDomain(response.data))
    );
  }

  markMessagesAsRead(roomId: string): Observable<void> {
    return this.apiClient.post<void>(`${this.baseEndpoint}/rooms/${roomId}/read`).pipe(
      map(() => void 0)
    );
  }

  pinRoom(roomId: string): Observable<ChatRoom> {
    return this.apiClient.post<ChatRoomDto>(`${this.baseEndpoint}/rooms/${roomId}/pin`).pipe(
      map(response => this.roomToDomain(response.data))
    );
  }

  unpinRoom(roomId: string): Observable<ChatRoom> {
    // Note: API might use toggle - if unpin doesn't exist, may need to use DELETE on /pin
    return this.apiClient.post<ChatRoomDto>(`${this.baseEndpoint}/rooms/${roomId}/unpin`).pipe(
      map(response => this.roomToDomain(response.data))
    );
  }

  muteRoom(roomId: string): Observable<ChatRoom> {
    return this.apiClient.post<ChatRoomDto>(`${this.baseEndpoint}/rooms/${roomId}/mute`).pipe(
      map(response => this.roomToDomain(response.data))
    );
  }

  unmuteRoom(roomId: string): Observable<ChatRoom> {
    // Note: API might use toggle - if unmute doesn't exist, may need to use DELETE on /mute
    return this.apiClient.post<ChatRoomDto>(`${this.baseEndpoint}/rooms/${roomId}/unmute`).pipe(
      map(response => this.roomToDomain(response.data))
    );
  }

  archiveRoom(roomId: string): Observable<ChatRoom> {
    return this.apiClient.post<ChatRoomDto>(`${this.baseEndpoint}/rooms/${roomId}/archive`).pipe(
      map(response => this.roomToDomain(response.data))
    );
  }

  unarchiveRoom(roomId: string): Observable<ChatRoom> {
    // Note: API might use toggle - if unarchive doesn't exist, may need to use DELETE on /archive
    return this.apiClient.post<ChatRoomDto>(`${this.baseEndpoint}/rooms/${roomId}/unarchive`).pipe(
      map(response => this.roomToDomain(response.data))
    );
  }

  deleteRoom(roomId: string): Observable<void> {
    return this.apiClient.delete<void>(`${this.baseEndpoint}/rooms/${roomId}`).pipe(
      map(() => void 0)
    );
  }

  getMessageReactions(messageId: string): Observable<ReactionSummaryDto[]> {
    // Note: Messages endpoints use /chat (singular) not /chats (plural)
    return this.apiClient.get<ReactionSummaryDto[]>(`/api/v1/chat/messages/${messageId}/reactions`).pipe(
      map(response => response.data)
    );
  }

  addMessageReaction(messageId: string, data: AddReactionDto): Observable<ReactionSummaryDto> {
    // Note: Messages endpoints use /chat (singular) not /chats (plural)
    return this.apiClient.post<ReactionSummaryDto>(`/api/v1/chat/messages/${messageId}/reactions`, data).pipe(
      map(response => response.data)
    );
  }

  removeMessageReaction(messageId: string, reactionType: string): Observable<void> {
    // Note: Messages endpoints use /chat (singular) not /chats (plural)
    return this.apiClient.delete<void>(`/api/v1/chat/messages/${messageId}/reactions/${reactionType}`).pipe(
      map(() => void 0)
    );
  }
}

