import { Injectable, inject } from '@angular/core';
import { TypeSafetyService } from './type-safety.service';
import { Observable, BehaviorSubject, Subject, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { ChatRepository } from '../../domains/chat/repositories/chat.repository';
import { ChatRoom as DomainChatRoom, ChatMessage as DomainChatMessage } from '../../domains/chat/models/chat.model';
import { CreateChatRoomDto, SendMessageDto } from '../../domains/chat/models/chat.dto';
import { 
  ChatRoom, 
  ChatMessage, 
  SendMessage, 
  CreateChatRoom,
  ChatMessageReactionSummary,
  ChatMessageReactionCreate
} from '../models';
import { RealtimeService } from './realtime.service';

export interface ChatState {
  rooms: ChatRoom[];
  currentRoom: ChatRoom | null;
  messages: ChatMessage[];
  unreadCount: number;
  isConnected: boolean;
  isLoading: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private typeSafety = inject(TypeSafetyService);
  private chatRepository = inject(ChatRepository);
  private realtime = inject(RealtimeService);
  
  private chatStateSubject = new BehaviorSubject<ChatState>({
    rooms: [],
    currentRoom: null,
    messages: [],
    unreadCount: 0,
    isConnected: false,
    isLoading: false
  });

  public chatState$ = this.chatStateSubject.asObservable();
  
  private messageSubject = new Subject<ChatMessage>();
  public newMessage$ = this.messageSubject.asObservable();

  private typingSubject = new Subject<{ roomId: string; userId?: string; isTyping: boolean }>();
  public typing$ = this.typingSubject.asObservable();

  constructor() {
    this.initializeSockets();
  }

  /**
   * Convert domain ChatRoom to old ChatRoom interface (for backward compatibility)
   */
  private domainRoomToOldFormat(domainRoom: DomainChatRoom): ChatRoom {
    return {
      id: domainRoom.id,
      buyer_id: domainRoom.buyerId,
      seller_id: domainRoom.sellerId,
      product_id: domainRoom.productId,
      request_id: domainRoom.requestId,
      last_message_at: domainRoom.lastMessageAt,
      unread_count_buyer: domainRoom.unreadCountBuyer,
      unread_count_seller: domainRoom.unreadCountSeller,
      pinned: domainRoom.pinned,
      muted: domainRoom.muted,
      archived: domainRoom.archived
    };
  }

  /**
   * Convert domain ChatMessage to old ChatMessage interface (for backward compatibility)
   */
  private domainMessageToOldFormat(domainMessage: DomainChatMessage): ChatMessage {
    return {
      id: domainMessage.id,
      room_id: domainMessage.roomId,
      sender_id: domainMessage.senderId,
      content: domainMessage.content,
      message_type: domainMessage.messageType,
      is_read: domainMessage.isRead,
      read_at: domainMessage.readAt,
      created_at: domainMessage.createdAt
    };
  }

  /**
   * Convert old CreateChatRoom to CreateChatRoomDto
   */
  private oldToDomainCreateRoom(oldCreate: CreateChatRoom): CreateChatRoomDto {
    return {
      buyer_id: oldCreate.buyer_id,
      seller_id: oldCreate.seller_id,
      product_id: oldCreate.product_id,
      request_id: oldCreate.request_id
    };
  }

  /**
   * Convert old SendMessage to SendMessageDto
   */
  private oldToDomainSendMessage(oldSend: SendMessage): SendMessageDto {
    return {
      content: oldSend.content,
      message_type: oldSend.message_type,
      message_data: oldSend.message_data
    };
  }

  // ============================================================================
  // SOCKET.IO SETUP
  // ============================================================================
  private initializeSockets(): void {
    this.realtime.connect('/chat');
    // Observe all chat events
    this.realtime.chat$.subscribe(({ event, data }) => {
      switch (event) {
        case 'connected':
          this.updateChatState({ isConnected: true });
          break;
        case 'disconnect':
          this.updateChatState({ isConnected: false });
          break;
        case 'message':
          this.handleNewMessage(data as ChatMessage);
          break;
        case 'typing_update':
          this.handleTypingIndicator(data);
          break;
        case 'read_receipt':
          this.handleReadReceipt(data);
          break;
        case 'room_update':
          this.handleRoomUpdate(data);
          break;
      }
    });
  }

  // ============================================================================
  // CHAT ROOM OPERATIONS
  // ============================================================================

  /**
   * Get all chat rooms
   * Uses ChatRepository (DDD pattern)
   */
  getChatRooms(params?: any): Observable<any> {
    return this.chatRepository.getRooms(params).pipe(
      map((domainRooms: DomainChatRoom[]) => {
        const rooms = domainRooms.map(r => this.domainRoomToOldFormat(r));
        this.updateChatState({ rooms });
        return {
          success: true,
          data: { rooms }
        };
      }),
      catchError((error: any) => {
        console.error('Error fetching chat rooms:', error);
        return of({ success: false, data: { rooms: [] } });
      })
    );
  }

  /**
   * Create new chat room
   * Uses ChatRepository (DDD pattern)
   */
  createChatRoom(roomData: CreateChatRoom): Observable<any> {
    const createDto = this.oldToDomainCreateRoom(roomData);
    
    return this.chatRepository.createRoom(createDto).pipe(
      map((domainRoom: DomainChatRoom) => {
        const room = this.domainRoomToOldFormat(domainRoom);
          const currentRooms = this.getChatState().rooms;
          this.updateChatState({ 
          rooms: [room, ...currentRooms],
          currentRoom: room
          });
          // Join the created room via socket
        this.joinRoom(room.id);
        return {
          success: true,
          data: room
        };
      }),
      catchError((error: any) => {
        console.error('Error creating chat room:', error);
        throw error;
      })
    );
  }

  /**
   * Get or create chat room with user
   */
  getOrCreateRoom(buyerId: string, sellerId: string, productId?: string, requestId?: string): Observable<any> {
    const roomData: CreateChatRoom = {
      buyer_id: buyerId,
      seller_id: sellerId,
      product_id: productId,
      request_id: requestId
    };
    
    return this.createChatRoom(roomData);
  }

  /**
   * Select chat room
   */
  selectRoom(roomId: string): void {
    const rooms = this.getChatState().rooms;
    const room = rooms.find(r => r.id === roomId);
    
    if (room) {
      this.updateChatState({ currentRoom: room });
      this.joinRoom(roomId);
      this.loadMessages(roomId);
    }
  }

  /**
   * Join a room (Socket.IO)
   */
  joinRoom(roomId: string): void {
    this.realtime.emitTo('/chat', 'join_room', { room_id: roomId });
  }

  /**
   * Leave a room (Socket.IO)
   */
  leaveRoom(roomId: string): void {
    this.realtime.emitTo('/chat', 'leave_room', { room_id: roomId });
  }

  /** Start/stop typing indicators */
  startTyping(roomId: string): void {
    this.realtime.emitTo('/chat', 'typing_start', { room_id: roomId });
  }

  stopTyping(roomId: string): void {
    this.realtime.emitTo('/chat', 'typing_stop', { room_id: roomId });
  }

  /**
   * Get current room
   */
  getCurrentRoom(): ChatRoom | null {
    return this.getChatState().currentRoom;
  }

  // ============================================================================
  // MESSAGE OPERATIONS
  // ============================================================================

  /**
   * Get chat messages
   * Uses ChatRepository (DDD pattern)
   */
  getChatMessages(roomId: string, params?: any): Observable<any> {
    return this.chatRepository.getMessages(roomId, params).pipe(
      map((domainMessages: DomainChatMessage[]) => {
        const messages = domainMessages.map(m => this.domainMessageToOldFormat(m));
        this.updateChatState({ messages });
        return {
          success: true,
          data: { messages }
        };
      }),
      catchError((error: any) => {
        console.error('Error fetching chat messages:', error);
        return of({ success: false, data: { messages: [] } });
      })
    );
  }

  /**
   * Load messages for current room
   */
  loadMessages(roomId: string, params?: any): void {
    this.getChatMessages(roomId, params).subscribe();
  }

  /**
   * Send message
   * Uses ChatRepository (DDD pattern)
   */
  sendMessage(roomId: string, messageData: SendMessage): Observable<any> {
    const sendDto = this.oldToDomainSendMessage(messageData);
    
    return this.chatRepository.sendMessage(roomId, sendDto).pipe(
      map((domainMessage: DomainChatMessage) => {
        const newMessage = this.domainMessageToOldFormat(domainMessage);
          const currentMessages = this.getChatState().messages;
          this.updateChatState({ 
            messages: [...currentMessages, newMessage]
          });
          // Emit via Socket.IO for real-time delivery
          this.realtime.emitTo('/chat', 'message', {
            room_id: roomId,
            message: messageData.content,
            ...messageData.message_data
          });
        return {
          success: true,
          data: newMessage
        };
      }),
      catchError((error: any) => {
        console.error('Error sending message:', error);
        throw error;
      })
    );
  }

  /**
   * Send text message
   */
  sendTextMessage(roomId: string, content: string): Observable<any> {
    const messageData: SendMessage = {
      content,
      message_type: 'text'
    };
    return this.sendMessage(roomId, messageData);
  }

  /**
   * Send image message
   */
  sendImageMessage(roomId: string, imageUrl: string, caption?: string): Observable<any> {
    const messageData: SendMessage = {
      content: caption || '',
      message_type: 'image',
      message_data: { image_url: imageUrl }
    };
    return this.sendMessage(roomId, messageData);
  }

  /**
   * Send file message
   */
  sendFileMessage(roomId: string, fileUrl: string, fileName: string): Observable<any> {
    const messageData: SendMessage = {
      content: fileName,
      message_type: 'file',
      message_data: { file_url: fileUrl, file_name: fileName }
    };
    return this.sendMessage(roomId, messageData);
  }

  /**
   * Mark messages as read (room-level per backend spec)
   * Uses ChatRepository (DDD pattern)
   */
  markMessagesAsRead(roomId: string): Observable<any> {
    return this.chatRepository.markMessagesAsRead(roomId).pipe(
      map(() => {
          const currentMessages = this.getChatState().messages;
          const updatedMessages = currentMessages.map(msg => 
            msg.room_id === roomId ? { ...msg, is_read: true } : msg
          );
          this.updateChatState({ messages: updatedMessages });
        this.markRoomAsRead(roomId);
        return { success: true };
      }),
      catchError((error: any) => {
        console.error('Error marking messages as read:', error);
        return of({ success: false, error: error.message });
      })
    );
  }

  // ============================================================================
  // CHAT ROOM MANAGEMENT
  // ============================================================================

  pinChat(roomId: string): Observable<any> {
    return this.chatRepository.pinRoom(roomId).pipe(
      map((domainRoom: DomainChatRoom) => {
        const room = this.domainRoomToOldFormat(domainRoom);
        const currentRooms = this.getChatState().rooms;
        const updatedRooms = currentRooms.map(r => r.id === roomId ? room : r);
        this.updateChatState({ rooms: updatedRooms });
        return { success: true, data: room };
      }),
      catchError((error: any) => {
        console.error('Error pinning chat:', error);
        return of({ success: false, error: error.message });
      })
    );
  }

  unpinChatRoom(roomId: string): Observable<any> {
    return this.chatRepository.unpinRoom(roomId).pipe(
      map((domainRoom: DomainChatRoom) => {
        const room = this.domainRoomToOldFormat(domainRoom);
        const currentRooms = this.getChatState().rooms;
        const updatedRooms = currentRooms.map(r => r.id === roomId ? room : r);
        this.updateChatState({ rooms: updatedRooms });
        return { success: true, data: room };
      }),
      catchError((error: any) => {
        console.error('Error unpinning chat:', error);
        return of({ success: false, error: error.message });
      })
    );
  }

  muteChat(roomId: string): Observable<any> {
    return this.chatRepository.muteRoom(roomId).pipe(
      map((domainRoom: DomainChatRoom) => {
        const room = this.domainRoomToOldFormat(domainRoom);
        const currentRooms = this.getChatState().rooms;
        const updatedRooms = currentRooms.map(r => r.id === roomId ? room : r);
        this.updateChatState({ rooms: updatedRooms });
        return { success: true, data: room };
      }),
      catchError((error: any) => {
        console.error('Error muting chat:', error);
        return of({ success: false, error: error.message });
      })
    );
  }

  unmuteChatRoom(roomId: string): Observable<any> {
    return this.chatRepository.unmuteRoom(roomId).pipe(
      map((domainRoom: DomainChatRoom) => {
        const room = this.domainRoomToOldFormat(domainRoom);
        const currentRooms = this.getChatState().rooms;
        const updatedRooms = currentRooms.map(r => r.id === roomId ? room : r);
        this.updateChatState({ rooms: updatedRooms });
        return { success: true, data: room };
      }),
      catchError((error: any) => {
        console.error('Error unmuting chat:', error);
        return of({ success: false, error: error.message });
      })
    );
  }

  archiveChat(roomId: string): Observable<any> {
    return this.chatRepository.archiveRoom(roomId).pipe(
      map((domainRoom: DomainChatRoom) => {
        const room = this.domainRoomToOldFormat(domainRoom);
        const currentRooms = this.getChatState().rooms;
        const updatedRooms = currentRooms.map(r => r.id === roomId ? room : r);
        this.updateChatState({ rooms: updatedRooms });
        return { success: true, data: room };
      }),
      catchError((error: any) => {
        console.error('Error archiving chat:', error);
        return of({ success: false, error: error.message });
      })
    );
  }

  unarchiveChatRoom(roomId: string): Observable<any> {
    return this.chatRepository.unarchiveRoom(roomId).pipe(
      map((domainRoom: DomainChatRoom) => {
        const room = this.domainRoomToOldFormat(domainRoom);
        const currentRooms = this.getChatState().rooms;
        const updatedRooms = currentRooms.map(r => r.id === roomId ? room : r);
        this.updateChatState({ rooms: updatedRooms });
        return { success: true, data: room };
      }),
      catchError((error: any) => {
        console.error('Error unarchiving chat:', error);
        return of({ success: false, error: error.message });
      })
    );
  }

  deleteChat(roomId: string): Observable<void> {
    return this.chatRepository.deleteRoom(roomId).pipe(
      map(() => {
        const updatedRooms = this.getChatState().rooms.filter(r => r.id !== roomId);
        this.updateChatState({ rooms: updatedRooms });
        if (this.getChatState().currentRoom?.id === roomId) {
          this.updateChatState({ currentRoom: null, messages: [] });
        }
        return void 0;
      }),
      catchError((error: any) => {
        console.error('Error deleting chat:', error);
        throw error;
      })
    );
  }

  // ============================================================================
  // MESSAGE REACTIONS
  // ============================================================================

  getMessageReactions(messageId: string): Observable<ChatMessageReactionSummary[]> {
    return this.chatRepository.getMessageReactions(messageId).pipe(
      map((reactions) => {
        // Convert DTO to old interface format
        return reactions.map(reaction => ({
          reaction_type: reaction.reaction_type,
          emoji: reaction.emoji,
          count: reaction.count,
          has_reacted: reaction.has_reacted,
          user_id: reaction.user_id
        }));
      }),
      catchError((error: any) => {
        console.error('Error getting message reactions:', error);
        return of([]);
      })
    );
  }

  addMessageReaction(messageId: string, reactionType: string): Observable<ChatMessageReactionSummary> {
    return this.chatRepository.addMessageReaction(messageId, { reaction_type: reactionType }).pipe(
      map((reaction) => ({
        reaction_type: reaction.reaction_type,
        emoji: reaction.emoji,
        count: reaction.count,
        has_reacted: reaction.has_reacted,
        user_id: reaction.user_id
      })),
      catchError((error: any) => {
        console.error('Error adding message reaction:', error);
        throw error;
      })
    );
  }

  removeMessageReaction(messageId: string, reactionType: string): Observable<void> {
    return this.chatRepository.removeMessageReaction(messageId, reactionType).pipe(
      map(() => void 0),
      catchError((error: any) => {
        console.error('Error removing message reaction:', error);
        throw error;
      })
    );
  }

  // ============================================================================
  // SOCKET EVENT HANDLERS
  // ============================================================================
  private handleNewMessage(message: ChatMessage): void {
    const currentState = this.getChatState();
    if (currentState.currentRoom && message.room_id === currentState.currentRoom.id) {
      const updatedMessages = [...currentState.messages, message];
      this.updateChatState({ messages: updatedMessages });
    }
    const updatedUnreadCount = currentState.unreadCount + 1;
    this.updateChatState({ unreadCount: updatedUnreadCount });
    this.messageSubject.next(message);
  }

  private handleTypingIndicator(data: any): void {
    if (!data) return;
    const payload = {
      roomId: String(this.typeSafety.getProperty(data, 'room_id', '')),
      userId: this.typeSafety.getProperty(data, 'user_id') as string | undefined,
      isTyping: this.typeSafety.toBoolean(this.typeSafety.getProperty(data, 'is_typing'))
    };
    this.typingSubject.next(payload);
  }

  private handleReadReceipt(data: any): void {
    const currentMessages = this.getChatState().messages;
    const updatedMessages = currentMessages.map(msg => 
      msg.id === data.message_id ? { ...msg, is_read: true, read_at: data.read_at } : msg
    );
    this.updateChatState({ messages: updatedMessages });
  }

  private handleRoomUpdate(data: any): void {
    const currentRooms = this.getChatState().rooms;
    const updatedRooms = currentRooms.map(room => 
      room.id === data.room_id ? { ...room, ...data.updates } : room
    );
    this.updateChatState({ rooms: updatedRooms });
  }

  // ============================================================================
  // CHAT UTILITIES
  // ============================================================================
  getChatState(): ChatState {
    return this.chatStateSubject.value;
  }

  getRooms$(): Observable<ChatRoom[]> {
    return this.chatState$.pipe(map(state => state.rooms));
  }

  getCurrentRoom$(): Observable<ChatRoom | null> {
    return this.chatState$.pipe(map(state => state.currentRoom));
  }

  getMessages$(): Observable<ChatMessage[]> {
    return this.chatState$.pipe(map(state => state.messages));
  }

  getUnreadCount$(): Observable<number> {
    return this.chatState$.pipe(
      map(state => state.rooms.reduce((total, room) => total + room.unread_count_buyer + room.unread_count_seller, 0))
    );
  }

  getConnectionStatus$(): Observable<boolean> {
    return this.chatState$.pipe(map(state => state.isConnected));
  }

  private updateChatState(partial: Partial<ChatState>): void {
    const currentState = this.getChatState();
    const newState = { ...currentState, ...partial };
    this.chatStateSubject.next(newState);
  }

  isMessageFromCurrentUser(message: ChatMessage): boolean {
    const currentUserId = this.getCurrentUserId();
    return message.sender_id === currentUserId;
  }

  private getCurrentUserId(): string {
    const userData = localStorage.getItem('markt_user');
    if (userData) {
      const user = JSON.parse(userData);
      return user.id;
    }
    return '';
  }

  getRoomById(roomId: string): ChatRoom | null {
    const rooms = this.getChatState().rooms;
    return rooms.find(room => room.id === roomId) || null;
  }

  getRoomWithUser(userId: string): ChatRoom | null {
    const rooms = this.getChatState().rooms;
    return rooms.find(room => 
      room.buyer_id === userId || room.seller_id === userId
    ) || null;
  }

  getUnreadCountForRoom(roomId: string): number {
    const room = this.getRoomById(roomId);
    if (!room) return 0;
    const currentUserId = this.getCurrentUserId();
    if (currentUserId === room.buyer_id) return room.unread_count_buyer;
    if (currentUserId === room.seller_id) return room.unread_count_seller;
    return 0;
  }

  markRoomAsRead(roomId: string): void {
    const currentRooms = this.getChatState().rooms;
    const updatedRooms = currentRooms.map(r => {
      if (r.id === roomId) {
        const currentUserId = this.getCurrentUserId();
        if (currentUserId === r.buyer_id) {
          return { ...r, unread_count_buyer: 0 };
        } else if (currentUserId === r.seller_id) {
          return { ...r, unread_count_seller: 0 };
        }
      }
      return r;
    });
    this.updateChatState({ rooms: updatedRooms });
  }

  // Cleanup
  ngOnDestroy(): void {
    this.realtime.disconnect('/chat');
  }
} 