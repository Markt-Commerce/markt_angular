/**
 * Chat Domain Service
 */

import { Injectable, inject } from '@angular/core';
import { Observable, Subject, BehaviorSubject, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ChatRepository } from '../repositories/chat.repository';
import { ChatMessage, ChatRoom } from '../models/chat.model';
import { SendMessageDto, CreateChatRoomDto } from '../models/chat.dto';
import { ApiService } from '../../../core/services/api.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private chatRepository = inject(ChatRepository);
  private apiService = inject(ApiService); // Temporary: for methods not yet migrated to repository
  
  // Temporary observables for real-time features
  public typing$ = new BehaviorSubject<{ roomId: string; isTyping: boolean }>({ roomId: '', isTyping: false });
  public newMessage$ = new Subject<ChatMessage>();
  private selectedRoomId: string | null = null;

  getRooms(params?: Record<string, unknown>): Observable<ChatRoom[]> {
    return this.chatRepository.getRooms(params);
  }

  createRoom(data: CreateChatRoomDto): Observable<ChatRoom> {
    if (!data.buyer_id || !data.seller_id) {
      throw new Error('Buyer and seller IDs are required');
    }

    return this.chatRepository.createRoom(data);
  }

  /**
   * Temporary helper for legacy components that expect createChatRoom API shape
   * Delegates to ApiService until dedicated repository method is available
   */
  createChatRoom(roomData: Record<string, unknown>): Observable<ChatRoom> {
    return this.apiService.createChatRoom(roomData).pipe(
      map(response => {
        const dto = response.data;

        if (!dto) {
          throw new Error('Failed to create chat room');
        }

        return new ChatRoom(
          dto.id,
          dto.buyer_id,
          dto.seller_id,
          dto.pinned ?? false,
          dto.muted ?? false,
          dto.archived ?? false,
          dto.product_id,
          dto.request_id,
          dto.last_message_at,
          dto.unread_count_buyer,
          dto.unread_count_seller
        );
      })
    );
  }

  getMessages(roomId: string, params?: Record<string, unknown>): Observable<ChatMessage[]> {
    return this.chatRepository.getMessages(roomId, params);
  }

  sendMessage(roomId: string, content: string): Observable<ChatMessage> {
    if (!content || content.trim().length === 0) {
      throw new Error('Message content is required');
    }

    const data: SendMessageDto = {
      content: content.trim(),
      message_type: 'text'
    };

    return this.chatRepository.sendMessage(roomId, data);
  }

  /**
   * Alias for getRooms (for backward compatibility)
   * TODO: Remove when all components use getRooms()
   */
  getChatRooms(params?: Record<string, unknown>): Observable<ChatRoom[]> {
    return this.getRooms(params);
  }

  /**
   * Select room (for state management)
   * TODO: Migrate to proper state management
   */
  selectRoom(roomId: string): void {
    this.selectedRoomId = roomId;
  }

  /**
   * Get messages as observable
   * TODO: Migrate to proper reactive stream
   */
  getMessages$(roomId?: string): Observable<ChatMessage[]> {
    const targetRoomId = roomId || this.selectedRoomId;
    if (!targetRoomId) {
      return new Observable(observer => observer.next([]));
    }
    return this.getMessages(targetRoomId);
  }

  /**
   * Load messages (alias for getMessages)
   * TODO: Remove when components use getMessages directly
   */
  loadMessages(roomId: string): void {
    this.getMessages(roomId).subscribe();
  }

  /**
   * Mark messages as read
   * TODO: Migrate to ChatRepository when method is added
   * Temporary: delegates to ApiService
   */
  markMessagesAsRead(roomId: string): Observable<any> {
    return this.apiService.markMessagesAsRead(roomId);
  }

  /**
   * Get unread chat count - compatibility helper for dashboard widgets.
   */
  getUnreadCount$(): Observable<number> {
    return this.apiService.getUnreadCount().pipe(
      map(response => {
        const payload = response.data ?? response;
        if (typeof payload === 'number') {
          return payload;
        }
        if (typeof payload?.count === 'number') {
          return payload.count;
        }
        if (typeof payload?.total === 'number') {
          return payload.total;
        }
        return 0;
      })
    );
  }

  /**
   * Send text message (alias for sendMessage)
   * TODO: Remove when components use sendMessage directly
   */
  sendTextMessage(roomId: string, content: string): Observable<ChatMessage> {
    return this.sendMessage(roomId, content);
  }

  /**
   * Start typing indicator
   * TODO: Migrate to proper real-time service
   */
  startTyping(roomId: string): void {
    this.typing$.next({ roomId, isTyping: true });
  }

  /**
   * Stop typing indicator
   * TODO: Migrate to proper real-time service
   */
  stopTyping(roomId: string): void {
    this.typing$.next({ roomId, isTyping: false });
  }

  /**
   * Get or create room
   * TODO: Migrate to ChatRepository when method is added
   * Temporary: tries to get existing room first, then creates if not found
   */
  getOrCreateRoom(buyerId: string, sellerId: string, productId?: string): Observable<ChatRoom> {
    // First try to find existing room
    return this.getRooms({ buyer_id: buyerId, seller_id: sellerId }).pipe(
      switchMap((rooms: ChatRoom[]) => {
        if (rooms.length > 0) {
          return of(rooms[0]);
        }
        // Create new room if none exists
        const roomData: CreateChatRoomDto = { 
          buyer_id: buyerId, 
          seller_id: sellerId, 
          product_id: productId 
        };
        return this.createRoom(roomData);
      })
    );
  }

  /**
   * Pin chat
   * TODO: Migrate to ChatRepository when method is added
   * Temporary: delegates to ApiService
   */
  pinChat(roomId: string): Observable<any> {
    return this.apiService.pinChatRoom(roomId);
  }

  /**
   * Mute chat
   * TODO: Migrate to ChatRepository when method is added
   * Temporary: delegates to ApiService
   */
  muteChat(roomId: string): Observable<any> {
    return this.apiService.muteChatRoom(roomId);
  }

  /**
   * Archive chat
   * TODO: Migrate to ChatRepository when method is added
   * Temporary: delegates to ApiService
   */
  archiveChat(roomId: string): Observable<any> {
    return this.apiService.archiveChatRoom(roomId);
  }

  /**
   * Delete chat
   * TODO: Migrate to ChatRepository when method is added
   * Temporary: delegates to ApiService
   */
  deleteChat(roomId: string): Observable<any> {
    return this.apiService.deleteChatRoom(roomId);
  }

  /**
   * Add message reaction
   * TODO: Migrate to ChatRepository when method is added
   * Temporary: delegates to ApiService
   */
  addMessageReaction(messageId: string, reactionData: any): Observable<any> {
    return this.apiService.addMessageReaction(messageId, reactionData);
  }
}

