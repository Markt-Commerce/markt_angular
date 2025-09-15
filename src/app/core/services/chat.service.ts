import { Injectable, inject } from '@angular/core';
import { TypeSafetyService } from './type-safety.service';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
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
  private apiService = inject(ApiService);
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
   */
  getChatRooms(params?: any): Observable<any> {
    return this.apiService.getChatRooms(params).pipe(
      tap(response => {
        if (response.success) {
          this.updateChatState({ rooms: response.data.rooms });
        }
      })
    );
  }

  /**
   * Create new chat room
   */
  createChatRoom(roomData: CreateChatRoom): Observable<any> {
    return this.apiService.createChatRoom(roomData).pipe(
      tap(response => {
        if (response.success) {
          const currentRooms = this.getChatState().rooms;
          this.updateChatState({ 
            rooms: [response.data, ...currentRooms],
            currentRoom: response.data
          });
          // Join the created room via socket
          this.joinRoom(response.data.id);
        }
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
   */
  getChatMessages(roomId: string, params?: any): Observable<any> {
    return this.apiService.getChatMessages(roomId, params).pipe(
      tap(response => {
        if (response.success) {
          this.updateChatState({ messages: response.data.messages });
        }
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
   */
  sendMessage(roomId: string, messageData: SendMessage): Observable<any> {
    return this.apiService.sendMessage(roomId, messageData).pipe(
      tap(response => {
        if (response.success) {
          const newMessage = response.data;
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
        }
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
   */
  markMessagesAsRead(roomId: string): Observable<any> {
    return this.apiService.markMessagesAsRead(roomId).pipe(
      tap(response => {
        if (response.success) {
          const currentMessages = this.getChatState().messages;
          const updatedMessages = currentMessages.map(msg => 
            msg.room_id === roomId ? { ...msg, is_read: true } : msg
          );
          this.updateChatState({ messages: updatedMessages });
        }
      })
    );
  }

  // ============================================================================
  // CHAT ROOM MANAGEMENT
  // ============================================================================

  pinChat(roomId: string): Observable<any> {
    return this.apiService.pinChatRoom(roomId).pipe(
      map(response => response.data),
      tap(() => {
        const room = this.getChatState().rooms.find(r => r.id === roomId);
        if (room) {
          room.pinned = true;
          this.updateChatState({ rooms: [...this.getChatState().rooms] });
        }
      })
    );
  }

  unpinChatRoom(roomId: string): Observable<any> {
    return this.apiService.pinChatRoom(roomId).pipe(
      map(response => response.data),
      tap(() => {
        const room = this.getChatState().rooms.find(r => r.id === roomId);
        if (room) {
          room.pinned = false;
          this.updateChatState({ rooms: [...this.getChatState().rooms] });
        }
      })
    );
  }

  muteChat(roomId: string): Observable<any> {
    return this.apiService.muteChatRoom(roomId).pipe(
      map(response => response.data),
      tap(() => {
        const room = this.getChatState().rooms.find(r => r.id === roomId);
        if (room) {
          room.muted = true;
          this.updateChatState({ rooms: [...this.getChatState().rooms] });
        }
      })
    );
  }

  unmuteChatRoom(roomId: string): Observable<any> {
    return this.apiService.muteChatRoom(roomId).pipe(
      map(response => response.data),
      tap(() => {
        const room = this.getChatState().rooms.find(r => r.id === roomId);
        if (room) {
          room.muted = false;
          this.updateChatState({ rooms: [...this.getChatState().rooms] });
        }
      })
    );
  }

  archiveChat(roomId: string): Observable<any> {
    return this.apiService.archiveChatRoom(roomId).pipe(
      map(response => response.data),
      tap(() => {
        const room = this.getChatState().rooms.find(r => r.id === roomId);
        if (room) {
          room.archived = true;
          this.updateChatState({ rooms: [...this.getChatState().rooms] });
        }
      })
    );
  }

  unarchiveChatRoom(roomId: string): Observable<any> {
    return this.apiService.archiveChatRoom(roomId).pipe(
      map(response => response.data),
      tap(() => {
        const room = this.getChatState().rooms.find(r => r.id === roomId);
        if (room) {
          room.archived = false;
          this.updateChatState({ rooms: [...this.getChatState().rooms] });
        }
      })
    );
  }

  deleteChat(roomId: string): Observable<void> {
    return this.apiService.deleteChatRoom(roomId).pipe(
      map(() => void 0),
      tap(() => {
        const updatedRooms = this.getChatState().rooms.filter(r => r.id !== roomId);
        this.updateChatState({ rooms: updatedRooms });
      })
    );
  }

  // ============================================================================
  // MESSAGE REACTIONS
  // ============================================================================

  getMessageReactions(messageId: string): Observable<ChatMessageReactionSummary[]> {
    return this.apiService.getMessageReactions(messageId).pipe(
      map(response => response.data || [])
    );
  }

  addMessageReaction(messageId: string, reactionType: string): Observable<ChatMessageReactionSummary> {
    return this.apiService.addMessageReaction(messageId, { reaction_type: reactionType }).pipe(
      map(response => response.data)
    );
  }

  removeMessageReaction(messageId: string, reactionType: string): Observable<void> {
    return this.apiService.removeMessageReaction(messageId, reactionType).pipe(
      map(() => void 0)
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